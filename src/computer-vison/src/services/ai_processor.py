import cv2
import os
import sys
import easyocr
import re
import time
import threading
import threading
from collections import Counter
from queue import Queue
from ultralytics import YOLO
import torch

# Ensure the project root (computer-vison/) is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.config import (
    YOLO_PLATE_MODEL_PATH,
    YOLO_CONTAINER_MODEL_PATH,
    DETECTION_CONFIDENCE_THRESHOLD,
    OCR_CONFIDENCE_THRESHOLD,
    OCR_LANGUAGES
)
from src.services.api_client import send_scan_event

def preprocess_image(image):
    """
    Tiền xử lý ảnh giúp OCR đọc chính xác hơn.
    """
    if image is None or image.size == 0:
        return image
        
    # Phóng to ảnh (giúp OCR dễ nhận diện nét chữ)
    image = cv2.resize(image, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
    
    # Chuyển xám
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Khử nhiễu nhưng giữ lại cạnh sắc (Bilateral Filter)
    blur = cv2.bilateralFilter(gray, 11, 17, 17)
    
    # Cân bằng sáng thích ứng (CLAHE)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(blur)
    
    return enhanced

def clean_and_format_plate(raw_text):
    """
    Làm sạch kết quả Text từ OCR và sửa lỗi ký tự phổ biến dựa trên format Biển số VN
    """
    clean_text = re.sub(r'[^A-Z0-9]', '', raw_text.upper())
    
    if len(clean_text) < 7 or len(clean_text) > 9:
        return None
        
    chars = list(clean_text)
    
    # Từ điển ánh xạ lỗi phổ biến
    char_to_int = {'A': '4', 'B': '8', 'C': '6', 'D': '0', 'G': '6', 'I': '1', 'O': '0', 'Q': '0', 'S': '5', 'Z': '2'}
    int_to_char = {'0': 'D', '1': 'I', '2': 'Z', '4': 'A', '5': 'S', '6': 'G', '8': 'B'}
    
    # 1. Hai ký tự đầu LUÔN LÀ SỐ (Mã tỉnh)
    for i in [0, 1]:
        if chars[i] in char_to_int:
            chars[i] = char_to_int[chars[i]]
            
    # 2. Ký tự thứ 3 LUÔN LÀ CHỮ
    if chars[2] in int_to_char:
        chars[2] = int_to_char[chars[2]]
        
    num_trailing_digits = 5 if len(chars) >= 8 else 4
    for i in range(len(chars) - num_trailing_digits, len(chars)):
        if chars[i] in char_to_int:
            chars[i] = char_to_int[chars[i]]
            
    return "".join(chars)

class AIProcessor:
    def __init__(self):
        print("=== INITIALIZING AI DETECTORS ===")
        
        self.device = 'cuda:0' if torch.cuda.is_available() else 'cpu'
        print(f"[AI] Using compute device: {self.device}")
        
        # 1. Initialize EasyOCR
        print(f"[AI] Initializing EasyOCR Reader for languages: {OCR_LANGUAGES} on GPU...")
        self.ocr_reader = easyocr.Reader(OCR_LANGUAGES, gpu=True)
        
        # 2. Load License Plate YOLO Model
        print(f"[AI] Loading License Plate YOLO model from: {YOLO_PLATE_MODEL_PATH}...")
        if os.path.exists(YOLO_PLATE_MODEL_PATH):
            self.plate_model = YOLO(YOLO_PLATE_MODEL_PATH)
            print("[AI] License Plate YOLO model loaded successfully.")
        else:
            print(f"[AI] ERROR: Weights file not found at {YOLO_PLATE_MODEL_PATH}. License plate detection will be inactive.")
            self.plate_model = None
            
        # 3. Load Container Code YOLO Model (Optional / fallback)
        print(f"[AI] Loading Container YOLO model from: {YOLO_CONTAINER_MODEL_PATH}...")
        if os.path.exists(YOLO_CONTAINER_MODEL_PATH):
            self.container_model = YOLO(YOLO_CONTAINER_MODEL_PATH)
            print("[AI] Container YOLO model loaded successfully.")
        else:
            print(f"[AI] NOTE: Container weights file not found at {YOLO_CONTAINER_MODEL_PATH}. Container detection will be inactive.")
            self.container_model = None
            
        # Advanced LPR Tracking State
        self.track_state = {}
        self.TRACK_TIMEOUT = 10.0
        self.ocr_queue = Queue(maxsize=20)
        self.frame_count = 0
        
        # Start OCR Worker Thread
        self.worker_thread = threading.Thread(target=self._ocr_worker_thread, daemon=True)
        self.worker_thread.start()

    def _ocr_worker_thread(self):
        while True:
            task = self.ocr_queue.get()
            if task is None:
                break
                
            track_id, cropped_plate = task
            
            if track_id not in self.track_state or self.track_state[track_id]["ocr_status"] == "done":
                self.ocr_queue.task_done()
                continue
                
            self.track_state[track_id]["ocr_status"] = "processing"
            
            processed_img = preprocess_image(cropped_plate)
            ocr_results = self.ocr_reader.readtext(processed_img)
            
            # Combine parts with prob > OCR_CONFIDENCE_THRESHOLD (0.4 by default)
            raw_plate_parts = [text for (bbox, text, prob) in ocr_results if prob > OCR_CONFIDENCE_THRESHOLD]
            raw_text_combined = "".join(raw_plate_parts)
            
            validated_plate = clean_and_format_plate(raw_text_combined)
            
            if validated_plate:
                if track_id in self.track_state:
                    self.track_state[track_id]["history"].append(validated_plate)
                    
                    counter = Counter(self.track_state[track_id]["history"])
                    best_plate, count = counter.most_common(1)[0]
                    
                    self.track_state[track_id]["plate_text"] = best_plate
                    
                    if count >= 5 or len(self.track_state[track_id]["history"]) >= 10:
                        self.track_state[track_id]["ocr_status"] = "done"
                        self.track_state[track_id]["color"] = (0, 255, 0)
                        print(f"\n[OCR ỔN ĐỊNH] ID: {track_id} | BIỂN SỐ: {best_plate}")
                        
                        # Send Webhook when stable
                        # We use prob=1.0 for stability, or calculate average prob
                        send_scan_event(best_plate, "plate", 1.0)
                    else:
                        self.track_state[track_id]["ocr_status"] = "pending"
                        self.track_state[track_id]["color"] = (0, 255, 255)
            else:
                if track_id in self.track_state:
                    self.track_state[track_id]["ocr_status"] = "pending"
                    
            self.ocr_queue.task_done()

    def _cleanup_stale_tracks(self):
        current_time = time.time()
        stale_ids = [tid for tid, data in self.track_state.items() if current_time - data["last_seen"] > self.TRACK_TIMEOUT]
        for tid in stale_ids:
            del self.track_state[tid]

    def process_frame(self, frame):
        """
        Processes a single video frame with YOLO Object Tracking and background OCR.
        """
        if frame is None:
            return None
            
        self.frame_count += 1
        current_time = time.time()
        
        if self.frame_count % 30 == 0:
            self._cleanup_stale_tracks()
            
        h_orig, w_orig, _ = frame.shape
        frame_resized = cv2.resize(frame, (800, 600))
        
        # A. Process License Plates with Tracking
        if self.plate_model is not None:
            try:
                # Use track instead of normal inference
                yolo_results = self.plate_model.track(frame_resized, persist=True, tracker="bytetrack.yaml", device=self.device, verbose=False)
                
                if yolo_results and len(yolo_results) > 0 and yolo_results[0].boxes is not None:
                    boxes = yolo_results[0].boxes
                    
                    if boxes.id is not None:
                        track_ids = boxes.id.int().cpu().tolist()
                        xyxys = boxes.xyxy.cpu().tolist()
                        confs = boxes.conf.cpu().tolist()
                        
                        for track_id, xyxy, conf in zip(track_ids, xyxys, confs):
                            if conf > DETECTION_CONFIDENCE_THRESHOLD:
                                x1, y1, x2, y2 = map(int, xyxy)
                                
                                if track_id not in self.track_state:
                                    self.track_state[track_id] = {
                                        "plate_text": None,
                                        "history": [],
                                        "ocr_status": "pending",
                                        "last_seen": current_time,
                                        "color": (0, 0, 255)
                                    }
                                else:
                                    self.track_state[track_id]["last_seen"] = current_time
                                    
                                state = self.track_state[track_id]
                                
                                if state["ocr_status"] == "pending":
                                    x1_org = int(x1 * w_orig / 800)
                                    y1_org = int(y1 * h_orig / 600)
                                    x2_org = int(x2 * w_orig / 800)
                                    y2_org = int(y2 * h_orig / 600)
                                    
                                    # Khống chế biên
                                    y1_org, y2_org = max(0, y1_org), min(h_orig, y2_org)
                                    x1_org, x2_org = max(0, x1_org), min(w_orig, x2_org)
                                    
                                    cropped_plate = frame[y1_org:y2_org, x1_org:x2_org]
                                    if cropped_plate.size > 0 and not self.ocr_queue.full():
                                        state["ocr_status"] = "processing"
                                        self.ocr_queue.put((track_id, cropped_plate))
                                
                                # Draw
                                display_text = f"ID:{track_id} - {state['plate_text'] if state['plate_text'] else 'SCANNING'}"
                                cv2.rectangle(frame_resized, (x1, y1), (x2, y2), state["color"], 2)
                                cv2.putText(frame_resized, display_text, (x1, y1 - 10), 
                                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, state["color"], 2)
            except Exception as e:
                print(f"[AI] Error during Plate tracking: {e}")
                
        # B. Process Containers (keep original naive logic for containers)
        if self.container_model is not None:
            try:
                container_results = self.container_model(frame_resized, device=self.device, verbose=False)[0]
                for box in container_results.boxes:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    conf = float(box.conf[0])
                    
                    if conf >= DETECTION_CONFIDENCE_THRESHOLD:
                        cv2.rectangle(frame_resized, (x1, y1), (x2, y2), (255, 0, 0), 2)
                        cv2.putText(frame_resized, f"CONTAINER: {conf:.2f}", (x1, y1 - 10), 
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)
                        
                        x1_org = int(x1 * w_orig / 800)
                        y1_org = int(y1 * h_orig / 600)
                        x2_org = int(x2 * w_orig / 800)
                        y2_org = int(y2 * h_orig / 600)
                        
                        cropped_container = frame[y1_org:y2_org, x1_org:x2_org]
                        if cropped_container.size > 0:
                            ocr_results = self.ocr_reader.readtext(cropped_container)
                            for (bbox, text, prob) in ocr_results:
                                if prob >= OCR_CONFIDENCE_THRESHOLD:
                                    clean_text = text.strip().upper()
                                    if len(clean_text) >= 4:
                                        send_scan_event(clean_text, "container", prob)
                                        (top_left, top_right, bottom_right, bottom_left) = bbox
                                        tl = (int(top_left[0]) + x1, int(top_left[1]) + y1)
                                        br = (int(bottom_right[0]) + x1, int(bottom_right[1]) + y1)
                                        cv2.rectangle(frame_resized, tl, br, (0, 255, 255), 2)
                                        cv2.putText(frame_resized, f"{clean_text}", (tl[0], tl[1] - 10), 
                                                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
            except Exception as e:
                print(f"[AI] Error during Container recognition: {e}")
                
        return frame_resized
