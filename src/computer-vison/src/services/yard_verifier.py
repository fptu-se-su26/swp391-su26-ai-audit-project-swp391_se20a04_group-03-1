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

# Chạy giám sát bãi mỗi ngần này giây (container đứng yên nên không cần realtime).
VERIFY_INTERVAL = 4.0
# Số lần đọc GIỐNG HỆT trong một ô thì chốt mã của ô đó.
SLOT_VOTE_STABLE = 3
# Không báo lại CÙNG (ô + mã) về backend trong ngần này giây (backend cũng tự debounce loa).
REPORT_COOLDOWN = 60.0
# Ngưỡng confidence tối thiểu cho OCR container (giống pipeline cổng).
CONTAINER_OCR_MIN_PROB = 0.2


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
        return None
    # Thử nối theo thứ tự mặc định và ép theo trục X (camera nghiêng dễ "đọc ngược").
    raw_y = "".join(t for _, t in parts)
    res = aip.clean_and_format_container(raw_y)
    if res:
        return res
    parts_x = sorted(parts, key=lambda p: p[0][0][0])
    raw_x = "".join(t for _, t in parts_x)
    return aip.clean_and_format_container(raw_x)


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
        self.slot_votes = {}    # slotName -> Counter(mã -> số phiếu)
        self.last_report = {}   # slotName -> (mã đã báo, thời điểm)
        self.last_run = 0.0

    def maybe_verify(self, frame, slots):
        """Gọi mỗi frame; tự throttle theo VERIFY_INTERVAL. Không làm gì nếu chưa tới hạn."""
        if self.model is None or frame is None or not slots:
            return
        now = time.time()
        if now - self.last_run < VERIFY_INTERVAL:
            return
        self.last_run = now

        h, w = frame.shape[:2]
        try:
            boxes = _detect_container_boxes(self.model, frame)
        except Exception as e:
            print(f"[Yard Verify] Lỗi detect: {e}")
            return

        for box in boxes:
            slot_name = _slot_of_box(box, slots, w, h)
            if not slot_name:
                continue
            x1, y1, x2, y2 = box
            pad = 15
            crop = frame[max(0, y1 - pad):min(h, y2 + pad), max(0, x1 - pad):min(w, x2 + pad)]
            try:
                code = _ocr_container(crop)
            except Exception as e:
                print(f"[Yard Verify] Lỗi OCR: {e}")
                continue
            if not code:
                continue

            votes = self.slot_votes.setdefault(slot_name, Counter())
            votes[code] += 1
            best, cnt = votes.most_common(1)[0]
            if cnt >= SLOT_VOTE_STABLE:
                self._report(slot_name, best)
                votes.clear()

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
