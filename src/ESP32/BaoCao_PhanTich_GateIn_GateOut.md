# BÁO CÁO PHÂN TÍCH KỸ THUẬT - HỆ THỐNG ESP32 (GATE IN & GATE OUT)

**Người đánh giá:** Tester (AI)
**Dự án:** IoT kết hợp AI (Smart Parking/Logistics)

Sau quá trình kiểm tra và phân tích mã nguồn đang chạy trên hai vi điều khiển ESP32 cho phần Cổng Vào (`GateIn`) và Cổng Ra (`GateOut`), tôi xin gửi báo cáo về các vấn đề, lỗi tiềm ẩn và các điểm thiếu sót hiện tại của hệ thống.

---

## 1. TỔNG QUAN VỀ KIẾN TRÚC VÀ SỰ THIẾU ĐỒNG BỘ
Hiện tại, hai hệ thống đang được viết theo hai tư duy và kiến trúc hoàn toàn khác nhau, gây ra sự thiếu đồng bộ nghiêm trọng:
*   **Giao thức kết nối:** 
    *   `GateIn` sử dụng **HTTP Server** cục bộ (chờ Backend gọi API GET `/api/open-gate`).
    *   `GateOut` sử dụng **MQTT Protocol** (Subscribe/Publish qua broker).
*   **Luồng xử lý (Threading & Blocking):**
    *   `GateIn` được viết theo dạng **tuần tự (Blocking)**, sử dụng các vòng lặp `while` và `delay()` trực tiếp trong hàm `loop()`.
    *   `GateOut` được viết theo dạng máy trạng thái **State Machine (Non-blocking)**, và sử dụng **FreeRTOS (Task & Queue)** để xử lý đa luồng (âm thanh chạy ở core riêng).
=> **Nhận xét:** Việc Backend phải gọi bằng 2 giao thức khác nhau cho cùng một chức năng là không tối ưu. Nên đồng bộ chuyển `GateIn` sang sử dụng MQTT giống như `GateOut`.

---

## 2. PHÂN TÍCH CHI TIẾT: GATE IN (CỔNG VÀO)

### Ưu điểm:
*   Code ngắn gọn, dễ hiểu luồng đi của xe.
*   Đã có xử lý ngắt/yield() chống lỗi Watchdog (WDT) khi phát âm thanh.

### Lỗi tiềm ẩn (Bugs) & Hạn chế:
1.  **Lỗi Treo Hệ Thống (Deadlock) ở cảm biến hồng ngoại:** 
    *   Ở BƯỚC 3 (Xe đang đi qua cổng), vòng lặp `while (digitalRead(IR_PIN) == LOW)` chờ đuôi xe đi qua **không hề có Timeout**. 
    *   **Hậu quả:** Nếu cảm biến hỏng, bị bẩn, hoặc xe tải bị chết máy giữa cổng, ESP32 sẽ bị kẹt mãi mãi trong vòng lặp này. Lúc này HTTP WebServer vẫn nhận request nhưng hệ thống không thể hoạt động tiếp. Cổng sẽ mở vĩnh viễn.
2.  **Khóa luồng (Blocking Code) do delay:**
    *   Quá trình chờ xe đến (tối đa 30s) dùng `while` kết hợp `delay(50)`. Dù có gọi `server.handleClient()` nhưng không tối ưu cho một vi điều khiển có mạng. Nếu có kết nối rác, thiết bị sẽ xử lý rất chậm.
3.  **Bảo vệ phần cứng (Cơ cấu Servo):**
    *   Code gọi lệnh `gateServo.write(ANGLE_OPEN)` và sau đó là `ANGLE_CLOSED` một cách trực tiếp. Chuyển động đột ngột từ 170 độ về 80 độ sẽ gây giật cục, dễ mẻ răng cưa của Servo hoặc hỏng cơ cấu cổng cơ khí.

---

## 3. PHÂN TÍCH CHI TIẾT: GATE OUT (CỔNG RA)

### Ưu điểm:
*   Kiến trúc rất tốt (State machine), không làm treo hệ thống.
*   Cơ chế điều khiển Servo quét từ từ (Smooth Sweep) thông qua `updateServo()` và `SERVO_MOVE_DELAY` giúp bảo vệ phần cứng.
*   Âm thanh (I2S) được đẩy vào Hàng đợi (Queue) và chạy bằng 1 Task riêng (FreeRTOS) giúp luồng chính kiểm soát phần cứng mượt mà. Hỗ trợ phát file âm thanh `.wav` trực tuyến.
*   Bảo mật tốt hơn (MQTT over TLS, có reconnect mechanism).

### Lỗi tiềm ẩn (Bugs) & Hạn chế:
1.  **Lỗi Treo Cổng (Logic Bỏ Quên Timeout):**
    *   Ở trạng thái `STATE_WAIT_CAR_PASS`, hệ thống chờ xe cắt qua cảm biến `IR_PIN`. Tuy nhiên, nếu Backend gửi lệnh mở cổng nhưng thực tế **không có xe nào chạy qua** (lệnh ảo, hoặc tài xế lùi xe lại không ra nữa), hệ thống sẽ ở trạng thái `STATE_WAIT_CAR_PASS` mãi mãi. 
    *   **Hậu quả:** Cổng không bao giờ đóng lại cho đến khi có một vật cản vô tình đi qua cảm biến.
2.  **Mâu thuẫn giữa Comment và Code:**
    *   Dòng số 6 ghi chú: *"Có 4 cảm biến đếm xe đang CHỜ ra."* nhưng thực tế trong code chỉ khai báo và xử lý đúng 1 cảm biến (`IR_PIN 32`). Chức năng đếm xe đang chờ hoàn toàn chưa được lập trình.

---

## 4. PHÂN TÍCH LỖI NGHIỆP VỤ (BUSINESS LOGIC) - LỖI HỆ THỐNG VẬN HÀNH

Sau khi đối chiếu mã nguồn với các kịch bản thực tế của một hệ thống quản lý bãi đỗ xe/logistics, hệ thống đang bộc lộ các vấn đề nghiệp vụ nghiêm trọng sau:

1.  **Lỗi "Đóng cổng nhầm" đối với xe đầu kéo/xe dài (Rơ moóc):**
    *   **Hiện trạng:** Cả hai cổng hiện tại dùng logic: Cảm biến bị che (`LOW`) -> Đợi cảm biến hết bị che (`HIGH`) -> Delay 1s -> Đóng cổng.
    *   **Thực tế:** Xe tải lớn hoặc xe kéo rơ moóc thường có khoảng hở lớn giữa đầu kéo và thùng xe. Khi khoảng hở này đi ngang cảm biến, cảm biến sẽ báo `HIGH` trong tíc tắc. Barie sẽ hiểu nhầm xe đã qua và lập tức sập xuống giữa xe, gây tai nạn hoặc hư hỏng nặng.

2.  **Thiếu cơ chế can thiệp khẩn cấp (Emergency / Override):**
    *   **Hiện trạng:** Hệ thống chỉ nhận duy nhất lệnh `open` (Gate Out) và API `/api/open-gate` (Gate In).
    *   **Thực tế:** Hệ thống vận hành thực tế luôn cần các lệnh bắt buộc đóng (`close`), lệnh giữ mở cổng liên tục (`hold_open` cho giờ cao điểm), và cả nút bấm vật lý (Manual Button) tại bốt bảo vệ để xử lý sự cố khi mất mạng hoặc Backend lỗi.

---

## 5. KHUYẾN NGHỊ VÀ GIẢI PHÁP SỬA LỖI ĐỒNG BỘ

Để hệ thống hoạt động ổn định và chuyên nghiệp hơn, đáp ứng đúng nghiệp vụ, đội dev cần thực hiện các công việc sau:

1.  **Đồng bộ kiến trúc (Đập đi xây lại Gate In theo chuẩn Gate Out):**
    *   Chuyển giao tiếp của Gate In từ HTTP GET sang **MQTT**.
    *   Áp dụng kiến trúc **State Machine** cho luồng mở cổng/đóng cổng của Gate In để không block thread.
    *   Áp dụng cơ chế xoay Servo từ từ để bảo vệ động cơ.
    *   Tách việc phát loa âm thanh sang một Task riêng biệt (dùng FreeRTOS xTaskCreatePinnedToCore).
2.  **Sửa lỗi nghiệp vụ & Kỹ thuật:**
    *   **Thêm Hàng Đợi (Queue) cho xe:** Thay vì dùng 1 biến cờ, cần tạo một mảng hoặc danh sách (Queue) chứa biển số các xe đang được phép qua. Mỗi khi 1 xe qua, pop() khỏi Queue. Chỉ đóng cổng khi Queue rỗng.
    *   **Debounce Cảm biến (Chống kẹp xe dài):** Khi cảm biến chuyển từ `LOW` (bị che) sang `HIGH` (không che), cần đếm thời gian (ví dụ 3-4 giây). Nếu trong 3-4 giây đó cảm biến bị che lại (vẫn là thân xe đó), thì reset timer. Chỉ đóng cổng khi cảm biến thực sự `HIGH` liên tục quá 4 giây.
    *   **Bổ sung Timeout ở các vòng lặp/trạng thái chờ:** Nếu cổng đã mở mà quá 30-45s xe không đi qua (hủy lệnh), phải tự động chuyển sang trạng thái đóng cổng.
3.  **Bảo mật & Quản lý Config:**
    *   Đồng bộ thông tin WiFi/MQTT cho chuẩn. Nên cân nhắc dùng tính năng WiFiManager (để tự sinh Access Point điền WiFi qua web nội bộ) thay vì fix cứng `SSID/Pass` trong code. Tránh tình trạng mang thiết bị sang môi trường khác phải nạp lại code.

---

## 6. BỔ SUNG YÊU CẦU NGHIỆP VỤ MỚI (REQUIREMENTS)

Theo yêu cầu nâng cấp dự án, hệ thống cần bổ sung 2 luồng nghiệp vụ quan trọng sau vào Backend và Code của ESP32:

### 6.1. Đồng bộ Báo cháy (Fire Alarm Sync)
**Mục tiêu:** Khi có sự cố cháy tại Gate In, cả Gate In và Gate Out đều phải lập tức mở cổng để phục vụ sơ tán khẩn cấp.
*   **Gate In:** 
    * Cần bổ sung logic đọc cảm biến cháy (Fire Sensor).
    * Khi phát hiện cháy: Lập tức chuyển state sang `EMERGENCY_OPEN` (Mở cổng thẳng lên góc an toàn, bỏ qua các bước chờ xe). Bật còi báo động (nếu có).
    * Gửi bản tin MQTT báo cháy về Backend (VD: `topic: smartparking/alerts/fire`).
*   **Backend:**
    * Subscribe topic cảnh báo cháy. Khi nhận được tín hiệu cháy từ Gate In, Backend phải lập tức Publish lệnh `{"action": "emergency_open"}` xuống topic điều khiển của **Gate Out** (và tất cả các cổng khác trong bãi).
*   **Gate Out:**
    * Bổ sung luồng xử lý lệnh `emergency_open`. Khi nhận lệnh này, lập tức chuyển sang trạng thái mở cổng khẩn cấp.
    * Ở trạng thái khẩn cấp, cổng phải **giữ nguyên vị trí mở (Hold Open)**, tuyệt đối không tự động đóng lại khi xe đi qua như nghiệp vụ thông thường. Chỉ được đóng khi nhận lệnh `emergency_close` hoặc reset tay.

### 6.2. Đèn LED Điều hướng theo Phân loại Xe (Gate In)
**Mục tiêu:** Sau khi Backend phân loại được xe vào bãi để lấy hay trả Container, hệ thống cổng vào (Gate In) sẽ bật đèn LED tương ứng ở làn đường phù hợp trong 15s để hướng dẫn tài xế.
*   **Backend:**
    * Trong lệnh mở cổng gửi xuống Gate In, cần bổ sung thêm trường phân loại luồng công việc.
    * Ví dụ Payload JSON: `{"action": "open", "plate": "...", "task": "pickup"}` (Vào lấy Cont) hoặc `{"task": "return"}` (Vào trả Cont).
*   **Gate In:**
    * Khai báo thêm 2 chân GPIO kết nối với Đèn Làn 1 (Lấy Cont) và Đèn Làn 2 (Trả Cont).
    * Khi nhận được lệnh mở cổng, đọc tham số `task`. Nếu là `pickup` thì kích hoạt **Đèn Làn 1**. Nếu là `return` thì kích hoạt **Đèn Làn 2**.
    * **Xử lý thuật toán Non-blocking:** Lưu lại thời điểm bật đèn `ledStartTime = millis()`. Trong hàm `loop()`, kiểm tra điều kiện `if (millis() - ledStartTime >= 15000)` thì sẽ tự động tắt đèn. Tuyệt đối không được dùng lệnh `delay(15000)` vì sẽ làm chết ngắt toàn bộ hệ thống mở cổng và chặn các tính năng khác.
