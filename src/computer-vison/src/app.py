import os
import sys

# Ensure the project root (computer-vison/) is on sys.path so 'src' is importable as a package
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import cv2
import threading
import time
import requests
import queue
from flask import Flask, Response, jsonify, request
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

class AsyncVideoReader:
    """Reads frames from cv2.VideoCapture in a dedicated background thread to prevent lag/buffering delay."""
    def __init__(self, url):
        self.url = url
        if isinstance(url, str) and url.startswith("rtsp://"):
            os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp|fflags;nobuffer|flags;low_delay"
            
        # Fix string digit "0" to integer 0 for local cameras
        if isinstance(url, str) and url.isdigit():
            url = int(url)
            
        self.cap = cv2.VideoCapture(url)
        if isinstance(self.url, str) and self.url.startswith("rtsp://"):
            self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
            
        self.running = True
        self.q = queue.Queue(maxsize=1)
        
        if self.cap.isOpened():
            self.t = threading.Thread(target=self._update, daemon=True)
            self.t.start()
            
    def _update(self):
        while self.running and self.cap.isOpened():
            ret, frame = self.cap.read()
            if not ret: 
                self.running = False
                break
            try:
                self.q.get_nowait() # drop old frame
            except queue.Empty:
                pass
            self.q.put(frame)
        self.running = False
        self.cap.release()
        
    def read_latest(self, timeout=2.0):
        try:
            return True, self.q.get(timeout=timeout)
        except queue.Empty:
            return self.running, None
            
    def isOpened(self):
        return self.cap.isOpened()
        
    def release(self):
        self.running = False


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
    
    try:
        processor = AIProcessor(camera_ip=str(CAMERA_INDEX))
    except Exception as e:
        print(f"[Server] CRITICAL: Failed to initialize AI Processor: {e}")
        camera_status = f"AI Init Error: {e}"
        return

    while camera_running:
        reader = AsyncVideoReader(CAMERA_INDEX)
        if not reader.isOpened():
            print(f"[Server] ERROR: Cannot open camera index {CAMERA_INDEX}. Retrying in 5 seconds...")
            camera_status = "Disconnected (Error opening camera)"
            time.sleep(5.0)
            continue
            
        camera_status = "Connected"
        print(f"[Server] Camera capture active on device {CAMERA_INDEX}")
        
        last_process_time = 0
        
        while camera_running and reader.isOpened():
            ret, frame = reader.read_latest()
            if not ret:
                print("[Server] Camera frame read error. Re-initializing camera capture...")
                camera_status = "Error Reading Frames"
                break
            if frame is None:
                continue
                
            current_time = time.time()
            if current_time - last_process_time < 0.2: # 5 FPS limit
                time.sleep(0.01)
                continue
            last_process_time = current_time
                
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
                
            time.sleep(0.01)
            
        reader.release()
        
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
            time.sleep(0.1)
            
        time.sleep(0.033)

@app.route('/')
def index():
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

def verify_auth(token):
    try:
        backend_api = BACKEND_URL.replace("/scan", "") 
        cookies = {"tokenAdmin": token}
        res = requests.get(f"{backend_api}/yards", cookies=cookies, timeout=2.0)
        data = res.json()
        if data.get("code") == "error":
            return False
        return True
    except Exception:
        return False

@app.route('/favicon.ico')
def favicon():
    return Response(status=204)

@app.route('/video_feed')
def video_feed():
    token = request.cookies.get('tokenAdmin')
    if not token or not verify_auth(token):
        return jsonify({"code": "error", "message": "Unauthorized"}), 401

    import urllib.parse
    raw_url = request.args.get('rtsp_url')
    if raw_url:
        rtsp_url = urllib.parse.unquote(raw_url)
        return Response(
            generate_gate_stream(rtsp_url), 
            mimetype='multipart/x-mixed-replace; boundary=frame'
        )
    return Response(
        generate_stream(), 
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )

@app.route('/status')
def get_status():
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

@app.route('/snapshot')
def snapshot():
    import urllib.parse
    raw_url = request.args.get('rtsp_url')
    if not raw_url:
        return jsonify({"code": "error", "message": "Missing rtsp_url"}), 400
        
    rtsp_url = urllib.parse.unquote(raw_url)
    os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp|fflags;nobuffer|flags;low_delay"
    
    cap = cv2.VideoCapture(rtsp_url)
    if not cap.isOpened():
        return jsonify({"code": "error", "message": "Cannot open stream"}), 500
        
    ret, frame = cap.read()
    cap.release()
    
    if not ret:
        return jsonify({"code": "error", "message": "Cannot read frame"}), 500
        
    ret_encode, buffer = cv2.imencode('.jpg', frame)
    if not ret_encode:
        return jsonify({"code": "error", "message": "Cannot encode frame"}), 500
        
    return Response(buffer.tobytes(), mimetype='image/jpeg')

active_yard_streams = {} # yard_id -> {"frame_data": bytes, "running": bool, "last_accessed": float}
active_gate_streams = {} # rtsp_url -> {"frame_data": bytes, "running": bool, "last_accessed": float}

def gate_capture_worker(rtsp_url, gate_type="in"):
    import os
    from src.services.ai_processor import AIProcessor
    
    try:
        processor = AIProcessor(gate_type=gate_type, camera_ip=rtsp_url)
    except Exception as e:
        print(f"[Gate Feed Worker] CRITICAL: Failed to initialize AI Processor: {e}")
        if rtsp_url in active_gate_streams:
            active_gate_streams[rtsp_url]["running"] = False
        return

    reader = AsyncVideoReader(rtsp_url)
    if not reader.isOpened():
        print(f"[Gate Feed Worker] Cannot open RTSP stream: {rtsp_url}")
        if rtsp_url in active_gate_streams:
            active_gate_streams[rtsp_url]["running"] = False
        return
        
    print(f"[Gate Feed Worker] Started stream for RTSP: {rtsp_url}")

    while active_gate_streams.get(rtsp_url, {}).get("running", False) and reader.isOpened():
        ret, frame = reader.read_latest()
        if not ret: 
            break
        if frame is None:
            continue
            
        try:
            processed_frame = processor.process_frame(frame)
            stream_frame = cv2.resize(processed_frame, (640, 480))
            ret_encode, buffer = cv2.imencode('.jpg', stream_frame, [cv2.IMWRITE_JPEG_QUALITY, 50])
            if ret_encode:
                active_gate_streams[rtsp_url]["frame_data"] = buffer.tobytes()
        except Exception as e:
            print(f"[Gate Feed Worker] Exception: {e}")
            
        time.sleep(0.01)
        
    reader.release()
    active_gate_streams.pop(rtsp_url, None)
    print(f"[Gate Feed Worker] Stream ended for RTSP: {rtsp_url}")

def generate_gate_stream(rtsp_url):
    while True:
        stream_state = active_gate_streams.get(rtsp_url)
        if not stream_state or not stream_state.get("running"):
            time.sleep(1)
            continue
            
        frame_data = stream_state.get("frame_data")
        
        if frame_data:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_data + b'\r\n')
        else:
            time.sleep(0.1)
            
        time.sleep(0.1)

def yard_capture_worker(yard_id, camera_ip):
    from ultralytics import YOLO
    import torch
    import os
    
    device = 'cuda:0' if torch.cuda.is_available() else 'cpu'
    try:
        vehicle_model = YOLO("yolov8n.pt") 
    except Exception as e:
        print(f"[Yard Feed Worker] Error loading YOLO: {e}")
        if yard_id in active_yard_streams:
            active_yard_streams[yard_id]["running"] = False
        return

    reader = AsyncVideoReader(camera_ip)
    if not reader.isOpened():
        print(f"[Yard Feed Worker] Cannot open RTSP stream: {camera_ip}")
        if yard_id in active_yard_streams:
            active_yard_streams[yard_id]["running"] = False
        return
        
    print(f"[Yard Feed Worker] Started stream for Yard ID: {yard_id}")

    def check_overlap(box_x1, box_y1, box_x2, box_y2, slot_x, slot_y, slot_w, slot_h, img_w, img_h):
        sx = int(slot_x / 100.0 * img_w)
        sy = int(slot_y / 100.0 * img_h)
        sw = int(slot_w / 100.0 * img_w)
        sh = int(slot_h / 100.0 * img_h)
        return not (box_x2 < sx or box_x1 > sx + sw or box_y2 < sy or box_y1 > sy + sh)

    frame_count = 0
    previous_occupied_slots = set()
    last_occupied_slots = set()
    last_ai_boxes = []
    
    while active_yard_streams.get(yard_id, {}).get("running", False) and reader.isOpened():
        ret, frame = reader.read_latest()
        if not ret: break
        if frame is None:
            continue
            
        frame_count += 1
        h, w, _ = frame.shape
        
        # Only run YOLO every 3 frames to save CPU/GPU
        if frame_count % 3 == 0:
            results = vehicle_model(frame, device=device, verbose=False)
            occupied_slots = set()
            current_ai_boxes = []
            
            if len(results) > 0 and results[0].boxes is not None:
                boxes = results[0].boxes
                xyxys = boxes.xyxy.cpu().tolist()
                confs = boxes.conf.cpu().tolist()
                for xyxy, conf in zip(xyxys, confs):
                    if conf > 0.5:
                        x1, y1, x2, y2 = map(int, xyxy)
                        current_ai_boxes.append((x1, y1, x2, y2))
                        current_slots = active_yard_streams.get(yard_id, {}).get("slots", [])
                        for slot in current_slots:
                            if check_overlap(x1, y1, x2, y2, slot['x'], slot['y'], slot['width'], slot['height'], w, h):
                                occupied_slots.add(slot.get('slotName'))
                                
            last_occupied_slots = occupied_slots
            last_ai_boxes = current_ai_boxes
        else:
            # Use previous results for intermediate frames
            occupied_slots = last_occupied_slots
            current_ai_boxes = last_ai_boxes
            
        # Draw AI boxes
        for (x1, y1, x2, y2) in current_ai_boxes:
            cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 165, 0), 2)
                    
        # Draw slots
        current_slots = active_yard_streams.get(yard_id, {}).get("slots", [])
        for slot in current_slots:
            sx = int(slot['x'] / 100.0 * w)
            sy = int(slot['y'] / 100.0 * h)
            sw = int(slot['width'] / 100.0 * w)
            sh = int(slot['height'] / 100.0 * h)
            is_occupied = slot.get('slotName') in occupied_slots
            color = (0, 0, 255) if is_occupied else (0, 255, 0)
            status_text = "Occupied" if is_occupied else "Empty"
            
            overlay = frame.copy()
            cv2.rectangle(overlay, (sx, sy), (sx + sw, sy + sh), color, -1)
            cv2.addWeighted(overlay, 0.3, frame, 0.7, 0, frame)
            cv2.rectangle(frame, (sx, sy), (sx + sw, sy + sh), color, 2)
            cv2.putText(frame, f"{slot['slotName']} - {status_text}", (sx, sy - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
            
        stream_frame = cv2.resize(frame, (640, 480))
        ret_encode, buffer = cv2.imencode('.jpg', stream_frame, [cv2.IMWRITE_JPEG_QUALITY, 50])
        if ret_encode:
            active_yard_streams[yard_id]["frame_data"] = buffer.tobytes()
            
        if occupied_slots != previous_occupied_slots:
            print(f"[Yard Feed Worker] Trạng thái bãi {yard_id} thay đổi! Gửi webhook...")
            try:
                payload = { "occupied_slots": list(occupied_slots) }
                backend_api_base = BACKEND_URL.replace("/scan", "") 
                webhook_url = f"{backend_api_base}/yards/{yard_id}/sync-status"
                requests.post(webhook_url, json=payload, timeout=2.0)
            except Exception as e:
                print(f"[Yard Feed Worker] Lỗi gửi webhook: {e}")
            previous_occupied_slots = occupied_slots.copy()
            
        time.sleep(0.01)
        
    reader.release()
    active_yard_streams.pop(yard_id, None)
    print(f"[Yard Feed Worker] Stream ended for Yard ID: {yard_id}")

def generate_yard_stream(yard_id):
    while True:
        stream_state = active_yard_streams.get(yard_id)
        if not stream_state or not stream_state.get("running"):
            time.sleep(1)
            continue
            
        frame_data = stream_state.get("frame_data")
        
        if frame_data:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_data + b'\r\n')
        else:
            time.sleep(0.1)
            
        time.sleep(0.1)

@app.route('/yard_feed')
def yard_feed():
    yard_id = request.args.get('yard_id')
    if not yard_id:
        return "Missing yard_id", 400
        
    token = request.cookies.get('tokenAdmin')
    if not token:
        return jsonify({"code": "error", "message": "Unauthorized"}), 401
        
    return Response(
        generate_yard_stream(yard_id), 
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )

def sync_cameras_worker():
    backend_api = BACKEND_URL.replace("/scan", "")
    headers = {"x-internal-secret": "AI_SERVER_SECRET_KEY"}
    
    while camera_running:
        try:
            # Sync Gates
            res_gates = requests.get(f"{backend_api}/gates", headers=headers, timeout=5)
            if res_gates.status_code == 200:
                data_gates = res_gates.json().get("data", [])
                valid_gate_ips = set()
                for gate in data_gates:
                    cam_ip = gate.get("cameraIp")
                    gate_type = gate.get("type", "in")
                    if not cam_ip: continue
                    valid_gate_ips.add(cam_ip)
                    
                    if cam_ip not in active_gate_streams:
                        active_gate_streams[cam_ip] = {"frame_data": None, "running": True}
                        t = threading.Thread(target=gate_capture_worker, args=(cam_ip, gate_type), daemon=True)
                        t.start()
                        
                # Stop removed gates
                for cam_ip in list(active_gate_streams.keys()):
                    if cam_ip not in valid_gate_ips:
                        active_gate_streams[cam_ip]["running"] = False
            
            # Sync Yards
            res_yards = requests.get(f"{backend_api}/yards", headers=headers, timeout=5)
            if res_yards.status_code == 200:
                data_yards = res_yards.json().get("data", [])
                valid_yard_ids = set()
                for yard in data_yards:
                    yid = yard.get("_id")
                    cam_ip = yard.get("cameraIp")
                    slots = yard.get("slots", [])
                    if not yid or not cam_ip: continue
                    valid_yard_ids.add(yid)
                    
                    if yid not in active_yard_streams:
                        active_yard_streams[yid] = {
                            "frame_data": None, "running": True, 
                            "camera_ip": cam_ip, "slots": slots
                        }
                        t = threading.Thread(target=yard_capture_worker, args=(yid, cam_ip), daemon=True)
                        t.start()
                    else:
                        active_yard_streams[yid]["slots"] = slots
                        if active_yard_streams[yid]["camera_ip"] != cam_ip:
                            active_yard_streams[yid]["running"] = False
                            time.sleep(0.5)
                            active_yard_streams[yid] = {
                                "frame_data": None, "running": True, 
                                "camera_ip": cam_ip, "slots": slots
                            }
                            t = threading.Thread(target=yard_capture_worker, args=(yid, cam_ip), daemon=True)
                            t.start()
                
                # Stop removed yards
                for yid in list(active_yard_streams.keys()):
                    if yid not in valid_yard_ids:
                        active_yard_streams[yid]["running"] = False

        except Exception as e:
            print(f"[Sync Worker] Error syncing cameras: {e}")
            
        time.sleep(10)

def start_server():
    global camera_running
    camera_running = True
    
    capture_thread = threading.Thread(target=video_capture_loop, daemon=True)
    capture_thread.start()
    
    sync_thread = threading.Thread(target=sync_cameras_worker, daemon=True)
    sync_thread.start()
    
    print(f"=== FLASK COMPUTER VISION SERVICE RUNNING ON http://{FLASK_HOST}:{FLASK_PORT} ===")
    app.run(host=FLASK_HOST, port=FLASK_PORT, threaded=True)

if __name__ == '__main__':
    start_server()
