import cv2
import easyocr
from ultralytics import YOLO  # Cần import thêm thư viện YOLO
from flask import Flask, Response  # Thêm thư viện để stream lên NextJS

app = Flask(__name__)

# 1. Khởi tạo bộ đọc chữ EasyOCR
ocr_reader = easyocr.Reader(['en'])

# =========================================================================
# VỊ TRÍ 1: KHỞI TẠO FILE .PT CỦA BẠN VÀO ĐÂY
# Thay "ten_file_cua_ban.pt" bằng đường dẫn chính xác tới file weight bạn đã tải về
yolo_plate_model = YOLO("best.pt") 
# =========================================================================

def generate_frames():
    # 2. Mở luồng Video Stream từ Iriun Webcam (Điện thoại) - Đổi sang index 1 nếu dùng Iriun
    cap = cv2.VideoCapture(0)

    print("=== HỆ THỐNG ĐÃ KÍCH HOẠT: YOLO DETECT -> EASYOCR READ (STREAMING MOUNTED) ===")

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # Thu nhỏ khung hình một chút để CPU tính toán ma trận điểm ảnh nhanh hơn
        frame = cv2.resize(frame, (800, 600))

        # =========================================================================
        # VỊ TRÍ 2: SỬ DỤNG YOLO ĐỂ DÒ VỊ TRÍ BIỂN SỐ TRƯỚC
        # verbose=False để terminal không bị rác bởi log của YOLO
        yolo_results = yolo_plate_model(frame, verbose=False)[0]

        for box in yolo_results.boxes:
            # Lấy tọa độ vùng chứa biển số xe do file .pt tìm được
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            conf = box.conf[0]  # Độ tin cậy của vùng phát hiện

            if conf > 0.5:  # Nếu YOLO chắc chắn trên 50% đây là biển số
                # Vẽ hộp chữ nhật màu đỏ bao quanh vùng biển số/container để phân biệt với hộp chữ
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
                cv2.putText(frame, "LICENSE PLATE", (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

                # CẮT ẢNH: Chỉ lấy phần ảnh nằm trong vùng đỏ đưa vào EasyOCR xử lý
                cropped_plate = frame[y1:y2, x1:x2]
                
                # Đưa vùng ảnh đã cắt nhỏ vào EasyOCR (Bỏ qua hoàn toàn chữ rác bên ngoài)
                ocr_results = ocr_reader.readtext(cropped_plate)
                
                # Duyệt qua các kết quả chữ tìm được TRONG VÙNG CẮT để vẽ khung
                for (bbox, text, prob) in ocr_results:
                    if prob > 0.4:
                        print(f"[YOLO + OCR] Biển số quét được: {text.upper()} ({prob*100:.1f}%)")
                        
                        # Lấy tọa độ góc tương đối trong vùng cắt
                        (top_left, top_right, bottom_right, bottom_left) = bbox
                        
                        # Cộng thêm độ lệch gốc (x1, y1) để vẽ chuẩn lên khung hình chính lớn (frame)
                        tl = (int(top_left[0]) + x1, int(top_left[1]) + y1)
                        br = (int(bottom_right[0]) + x1, int(bottom_right[1]) + y1)
                        
                        # Vẽ hộp chữ nhật màu xanh lá cây quanh các chữ số
                        cv2.rectangle(frame, tl, br, (0, 255, 0), 2)
                        cv2.putText(frame, text.upper(), (tl[0], tl[1] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
        # =========================================================================

        # CHUYỂN ĐỔI FRAME THÀNH DỮ LIỆU ĐỂ STREAM QUA WEB (THAY CHO CV2.IMSHOW)
        ret_encode, buffer = cv2.imencode('.jpg', frame)
        if not ret_encode:
            continue
        frame_bytes = buffer.tobytes()
        
        # Đẩy từng khung hình ra cổng kết nối mạng liên tục
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    cap.release()

# Định tuyến đường link API cho NextJS nhúng vào
@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    # Chạy Server ở port 5001 để tránh xung đột với hệ thống NodeJS (Port 5000)
    app.run(host='0.0.0.0', port=5001, threaded=True)
