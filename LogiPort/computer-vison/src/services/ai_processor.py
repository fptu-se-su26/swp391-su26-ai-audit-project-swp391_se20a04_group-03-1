import cv2
import os
import sys
import easyocr
from ultralytics import YOLO

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

class AIProcessor:
    def __init__(self):
        print("=== INITIALIZING AI DETECTORS ===")
        
        # 1. Initialize EasyOCR
        print(f"[AI] Initializing EasyOCR Reader for languages: {OCR_LANGUAGES}...")
        self.ocr_reader = easyocr.Reader(OCR_LANGUAGES, gpu=False) # default to CPU for portability, EasyOCR will use GPU if torch is configured for CUDA
        
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

    def process_frame(self, frame):
        """
        Processes a single video frame: detects objects (plates/containers),
        crops them, runs EasyOCR, sends webhook events, and returns the annotated frame.
        """
        if frame is None:
            return None
            
        # Resize frame slightly to speed up pixel calculations
        frame = cv2.resize(frame, (800, 600))
        
        # A. Process License Plates if model is loaded
        if self.plate_model is not None:
            try:
                plate_results = self.plate_model(frame, verbose=False)[0]
                for box in plate_results.boxes:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    conf = float(box.conf[0])
                    
                    if conf >= DETECTION_CONFIDENCE_THRESHOLD:
                        # Draw bounding box around license plate detection region (Red)
                        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
                        cv2.putText(frame, f"PLATE CONF: {conf:.2f}", (x1, y1 - 10), 
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
                        
                        # Crop plate region
                        cropped_plate = frame[y1:y2, x1:x2]
                        if cropped_plate.size > 0:
                            # Run EasyOCR
                            ocr_results = self.ocr_reader.readtext(cropped_plate)
                            for (bbox, text, prob) in ocr_results:
                                if prob >= OCR_CONFIDENCE_THRESHOLD:
                                    clean_text = text.strip().upper()
                                    if len(clean_text) >= 4:  # basic length validation
                                        # Send scan event (throttling handled in api_client)
                                        send_scan_event(clean_text, "plate", prob)
                                        
                                        # Draw inner character recognition box (Green)
                                        (top_left, top_right, bottom_right, bottom_left) = bbox
                                        tl = (int(top_left[0]) + x1, int(top_left[1]) + y1)
                                        br = (int(bottom_right[0]) + x1, int(bottom_right[1]) + y1)
                                        
                                        cv2.rectangle(frame, tl, br, (0, 255, 0), 2)
                                        cv2.putText(frame, f"{clean_text} ({prob*100:.1f}%)", (tl[0], tl[1] - 10), 
                                                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
            except Exception as e:
                print(f"[AI] Error during Plate recognition: {e}")
                
        # B. Process Containers if model is loaded
        if self.container_model is not None:
            try:
                container_results = self.container_model(frame, verbose=False)[0]
                for box in container_results.boxes:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    conf = float(box.conf[0])
                    
                    if conf >= DETECTION_CONFIDENCE_THRESHOLD:
                        # Draw bounding box around container detection region (Blue)
                        cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 0), 2)
                        cv2.putText(frame, f"CONTAINER CONF: {conf:.2f}", (x1, y1 - 10), 
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)
                        
                        # Crop container region
                        cropped_container = frame[y1:y2, x1:x2]
                        if cropped_container.size > 0:
                            # Run EasyOCR
                            ocr_results = self.ocr_reader.readtext(cropped_container)
                            for (bbox, text, prob) in ocr_results:
                                if prob >= OCR_CONFIDENCE_THRESHOLD:
                                    clean_text = text.strip().upper()
                                    if len(clean_text) >= 4:
                                        # Send scan event (throttling handled in api_client)
                                        send_scan_event(clean_text, "container", prob)
                                        
                                        # Draw inner character recognition box (Yellow)
                                        (top_left, top_right, bottom_right, bottom_left) = bbox
                                        tl = (int(top_left[0]) + x1, int(top_left[1]) + y1)
                                        br = (int(bottom_right[0]) + x1, int(bottom_right[1]) + y1)
                                        
                                        cv2.rectangle(frame, tl, br, (0, 255, 255), 2)
                                        cv2.putText(frame, f"{clean_text} ({prob*100:.1f}%)", (tl[0], tl[1] - 10), 
                                                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
            except Exception as e:
                print(f"[AI] Error during Container recognition: {e}")
                
        return frame
