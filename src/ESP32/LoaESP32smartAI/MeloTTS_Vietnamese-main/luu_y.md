# Những Lưu Ý Quan Trọng Về Xử Lý Text-To-Speech (MeloTTS)

Tài liệu này ghi chú lại những điểm cần đặc biệt chú ý khi sử dụng mã nguồn MeloTTS cho bài toán đọc biển số xe container hoặc các văn bản chứa nhiều chữ số độc lập.

## 1. Vấn Đề Về Bộ Chuẩn Hóa Văn Bản (Text Normalizer)

> [!WARNING]
> **Hệ thống bỏ qua số:** Mã nguồn MeloTTS hiện tại chưa tích hợp sẵn bộ chuẩn hóa văn bản (Text Normalizer) tự động cho tiếng Việt để chuyển đổi các con số (VD: `1`, `2`) thành chữ (`một`, `hai`). Do đó, nếu truyền trực tiếp chữ số vào, hệ thống TTS có thể sẽ không đọc được hoặc bỏ qua hoàn toàn các con số đó.

Mô hình học máy thường chỉ được huấn luyện trên các âm tiết (chữ cái) thay vì các ký tự số. Trong các dự án thực tế, người ta thường dùng một công cụ xử lý văn bản riêng để phiên âm số thành chữ trước khi đưa vào mô hình.

## 2. Giải Pháp Khắc Phục

Để hệ thống đọc đúng và tự nhiên từng ký tự của biển số (tránh tình trạng đọc dính liền số hàng chục ngàn hay hàng ngàn), bắt buộc phải có bước **tiền xử lý (pre-processing)**.

### Hàm `chuyen_ky_tu_sang_tieng_viet`
Trong mã nguồn hiện tại (`thong_bao_dieu_phoi.py` và `chay_thu.py`), chúng ta đã thêm vào một hàm để làm nhiệm vụ chuyển đổi từng ký tự:

- **Các chữ số `0` - `9`**: Chuyển thành chữ viết tiếng Việt (`không`, `một`, `hai`, `ba`, `bốn`, `năm`, `sáu`, `bảy`, `tám`, `chín`).
- **Các chữ cái tiếng Anh `A` - `Z`**: Chuyển thành phiên âm đọc chữ cái tương ứng (`a`, `bê`, `xê`, `đê`,...).

### Cách hoạt động
1. **Làm sạch**: Loại bỏ các dấu gạch ngang (`-`) và khoảng trắng cũ.
2. **Ánh xạ**: Dịch từng ký tự trong biển số qua hàm trên.
3. **Ghép nối**: Nối các chữ vừa dịch bằng một khoảng trắng ` ` (hoặc dấu phẩy `,` nếu muốn AI ngắt nghỉ lâu hơn).

> [!TIP]
> **Ví dụ thực tế:** 
> Khi đầu vào là `12A-12345` và vào ô số `1`:
> 1. Biển số sẽ được tách và dịch thành chuỗi: `"một hai a một hai ba bốn năm"`.
> 2. Ô số được dịch thành `"một"`.
> 3. Chuỗi văn bản cuối cùng đưa vào AI là: `"xe có biển số một hai a một hai ba bốn năm di chuyển vào ô số một"`.

## 3. Tùy Chỉnh Thêm

Nếu trong tương lai bạn cần hệ thống đọc chậm hơn ở từng con số, bạn có thể thay đổi cách nối các chữ số. Ví dụ:
```python
# Nối bằng dấu phẩy thay vì khoảng trắng để AI ngắt nghỉ
bien_so_doc = ", ".join([chuyen_ky_tu_sang_tieng_viet(c) for c in bien_so_sach])
```
