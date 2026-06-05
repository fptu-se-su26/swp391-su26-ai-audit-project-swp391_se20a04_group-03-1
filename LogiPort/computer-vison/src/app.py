import os
import sys

# Ensure the project root (computer-vison/) is on sys.path so 'src' is importable as a package
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import cv2
import threading
import time
from flask import Flask, Response, jsonify
from flask_cors import CORS
from src.config import (
    FLASK_HOST,
    FLASK_PORT,
    CAMERA_INDEX,
    BACKEND_URL,
    YOLO_PLATE_MODEL_PATH,
    YOLO_CONTAINER_MODEL_PATH
)
from src.services.ai_processor import AIProcessor

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# Global variables for thread-safe frame sharing
latest_processed_frame = None
latest_jpeg_bytes = None
frame_lock = threading.Lock()
camera_running = False
camera_status = "Disconnected"

def video_capture_loop():
    """
    Background thread that continuously grabs frames from the camera,
    runs the AI processor pipeline, and stores the processed frame as JPEG bytes.
    """
    global latest_processed_frame, latest_jpeg_bytes, camera_running, camera_status
    
    print(f"[Server] Starting background camera capture thread (Camera Index: {CAMERA_INDEX})...")
    
    # Initialize the AI Processor inside the thread to keep the main thread startup instant
    try:
        processor = AIProcessor()
    except Exception as e:
        print(f"[Server] CRITICAL: Failed to initialize AI Processor: {e}")
        camera_status = f"AI Init Error: {e}"
        return

    while camera_running:
        cap = cv2.VideoCapture(CAMERA_INDEX)
        if not cap.isOpened():
            print(f"[Server] ERROR: Cannot open camera index {CAMERA_INDEX}. Retrying in 5 seconds...")
            camera_status = "Disconnected (Error opening camera)"
            time.sleep(5.0)
            continue
            
        camera_status = "Connected"
        print(f"[Server] Camera capture active on device {CAMERA_INDEX}")
        
        while camera_running and cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                print("[Server] Camera frame read error. Re-initializing camera capture...")
                camera_status = "Error Reading Frames"
                break
                
            try:
                # 1. Process frame with YOLO and EasyOCR
                processed_frame = processor.process_frame(frame)
                
                # 2. Encode to JPEG
                ret_encode, buffer = cv2.imencode('.jpg', processed_frame)
                if ret_encode:
                    jpeg_bytes = buffer.tobytes()
                    with frame_lock:
                        latest_processed_frame = processed_frame
                        latest_jpeg_bytes = jpeg_bytes
            except Exception as e:
                print(f"[Server] Exception during background frame processing: {e}")
                
            # Yield CPU slice to prevent 100% core usage
            time.sleep(0.01)
            
        cap.release()
        
    camera_status = "Stopped"
    print("[Server] Background camera capture thread finished.")

def generate_stream():
    """Generator function that yields the latest processed JPEG frame bytes."""
    global latest_jpeg_bytes
    
    while True:
        with frame_lock:
            frame_data = latest_jpeg_bytes
            
        if frame_data is not None:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_data + b'\r\n')
        else:
            # Yield a tiny transparent 1x1 spacer if no camera frame is ready
            # to prevent connection drop outs
            time.sleep(0.1)
            
        # Match rate-limiting to roughly ~30fps stream output
        time.sleep(0.033)

@app.route('/')
def index():
    """Root landing page with links to video feed and status."""
    return '''
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Computer Vision - Port Gate Monitor</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; }
            .container { max-width: 960px; margin: 0 auto; padding: 2rem 1rem; }
            h1 { font-size: 1.75rem; margin-bottom: 0.25rem; color: #38bdf8; }
            .subtitle { color: #94a3b8; font-size: 0.9rem; margin-bottom: 2rem; }
            .grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
            @media(min-width:640px) { .grid { grid-template-columns: 1fr 1fr; } }
            .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 1.5rem; }
            .card h2 { font-size: 1.1rem; margin-bottom: 0.5rem; }
            .card p { color: #94a3b8; font-size: 0.85rem; margin-bottom: 1rem; }
            .card a { display: inline-block; background: #0ea5e9; color: #0f172a; padding: 0.5rem 1.25rem;
                       border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.85rem; transition: background 0.2s; }
            .card a:hover { background: #38bdf8; }
            .stream-box { grid-column: 1 / -1; }
            .stream-box img { width: 100%; border-radius: 8px; border: 1px solid #334155; background: #000; }
            .badge { display: inline-block; background: #22c55e20; color: #4ade80; padding: 0.2rem 0.6rem;
                     border-radius: 6px; font-size: 0.75rem; font-weight: 600; margin-bottom: 1rem; }
        </style>
    </head>
    <body>
        <div class="container">
            <span class="badge">● ONLINE</span>
            <h1>🚢 Port Gate Computer Vision</h1>
            <p class="subtitle">YOLO + EasyOCR License Plate & Container Code Detection Service</p>
            <div class="grid">
                <div class="stream-box card">
                    <h2>📹 Live Camera Feed</h2>
                    <p>Real-time video stream with AI annotations</p>
                    <img src="/video_feed" alt="Live Camera Feed" />
                </div>
                <div class="card">
                    <h2>📡 Video Stream URL</h2>
                    <p>Embed this URL in your Next.js frontend to display the live camera feed.</p>
                    <a href="/video_feed" target="_blank">Open /video_feed</a>
                </div>
                <div class="card">
                    <h2>🩺 Health Status</h2>
                    <p>Check camera connection, model loading, and backend webhook status.</p>
                    <a href="/status" target="_blank">Open /status</a>
                </div>
            </div>
        </div>
    </body>
    </html>
    '''

@app.route('/favicon.ico')
def favicon():
    """Return empty response for favicon to prevent 404 logs."""
    return Response(status=204)

@app.route('/video_feed')
def video_feed():
    """Renders the motion-JPEG streaming stream."""
    return Response(
        generate_stream(), 
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )

@app.route('/status')
def get_status():
    """Diagnostics and health checking API endpoint."""
    import os
    return jsonify({
        "status": "online",
        "camera": {
            "index": CAMERA_INDEX,
            "connection_status": camera_status,
            "running": camera_running
        },
        "models": {
            "license_plate_weights_path": YOLO_PLATE_MODEL_PATH,
            "license_plate_weights_exists": os.path.exists(YOLO_PLATE_MODEL_PATH),
            "container_weights_path": YOLO_CONTAINER_MODEL_PATH,
            "container_weights_exists": os.path.exists(YOLO_CONTAINER_MODEL_PATH)
        },
        "integration": {
            "nodejs_backend_webhook_url": BACKEND_URL
        }
    })

def start_server():
    global camera_running
    camera_running = True
    
    # Start the background frame processor thread
    capture_thread = threading.Thread(target=video_capture_loop, daemon=True)
    capture_thread.start()
    
    # Launch Flask
    print(f"=== FLASK COMPUTER VISION SERVICE RUNNING ON http://{FLASK_HOST}:{FLASK_PORT} ===")
    app.run(host=FLASK_HOST, port=FLASK_PORT, threaded=True)

if __name__ == '__main__':
    start_server()
