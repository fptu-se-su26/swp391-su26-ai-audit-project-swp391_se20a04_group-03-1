# Hướng dẫn chạy dự án MeloTTS Vietnamese

Dưới đây là các bước để khởi chạy và sử dụng dự án trên môi trường Windows (sử dụng Command Prompt).

## 1. Yêu cầu hệ thống
- Python 3.11.x
- Git (tuỳ chọn nếu bạn muốn clone repo)

## 2. Cài đặt môi trường

1. **Mở Command Prompt (cmd)** hoặc PowerShell tại chính thư mục dự án này, hoặc dùng lệnh `cd`:
   ```cmd
   cd .\LoaESP32smartAI\MeloTTS_Vietnamese-main
   ```
2. **Tạo môi trường ảo (virtual environment)**:
   ```cmd
   python -m venv venv
   ```
3. **Kích hoạt môi trường ảo**:
   ```cmd
   venv\Scripts\activate
   ```
   *(Sau khi kích hoạt, bạn sẽ thấy chữ `(venv)` ở đầu dòng lệnh).*

4. **Cài đặt các thư viện cần thiết**:
   ```cmd
   pip install -r requirements.txt
   pip install -e .
   ```

## 3. Chạy thử nghiệm tạo giọng nói
Dự án đã có sẵn file `chay_thu.py` để bạn dễ dàng tạo giọng nói từ văn bản.
*Lưu ý: Mô hình `G_model.pth` và cấu hình `config.json` phải được đặt ở trong thư mục `models/`.*

1. **Kích hoạt môi trường ảo** (nếu chưa kích hoạt):
   ```cmd
   venv\Scripts\activate
   ```
2. **Chạy script**:
   ```cmd
   python chay_thu.py
   ```
3. **Kết quả**:
   - Nếu chạy lần đầu tiên, chương trình sẽ tự động tải thêm các mô hình phụ trợ (như BERT) và bộ từ điển phát âm (`vie-n.tsv`).
   - Sau khi hoàn thành, file âm thanh kết quả sẽ được lưu với tên `ket_qua.wav` trong cùng thư mục.
   - Script tự động phát hiện xem máy bạn có hỗ trợ GPU hay không. Nếu không, nó sẽ dùng CPU.

## 4. Tuỳ chỉnh
Bạn có thể dễ dàng sửa văn bản cần đọc bằng cách mở file `chay_thu.py` bằng trình chỉnh sửa code (như VSCode hoặc Notepad) và sửa biến `text`.

```python
text = "Đoạn văn bản bạn muốn công cụ đọc."
```
Lưu file và chạy lại `python chay_thu.py`!

## 5. Hướng dẫn chạy Server API Ảo cho Loa ESP32
Dự án có sẵn file `api_server.py` để tạo một server cục bộ. Loa ESP32 của bạn sẽ kết nối tới server này để gửi văn bản và nhận file âm thanh (TTS) về.

1. **Cài đặt thêm các thư viện cho Server**:
   Do các thư viện làm server không có sẵn trong `requirements.txt`, bạn cần cài thêm `fastapi`, `uvicorn` và `python-multipart`. Hãy đảm bảo môi trường ảo (`venv`) đang được kích hoạt, sau đó chạy lệnh sau:
   ```cmd
   pip install fastapi uvicorn python-multipart
   ```

2. **Khởi động Server**:
   Sau khi cài đặt xong, hãy chạy file server:
   ```cmd
   python api_server.py
   ```
   *Mô hình AI (PyTorch) sẽ được load vào bộ nhớ ngay lúc khởi động. Khi màn hình hiện `Uvicorn running on http://0.0.0.0:8000` nghĩa là server đã sẵn sàng hoạt động!*

3. **Thông tin API (dành cho lập trình ESP32)**:
   - Thay vì dùng `localhost`, trên ESP32 bạn cần gọi đến địa chỉ IP LAN của máy tính đang chạy server (Ví dụ: `http://192.168.1.X:8000`).
   - `POST /generate-tts/`: Endpoint này nhận dữ liệu dạng file (form-data) chứa nội dung text. Server sẽ nhận đoạn chữ này và chuyển thành file âm thanh.
   - `GET /get-audio/`: Endpoint này trả về file `ket_qua.wav` dưới dạng binary audio để ESP32 tải về và phát ra loa.
