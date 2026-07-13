import os
import cv2
import hailo
import pytesseract
import numpy as np
from src.config import CAMERA_INDEX
from hailo_rpi5_common import get_caps_from_pad, get_numpy_from_buffer
from hailo_apps_infra.hailo_rpi5_app import GStreamerApp

class FastYardMonitor(GStreamerApp):
    def __init__(self):
        super().__init__()
        # Thay đường dẫn tới file .hef của bạn
        self.hef_path = os.path.join(os.path.dirname(__file__), "../models/best.hef")

        # Đảm bảo CAMERA_INDEX là RTSP URL hoặc /dev/video0
        self.video_source = str(CAMERA_INDEX) if "rtsp" in str(CAMERA_INDEX) else f"/dev/video{CAMERA_INDEX}"

        # File thư viện post-processing (Cài từ bộ hailo-rpi5-examples)
        self.post_process_so = "/usr/lib/aarch64-linux-gnu/hailo/tappas/post_processes/libyolo_hailortpp_post.so"

    def get_pipeline_string(self):
        source_element = (
            f"rtspsrc location={self.video_source} ! rtph264depay ! h264parse ! v4l2slh264dec"
            if "rtsp" in self.video_source else
            f"v4l2src device={self.video_source} ! videorate ! video/x-raw,framerate=30/1"
        )

        pipeline = f"""
            {source_element} !
            videoconvert !
            hailonet hef-path={self.hef_path} !
            hailofilter so-path={self.post_process_so} qvga=true !
            hailooverlay !
            videoconvert !
            fpsdisplaysink video-sink=autovideosink text-overlay=true sync=false
        """
        return pipeline

    def user_callback(self, pad, info):
        # Hàm callback siêu nhẹ: Chỉ chạy khi C++ đã vẽ xong bounding box
        buffer = info.get_buffer()
        roi = hailo.get_roi_from_buffer(buffer)
        detections = roi.get_objects_typed(hailo.HAILO_DETECTION)

        # Nếu có nhận diện được biển số / mã container
        if len(detections) > 0:
            format, width, height = get_caps_from_pad(pad)
            frame = get_numpy_from_buffer(buffer, format, width, height)

            for detection in detections:
                label = detection.get_label()
                if label in ["container_code", "license_plate"]:
                    bbox = detection.get_bbox()

                    x_min = max(0, int(bbox.xmin() * width))
                    y_min = max(0, int(bbox.ymin() * height))
                    x_max = min(width, int(bbox.xmax() * width))
                    y_max = min(height, int(bbox.ymax() * height))

                    # Cắt ảnh nhỏ & chuyển trắng đen để OCR xử lý mượt hơn
                    cropped = frame[y_min:y_max, x_min:x_max]
                    gray = cv2.cvtColor(cropped, cv2.COLOR_BGR2GRAY)
                    thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]

                    text = pytesseract.image_to_string(thresh, config='--psm 7').strip()
                    if len(text) > 4:
                        print(f"[🔥 FAST AI] {label.upper()} detected: {text}")
                        # Gửi API về backend ở đây nếu cần!

        return hailo.GST_PAD_PROBE_OK

if __name__ == "__main__":
    print("[INFO] Khởi động Fast Yard Monitor bằng GStreamer...")
    app = FastYardMonitor()
    app.run()