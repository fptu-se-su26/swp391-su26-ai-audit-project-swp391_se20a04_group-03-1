import cv2
import os
import sys
import re
import time
import threading
import numpy as np
from collections import Counter
from queue import Queue
from concurrent.futures import ThreadPoolExecutor

# torch chỉ cần cho nhánh detection Ultralytics (khi KHÔNG có Hailo) và cho EasyOCR.
# Trên Pi 5 + Hailo + RapidOCR có thể GỠ HẲN torch/ultralytics/easyocr cho nhẹ máy,
# nên import "mềm" — thiếu cũng không sao.
try:
    import torch
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False

# RapidOCR (ONNXRuntime + PP-OCRv4 mobile): OCR nhẹ, KHÔNG cần torch. Ưu tiên dùng.
try:
    from rapidocr_onnxruntime import RapidOCR
    HAS_RAPIDOCR = True
except ImportError:
    HAS_RAPIDOCR = False

try:
    from src.services.hailo_yolo import HailoYOLO, HAILO_AVAILABLE, HAILO_SCHEDULER_AVAILABLE
except ImportError:
    HAILO_AVAILABLE = False
    HAILO_SCHEDULER_AVAILABLE = False
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.config import (
    YOLO_PLATE_MODEL_PATH,
    YOLO_CONTAINER_MODEL_PATH,
    DETECTION_CONFIDENCE_THRESHOLD,
    OCR_CONFIDENCE_THRESHOLD,
    OCR_LANGUAGES,
    DETECT_INTERVAL,
    OCR_ENGINE,
)
from src.services.api_client import send_scan_event

# ---------------------------------------------------------------------------
# Image preprocessing
# ---------------------------------------------------------------------------

def preprocess_image_plate(image):
    """
    Tiền xử lý ảnh giúp OCR đọc biển số xe.
    Tối ưu tốc độ: resize 2x + GaussianBlur nhẹ + CLAHE.
    (Loại bỏ bilateralFilter ~40ms và sharpening kernel để giảm latency)
    """
    if image is None or image.size == 0:
        return image

    image = cv2.resize(image, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # GaussianBlur nhẹ — nhanh hơn bilateralFilter ~10x nhưng vẫn khử nhiễu tốt
    blur = cv2.GaussianBlur(gray, (3, 3), 0)

    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    return clahe.apply(blur)


def preprocess_image_container(image):
    """
    Tiền xử lý ảnh giúp OCR đọc mã container.
    Container thường có chữ to, nhưng hay có vân sóng nhấp nhô & bóng rỉ sét.
    Dùng GaussianBlur + CLAHE nhẹ hơn so với biển số để tránh khuếch đại nhiễu.
    """
    if image is None or image.size == 0:
        return image

    image = cv2.resize(image, None, fx=1.5, fy=1.5, interpolation=cv2.INTER_CUBIC)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    clahe = cv2.createCLAHE(clipLimit=1.5, tileGridSize=(8, 8))
    return clahe.apply(blur)


# ---------------------------------------------------------------------------
# Text cleaning & format validation
# ---------------------------------------------------------------------------

# Bảng ánh xạ lỗi ký tự phổ biến của OCR
_CHAR_TO_INT = {
    'A': '4', 'B': '8', 'C': '6', 'D': '0', 'G': '6',
    'I': '1', 'O': '0', 'Q': '0', 'S': '5', 'Z': '2', 'L': '4'
}
_INT_TO_CHAR_PLATE = {
    '0': 'D', '1': 'I', '2': 'Z', '4': 'A', '5': 'S', '6': 'G', '8': 'B'
}
_INT_TO_CHAR_CONTAINER = {
    '0': 'O', '1': 'I', '2': 'Z', '4': 'A', '5': 'S', '6': 'G', '8': 'B'
}


def clean_and_format_plate(raw_text):
    """
    Làm sạch kết quả OCR cho biển số xe Việt Nam.
    Format: 2 số (mã tỉnh) + 1 chữ (series) + 4~5 số (biển số).
    """
    clean_text = re.sub(r'[^A-Z0-9]', '', raw_text.upper())

    if len(clean_text) < 7 or len(clean_text) > 9:
        return None

    chars = list(clean_text)

    # 2 ký tự đầu LUÔN LÀ SỐ (Mã tỉnh)
    for i in [0, 1]:
        if chars[i] in _CHAR_TO_INT:
            chars[i] = _CHAR_TO_INT[chars[i]]

    # Ký tự thứ 3 LUÔN LÀ CHỮ
    if chars[2] in _INT_TO_CHAR_PLATE:
        chars[2] = _INT_TO_CHAR_PLATE[chars[2]]

    # Các ký tự cuối (4 hoặc 5 số) LUÔN LÀ SỐ
    num_trailing_digits = 5 if len(chars) >= 8 else 4
    for i in range(len(chars) - num_trailing_digits, len(chars)):
        if chars[i] in _CHAR_TO_INT:
            chars[i] = _CHAR_TO_INT[chars[i]]

    return "".join(chars)


def clean_and_format_container(raw_text):
    """
    Làm sạch kết quả OCR cho mã container ISO 6346.
    Format: 4 chữ cái (owner code + category) + 6 số (serial number) = 10 ký tự.
    Ký tự thứ 4 thường là U, J, hoặc Z.

    Sử dụng sliding-window 10 ký tự + scoring để tìm cửa sổ tốt nhất,
    tránh nhận diện rác từ chữ khác trên thân container.
    """
    clean_text = re.sub(r'[^A-Z0-9]', '', raw_text.upper())

    best_window = ""
    max_score = -1

    # Chỉ xét cửa sổ đúng 10 ký tự
    w_len = 10
    if len(clean_text) < w_len:
        return None

    for i in range(len(clean_text) - w_len + 1):
        window = list(clean_text[i:i + w_len])

        # Ép kiểu: 4 ký tự đầu → chữ, 6 ký tự sau → số
        for j in range(4):
            if window[j] in _INT_TO_CHAR_CONTAINER:
                window[j] = _INT_TO_CHAR_CONTAINER[window[j]]
        for j in range(4, w_len):
            if window[j] in _CHAR_TO_INT:
                window[j] = _CHAR_TO_INT[window[j]]

        window_str = "".join(window)

        # Chấm điểm: 4 chữ cái đầu + 6 số cuối = tối đa 10 điểm
        score = sum(1 for j in range(4) if window_str[j].isalpha()) + \
                sum(1 for j in range(4, w_len) if window_str[j].isdigit())

        # Bonus nếu ký tự thứ 4 là U/J/Z (đúng chuẩn ISO 6346)
        if window_str[3] in ('U', 'J', 'Z'):
            score += 2

        if score > max_score:
            max_score = score
            best_window = window_str

    # Yêu cầu tối thiểu 8/10 điểm (≥ 3/4 chữ + ≥ 5/6 số)
    if not best_window or max_score < 8:
        return None

    return best_window


# ---------------------------------------------------------------------------
# Global singleton models (prevent OOM & duplicate loading)
# ---------------------------------------------------------------------------

GLOBAL_PLATE_OCR_READER = None
GLOBAL_CONTAINER_OCR_READER = None
GLOBAL_MODELS_LOADED = False
GLOBAL_MODEL_LOCK = threading.Lock()

GLOBAL_VDEVICE = None
GLOBAL_HAILO_PLATE_MODEL = None
GLOBAL_HAILO_CONTAINER_MODEL = None
GLOBAL_HAILO_PERSISTENT = False


def get_hailo_models():
    """
    Khởi tạo (một lần duy nhất cho cả tiến trình) 1 VDevice dùng chung + 2 model HEF.

    Ưu tiên bật scheduler (ROUND_ROBIN) để hai model plate/container chia sẻ cùng 1 NPU
    mà không phải activate/deactivate mỗi frame → cho phép giữ pipeline thường trực.
    Nếu HailoRT không hỗ trợ scheduler thì tự fallback về VDevice thường (chế độ activate cũ).
    """
    global GLOBAL_VDEVICE, GLOBAL_HAILO_PLATE_MODEL, GLOBAL_HAILO_CONTAINER_MODEL, GLOBAL_HAILO_PERSISTENT
    if not HAILO_AVAILABLE:
        return None, None

    with GLOBAL_MODEL_LOCK:
        if GLOBAL_VDEVICE is None:
            from hailo_platform import VDevice
            try:
                if HAILO_SCHEDULER_AVAILABLE:
                    from hailo_platform import HailoSchedulingAlgorithm
                    params = VDevice.create_params()
                    params.scheduling_algorithm = HailoSchedulingAlgorithm.ROUND_ROBIN
                    params.group_id = "SHARED"
                    GLOBAL_VDEVICE = VDevice(params)
                    GLOBAL_HAILO_PERSISTENT = True
                    print("[AI] Global VDevice initialized (scheduler ROUND_ROBIN, persistent pipeline).")
                else:
                    GLOBAL_VDEVICE = VDevice()
                    GLOBAL_HAILO_PERSISTENT = False
                    print("[AI] Global VDevice initialized (legacy activate-per-frame mode).")
            except Exception as e:
                print(f"[AI] Cannot open VDevice: {e}")
                return None, None

        if GLOBAL_HAILO_PLATE_MODEL is None:
            hef_plate = YOLO_PLATE_MODEL_PATH.replace(".onnx", ".hef").replace(".pt", ".hef")
            GLOBAL_HAILO_PLATE_MODEL = (
                HailoYOLO(hef_plate, GLOBAL_VDEVICE, persistent=GLOBAL_HAILO_PERSISTENT)
                if os.path.exists(hef_plate) else None
            )

        if GLOBAL_HAILO_CONTAINER_MODEL is None:
            hef_container = YOLO_CONTAINER_MODEL_PATH.replace(".onnx", ".hef").replace(".pt", ".hef")
            GLOBAL_HAILO_CONTAINER_MODEL = (
                HailoYOLO(hef_container, GLOBAL_VDEVICE, persistent=GLOBAL_HAILO_PERSISTENT)
                if os.path.exists(hef_container) else None
            )

    return GLOBAL_HAILO_PLATE_MODEL, GLOBAL_HAILO_CONTAINER_MODEL


GLOBAL_OCR_QUEUE = Queue(maxsize=50)           # Plate OCR queue
GLOBAL_CONTAINER_OCR_QUEUE = Queue(maxsize=50)  # Container OCR queue
GLOBAL_OCR_THREAD_STARTED = False
# HAI Reader riêng biệt (plate & container) → OCR hai loại chạy SONG SONG trên 2 core
# CPU của Pi 5, không còn xếp hàng qua một lock chung. Mỗi Reader có lock riêng
# (mỗi Reader chỉ do 1 worker thread dùng; lock để an toàn khi nhiều camera đổ vào).
GLOBAL_PLATE_OCR_LOCK = threading.Lock()
GLOBAL_CONTAINER_OCR_LOCK = threading.Lock()

OCR_ALLOWLIST = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'


def _resolve_ocr_backend():
    """Chọn backend OCR thực tế: ưu tiên OCR_ENGINE, fallback easyocr nếu thiếu rapidocr."""
    want = (OCR_ENGINE or "rapidocr").lower()
    if want == "rapidocr":
        if HAS_RAPIDOCR:
            return "rapidocr"
        print("[AI] OCR_ENGINE=rapidocr nhưng chưa cài rapidocr-onnxruntime → fallback easyocr.")
    return "easyocr"


class _OCRReader:
    """
    Bọc EasyOCR hoặc RapidOCR về CÙNG MỘT API: .read(img) → [(box4, text, prob), ...]
    với box4 = 4 điểm [[x,y],...] (cùng quy ước cho cả hai backend).
    """
    def __init__(self, backend, engine, allowlist=None):
        self.backend = backend
        self.engine = engine
        self.allowlist = allowlist

    def read(self, img):
        if self.backend == "rapidocr":
            # use_cls=False: bỏ bước phân loại xoay 180° cho nhanh (ảnh cổng thường đứng).
            res, _ = self.engine(img, use_cls=False)
            return list(res) if res else []
        out = self.engine.readtext(img, allowlist=self.allowlist)
        return [(box, text, prob) for (box, text, prob) in out]


def _preprocess_for_ocr(image, task_type, backend):
    """Tiền xử lý theo backend: EasyOCR thích ảnh xám CLAHE; RapidOCR (PP-OCR) tự chuẩn
    hoá tốt hơn trên ảnh màu, chỉ cần phóng to đủ để chữ rõ."""
    if backend == "rapidocr":
        if image is None or image.size == 0:
            return image
        h, w = image.shape[:2]
        target_h = 64 if task_type == "plate" else 56
        if 0 < h < target_h:
            scale = target_h / h
            image = cv2.resize(image, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_CUBIC)
        if image.ndim == 2:
            image = cv2.cvtColor(image, cv2.COLOR_GRAY2BGR)
        return image
    # easyocr
    return preprocess_image_plate(image) if task_type == "plate" else preprocess_image_container(image)


# Khoảng lặng DETECTION (giây) để coi như "xe mới".
# QUAN TRỌNG: mốc thời gian được làm mới mỗi khi CÓ DETECTION (xem _touch_vote),
# KHÔNG phải mỗi khi OCR ra kết quả. OCR trên CPU chậm nên nếu tính theo OCR thì rất
# dễ reset nhầm GIỮA CHỪNG một xe → phiếu không bao giờ đủ để chốt. Tính theo detection
# thì khi xe còn trong khung, bộ đếm luôn "sống" và tích luỹ; chỉ reset khi xe đã rời
# khung > ngần này giây (lúc đó bắt đầu chốt cho xe kế tiếp).
VOTE_RESET_GAP = 5.0


def _touch_vote(bucket):
    """
    Gọi mỗi khi có DETECTION của loại tương ứng. Nếu trước đó có khoảng lặng detection
    dài hơn VOTE_RESET_GAP thì coi là XE MỚI → reset bộ đếm trước khi tích luỹ tiếp.
    Nhờ tách khỏi OCR, xe đang đứng yên (OCR chậm) sẽ KHÔNG bị reset giữa chừng.
    """
    now = time.time()
    with bucket["lock"]:
        if bucket["last_update"] > 0 and now - bucket["last_update"] > VOTE_RESET_GAP:
            bucket["votes"].clear()
            bucket["samples"] = 0
            bucket["finalized"] = None
        bucket["last_update"] = now


def _accumulate_vote(bucket, text, task_type):
    """
    Cộng dồn phiếu (vote) cho MỘT loại (plate/container) ở cấp CAMERA — độc lập với
    track_id. Nhờ vậy dù tracker mất/đổi ID liên tục (che khuất, detect trượt), phiếu
    vẫn được giữ và tiến tới chốt, thay vì bị reset về 0 mỗi lần đổi ID.

    Vòng đời (reset khi xe rời khung) do _touch_vote lo. Hàm này chỉ cộng phiếu + chốt.
    Trả về (best_text, is_finalized, just_finalized).
    """
    just_finalized = False
    with bucket["lock"]:
        # Đã chốt cho xe hiện tại → không cộng thêm, không gửi lại.
        if bucket["finalized"] is not None:
            return bucket["finalized"], True, False

        bucket["votes"][text] += 1
        bucket["samples"] += 1
        best, count = bucket["votes"].most_common(1)[0]

        if task_type == "plate":
            # ≥3 lần giống hệt, HOẶC 6 mẫu mà top ≥2, HOẶC đã thử ≥10 lần thì chốt "best".
            stable = (count >= 3
                      or (bucket["samples"] >= 6 and count >= 2)
                      or bucket["samples"] >= 10)
        else:
            # Container không checksum: ≥4 giống hệt, HOẶC 8 mẫu & top ≥3, HOẶC ≥15 lần.
            stable = (count >= 4
                      or (bucket["samples"] >= 8 and count >= 3)
                      or bucket["samples"] >= 15)

        if stable:
            bucket["finalized"] = best
            just_finalized = True
        return best, stable, just_finalized


def get_ocr():
    """Lazily initialize the two OCR readers (backend theo config) và start workers."""
    global GLOBAL_PLATE_OCR_READER, GLOBAL_CONTAINER_OCR_READER
    global GLOBAL_MODELS_LOADED, GLOBAL_OCR_THREAD_STARTED
    with GLOBAL_MODEL_LOCK:
        if not GLOBAL_MODELS_LOADED:
            backend = _resolve_ocr_backend()
            # Chia đều core CPU cho 2 worker OCR: mỗi engine dùng ~1 nửa số core →
            # plate & container chạy SONG SONG thật, thay vì cùng giành cả 4 core
            # (oversubscribe → chậm và giống như tuần tự).
            n_cores = os.cpu_count() or 4
            per_worker = max(1, n_cores // 2)
            print(f"=== INIT OCR (backend={backend}, {per_worker} threads/worker) ===")

            if backend == "rapidocr":
                # 2 engine RapidOCR riêng → gọi song song an toàn (session độc lập).
                GLOBAL_PLATE_OCR_READER = _OCRReader(
                    "rapidocr", RapidOCR(intra_op_num_threads=per_worker))
                GLOBAL_CONTAINER_OCR_READER = _OCRReader(
                    "rapidocr", RapidOCR(intra_op_num_threads=per_worker))
            else:
                import easyocr
                if HAS_TORCH:
                    try:
                        torch.set_num_threads(per_worker)
                    except Exception as e:
                        print(f"[AI] set_num_threads failed: {e}")
                use_gpu = HAS_TORCH and torch.cuda.is_available()
                print(f"[AI] Initializing 2 EasyOCR Readers (GPU={use_gpu})...")
                GLOBAL_PLATE_OCR_READER = _OCRReader(
                    "easyocr", easyocr.Reader(OCR_LANGUAGES, gpu=use_gpu), OCR_ALLOWLIST)
                GLOBAL_CONTAINER_OCR_READER = _OCRReader(
                    "easyocr", easyocr.Reader(OCR_LANGUAGES, gpu=use_gpu), OCR_ALLOWLIST)

            GLOBAL_MODELS_LOADED = True

        if not GLOBAL_OCR_THREAD_STARTED:
            threading.Thread(target=_plate_ocr_worker, daemon=True).start()
            threading.Thread(target=_container_ocr_worker, daemon=True).start()
            GLOBAL_OCR_THREAD_STARTED = True

    return GLOBAL_PLATE_OCR_READER


# ---------------------------------------------------------------------------
# Background OCR worker threads
# ---------------------------------------------------------------------------

def _plate_ocr_worker():
    """
    Background thread: nhận crop biển số từ queue, chạy OCR, cộng phiếu vào bộ đếm
    vote CẤP CAMERA (bền vững qua các lần đổi track_id) rồi chốt khi ổn định.
    """
    while True:
        task = GLOBAL_OCR_QUEUE.get()
        if task is None:
            break

        vote_bucket, track_state_dict, track_id, cropped_plate, gate_type, camera_ip = task

        processed_img = _preprocess_for_ocr(cropped_plate, "plate", GLOBAL_PLATE_OCR_READER.backend)

        with GLOBAL_PLATE_OCR_LOCK:
            ocr_results = GLOBAL_PLATE_OCR_READER.read(processed_img)

        # Sắp xếp theo hàng (Y) rồi theo cột (X) — xử lý biển số 2 dòng
        def get_sort_key(item):
            bbox = item[0]
            y_center = (bbox[0][1] + bbox[2][1]) / 2
            x_center = (bbox[0][0] + bbox[1][0]) / 2
            return (int(y_center // 15), x_center)

        ocr_results.sort(key=get_sort_key)

        raw_plate_parts = [text for (bbox, text, prob) in ocr_results if prob > OCR_CONFIDENCE_THRESHOLD]
        raw_text_combined = "".join(raw_plate_parts)
        validated_plate = clean_and_format_plate(raw_text_combined)

        if validated_plate:
            best, finalized, just_finalized = _accumulate_vote(vote_bucket, validated_plate, "plate")

            if track_id in track_state_dict:
                track_state_dict[track_id]["plate_text"] = best
                track_state_dict[track_id]["ocr_status"] = "done" if finalized else "pending"
                track_state_dict[track_id]["color"] = (0, 255, 0) if finalized else (0, 255, 255)

            if just_finalized:
                print(f"\n{'='*50}")
                print(f"[OCR ỔN ĐỊNH] PLATE → KẾT QUẢ: {best}")
                print(f"{'='*50}\n")
                send_scan_event(best, "plate", 1.0, gate_type, camera_ip)
            else:
                print(f"[LẤY MẪU] PLATE → {validated_plate} | Tạm: {best}")
        elif track_id in track_state_dict and track_state_dict[track_id]["ocr_status"] != "done":
            track_state_dict[track_id]["ocr_status"] = "pending"

        GLOBAL_OCR_QUEUE.task_done()


def _container_ocr_worker():
    """
    Background thread: nhận crop mã container từ queue, chạy OCR,
    cập nhật track_state theo cơ chế voting (majority vote).

    So với pipeline biển số:
    - Dùng Reader RIÊNG (GLOBAL_CONTAINER_OCR_READER) → chạy song song với plate.
    - Dùng preprocess_image_container (blur nhẹ hơn, tránh khuếch đại sóng container)
    - Dùng clean_and_format_container (sliding-window 10 ký tự, ép 4 chữ + 6 số)
    - Xử lý "đọc ngược" bằng cách sinh 2 kịch bản nối chữ (theo Y và theo X)
    - Ngưỡng confidence thấp hơn (0.2) vì container hay bị bóng mờ
    - Vote cấp camera, chốt khi ≥4 lần giống hệt (hạ từ 6 để chốt nhanh hơn).
    """
    CONTAINER_OCR_MIN_PROB = 0.2

    while True:
        task = GLOBAL_CONTAINER_OCR_QUEUE.get()
        if task is None:
            break

        vote_bucket, track_state_dict, track_id, cropped_container, gate_type, camera_ip = task

        processed_img = _preprocess_for_ocr(cropped_container, "container", GLOBAL_CONTAINER_OCR_READER.backend)

        with GLOBAL_CONTAINER_OCR_LOCK:
            ocr_results = GLOBAL_CONTAINER_OCR_READER.read(processed_img)

        # Lọc kết quả đạt ngưỡng confidence
        valid_parts = [(bbox, text) for (bbox, text, prob) in ocr_results if prob > CONTAINER_OCR_MIN_PROB]

        # Kịch bản 1: Nối chữ theo thứ tự mặc định của EasyOCR (Top→Bottom, Left→Right)
        raw_text_y = "".join([text for bbox, text in valid_parts])
        res_y = clean_and_format_container(raw_text_y)

        # Kịch bản 2: Ép sắp xếp từ trái qua phải (theo trục X)
        # Giải quyết lỗi "đọc ngược" khi camera quay nghiêng
        parts_sorted_x = sorted(valid_parts, key=lambda p: p[0][0][0])
        raw_text_x = "".join([text for bbox, text in parts_sorted_x])
        res_x = clean_and_format_container(raw_text_x)

        # Ưu tiên kịch bản nào ra được mã chuẩn
        validated_text = res_y if res_y else res_x

        if validated_text:
            best, finalized, just_finalized = _accumulate_vote(vote_bucket, validated_text, "container")

            if track_id in track_state_dict:
                track_state_dict[track_id]["plate_text"] = best
                track_state_dict[track_id]["ocr_status"] = "done" if finalized else "pending"
                track_state_dict[track_id]["color"] = (0, 255, 0) if finalized else (0, 255, 255)

            if just_finalized:
                print(f"\n{'='*50}")
                print(f"[OCR ỔN ĐỊNH] CONTAINER → KẾT QUẢ: {best}")
                print(f"{'='*50}\n")
                send_scan_event(best, "container", 1.0, gate_type, camera_ip)
            else:
                print(f"[LẤY MẪU] CONTAINER → {validated_text} | Tạm: {best}")
        elif track_id in track_state_dict and track_state_dict[track_id]["ocr_status"] != "done":
            track_state_dict[track_id]["ocr_status"] = "pending"

        GLOBAL_CONTAINER_OCR_QUEUE.task_done()


# ---------------------------------------------------------------------------
# Main AI Processor class
# ---------------------------------------------------------------------------

class AIProcessor:
    """
    Xử lý frame camera: chạy YOLO detection + tracking cho cả biển số xe (plate)
    và mã container (container), sau đó gửi crop vào hàng đợi OCR background.

    Trên Pi 5 + Hailo-8L: dùng 1 VDevice/2 model HEF dùng chung (singleton), pipeline
    thường trực, và chạy 2 model qua ThreadPoolExecutor để overlap phần xử lý host
    (resize/decode/OCR-enqueue) — không còn cảnh "container xong mới tới biển số".
    """

    def __init__(self, gate_type="in", camera_ip=None):
        self.ocr_reader = get_ocr()
        self.gate_type = gate_type
        self.camera_ip = camera_ip

        if HAILO_AVAILABLE:
            self.vdevice = True
            self.device = 'cpu'
            self.plate_model, self.container_model = get_hailo_models()
        else:
            # Nhánh không-Hailo (test trên laptop): cần torch + ultralytics.
            from ultralytics import YOLO
            self.vdevice = None
            self.device = 'cuda:0' if (HAS_TORCH and torch.cuda.is_available()) else 'cpu'
            self.plate_model = YOLO(YOLO_PLATE_MODEL_PATH) if os.path.exists(YOLO_PLATE_MODEL_PATH) else None
            self.container_model = YOLO(YOLO_CONTAINER_MODEL_PATH) if os.path.exists(YOLO_CONTAINER_MODEL_PATH) else None

        # Tracking state riêng cho mỗi loại (plate / container) — chỉ dùng để VẼ.
        self.plate_track_state = {}
        self.container_track_state = {}

        # Bộ đếm vote cấp CAMERA — bền vững qua các lần tracker đổi track_id, nên biển
        # số/container không bị "reset về 0" mỗi khi mất box một nhịp rồi bắt lại.
        self.plate_votes = self._new_vote_bucket()
        self.container_votes = self._new_vote_bucket()

        if HAILO_AVAILABLE:
            from src.services.hailo_yolo import CentroidTracker
            # maxDisappeared nới rộng để giữ ID qua các nhịp detect trượt (đỡ nhấp nháy).
            self.plate_tracker = CentroidTracker(maxDisappeared=30, maxDistance=100)
            self.container_tracker = CentroidTracker(maxDisappeared=30, maxDistance=100)
        else:
            self.plate_tracker = None
            self.container_tracker = None

        self.TRACK_TIMEOUT = 10.0
        self.frame_count = 0

        # Chạy 2 model song song (overlap host-side work). 1 executor/ camera.
        self._executor = ThreadPoolExecutor(max_workers=2, thread_name_prefix="ai-track")

        # Frame-skip detection để giảm tải NPU khi cần (mặc định 1 = detect mỗi frame).
        self.detect_interval = max(1, DETECT_INTERVAL)
        self._last_draws = []

    @staticmethod
    def _new_vote_bucket():
        return {
            "votes": Counter(),
            "samples": 0,
            "last_update": 0.0,
            "finalized": None,
            "lock": threading.Lock(),
        }

    def _cleanup_stale_tracks(self):
        """Dọn dẹp các track_id cũ không xuất hiện trên màn hình > TRACK_TIMEOUT giây."""
        current_time = time.time()
        for state_dict in (self.plate_track_state, self.container_track_state):
            stale_ids = [tid for tid, data in state_dict.items()
                         if current_time - data["last_seen"] > self.TRACK_TIMEOUT]
            for tid in stale_ids:
                del state_dict[tid]
                print(f"[CLEANUP] Đã dọn dẹp bộ nhớ ID: {tid}")

    def _process_tracking(self, frame, frame_resized, model, task_type, track_state_dict, h_orig, w_orig, current_time):
        """
        Xử lý detection + tracking cho MỘT model (plate hoặc container).

        KHÔNG vẽ trực tiếp lên frame — thay vào đó trả về danh sách 'draw ops'
        [(x1, y1, x2, y2, color, text), ...] để hàm gọi (chạy ở main thread) vẽ tuần tự.
        Nhờ vậy 2 model có thể chạy song song trong 2 thread mà không tranh ghi lên
        cùng một cv2.Mat (tránh race/segfault).

        - Plate: detect trên ảnh gốc full-res → nhìn xa hơn
        - Container: detect trên ảnh 800x600 → tiết kiệm tải
        """
        conf_threshold = 0.35 if task_type == "plate" else DETECTION_CONFIDENCE_THRESHOLD
        default_color = (0, 0, 255) if task_type == "plate" else (255, 0, 0)
        ocr_queue = GLOBAL_OCR_QUEUE if task_type == "plate" else GLOBAL_CONTAINER_OCR_QUEUE
        vote_bucket = self.plate_votes if task_type == "plate" else self.container_votes
        draws = []

        if task_type == "plate":
            detect_frame = frame
            scale_x = w_orig / 640.0
            scale_y = h_orig / 640.0
            scale_x_draw = 800 / w_orig
            scale_y_draw = 600 / h_orig
            scale_x_crop = 1.0
            scale_y_crop = 1.0
        else:
            detect_frame = frame_resized
            scale_x = 800 / 640.0
            scale_y = 600 / 640.0
            scale_x_draw = 1.0
            scale_y_draw = 1.0
            scale_x_crop = w_orig / 800.0
            scale_y_crop = h_orig / 600.0

        def _register_and_maybe_ocr(det_id, x1_det, y1_det, x2_det, y2_det):
            """Cập nhật track state + enqueue OCR + trả về (color, plate_text) để vẽ."""
            # Có detection → giữ bộ đếm vote "sống" (và reset nếu vừa qua 1 xe mới).
            _touch_vote(vote_bucket)
            track_id = f"{task_type}_{det_id}"
            if track_id not in track_state_dict:
                track_state_dict[track_id] = {
                    "plate_text": None,
                    "history": [],
                    "ocr_status": "pending",
                    "last_seen": current_time,
                    "color": default_color,
                }
            else:
                track_state_dict[track_id]["last_seen"] = current_time

            state = track_state_dict[track_id]

            if state["ocr_status"] == "pending":
                # Nếu đã chốt cho xe hiện tại (bucket còn "nóng") thì khỏi OCR track mới.
                with vote_bucket["lock"]:
                    done_recent = (vote_bucket["finalized"] is not None and
                                   current_time - vote_bucket["last_update"] < VOTE_RESET_GAP)
                    done_text = vote_bucket["finalized"]

                if done_recent:
                    state["ocr_status"] = "done"
                    state["color"] = (0, 255, 0)
                    state["plate_text"] = done_text
                else:
                    padding = 15 if task_type == "container" else 5
                    x1_org = max(0, int(x1_det * scale_x_crop) - padding)
                    y1_org = max(0, int(y1_det * scale_y_crop) - padding)
                    x2_org = min(w_orig, int(x2_det * scale_x_crop) + padding)
                    y2_org = min(h_orig, int(y2_det * scale_y_crop) + padding)

                    cropped_img = frame[y1_org:y2_org, x1_org:x2_org]
                    if cropped_img.size > 0 and not ocr_queue.full():
                        state["ocr_status"] = "processing"
                        ocr_queue.put((vote_bucket, track_state_dict, track_id,
                                       cropped_img.copy(), self.gate_type, self.camera_ip))

            return state["color"], state["plate_text"]

        try:
            if HAILO_AVAILABLE and hasattr(model, 'track'):
                tracker = self.plate_tracker if task_type == "plate" else self.container_tracker
                objects = model.track(detect_frame, tracker=tracker, conf_threshold=conf_threshold)

                for objectID, (centroid, rect) in objects.items():
                    x1_det, y1_det, x2_det, y2_det = rect
                    x1_det, x2_det = x1_det * scale_x, x2_det * scale_x
                    y1_det, y2_det = y1_det * scale_y, y2_det * scale_y

                    color, plate_text = _register_and_maybe_ocr(objectID, x1_det, y1_det, x2_det, y2_det)

                    x1_draw = int(x1_det * scale_x_draw)
                    y1_draw = int(y1_det * scale_y_draw)
                    x2_draw = int(x2_det * scale_x_draw)
                    y2_draw = int(y2_det * scale_y_draw)
                    label = task_type.upper()
                    display_text = f"{label} {objectID}: {plate_text if plate_text else 'SCANNING'}"
                    draws.append((x1_draw, y1_draw, x2_draw, y2_draw, color, display_text))

            else:
                # Ultralytics YOLO logic (dùng khi test trên laptop, không có Hailo)
                detect_imgsz = 1280 if task_type == "plate" else 640
                yolo_results = model.track(
                    detect_frame, persist=True, tracker="bytetrack.yaml",
                    device=self.device, verbose=False, conf=conf_threshold, imgsz=detect_imgsz
                )

                if yolo_results and len(yolo_results) > 0 and yolo_results[0].boxes is not None:
                    boxes = yolo_results[0].boxes
                    if boxes.id is not None:
                        track_ids = boxes.id.int().cpu().tolist()
                        xyxys = boxes.xyxy.cpu().tolist()
                        confs = boxes.conf.cpu().tolist()

                        for raw_id, xyxy, conf in zip(track_ids, xyxys, confs):
                            if conf > conf_threshold:
                                x1_det, y1_det, x2_det, y2_det = xyxy
                                color, plate_text = _register_and_maybe_ocr(
                                    int(raw_id), x1_det, y1_det, x2_det, y2_det
                                )

                                x1_draw = int(x1_det * scale_x_draw)
                                y1_draw = int(y1_det * scale_y_draw)
                                x2_draw = int(x2_det * scale_x_draw)
                                y2_draw = int(y2_det * scale_y_draw)
                                label = task_type.upper()
                                display_text = f"{label} {int(raw_id)}: {plate_text if plate_text else 'SCANNING'}"
                                draws.append((x1_draw, y1_draw, x2_draw, y2_draw, color, display_text))
                    else:
                        xyxys = boxes.xyxy.cpu().tolist()
                        confs = boxes.conf.cpu().tolist()
                        for xyxy, conf in zip(xyxys, confs):
                            if conf > conf_threshold:
                                x1_det, y1_det, x2_det, y2_det = xyxy
                                x1_draw = int(x1_det * scale_x_draw)
                                y1_draw = int(y1_det * scale_y_draw)
                                x2_draw = int(x2_det * scale_x_draw)
                                y2_draw = int(y2_det * scale_y_draw)
                                draws.append((x1_draw, y1_draw, x2_draw, y2_draw, (128, 128, 128), "DETECTING..."))

        except Exception as e:
            print(f"[AI] Error during {task_type} tracking: {e}")

        return draws

    def process_frame(self, frame):
        """
        Pipeline xử lý chính cho mỗi frame:
        1. Resize frame về 800x600 (canvas hiển thị + nguồn detect container)
        2. Chạy tracking biển số & container SONG SONG (2 thread)
        3. Vẽ kết quả (main thread) để tránh tranh ghi cv2.Mat
        4. Dọn dẹp track cũ mỗi 30 frame
        """
        if frame is None:
            return None

        self.frame_count += 1
        current_time = time.time()

        if self.frame_count % 30 == 0:
            self._cleanup_stale_tracks()

        h_orig, w_orig, _ = frame.shape
        frame_resized = cv2.resize(frame, (800, 600))

        # Frame-skip: chỉ chạy detection mỗi detect_interval frame, còn lại vẽ lại box cũ.
        run_detection = (self.frame_count % self.detect_interval == 0) or not self._last_draws

        if run_detection:
            futures = []
            if self.plate_model is not None:
                futures.append(self._executor.submit(
                    self._process_tracking, frame, frame_resized, self.plate_model,
                    "plate", self.plate_track_state, h_orig, w_orig, current_time
                ))
            if self.container_model is not None:
                futures.append(self._executor.submit(
                    self._process_tracking, frame, frame_resized, self.container_model,
                    "container", self.container_track_state, h_orig, w_orig, current_time
                ))

            all_draws = []
            for f in futures:
                try:
                    all_draws.extend(f.result())
                except Exception as e:
                    print(f"[AI] tracking future error: {e}")
            self._last_draws = all_draws
        else:
            all_draws = self._last_draws

        # Vẽ tuần tự trên main thread (an toàn với cv2.Mat)
        for (x1_draw, y1_draw, x2_draw, y2_draw, color, display_text) in all_draws:
            cv2.rectangle(frame_resized, (x1_draw, y1_draw), (x2_draw, y2_draw), color, 2)
            cv2.putText(frame_resized, display_text, (x1_draw, y1_draw - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

        return frame_resized
