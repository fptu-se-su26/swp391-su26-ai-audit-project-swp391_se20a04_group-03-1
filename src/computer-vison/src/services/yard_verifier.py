# -*- coding: utf-8 -*-
"""
Kiểm tra container ĐÚNG Ô tại BÃI ĐỖ.

Camera cổng lo việc quét lúc xe VÀO/RA. Module này lo việc GIÁM SÁT BÃI: với camera đặt ở
bãi, nó OCR mã container của từng container đang đỗ, xác định container đó nằm ở Ô NÀO (theo
hình học slot của yard), rồi báo `{slotName, containerNo}` về backend
(`POST /yards/<id>/verify-slot`). Backend đối chiếu với ô đã cấp lúc check-in; sai vị trí thì
phát loa cổng IN.

Tái dùng hạ tầng sẵn có trong ai_processor:
  - model phát hiện mã container (Hailo HEF dùng chung, hoặc Ultralytics khi test laptop),
  - 2 reader OCR + hàm làm sạch mã container ISO 6346 (clean_and_format_container).

Khác pipeline cổng: KHÔNG vote cấp-camera mà vote CẤP-Ô (mỗi ô một bộ đếm) vì container
đứng yên trong ô — cần biết "ô này đang chứa mã nào", không phải "camera thấy mã nào".
"""
import time
import threading
import requests
import numpy as np
import cv2
from collections import Counter

import src.services.ai_processor as aip
from src.services.ai_processor import (
    HAILO_AVAILABLE,
    get_hailo_models,
    get_ocr,
)
from src.config import (
    BACKEND_URL,
    YOLO_CONTAINER_MODEL_PATH,
    DETECTION_CONFIDENCE_THRESHOLD,
)
import os

# Khớp header nội bộ mà backend chấp nhận (bỏ qua auth) — giống sync_cameras_worker.
INTERNAL_SECRET = "AI_SERVER_SECRET_KEY"

# Chạy giám sát bãi mỗi ngần này giây (nhịp TỐI THIỂU — thực tế trên Pi một vòng detect+OCR
# mất ~5-8s nên chu kỳ thật lớn hơn con số này khá nhiều).
VERIFY_INTERVAL = 2.5
# Không báo lại CÙNG (ô + mã) về backend trong ngần này giây (backend cũng tự debounce loa).
REPORT_COOLDOWN = 60.0
# Ngưỡng confidence tối thiểu cho OCR container (giống pipeline cổng).
CONTAINER_OCR_MIN_PROB = 0.2

# --- Luật vote RIÊNG CỦA BÃI (không dùng chung với gate) ---------------------------------
# Gate dùng VOTE_RESET_GAP = 5s vì XE CHẠY QUA: im 5s tức là xe khác. Ở BÃI thì ngược lại —
# container ĐỨNG YÊN hàng giờ, mà một vòng detect+OCR trên Pi mất tới ~8s, tức là LỚN HƠN 5s.
# Dùng luật gate ở đây khiến mỗi lần quét đều bị coi là "container mới" -> xoá phiếu -> samples
# đứng mãi ở 1 và KHÔNG BAO GIỜ chốt được mã. Vì vậy bãi có mốc reset rộng hơn nhiều: chỉ khi ô
# không thấy container liên tục quá ngần này giây mới coi là ô đã được dọn.
SLOT_VOTE_RESET_GAP = 45.0
# Số lần OCR ra CÙNG một mã thì chốt. Container đứng yên nên 3 lần khớp (~24s) là chắc chắn.
SLOT_VOTE_STABLE = 3
# ...hoặc đã thử ngần này mẫu thì lấy mã có phiếu cao nhất (tránh kẹt mãi vì OCR nhảy 1 ký tự).
SLOT_VOTE_MAX_SAMPLES = 6
# Đã chốt rồi nhưng OCR ra mã KHÁC liên tiếp ngần này lần -> ô đã đổi container, vote lại từ đầu.
SLOT_MISMATCH_RESET = 3


def _new_slot_bucket():
    """Bucket vote cho MỘT ô."""
    return {
        "votes": Counter(),
        "samples": 0,
        "last_update": 0.0,
        "finalized": None,
        "mismatch": 0,
        "lock": threading.Lock(),
    }


def _touch_slot_vote(bucket):
    """
    Gọi mỗi lần THẤY container trong ô (theo detection, không theo OCR).

    Chỉ reset phiếu khi ô đã im lặng quá SLOT_VOTE_RESET_GAP — nghĩa là container đã được
    lấy đi. Khác gate: ở bãi khoảng cách giữa 2 lần quét (~8s) là BÌNH THƯỜNG, không phải
    dấu hiệu đổi container.
    """
    now = time.time()
    with bucket["lock"]:
        if bucket["last_update"] > 0 and now - bucket["last_update"] > SLOT_VOTE_RESET_GAP:
            bucket["votes"].clear()
            bucket["samples"] = 0
            bucket["finalized"] = None
            bucket["mismatch"] = 0
        bucket["last_update"] = now


def _accumulate_slot_vote(bucket, text):
    """
    Cộng phiếu cho ô và chốt theo luật của bãi.

    Trả về (best_text, is_finalized, just_finalized).
    """
    with bucket["lock"]:
        if bucket["finalized"] is not None:
            # Đã chốt: chỉ theo dõi xem có phải container KHÁC vừa được đặt vào không.
            if text == bucket["finalized"]:
                bucket["mismatch"] = 0
                return bucket["finalized"], True, False
            bucket["mismatch"] += 1
            if bucket["mismatch"] < SLOT_MISMATCH_RESET:
                return bucket["finalized"], True, False
            # Đủ số lần lệch → coi như ô đã đổi container, bầu lại từ đầu.
            bucket["votes"].clear()
            bucket["samples"] = 0
            bucket["finalized"] = None
            bucket["mismatch"] = 0

        bucket["votes"][text] += 1
        bucket["samples"] += 1
        best, count = bucket["votes"].most_common(1)[0]

        if count >= SLOT_VOTE_STABLE or bucket["samples"] >= SLOT_VOTE_MAX_SAMPLES:
            bucket["finalized"] = best
            return best, True, True
        return best, False, False


def _get_container_model():
    """Lấy model phát hiện mã container: Hailo HEF dùng chung, hoặc Ultralytics (test laptop)."""
    if HAILO_AVAILABLE:
        _, container_model = get_hailo_models()
        return container_model
    if os.path.exists(YOLO_CONTAINER_MODEL_PATH):
        from ultralytics import YOLO
        return YOLO(YOLO_CONTAINER_MODEL_PATH)
    return None


def _detect_container_boxes(model, frame):
    """Phát hiện vùng mã container → list bbox (x1,y1,x2,y2) ở toạ độ frame GỐC."""
    h, w = frame.shape[:2]
    boxes = []
    if HAILO_AVAILABLE and hasattr(model, "infer"):
        # HailoYOLO.infer trả rects ở hệ 640x640 → scale về frame gốc.
        rects = model.infer(frame, conf_threshold=DETECTION_CONFIDENCE_THRESHOLD)
        sx, sy = w / 640.0, h / 640.0
        for (x1, y1, x2, y2) in rects:
            boxes.append((int(x1 * sx), int(y1 * sy), int(x2 * sx), int(y2 * sy)))
    else:
        results = model(frame, verbose=False, conf=DETECTION_CONFIDENCE_THRESHOLD)
        if results and len(results) > 0 and results[0].boxes is not None:
            for xyxy in results[0].boxes.xyxy.cpu().tolist():
                x1, y1, x2, y2 = map(int, xyxy)
                boxes.append((x1, y1, x2, y2))
    return boxes


def _ocr_container(crop):
    """OCR một crop mã container → mã chuẩn ISO 6346 (10 ký tự) hoặc None."""
    reader = aip.GLOBAL_CONTAINER_OCR_READER
    if reader is None or crop is None or crop.size == 0:
        return None
    img = aip._preprocess_for_ocr(crop, "container", reader.backend)
    with aip.GLOBAL_CONTAINER_OCR_LOCK:
        results = reader.read(img)
    parts = [(bbox, text) for (bbox, text, prob) in results if prob > CONTAINER_OCR_MIN_PROB]
    if not parts:
        print("[Yard Verify] OCR không đọc được ký tự nào trong ô (ảnh mờ/nhỏ/nghiêng?)")
        return None
    # Thử nối theo thứ tự mặc định và ép theo trục X (camera nghiêng dễ "đọc ngược").
    raw_y = "".join(t for _, t in parts)
    res = aip.clean_and_format_container(raw_y)
    if res:
        return res
    parts_x = sorted(parts, key=lambda p: p[0][0][0])
    raw_x = "".join(t for _, t in parts_x)
    res = aip.clean_and_format_container(raw_x)
    if not res:
        print(f"[Yard Verify] OCR thô: '{raw_y}' / '{raw_x}' -> chưa thành mã ISO 6346 hợp lệ")
    return res


def _slot_of_box(box, slots, img_w, img_h):
    """
    Ô nào chứa TÂM của box container. Trả slotName hoặc None.

    Slot lưu hình học theo % (0..100) của khung hình — cùng quy ước với yard_capture_worker.
    Ưu tiên đa giác `points`; không có thì dùng bbox x/y/width/height.
    """
    x1, y1, x2, y2 = box
    cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
    for slot in slots:
        name = slot.get("slotName")
        if not name:
            continue
        if slot.get("points"):
            pts = [[int(p["x"] / 100.0 * img_w), int(p["y"] / 100.0 * img_h)] for p in slot["points"]]
            poly = np.array(pts, np.int32)
            if cv2.pointPolygonTest(poly, (cx, cy), False) >= 0:
                return name
        else:
            sx = int(slot.get("x", 0) / 100.0 * img_w)
            sy = int(slot.get("y", 0) / 100.0 * img_h)
            sw = int(slot.get("width", 0) / 100.0 * img_w)
            sh = int(slot.get("height", 0) / 100.0 * img_h)
            if sx <= cx <= sx + sw and sy <= cy <= sy + sh:
                return name
    return None


class YardVerifier:
    """
    Giám sát 1 bãi: gom phiếu mã container theo TỪNG Ô, chốt khi ổn định rồi báo backend.

    Dùng bền: nếu thiếu model/OCR thì tự vô hiệu (maybe_verify thành no-op), không làm chết
    yard_capture_worker.
    """

    def __init__(self, yard_id):
        self.yard_id = yard_id
        try:
            self.model = _get_container_model()
            get_ocr()  # đảm bảo reader OCR + worker đã nạp
        except Exception as e:
            print(f"[Yard Verify] Không khởi tạo được (bỏ qua giám sát bãi {yard_id}): {e}")
            self.model = None
        self.slot_buckets = {}   # slotName -> vote bucket (giống gate), sống theo detection
        self.last_report = {}    # slotName -> (mã đã báo, thời điểm)
        self.last_run = 0.0
        self.last_boxes = []     # box container lần quét gần nhất, để luồng stream VẼ lại
        self.container_slots = set()  # ô ĐANG có container (yard_capture_worker tính vào occupancy)

    def maybe_verify(self, frame, slots):
        """
        Phát hiện container ở mỗi Ô -> OCR -> vote (kiểu gate) -> báo backend nếu sai vị trí.

        CONTAINER nằm trong ô tức là ô ĐANG BỊ CHIẾM: cập nhật `self.container_slots` để luồng
        capture cộng vào occupancy (ô đứng vững kể cả khi model xe bỏ sót). Trả về list
        (x1, y1, x2, y2, code) để luồng stream vẽ border box (code="" khi chưa OCR ra — vẫn vẽ
        khung để thấy đang quét). Tự throttle theo VERIFY_INTERVAL; giữa 2 lần quét trả box cũ.
        """
        if self.model is None or frame is None or not slots:
            return self.last_boxes
        now = time.time()
        if now - self.last_run < VERIFY_INTERVAL:
            return self.last_boxes
        self.last_run = now

        h, w = frame.shape[:2]
        try:
            boxes = _detect_container_boxes(self.model, frame)
        except Exception as e:
            print(f"[Yard Verify] Lỗi detect: {e}")
            return self.last_boxes

        draw_boxes = []
        container_slots = set()
        for box in boxes:
            slot_name = _slot_of_box(box, slots, w, h)
            if not slot_name:
                continue
            container_slots.add(slot_name)

            # Mốc "sống" theo DETECTION (không theo OCR) nên OCR chậm không làm reset phiếu
            # giữa chừng; chỉ reset khi ô hết thấy container > SLOT_VOTE_RESET_GAP (45s).
            bucket = self.slot_buckets.setdefault(slot_name, _new_slot_bucket())
            _touch_slot_vote(bucket)

            x1, y1, x2, y2 = box
            pad = 15
            crop = frame[max(0, y1 - pad):min(h, y2 + pad), max(0, x1 - pad):min(w, x2 + pad)]
            try:
                code = _ocr_container(crop)
            except Exception as e:
                print(f"[Yard Verify] Lỗi OCR: {e}")
                code = None
            draw_boxes.append((x1, y1, x2, y2, code or ""))
            if not code:
                continue

            # Luật chốt của bãi: ≥3 lần khớp, hoặc ≥6 mẫu thì lấy mã nhiều phiếu nhất.
            best, finalized, just_finalized = _accumulate_slot_vote(bucket, code)
            print(f"[Yard Verify] ô {slot_name}: mẫu '{code}' | tạm '{best}' "
                  f"({bucket['samples']}/{SLOT_VOTE_STABLE} phiếu"
                  f"{' — ĐÃ CHỐT' if finalized else ''})")
            if just_finalized:
                print(f"[Yard Verify] ✅ CHỐT ô {slot_name} = '{best}'")
                self._report(slot_name, best)
            if finalized:
                # Đã chốt: hiện mã đã chốt lên khung vẽ thay vì mã thô của lần OCR này.
                draw_boxes[-1] = (x1, y1, x2, y2, best)

        self.container_slots = container_slots
        self.last_boxes = draw_boxes
        return draw_boxes

    def _report(self, slot_name, code):
        """Báo (ô, mã) về backend, chống lặp cùng (ô+mã) trong REPORT_COOLDOWN."""
        now = time.time()
        prev = self.last_report.get(slot_name)
        if prev and prev[0] == code and now - prev[1] < REPORT_COOLDOWN:
            return
        self.last_report[slot_name] = (code, now)
        try:
            base = BACKEND_URL.replace("/scan", "")
            requests.post(
                f"{base}/yards/{self.yard_id}/verify-slot",
                json={"slotName": slot_name, "containerNo": code},
                headers={"x-internal-secret": INTERNAL_SECRET},
                timeout=3.0,
            )
            print(f"[Yard Verify] Bãi {self.yard_id} ô {slot_name} → {code}")
        except requests.exceptions.RequestException as e:
            print(f"[Yard Verify] Lỗi gửi verify-slot: {e}")
