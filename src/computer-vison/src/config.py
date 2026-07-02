import os

# Project base paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")

# API / Server Configuration
BACKEND_URL = os.getenv("BACKEND_URL", "https://api.datnotes.click/api/scan")
FLASK_HOST = os.getenv("FLASK_HOST", "0.0.0.0")
FLASK_PORT = int(os.getenv("FLASK_PORT", 5001))

# Camera Configuration
# Use integer (e.g. 0 or 1) for local webcam / Iriun Webcam
# Or string path/URL for RTSP stream or test video file
CAMERA_INDEX = int(os.getenv("CAMERA_INDEX", 0))

# Tự động dùng bản hef cho Raspberry Pi 5 NPU nếu có
hef_plate_path = os.path.join(MODELS_DIR, "best.hef")
hef_container_path = os.path.join(MODELS_DIR, "container-code.hef")

ncnn_plate_path = os.path.join(MODELS_DIR, "best_ncnn_model")
ncnn_container_path = os.path.join(MODELS_DIR, "container-code_ncnn_model")

YOLO_PLATE_MODEL_PATH = os.getenv(
    "YOLO_PLATE_MODEL_PATH", 
    hef_plate_path if os.path.isfile(hef_plate_path) else (ncnn_plate_path if os.path.isdir(ncnn_plate_path) else os.path.join(MODELS_DIR, "best.pt"))
)
YOLO_CONTAINER_MODEL_PATH = os.getenv(
    "YOLO_CONTAINER_MODEL_PATH", 
    hef_container_path if os.path.isfile(hef_container_path) else (ncnn_container_path if os.path.isdir(ncnn_container_path) else os.path.join(MODELS_DIR, "container-code.pt"))
)

# AI Processing Parameters
DETECTION_CONFIDENCE_THRESHOLD = float(os.getenv("DETECTION_CONFIDENCE_THRESHOLD", 0.5))
OCR_CONFIDENCE_THRESHOLD = float(os.getenv("OCR_CONFIDENCE_THRESHOLD", 0.4))

# De-duplication Cooldown
# Period in seconds before sending the same recognized license plate or container code to the backend again.
COOLDOWN_PERIOD = float(os.getenv("COOLDOWN_PERIOD", 5.0))

# EasyOCR Language list
OCR_LANGUAGES = ["en"]
