# Top 15 Prompts Chuẩn Hóa Theo Cấu Trúc Google (Prompt Engineering)
*Dự án: LoaESP32 smartAI*

Dưới đây là 15 prompt cốt lõi đã được viết lại theo chuẩn **Prompt Engineering framework** được Google khuyến nghị, bao gồm các yếu tố: **Vai trò (Persona), Ngữ cảnh (Context), Nhiệm vụ (Task), Yêu cầu/Ràng buộc (Instructions/Constraints), và Định dạng đầu ra (Format)**.

---

### 1. Khởi tạo cấu trúc phần cứng và logic lõi ESP32
```markdown
**Vai trò:** Chuyên gia lập trình hệ thống nhúng (Embedded Systems Engineer) chuyên về ESP32.

**Ngữ cảnh:** Tôi đang phát triển dự án `LoaESP32smartAI` chạy trên PlatformIO. Dự án sử dụng màn hình LCD I2C, module khuếch đại âm thanh MAX98357A (I2S) và động cơ Servo (SG90/MG996R).

**Nhiệm vụ:** Viết mã C++ cho ESP32 tích hợp các thành phần cứng trên.

**Yêu cầu:** 
- Cứ mỗi 5 giây, điều khiển servo xoay 90 độ để mở cổng.
- Khi cổng mở, in dòng chữ "WELCOME" ra màn hình LCD, đồng thời phát ra 3 tiếng "tinh tinh tinh" qua loa bằng I2S.
- Sau 2 giây mở cổng, điều khiển servo trở về trạng thái 0 độ.

**Định dạng đầu ra:** Toàn bộ source code `main.cpp` đầy đủ cho môi trường PlatformIO, kèm chú thích cấu hình chân (pinout) chi tiết.
```

---

### 2. Cải tiến Logic Hoạt Động & Thêm Cảm Biến Hồng Ngoại
```markdown
**Vai trò:** Kỹ sư hệ thống IoT.

**Ngữ cảnh:** Dự án hiện tại đã có LCD, Loa I2S và Servo hoạt động. Bây giờ tôi muốn tích hợp thêm cảm biến vật cản hồng ngoại (module LM393) nối vào GPIO 32.

**Nhiệm vụ:** Cập nhật luồng hoạt động tự động của hệ thống.

**Yêu cầu:**
- Trạng thái đóng: LCD hiện "Dang dong cong..." và đợi 5 giây (servo 0 độ).
- Trạng thái đón khách: LCD hiện "WELCOME!", phát 3 tiếng bíp, servo xoay 90 độ. Sau đó chuyển sang trạng thái chờ "Cho xe di qua..." và giữ cổng mở vô thời hạn.
- Khi xe cắt ngang cảm biến hồng ngoại: LCD chuyển sang in dòng chữ "Dang qua cong...".
- Thoát trạng thái: Sau khi xe đi qua hoàn toàn (tín hiệu cảm biến trở về HIGH), đợi 1 giây an toàn, hạ cổng xuống và quay lại từ đầu.

**Định dạng đầu ra:** Mã nguồn C++ hoàn chỉnh và các bước nối dây bổ sung.
```

---

### 3. Xử lý lỗi giao tiếp HTTP (ESP32 và Server)
```markdown
**Vai trò:** Kỹ sư phần mềm mạng (Network Software Engineer).

**Ngữ cảnh:** Hệ thống gồm 1 server ảo (chạy Python ở Localhost) đã tạo sẵn file `ket_qua.wav` và 1 mạch ESP32 kết nối chung WiFi.

**Nhiệm vụ:** Gỡ lỗi quá trình ESP32 tải file âm thanh từ server HTTP.

**Yêu cầu:** Phân tích nguyên nhân tại sao ESP32 báo lỗi "Không nhận được file" dù file đã thực sự tồn tại trên server. Hãy kiểm tra các khía cạnh: cấu hình tường lửa Windows (Firewall), khác biệt dải IP tĩnh/động, hoặc lỗi phân tích cú pháp URL trên mạch.

**Định dạng đầu ra:** Danh sách các bước kiểm tra (check-list) mạng và đoạn code HTTP Client (sử dụng thư viện HTTPClient) đã được tinh chỉnh để tải file an toàn.
```

---

### 4. Gỡ lỗi kết nối Mạng và IP
```markdown
**Vai trò:** Chuyên gia mạng nhúng (Embedded Network Expert).

**Ngữ cảnh:** Tôi vừa thay đổi điểm phát WiFi sang mạng mới, đã đổi đúng SSID/Password và cập nhật lại IP tĩnh trong mã nguồn.

**Nhiệm vụ:** Khắc phục lỗi ESP32 không chịu kết nối WiFi mới và không phát ra âm thanh.

**Yêu cầu:** Liệt kê các khả năng gây ra lỗi mạng (như băng tần 5GHz không được hỗ trợ trên ESP32) và đưa ra kỹ thuật chẩn đoán lỗi vòng lặp `WiFi.begin()`.

**Định dạng đầu ra:** Đoạn mã bổ sung hàm in log kết nối WiFi ra Serial Monitor để chẩn đoán trạng thái `WiFi.status()`.
```

---

### 5. Khắc phục lỗi Nguồn cho Servo
```markdown
**Vai trò:** Kỹ sư Điện tử (Electronics Engineer).

**Ngữ cảnh:** Tôi đang sử dụng một nguồn điện bên ngoài (5V adapter) để cấp điện riêng cho Servo, LCD, và Loa. Mạch ESP32 chỉ đóng vai trò cấp tín hiệu. Khi nạp code, mạch vẫn chạy logic bình thường nhưng Servo bị đơ, không xoay.

**Nhiệm vụ:** Tìm và khắc phục lỗi phần cứng kết nối nguồn.

**Yêu cầu:** Phân tích lỗi kỹ thuật về "Nối chung mass/GND" giữa các bộ nguồn độc lập. Giải thích ngắn gọn cơ chế băm xung PWM cần mạch tham chiếu điện áp.

**Định dạng đầu ra:** Giải thích kỹ thuật và hướng dẫn sửa lại dây nối (sơ đồ kết nối lại).
```

---

### 6. Hiệu chỉnh góc xoay Servo
```markdown
**Vai trò:** Kỹ sư Hệ thống Điều khiển (Control Systems Engineer).

**Ngữ cảnh:** Servo MG996R sử dụng thư viện `ESP32Servo.h` nhưng khi ra lệnh `write(0)` và `write(90)`, góc quay vật lý thực tế của động cơ đang bị lệch, không thẳng chuẩn xác.

**Nhiệm vụ:** Tinh chỉnh các thông số cấp xung PWM.

**Yêu cầu:** Cung cấp kỹ thuật sử dụng giới hạn min/max pulse (microsecond) thay thế cho việc gọi độ thẳng. Giúp tôi căn chỉnh lại điểm 0 thực tế và góc vuông 90 độ thực tế.

**Định dạng đầu ra:** Đoạn mã cấu hình `gateServo.attach(pin, minPulse, maxPulse)` kèm chú thích cách thay đổi thông số pulse.
```

---

### 7. Sửa lỗi hiển thị dữ liệu LCD
```markdown
**Vai trò:** Kỹ sư Nhúng.

**Ngữ cảnh:** Màn hình hiển thị LCD 16x2 sử dụng module mở rộng I2C đang hiển thị ra toàn các ký tự nhiễu, rác, không đọc được tiếng Anh/Việt.

**Nhiệm vụ:** Chẩn đoán và sửa lỗi đường truyền tín hiệu I2C.

**Yêu cầu:** Nêu ra các nguyên nhân khả dĩ nhất (như xung nhiễu dây điện dài, sai địa chỉ 0x27/0x3F, hoặc nguồn điện vào 3.3V thay vì 5V không đủ độ tương phản).

**Định dạng đầu ra:** Cung cấp một đoạn mã "I2C Scanner" chuẩn của Arduino để giúp tôi tìm đúng địa chỉ phần cứng của màn hình.
```

---

### 8. Thiết lập môi trường Server AI (Python)
```markdown
**Vai trò:** Chuyên gia Python và Trí tuệ nhân tạo (AI Expert).

**Ngữ cảnh:** Trong thư mục `MeloTTS_Vietnamese-main`, tôi đã kích hoạt môi trường ảo (venv) và chạy `python chay_thu.py` nhưng liên tục gặp thông báo lỗi: `ModuleNotFoundError: No module named 'torch'`.

**Nhiệm vụ:** Xử lý triệt để lỗi môi trường thư viện.

**Yêu cầu:** Hướng dẫn chính xác câu lệnh cài đặt thư viện `PyTorch` hỗ trợ cho CPU/GPU trên Windows. Giải thích vì sao khi dùng venv cần phải cài lại thư viện thay vì dùng chung với Python gốc.

**Định dạng đầu ra:** Lệnh cài đặt cụ thể trong terminal Windows (ví dụ: pip install).
```

---

### 9. Quản lý Tài liệu Dự án
```markdown
**Vai trò:** Chuyên viên viết tài liệu kỹ thuật (Technical Writer).

**Ngữ cảnh:** Dự án đang thiếu bước hướng dẫn rõ ràng trong file `huong_dan_chay_du_an.md` để chạy được server AI.

**Nhiệm vụ:** Soạn thảo thêm mục "Hướng dẫn khởi động và chạy server ảo".

**Yêu cầu:** Viết một cách bài bản, rõ ràng từ các bước căn bản nhất (mở terminal ở đâu, tạo venv thế nào, chạy requirements.txt, cho đến lệnh start server).

**Định dạng đầu ra:** Đoạn văn bản định dạng Markdown (.md) chuẩn, sử dụng các khối code-block cho mọi lệnh terminal để người đọc dễ dàng copy/paste.
```

---

### 10. Dọn dẹp & Quản lý Mã Nguồn
```markdown
**Vai trò:** Kỹ sư DevOps và chuyên gia quản lý Git.

**Ngữ cảnh:** Toàn bộ thư mục dự án hiện chứa trộn lẫn giữa code C++ (PlatformIO) và mã Python (chứa các model AI nặng, log, venv).

**Nhiệm vụ:** Thiết lập các bộ quy tắc loại trừ file (gitignore) cho dự án monorepo này.

**Yêu cầu:** 
- Tạo file `.gitignore` tiêu chuẩn nhằm loại bỏ: thư mục build `.pio/`, file biên dịch `*.elf`, cache của Python `__pycache__/`, môi trường ảo `venv/` và thông tin lưu trữ VS Code.
- Đảm bảo các mô hình nặng (file .pth) hoặc data nhạy cảm không bị đưa lên Git nhưng các config thiết yếu vẫn được giữ.

**Định dạng đầu ra:** Nội dung nguyên văn cho các file `.gitignore` để gán vào các thư mục tương ứng.
```

---

### 11. Xử lý Lỗi Cài đặt Thư viện bằng Pip (Virtual Environment)
```markdown
**Vai trò:** Chuyên gia Môi trường Python (Python Environment Specialist).

**Ngữ cảnh:** Khi kích hoạt môi trường ảo (venv) để thiết lập dự án MeloTTS và chạy lệnh `pip install -r requirements.txt`, terminal báo lỗi: `Fatal error in launcher: Unable to create process using ... pip.exe`.

**Nhiệm vụ:** Khắc phục lỗi đường dẫn môi trường của trình quản lý gói pip.

**Yêu cầu:** Giải thích nguyên nhân (thường do di chuyển thư mục chứa venv làm sai lệch đường dẫn tuyệt đối của pip). Cung cấp giải pháp dùng `python -m pip install` thay vì gọi trực tiếp `pip`, hoặc hướng dẫn xóa và tạo lại venv một cách an toàn.

**Định dạng đầu ra:** Câu lệnh khắc phục lỗi có thể chạy ngay trong Terminal.
```

---

### 12. Gỡ bỏ Công cụ Giả lập Linux (MSYS2) Gây Xung Đột
```markdown
**Vai trò:** Quản trị viên Hệ thống Windows (Windows System Administrator).

**Ngữ cảnh:** Máy tính của tôi có cài đặt bộ công cụ MSYS2. Điều này làm cho biến môi trường PATH ưu tiên gọi Python của MSYS2 (`C:\msys64\...`) thay vì Python chuẩn của Windows, khiến dự án AI TTS không nhận diện được thư viện.

**Nhiệm vụ:** Hướng dẫn loại bỏ sự cản trở của MSYS2 đối với môi trường lập trình Python.

**Yêu cầu:** Liệt kê các bước cụ thể để mở "Environment Variables" (Biến môi trường) trên Windows, tìm và xóa đường dẫn của MSYS2 ra khỏi biến PATH.

**Định dạng đầu ra:** Danh sách hướng dẫn từng bước (step-by-step) trên giao diện đồ họa Windows.
```

---

### 13. Tự Động Hóa Thực Thi Lệnh Terminal
```markdown
**Vai trò:** Trợ lý lập trình AI tự động (Agentic AI Assistant).

**Ngữ cảnh:** Tôi đang gặp khó khăn khi cài đặt môi trường ảo cho mô hình AI. Bạn vừa hướng dẫn các dòng lệnh khắc phục lỗi, nhưng tôi muốn bạn trực tiếp can thiệp.

**Nhiệm vụ:** Chạy trực tiếp các lệnh Terminal để sửa lỗi môi trường Python trên thiết bị của tôi.

**Yêu cầu:** Hãy sử dụng khả năng thực thi mã lệnh/terminal tự động của bạn để xóa thư mục `venv` cũ bị lỗi, tạo lại `venv` mới và kích hoạt, sau đó cài đặt `requirements.txt` mà không cần tôi phải tự gõ bất kỳ phím nào.

**Định dạng đầu ra:** Kết quả thực thi từ hệ thống (Log/Output) xác nhận môi trường đã sẵn sàng.
```

---

### 14. Đánh Giá và Tái Cấu Trúc Tài Liệu Kỹ Thuật (Docs)
```markdown
**Vai trò:** Người kiểm duyệt tài liệu (Technical Reviewer).

**Ngữ cảnh:** Tôi đang xem xét file `docs\huong_dan_chay_du_an.md` thuộc thư mục TTS AI sau khi chúng ta đã khắc phục hàng loạt lỗi phần cứng và môi trường.

**Nhiệm vụ:** Rà soát và cập nhật nội dung tài liệu.

**Yêu cầu:** Hãy đọc toàn bộ nội dung file tài liệu hiện tại, đối chiếu với những thay đổi kỹ thuật ta vừa làm (như sử dụng IP tĩnh mới, lệnh `python -m pip`, cấu hình ESP32). Đề xuất những thông tin bị lỗi thời cần xóa đi và viết bổ sung những thông tin mới.

**Định dạng đầu ra:** Danh sách các điểm cần chỉnh sửa (bullet points) và đoạn văn bản nháp Markdown để thay thế.
```

---

### 15. Tinh chỉnh Server API Trả Về Luồng Âm Thanh
```markdown
**Vai trò:** Kỹ sư Kỹ thuật Trí tuệ Nhân tạo (AI/ML Engineer).

**Ngữ cảnh:** Hệ thống MeloTTS hiện tại chạy script `chay_thu.py` thành công và sinh ra file `ket_qua.wav` tĩnh trên ổ cứng dựa theo model ngôn ngữ Việt (`vie-n.tsv`). Tuy nhiên, ESP32 cần kéo luồng dữ liệu này qua mạng.

**Nhiệm vụ:** Xây dựng một Web API server nội bộ để phục vụ file âm thanh.

**Yêu cầu:** 
- Viết một endpoint HTTP (sử dụng thư viện như Flask, FastAPI hoặc HTTP module tiêu chuẩn).
- Khi ESP32 gọi phương thức GET tới endpoint này kèm nội dung văn bản, server sẽ gọi mô hình TTS sinh ra file và trả trực tiếp file .wav về dưới dạng HTTP Response (MIME type: `audio/wav`).

**Định dạng đầu ra:** Source code hoàn chỉnh của server Python và ví dụ gọi API.
```
