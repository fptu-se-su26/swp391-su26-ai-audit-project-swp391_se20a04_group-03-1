import cv2
import os
import sys
import easyocr
import re
import time
import threading
import numpy as np
from collections import Counter
from queue import Queue
import torch
from ultralytics import YOLO

try:
    from src.services.hailo_yolo import HailoYOLO, HAILO_AVAILABLE
except ImportError:
    HAILO_AVAILABLE = False
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.config import (
    YOLO_PLATE_MODEL_PATH,
    YOLO_CONTAINER_MODEL_PATH,
    DETECTION_CONFIDENCE_THRESHOLD,
    OCR_CONFIDENCE_THRESHOLD,
    OCR_LANGUAGES
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

GLOBAL_OCR_READER = None
GLOBAL_MODELS_LOADED = False
GLOBAL_MODEL_LOCK = threading.Lock()

GLOBAL_OCR_QUEUE = Queue(maxsize=50)          # Plate OCR queue
GLOBAL_CONTAINER_OCR_QUEUE = Queue(maxsize=50) # Container OCR queue
GLOBAL_OCR_THREAD_STARTED = False
GLOBAL_PLATE_OCR_LOCK = threading.Lock()       # Lock riêng cho plate OCR
GLOBAL_CONTAINER_OCR_LOCK = threading.Lock()   # Lock riêng cho container OCR

OCR_ALLOWLIST = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'


def get_ocr():
    """Lazily initialize the global EasyOCR reader and start worker threads."""
    global GLOBAL_OCR_READER, GLOBAL_MODELS_LOADED, GLOBAL_OCR_THREAD_STARTED
    with GLOBAL_MODEL_LOCK:
        if not GLOBAL_MODELS_LOADED:
            print("=== INITIALIZING GLOBAL OCR ===")
            use_gpu = torch.cuda.is_available()
            print(f"[AI] Initializing EasyOCR Reader (GPU={use_gpu})...")
            GLOBAL_OCR_READER = easyocr.Reader(OCR_LANGUAGES, gpu=use_gpu)
            GLOBAL_MODELS_LOADED = True

        if not GLOBAL_OCR_THREAD_STARTED:
            threading.Thread(target=_plate_ocr_worker, daemon=True).start()
            threading.Thread(target=_container_ocr_worker, daemon=True).start()
            GLOBAL_OCR_THREAD_STARTED = True

    return GLOBAL_OCR_READER


# ---------------------------------------------------------------------------
# Background OCR worker threads
# ---------------------------------------------------------------------------

def _plate_ocr_worker():
    """
    Background thread: nhận crop biển số từ queue, chạy OCR,
    cập nhật track_state theo cơ chế voting (majority vote).
    """
    while True:
        task = GLOBAL_OCR_QUEUE.get()
        if task is None:
            break

        track_state_dict, track_id, cropped_plate, gate_type, camera_ip = task

        # Skip nếu track_id đã bị xóa hoặc đã chốt kết quả
        if track_id not in track_state_dict or track_state_dict[track_id]["ocr_status"] == "done":
            GLOBAL_OCR_QUEUE.task_done()
            continue

        track_state_dict[track_id]["ocr_status"] = "processing"

        processed_img = preprocess_image_plate(cropped_plate)

        with GLOBAL_PLATE_OCR_LOCK:
            ocr_results = GLOBAL_OCR_READER.readtext(processed_img, allowlist=OCR_ALLOWLIST)

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

        if validated_plate and track_id in track_state_dict:
            track_state_dict[track_id]["history"].append(validated_plate)
            counter = Counter(track_state_dict[track_id]["history"])
            best_plate, count = counter.most_common(1)[0]
            track_state_dict[track_id]["plate_text"] = best_plate

            # Ngưỡng ổn định: ≥3 lần giống hệt, hoặc ≥6 mẫu với ≥2 lần
            is_stable = count >= 3 or (len(track_state_dict[track_id]["history"]) >= 6 and count >= 2)

            if is_stable:
                track_state_dict[track_id]["ocr_status"] = "done"
                track_state_dict[track_id]["color"] = (0, 255, 0)  # Xanh lá → chốt
                print(f"\n{'='*50}")
                print(f"[OCR ỔN ĐỊNH] PLATE ID:{track_id} | KẾT QUẢ: {best_plate} ({count}/{len(track_state_dict[track_id]['history'])})")
                print(f"{'='*50}\n")
                send_scan_event(best_plate, "plate", 1.0, gate_type, camera_ip)
            else:
                track_state_dict[track_id]["ocr_status"] = "pending"
                track_state_dict[track_id]["color"] = (0, 255, 255)  # Vàng → đang lấy mẫu
                print(f"[LẤY MẪU] PLATE ID:{track_id} → {validated_plate} | Tạm: {best_plate} ({count} lần)")
        elif track_id in track_state_dict:
            track_state_dict[track_id]["ocr_status"] = "pending"

        GLOBAL_OCR_QUEUE.task_done()


def _container_ocr_worker():
    """
    Background thread: nhận crop mã container từ queue, chạy OCR,
    cập nhật track_state theo cơ chế voting (majority vote).

    So với pipeline biển số:
    - Dùng preprocess_image_container (blur nhẹ hơn, tránh khuếch đại sóng container)
    - Dùng clean_and_format_container (sliding-window 10 ký tự, ép 4 chữ + 6 số)
    - Xử lý "đọc ngược" bằng cách sinh 2 kịch bản nối chữ (theo Y và theo X)
    - Ngưỡng confidence thấp hơn (0.2) vì container hay bị bóng mờ
    - Yêu cầu voting cao hơn: ≥6 lần giống hệt để chốt (vì không có checksum)
    """
    CONTAINER_OCR_MIN_PROB = 0.2

    while True:
        task = GLOBAL_CONTAINER_OCR_QUEUE.get()
        if task is None:
            break

        track_state_dict, track_id, cropped_container, gate_type, camera_ip = task

        # Skip nếu đã chốt hoặc bị dọn dẹp
        if track_id not in track_state_dict or track_state_dict[track_id]["ocr_status"] == "done":
            GLOBAL_CONTAINER_OCR_QUEUE.task_done()
            continue

        track_state_dict[track_id]["ocr_status"] = "processing"

        processed_img = preprocess_image_container(cropped_container)

        with GLOBAL_CONTAINER_OCR_LOCK:
            ocr_results = GLOBAL_OCR_READER.readtext(processed_img, allowlist=OCR_ALLOWLIST)

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

        if validated_text and track_id in track_state_dict:
            track_state_dict[track_id]["history"].append(validated_text)
            counter = Counter(track_state_dict[track_id]["history"])
            best_text, count = counter.most_common(1)[0]
            track_state_dict[track_id]["plate_text"] = best_text

            # Container (10 ký tự, không có checksum):
            # Yêu cầu ≥6 lần giống hệt, hoặc ≥15 mẫu với ≥5 lần
            is_stable = count >= 6 or (len(track_state_dict[track_id]["history"]) >= 15 and count >= 5)

            if is_stable:
                track_state_dict[track_id]["ocr_status"] = "done"
                track_state_dict[track_id]["color"] = (0, 255, 0)  # Xanh lá → chốt
                print(f"\n{'='*50}")
                print(f"[OCR ỔN ĐỊNH] CONTAINER ID:{track_id} | KẾT QUẢ: {best_text} ({count}/{len(track_state_dict[track_id]['history'])})")
                print(f"{'='*50}\n")
                send_scan_event(best_text, "container", 1.0, gate_type, camera_ip)
            else:
                track_state_dict[track_id]["ocr_status"] = "pending"
                track_state_dict[track_id]["color"] = (0, 255, 255)  # Vàng → đang lấy mẫu
                print(f"[LẤY MẪU] CONTAINER ID:{track_id} → {validated_text} | Tạm: {best_text} ({count} lần)")
        elif track_id in track_state_dict:
            track_state_dict[track_id]["ocr_status"] = "pending"

        GLOBAL_CONTAINER_OCR_QUEUE.task_done()


# ---------------------------------------------------------------------------
# Main AI Processor class
# ---------------------------------------------------------------------------

class AIProcessor:
    """
    Xử lý frame camera: chạy YOLO detection + ByteTrack tracking cho cả
    biển số xe (plate) và mã container (container), sau đó gửi crop vào
    hàng đợi OCR background để nhận diện văn bản.
    """

    def __init__(self, gate_type="in", camera_ip=None):
        self.ocr_reader = get_ocr()
        self.gate_type = gate_type
        self.camera_ip = camera_ip

        if HAILO_AVAILABLE:
            from hailo_platform import VDevice
            try:
                self.vdevice = VDevice()
            except Exception as e:
                print(f"[AI] Cannot open VDevice: {e}")
                self.vdevice = None
            
            hef_plate = YOLO_PLATE_MODEL_PATH.replace(".onnx", ".hef").replace(".pt", ".hef")
            hef_container = YOLO_CONTAINER_MODEL_PATH.replace(".onnx", ".hef").replace(".pt", ".hef")
            
            self.plate_model = HailoYOLO(hef_plate, self.vdevice) if os.path.exists(hef_plate) and self.vdevice else None
            self.container_model = HailoYOLO(hef_container, self.vdevice) if os.path.exists(hef_container) and self.vdevice else None
        else:
            self.vdevice = None
            self.device = 'cuda:0' if torch.cuda.is_available() else 'cpu'
            self.plate_model = YOLO(YOLO_PLATE_MODEL_PATH) if os.path.exists(YOLO_PLATE_MODEL_PATH) else None
            self.container_model = YOLO(YOLO_CONTAINER_MODEL_PATH) if os.path.exists(YOLO_CONTAINER_MODEL_PATH) else None

        # Tracking state riêng cho mỗi loại (plate / container)
        self.plate_track_state = {}
        self.container_track_state = {}
        self.TRACK_TIMEOUT = 10.0
        self.frame_count = 0

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
        Hàm tổng quát xử lý tracking cho một model YOLO (plate hoặc container).
        - Plate: detect trên ảnh gốc full-res + imgsz=1280 → nhìn xa hơn
        - Container: detect trên ảnh 800x600 + imgsz=640 → tiết kiệm GPU
        """
        conf_threshold = 0.35 if task_type == "plate" else DETECTION_CONFIDENCE_THRESHOLD
        default_color = (0, 0, 255) if task_type == "plate" else (255, 0, 0)
        ocr_queue = GLOBAL_OCR_QUEUE if task_type == "plate" else GLOBAL_CONTAINER_OCR_QUEUE

        # Plate: detect trên frame gốc (full-res)
        # Container: detect trên frame_resized (800x600)
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

        try:
            # HailoYOLO.track() trả về dict: objectID -> (centroid, (x1, y1, x2, y2) ở hệ 640x640)
            objects = model.track(detect_frame, conf_threshold=conf_threshold)

            for objectID, (centroid, rect) in objects.items():
                x1_det, y1_det, x2_det, y2_det = rect
                
                # Đưa về hệ tọa độ của detect_frame
                x1_det, x2_det = x1_det * scale_x, x2_det * scale_x
                y1_det, y2_det = y1_det * scale_y, y2_det * scale_y
                
                track_id = f"{task_type}_{objectID}"

                if track_id not in track_state_dict:
                    track_state_dict[track_id] = {
                        "plate_text": None,
                        "history": [],
                        "ocr_status": "pending",
                        "last_seen": current_time,
                        "color": default_color
                    }
                else:
                    track_state_dict[track_id]["last_seen"] = current_time

                state = track_state_dict[track_id]

                if state["ocr_status"] == "pending":
                    padding = 15 if task_type == "container" else 5

                    # Tọa độ để crop trên frame gốc
                    x1_org = max(0, int(x1_det * scale_x_crop) - padding)
                    y1_org = max(0, int(y1_det * scale_y_crop) - padding)
                    x2_org = min(w_orig, int(x2_det * scale_x_crop) + padding)
                    y2_org = min(h_orig, int(y2_det * scale_y_crop) + padding)

                    cropped_img = frame[y1_org:y2_org, x1_org:x2_org]
                    if cropped_img.size > 0 and not ocr_queue.full():
                        state["ocr_status"] = "processing"
                        ocr_queue.put((track_state_dict, track_id, cropped_img, self.gate_type, self.camera_ip))

                # Tọa độ để vẽ lên frame_resized (800x600)
                x1_draw = int(x1_det * scale_x_draw)
                y1_draw = int(y1_det * scale_y_draw)
                x2_draw = int(x2_det * scale_x_draw)
                y2_draw = int(y2_det * scale_y_draw)

                label = task_type.upper()
                display_text = f"{label} {objectID}: {state['plate_text'] if state['plate_text'] else 'SCANNING'}"
                cv2.rectangle(frame_resized, (x1_draw, y1_draw), (x2_draw, y2_draw), state["color"], 2)
                cv2.putText(frame_resized, display_text, (x1_draw, y1_draw - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, state["color"], 2)

        except Exception as e:
            print(f"[AI] Error during {task_type} tracking: {e}")

    def process_frame(self, frame):
        """
        Pipeline xử lý chính cho mỗi frame:
        1. Resize frame về 800x600 cho YOLO
        2. Chạy tracking biển số (mỗi frame)
        3. Chạy tracking container (mỗi frame)
        4. Dọn dẹp track cũ mỗi 30 frame
        """
        if frame is None:
            return None

        self.frame_count += 1
        current_time = time.time()

        if self.frame_count % 30 == 0:
            ocr_results = GLOBAL_OCR_READER.readtext(processed_img, allowlist=OCR_ALLOWLIST)

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

        if validated_text and track_id in track_state_dict:
            track_state_dict[track_id]["history"].append(validated_text)
            counter = Counter(track_state_dict[track_id]["history"])
            best_text, count = counter.most_common(1)[0]
            track_state_dict[track_id]["plate_text"] = best_text

            # Container (10 ký tự, không có checksum):
            # Yêu cầu ≥6 lần giống hệt, hoặc ≥15 mẫu với ≥5 lần
            is_stable = count >= 6 or (len(track_state_dict[track_id]["history"]) >= 15 and count >= 5)

            if is_stable:
                track_state_dict[track_id]["ocr_status"] = "done"
                track_state_dict[track_id]["color"] = (0, 255, 0)  # Xanh lá → chốt
                print(f"\n{'='*50}")
                print(f"[OCR ỔN ĐỊNH] CONTAINER ID:{track_id} | KẾT QUẢ: {best_text} ({count}/{len(track_state_dict[track_id]['history'])})")
                print(f"{'='*50}\n")
                send_scan_event(best_text, "container", 1.0, gate_type, camera_ip)
            else:
                track_state_dict[track_id]["ocr_status"] = "pending"
                track_state_dict[track_id]["color"] = (0, 255, 255)  # Vàng → đang lấy mẫu
                print(f"[LẤY MẪU] CONTAINER ID:{track_id} → {validated_text} | Tạm: {best_text} ({count} lần)")
        elif track_id in track_state_dict:
            track_state_dict[track_id]["ocr_status"] = "pending"

        GLOBAL_CONTAINER_OCR_QUEUE.task_done()


# ---------------------------------------------------------------------------
# Main AI Processor class
# ---------------------------------------------------------------------------

class AIProcessor:
    """
    Xử lý frame camera: chạy YOLO detection + ByteTrack tracking cho cả
    biển số xe (plate) và mã container (container), sau đó gửi crop vào
    hàng đợi OCR background để nhận diện văn bản.
    """

    def __init__(self, gate_type="in", camera_ip=None):
        self.ocr_reader = get_ocr()
        self.gate_type = gate_type
        self.camera_ip = camera_ip

        if HAILO_AVAILABLE:
            from hailo_platform import VDevice
            try:
                self.vdevice = VDevice()
            except Exception as e:
                print(f"[AI] Cannot open VDevice: {e}")
                self.vdevice = None
            
            hef_plate = YOLO_PLATE_MODEL_PATH.replace(".onnx", ".hef").replace(".pt", ".hef")
            hef_container = YOLO_CONTAINER_MODEL_PATH.replace(".onnx", ".hef").replace(".pt", ".hef")
            
            self.plate_model = HailoYOLO(hef_plate, self.vdevice) if os.path.exists(hef_plate) and self.vdevice else None
            self.container_model = HailoYOLO(hef_container, self.vdevice) if os.path.exists(hef_container) and self.vdevice else None
        else:
            self.vdevice = None
            self.device = 'cuda:0' if torch.cuda.is_available() else 'cpu'
            self.plate_model = YOLO(YOLO_PLATE_MODEL_PATH) if os.path.exists(YOLO_PLATE_MODEL_PATH) else None
            self.container_model = YOLO(YOLO_CONTAINER_MODEL_PATH) if os.path.exists(YOLO_CONTAINER_MODEL_PATH) else None

        # Tracking state riêng cho mỗi loại (plate / container)
        self.plate_track_state = {}
        self.container_track_state = {}
        self.TRACK_TIMEOUT = 10.0
        self.frame_count = 0

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
        Hàm tổng quát xử lý tracking cho một model YOLO (plate hoặc container).
        - Plate: detect trên ảnh gốc full-res + imgsz=1280 → nhìn xa hơn
        - Container: detect trên ảnh 800x600 + imgsz=640 → tiết kiệm GPU
        """
        conf_threshold = 0.35 if task_type == "plate" else DETECTION_CONFIDENCE_THRESHOLD
        default_color = (0, 0, 255) if task_type == "plate" else (255, 0, 0)
        ocr_queue = GLOBAL_OCR_QUEUE if task_type == "plate" else GLOBAL_CONTAINER_OCR_QUEUE

        # Plate: detect trên frame gốc (full-res)
        # Container: detect trên frame_resized (800x600)
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

        try:
            # HailoYOLO.track() trả về dict: objectID -> (centroid, (x1, y1, x2, y2) ở hệ 640x640)
            objects = model.track(detect_frame, conf_threshold=conf_threshold)

            for objectID, (centroid, rect) in objects.items():
                x1_det, y1_det, x2_det, y2_det = rect
                
                # Đưa về hệ tọa độ của detect_frame
                x1_det, x2_det = x1_det * scale_x, x2_det * scale_x
                y1_det, y2_det = y1_det * scale_y, y2_det * scale_y
                
                track_id = f"{task_type}_{objectID}"

                if track_id not in track_state_dict:
                    track_state_dict[track_id] = {
                        "plate_text": None,
                        "history": [],
                        "ocr_status": "pending",
                        "last_seen": current_time,
                        "color": default_color
                    }
                else:
                    track_state_dict[track_id]["last_seen"] = current_time

                state = track_state_dict[track_id]

                if state["ocr_status"] == "pending":
                    padding = 15 if task_type == "container" else 5

                    # Tọa độ để crop trên frame gốc
                    x1_org = max(0, int(x1_det * scale_x_crop) - padding)
                    y1_org = max(0, int(y1_det * scale_y_crop) - padding)
                    x2_org = min(w_orig, int(x2_det * scale_x_crop) + padding)
                    y2_org = min(h_orig, int(y2_det * scale_y_crop) + padding)

                    cropped_img = frame[y1_org:y2_org, x1_org:x2_org]
                    if cropped_img.size > 0 and not ocr_queue.full():
                        state["ocr_status"] = "processing"
                        ocr_queue.put((track_state_dict, track_id, cropped_img, self.gate_type, self.camera_ip))

                # Tọa độ để vẽ lên frame_resized (800x600)
                x1_draw = int(x1_det * scale_x_draw)
                y1_draw = int(y1_det * scale_y_draw)
                x2_draw = int(x2_det * scale_x_draw)
                y2_draw = int(y2_det * scale_y_draw)

                label = task_type.upper()
                display_text = f"{label} {objectID}: {state['plate_text'] if state['plate_text'] else 'SCANNING'}"
                cv2.rectangle(frame_resized, (x1_draw, y1_draw), (x2_draw, y2_draw), state["color"], 2)
                cv2.putText(frame_resized, display_text, (x1_draw, y1_draw - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, state["color"], 2)

        except Exception as e:
            print(f"[AI] Error during {task_type} tracking: {e}")

    def process_frame(self, frame):
        """
        Pipeline xử lý chính cho mỗi frame:
        1. Resize frame về 800x600 cho YOLO
        2. Chạy tracking biển số (mỗi frame)
        3. Chạy tracking container (mỗi frame)
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

        # A. Tracking biển số xe
        if self.plate_model is not None:
            self._process_tracking(
                frame, frame_resized, self.plate_model, "plate",
                self.plate_track_state, h_orig, w_orig, current_time
            )

        # B. Tracking mã container
        if self.container_model is not None:
            self._process_tracking(
                frame, frame_resized, self.container_model, "container",
                self.container_track_state, h_orig, w_orig, current_time
            )

        return frame_resized
