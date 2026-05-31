import cv2
import os
import sys
import easyocr
import re
import time
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
    if image is None or image.size == 0:
        return image
    image = cv2.resize(image, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blur = cv2.bilateralFilter(gray, 11, 17, 17)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    return clahe.apply(blur)

def clean_and_format_plate(raw_text):
    clean_text = re.sub(r'[^A-Z0-9]', '', raw_text.upper())
    if len(clean_text) < 7 or len(clean_text) > 9:
        return None
    chars = list(clean_text)
    char_to_int = {'A': '4', 'B': '8', 'C': '6', 'D': '0', 'G': '6', 'I': '1', 'O': '0', 'Q': '0', 'S': '5', 'Z': '2', 'L': '4'}
    int_to_char = {'0': 'D', '1': 'I', '2': 'Z', '4': 'A', '5': 'S', '6': 'G', '8': 'B'}
    
    for i in [0, 1]:
        if chars[i] in char_to_int:
            chars[i] = char_to_int[chars[i]]
    if chars[2] in int_to_char:
        chars[2] = int_to_char[chars[2]]
        
    num_trailing_digits = 5 if len(chars) >= 8 else 4
    for i in range(len(chars) - num_trailing_digits, len(chars)):
        if chars[i] in char_to_int:
            chars[i] = char_to_int[chars[i]]
    return "".join(chars)

# GLOBAL MODELS TO PREVENT OOM AND DUPLICATE LOADING
GLOBAL_OCR_READER = None
GLOBAL_PLATE_MODEL = None
GLOBAL_CONTAINER_MODEL = None
GLOBAL_MODELS_LOADED = False
GLOBAL_MODEL_LOCK = threading.Lock()

GLOBAL_OCR_QUEUE = Queue(maxsize=50)
GLOBAL_OCR_THREAD_STARTED = False
GLOBAL_OCR_EXEC_LOCK = threading.Lock()

def get_ocr():
    global GLOBAL_OCR_READER, GLOBAL_MODELS_LOADED, GLOBAL_OCR_THREAD_STARTED
    with GLOBAL_MODEL_LOCK:
        if not GLOBAL_MODELS_LOADED:
            print("=== INITIALIZING GLOBAL OCR ===")
            print(f"[AI] Initializing EasyOCR Reader on GPU...")
            GLOBAL_OCR_READER = easyocr.Reader(OCR_LANGUAGES, gpu=torch.cuda.is_available())
            GLOBAL_MODELS_LOADED = True
            
        if not GLOBAL_OCR_THREAD_STARTED:
            threading.Thread(target=global_ocr_worker, daemon=True).start()
            GLOBAL_OCR_THREAD_STARTED = True
            
    return GLOBAL_OCR_READER

def global_ocr_worker():
    while True:
        task = GLOBAL_OCR_QUEUE.get()
        if task is None: break
        
        track_state_dict, track_id, cropped_plate, gate_type = task
        
        if track_id not in track_state_dict or track_state_dict[track_id]["ocr_status"] == "done":
            GLOBAL_OCR_QUEUE.task_done()
            continue
            
        track_state_dict[track_id]["ocr_status"] = "processing"
        
        processed_img = preprocess_image(cropped_plate)
        
        with GLOBAL_OCR_EXEC_LOCK:
            ocr_results = GLOBAL_OCR_READER.readtext(processed_img)
            
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
            if track_id in track_state_dict:
                track_state_dict[track_id]["history"].append(validated_plate)
                
                counter = Counter(track_state_dict[track_id]["history"])
                best_plate, count = counter.most_common(1)[0]
                track_state_dict[track_id]["plate_text"] = best_plate
                
                if count >= 2 or len(track_state_dict[track_id]["history"]) >= 4:
                    track_state_dict[track_id]["ocr_status"] = "done"
                    track_state_dict[track_id]["color"] = (0, 255, 0)
                    print(f"\n[OCR ỔN ĐỊNH] ID: {track_id} | BIỂN SỐ: {best_plate}")
                    send_scan_event(best_plate, "plate", 1.0, gate_type)
                else:
                    track_state_dict[track_id]["ocr_status"] = "pending"
                    track_state_dict[track_id]["color"] = (0, 255, 255)
        else:
            if track_id in track_state_dict:
                track_state_dict[track_id]["ocr_status"] = "pending"
                
        GLOBAL_OCR_QUEUE.task_done()

class AIProcessor:
    def __init__(self, gate_type="in"):
        self.ocr_reader = get_ocr()
        self.gate_type = gate_type
        self.device = 'cuda:0' if torch.cuda.is_available() else 'cpu'
        
        # Load independent YOLO instances to isolate Tracker states
        self.plate_model = YOLO(YOLO_PLATE_MODEL_PATH) if os.path.exists(YOLO_PLATE_MODEL_PATH) else None
        self.container_model = YOLO(YOLO_CONTAINER_MODEL_PATH) if os.path.exists(YOLO_CONTAINER_MODEL_PATH) else None
        
        self.track_state = {}
        self.TRACK_TIMEOUT = 10.0
        self.frame_count = 0
        self.last_container_boxes = []

    def _cleanup_stale_tracks(self):
        current_time = time.time()
        stale_ids = [tid for tid, data in self.track_state.items() if current_time - data["last_seen"] > self.TRACK_TIMEOUT]
        for tid in stale_ids:
            del self.track_state[tid]

    def process_frame(self, frame):
        if frame is None: return None
            
        self.frame_count += 1
        current_time = time.time()
        
        if self.frame_count % 30 == 0:
            self._cleanup_stale_tracks()
            
        h_orig, w_orig, _ = frame.shape
        frame_resized = cv2.resize(frame, (800, 600))
        
        # A. Process License Plates with Tracking
        if self.plate_model is not None:
            try:
                yolo_results = self.plate_model.track(
                    frame, persist=True, tracker="bytetrack.yaml", 
                    device=self.device, verbose=False, conf=0.35, imgsz=1024
                )
                
                if yolo_results and len(yolo_results) > 0 and yolo_results[0].boxes is not None:
                    boxes = yolo_results[0].boxes
                    if boxes.id is not None:
                        track_ids = boxes.id.int().cpu().tolist()
                        xyxys = boxes.xyxy.cpu().tolist()
                        confs = boxes.conf.cpu().tolist()
                        
                        for track_id, xyxy, conf in zip(track_ids, xyxys, confs):
                            if conf > 0.35:
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
                                    x1_org, y1_org = x1, y1
                                    x2_org, y2_org = x2, y2
                                    
                                    y1_org, y2_org = max(0, y1_org), min(h_orig, y2_org)
                                    x1_org, x2_org = max(0, x1_org), min(w_orig, x2_org)
                                    
                                    # Thêm padding 5% để không bị lẹm viền số
                                    pad_x = int((x2_org - x1_org) * 0.05)
                                    pad_y = int((y2_org - y1_org) * 0.05)
                                    x1_org = max(0, x1_org - pad_x)
                                    y1_org = max(0, y1_org - pad_y)
                                    x2_org = min(w_orig, x2_org + pad_x)
                                    y2_org = min(h_orig, y2_org + pad_y)
                                    
                                    cropped_plate = frame[y1_org:y2_org, x1_org:x2_org]
                                    if cropped_plate.size > 0 and not GLOBAL_OCR_QUEUE.full():
                                        state["ocr_status"] = "processing"
                                        GLOBAL_OCR_QUEUE.put((self.track_state, track_id, cropped_plate, self.gate_type))
                                
                                display_text = f"ID:{track_id} - {state['plate_text'] if state['plate_text'] else 'SCANNING'}"
                                
                                x1_res = int(x1 * 800 / w_orig)
                                y1_res = int(y1 * 600 / h_orig)
                                x2_res = int(x2 * 800 / w_orig)
                                y2_res = int(y2 * 600 / h_orig)
                                
                                cv2.rectangle(frame_resized, (x1_res, y1_res), (x2_res, y2_res), state["color"], 2)
                                cv2.putText(frame_resized, display_text, (x1_res, y1_res - 10), 
                                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, state["color"], 2)
                    else:
                        # Draw unconfirmed detections in gray
                        xyxys = boxes.xyxy.cpu().tolist()
                        confs = boxes.conf.cpu().tolist()
                        for xyxy, conf in zip(xyxys, confs):
                            if conf > 0.35:
                                x1, y1, x2, y2 = map(int, xyxy)
                                x1_res = int(x1 * 800 / w_orig)
                                y1_res = int(y1 * 600 / h_orig)
                                x2_res = int(x2 * 800 / w_orig)
                                y2_res = int(y2 * 600 / h_orig)
                                cv2.rectangle(frame_resized, (x1_res, y1_res), (x2_res, y2_res), (128, 128, 128), 2)
                                cv2.putText(frame_resized, "DETECTING...", (x1_res, y1_res - 10), 
                                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (128, 128, 128), 2)
            except Exception as e:
                print(f"[AI] Error during Plate tracking: {e}")
                
        # B. Process Containers (run every 5 frames to save GPU, keep original naive logic)
        if self.container_model is not None:
            try:
                if self.frame_count % 5 == 0:
                    container_results = self.container_model(
                        frame_resized, device=self.device, verbose=False, conf=DETECTION_CONFIDENCE_THRESHOLD
                    )[0]
                    self.last_container_boxes = []
                    for box in container_results.boxes:
                        x1, y1, x2, y2 = map(int, box.xyxy[0])
                        conf = float(box.conf[0])
                        if conf >= DETECTION_CONFIDENCE_THRESHOLD:
                            self.last_container_boxes.append((x1, y1, x2, y2, conf))
                            
                            x1_org = int(x1 * w_orig / 800)
                            y1_org = int(y1 * h_orig / 600)
                            x2_org = int(x2 * w_orig / 800)
                            y2_org = int(y2 * h_orig / 600)
                            
                            cropped_container = frame[y1_org:y2_org, x1_org:x2_org]
                            if cropped_container.size > 0:
                                with GLOBAL_OCR_EXEC_LOCK:
                                    ocr_results = self.ocr_reader.readtext(cropped_container)
                                for (bbox, text, prob) in ocr_results:
                                    if prob >= OCR_CONFIDENCE_THRESHOLD:
                                        clean_text = text.strip().upper()
                                        if len(clean_text) >= 4:
                                            send_scan_event(clean_text, "container", prob, self.gate_type)
                
                # Draw container boxes from cache
                for (x1, y1, x2, y2, conf) in self.last_container_boxes:
                    cv2.rectangle(frame_resized, (x1, y1), (x2, y2), (255, 0, 0), 2)
                    cv2.putText(frame_resized, f"CONTAINER: {conf:.2f}", (x1, y1 - 10), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)
            except Exception as e:
                print(f"[AI] Error during Container recognition: {e}")
                
        return frame_resized
