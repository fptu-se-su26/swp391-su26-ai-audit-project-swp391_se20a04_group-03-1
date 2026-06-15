# Chi tiết dự án MeloTTS Vietnamese

Dự án này là một phiên bản được tuỳ biến và Việt hoá dựa trên kiến trúc gốc của [MeloTTS](https://github.com/myshell-ai/MeloTTS) - một công cụ Text-to-Speech đa ngôn ngữ hiệu suất cao, chất lượng giọng nói mượt mà do MyShell AI phát triển. Phiên bản này chuyên biệt cho tiếng Việt.

## 1. Luồng hoạt động (Workflow)

Quá trình từ một chuỗi văn bản thuần tuý biến thành giọng nói (audio) trong MeloTTS tiếng Việt diễn ra theo các bước sau:

### Bước 1: Tiền xử lý văn bản (Text Preprocessing)
- **Chuẩn hoá văn bản (Text Normalization)**: Xử lý các dấu câu, ký tự đặc biệt, chuyển đổi số thành chữ (nếu có), phân tách câu và từ để làm sạch văn bản đầu vào.
- **Phân tách âm vị (Grapheme-to-Phoneme - G2P)**: Văn bản đầu vào tiếng Việt được đẩy qua module `Text2PhonemeSequence`. Công cụ sẽ tra cứu trong từ điển `vie-n.tsv` (chứa quy tắc phát âm của tiếng Việt) để chia các từ thành các âm vị (phonemes) và các dấu thanh (tones).
  - Nếu từ không có trong từ điển, một mô hình T5 nhỏ (CharsiuG2P) sẽ chạy ngầm để suy luận âm vị một cách tự động.
- **Thêm tính năng phụ (Feature Extraction)**: Trích xuất thêm các embedding ngữ nghĩa (sử dụng một mô hình ngôn ngữ như BERT, ở đây dùng `bert-base-uncased` của HuggingFace) để giúp giọng đọc có ngữ điệu cảm xúc tự nhiên hơn.

### Bước 2: Sinh phổ âm (Acoustic Modeling)
- Các chuỗi âm vị (phonemes), cao độ/dấu thanh (tones), và ID ngôn ngữ/người đọc (speaker ID) được đưa vào **Acoustic Model** (mô hình âm thanh dựa trên VITS / VITS2).
- Thay vì sinh ra âm thanh trực tiếp, mô hình sẽ tính toán và mô phỏng các biến đổi về trường độ (duration) cũng như phổ âm thanh (spectrogram) theo thời gian.
- Tính năng Duration Predictor giúp MeloTTS tự động căn chỉnh khoảng cách nghỉ giữa các từ cho tự nhiên nhất mà không cần con người chỉ định độ dài.

### Bước 3: Chuyển đổi thành âm thanh (Vocoder)
- Module Vocoder (mô hình bộ tổng hợp âm thanh - thường là HiFi-GAN tích hợp bên trong kiến trúc VITS) nhận dữ liệu từ phổ âm và chuyển đổi nó ngược lại thành dạng sóng âm thanh (audio waveform).
- Khối lượng tính toán được tối ưu để Vocoder chạy cực nhanh, giúp thời gian phản hồi ở mức thời gian thực (Real-time TTS).

### Bước 4: Hậu xử lý và Xuất file
- Dạng sóng âm được lấy mẫu (sampling rate thường là 44.1kHz cho chất lượng cao) và lưu lại dưới dạng file âm thanh `.wav` (ví dụ `ket_qua.wav`).
- Hệ thống giải phóng bộ nhớ.

## 2. Kiến trúc thư mục chính
- `chay_thu.py`: Script khởi chạy trực tiếp và dễ dùng nhất.
- `melo/`: Thư mục lõi chứa mã nguồn.
  - `melo/text/`: Chứa các quy tắc chuẩn hoá, phân tách âm vị riêng cho từng ngôn ngữ (trong đó có `vietnamese.py`).
  - `melo/text2phonemesequence/`: Logic chuyển đổi chữ sang âm vị, tải từ điển và gọi model G2P (T5).
  - `melo/api.py`: Giao diện lập trình ứng dụng (API) gọn gàng, định nghĩa lớp `TTS` để khởi tạo mô hình và gọi hàm `tts_to_file`.
- `models/`: Thư mục do người dùng tạo, chứa file `G_model.pth` (trọng số của Generator) và `config.json` (cấu hình các lớp mạng neural).

## 3. Điểm đặc biệt của MeloTTS
1. **Chất lượng âm thanh tự nhiên (High Quality)**: Do áp dụng các biến thể của VITS/HiFi-GAN kết hợp với trích xuất ngữ điệu bằng BERT.
2. **Nhanh và nhẹ**: Dù sinh âm thanh chất lượng cao, nhưng mô hình suy luận rất nhanh ngay cả khi chạy trên CPU của máy tính cá nhân.
