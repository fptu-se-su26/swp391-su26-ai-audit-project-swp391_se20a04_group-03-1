import os
import cv2
import easyocr
import re
import time
import threading
from collections import Counter
from queue import Queue
from ultralytics import YOLO

# 1. Khởi tạo mô hình
ocr_reader = easyocr.Reader(['en'])
yolo_plate_model = YOLO("best.pt") 

CAMERA_SOURCE = 3  # 0 cho USB camera mặc định, đổi thành 1, 2... nếu có nhiều camera

# 2. Hàng đợi cho luồng OCR
ocr_queue = Queue(maxsize=10)

# 3. Quản lý trạng thái Tracking
# track_state = {
#     track_id: {
#         "plate_text": str or None,
#         "ocr_status": "pending" | "processing" | "done",
#         "last_seen": float,
#         "color": (B, G, R)
#     }
# }
track_state = {}
TRACK_TIMEOUT = 10.0  # Xoá ID khỏi bộ nhớ nếu 10 giây không xuất hiện

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
    
    # Nếu muốn có thể dùng Adaptive Threshold (tùy vào thực tế camera có hay bị bóng râm không)
    # thresh = cv2.adaptiveThreshold(enhanced, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
    
    return enhanced

def clean_and_format_plate(raw_text):
    """
    Làm sạch kết quả Text từ OCR và sửa lỗi ký tự phổ biến dựa trên format Biển số VN
    - 2 ký tự đầu: Mã tỉnh (Luôn là số)
    - Ký tự thứ 3: Series (Luôn là chữ)
    - 4 hoặc 5 ký tự cuối: Biển số (Luôn là số)
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
        
    # 3. Các ký tự cuối cùng (4 hoặc 5 số cuối) LUÔN LÀ SỐ
    # Nếu biển 7 ký tự (VD 30F1234) -> 4 ký tự cuối là số
    # Nếu biển 8 ký tự (VD 30F12345) -> 5 ký tự cuối là số
    # Nếu biển xe máy 8 ký tự (VD 29G11234) -> 4 ký tự cuối là số
    # Do đó an toàn nhất là ép 4 ký tự cuối thành số, và ký tự thứ 5 từ dưới lên cũng ép thành số nếu nó không phải là xe máy (tuy nhiên ta cứ ưu tiên ép thành số cho phần đuôi).
    
    num_trailing_digits = 5 if len(chars) >= 8 else 4
    for i in range(len(chars) - num_trailing_digits, len(chars)):
        # Xe máy có định dạng: 29G1, lúc này ký tự thứ 4 (index 3) có thể là SỐ, nhưng nếu là xe ô tô 30F12345 thì index 3 cũng là SỐ. 
        # Do đó ta ép `num_trailing_digits` ký tự cuối cùng thành số.
        if chars[i] in char_to_int:
            chars[i] = char_to_int[chars[i]]
            
    return "".join(chars)

def ocr_worker_thread():
    """
    LUỒNG PHỤ: Xử lý OCR dựa trên track_id, tránh quét lặp
    """
    global track_state
    
    while True:
        task = ocr_queue.get()
        if task is None: 
            break
            
        track_id, cropped_plate = task
        
        # Nếu ID này không còn trong state hoặc đã OCR thành công rồi thì bỏ qua
        if track_id not in track_state or track_state[track_id]["ocr_status"] == "done":
            ocr_queue.task_done()
            continue
            
        # Đánh dấu đang xử lý
        track_state[track_id]["ocr_status"] = "processing"
        
        # Tiền xử lý
        processed_img = preprocess_image(cropped_plate)
        
        # Gọi OCR
        ocr_results = ocr_reader.readtext(processed_img)
        raw_plate_parts = [text for (bbox, text, prob) in ocr_results if prob > 0.4]
        raw_text_combined = "".join(raw_plate_parts)
        
        validated_plate = clean_and_format_plate(raw_text_combined)
        
        if validated_plate:
            if track_id in track_state:
                # Thêm kết quả vào lịch sử để bầu chọn (voting)
                track_state[track_id]["history"].append(validated_plate)
                
                # Tìm biển số xuất hiện nhiều nhất trong lịch sử
                counter = Counter(track_state[track_id]["history"])
                best_plate, count = counter.most_common(1)[0]
                
                track_state[track_id]["plate_text"] = best_plate
                
                # Nếu kết quả lặp lại đủ 4 lần, hoặc đã quét 8 lần -> Chốt kết quả (Ổn định)
                if count >= 5 or len(track_state[track_id]["history"]) >= 10:
                    track_state[track_id]["ocr_status"] = "done"
                    track_state[track_id]["color"] = (0, 255, 0) # Xanh lá (chốt)
                    
                    print("\n" + "="*50)
                    print(f"[OCR ỔN ĐỊNH] ID: {track_id} | BIỂN SỐ: {best_plate} (Tần suất: {count}/{len(track_state[track_id]['history'])})")
                    print("="*50 + "\n")
                else:
                    # Chưa đủ ổn định -> Tiếp tục lấy mẫu
                    track_state[track_id]["ocr_status"] = "pending"
                    track_state[track_id]["color"] = (0, 255, 255) # Vàng (đang lấy mẫu)
                    print(f"[LẤY MẪU] ID: {track_id} -> Đọc được: {validated_plate} | Tạm thời: {best_plate} ({count} lần)")
        else:
            # Thất bại, cho phép thử lại
            if track_id in track_state:
                track_state[track_id]["ocr_status"] = "pending"
                
        ocr_queue.task_done()

def cleanup_stale_tracks():
    """
    Dọn dẹp các track_id cũ không còn xuất hiện trên màn hình
    """
    global track_state
    current_time = time.time()
    stale_ids = [tid for tid, data in track_state.items() if current_time - data["last_seen"] > TRACK_TIMEOUT]
    for tid in stale_ids:
        del track_state[tid]
        print(f"[CLEANUP] Đã dọn dẹp bộ nhớ ID: {tid}")

def main():
    global track_state
    
    # Khởi chạy luồng OCR
    worker = threading.Thread(target=ocr_worker_thread, daemon=True)
    worker.start()

    cap = cv2.VideoCapture(CAMERA_SOURCE)
    print("=== HỆ THỐNG ALPR CHUẨN THỰC TẾ ĐÃ KÍCH HOẠT ===")

    frame_count = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        frame_count += 1
        current_time = time.time()

        # Cứ mỗi 30 frame dọn dẹp rác 1 lần
        if frame_count % 30 == 0:
            cleanup_stale_tracks()

        frame_resized = cv2.resize(frame, (800, 600))
        h_orig, w_orig, _ = frame.shape

        # CHẠY YOLO VỚI OBJECT TRACKING
        # Tham số persist=True để nhớ object giữa các frame
        # Tham số tracker="bytetrack.yaml" có sẵn của ultralytics (ít bị lỗi cài đặt hơn botsort)
        yolo_results = yolo_plate_model.track(frame_resized, persist=True, tracker="bytetrack.yaml", verbose=False)
        
        if yolo_results and len(yolo_results) > 0 and yolo_results[0].boxes is not None:
            boxes = yolo_results[0].boxes
            
            # Đảm bảo box có ID (vì đôi lúc tracker chưa gán ID ngay lập tức)
            if boxes.id is not None:
                track_ids = boxes.id.int().cpu().tolist()
                xyxys = boxes.xyxy.cpu().tolist()
                confs = boxes.conf.cpu().tolist()
                
                for track_id, xyxy, conf in zip(track_ids, xyxys, confs):
                    if conf > 0.65:
                        x1, y1, x2, y2 = map(int, xyxy)
                        
                        # Khởi tạo ID trong bộ nhớ nếu chưa có
                        if track_id not in track_state:
                            track_state[track_id] = {
                                "plate_text": None,
                                "history": [], # Lịch sử các lần đọc
                                "ocr_status": "pending",
                                "last_seen": current_time,
                                "color": (0, 0, 255) # Đỏ (chưa đọc được)
                            }
                        else:
                            # Cập nhật thời gian nhìn thấy lần cuối
                            track_state[track_id]["last_seen"] = current_time
                            
                        state = track_state[track_id]
                        
                        # Nếu ID này chưa ổn định và chưa được đẩy vào queue để OCR
                        if state["ocr_status"] == "pending":
                            x1_org = int(x1 * w_orig / 800)
                            y1_org = int(y1 * h_orig / 600)
                            x2_org = int(x2 * w_orig / 800)
                            y2_org = int(y2 * h_orig / 600)
                            
                            cropped_plate = frame[y1_org:y2_org, x1_org:x2_org]
                            if cropped_plate.size > 0 and not ocr_queue.full():
                                state["ocr_status"] = "processing" # Chặn không cho gửi tiếp ảnh cho đến khi xử lý xong
                                ocr_queue.put((track_id, cropped_plate))
                        
                        # VẼ KHUNG LÊN MÀN HÌNH
                        display_text = f"ID:{track_id} - {state['plate_text'] if state['plate_text'] else 'SCANNING'}"
                        cv2.rectangle(frame_resized, (x1, y1), (x2, y2), state["color"], 2)
                        cv2.putText(frame_resized, display_text, (x1, y1 - 10), 
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, state["color"], 2)

        cv2.imshow('Advanced ALPR System', frame_resized)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == '__main__':
    main()