# 🐛 DANH SÁCH BÁO CÁO LỖI (BUG REPORTS) — TUẦN 7

Tài liệu tổng hợp các báo cáo lỗi phát hiện trong tuần 7 (bao gồm các lỗi đã sửa và các lỗi phát hiện qua kiểm thử tự do - Exploratory Testing).

---

### ID: BUG-001
* **Summary:** API tạo bãi đỗ (Yards) trả về HTTP status 200 OK thay vì 400 Bad Request khi thiếu trường `cameraIp`.
* **Steps:**
  1. Gửi request `POST` đến endpoint `/api/yards/create`.
  2. Gửi payload chỉ có `name` (ví dụ: `{"name": "Bãi đỗ thiếu IP"}`) và bỏ trống trường `cameraIp`.
  3. Kiểm tra mã trạng thái HTTP (Status Code) và phản hồi từ hệ thống.
* **Expected:** Hệ thống phải phản hồi mã trạng thái **HTTP 400 Bad Request** vì dữ liệu đầu vào không hợp lệ (thiếu tham số bắt buộc).
* **Actual:** Hệ thống phản hồi mã trạng thái **HTTP 200 OK** mặc dù payload thất bại và trả về thông tin lỗi Joi validation.
* **Severity:** Major
* **Trạng thái:** Đã sửa (Fixed)

---

### ID: BUG-002
* **Summary:** Lỗi assertion fail tại API đặt lịch hẹn (Appointments) khi khung giờ đặt chỗ đã đầy (Capacity đạt tối đa).
* **Steps:**
  1. Chạy test suite `appointment.api.test.ts` (test case `TC_INT_3`).
  2. Giả lập luồng đặt lịch hẹn liên tục vào cùng một khung giờ cho đến khi số lượng đặt lịch đạt giới hạn tối đa (max capacity).
  3. Tiếp tục gửi thêm một yêu cầu đặt lịch hẹn mới vào khung giờ đó.
* **Expected:** Test suite cần đặt kì vọng khẳng định (assertion) trả về đúng là **HTTP 400 Bad Request** khi hết lượt đặt chỗ để phản ánh đúng logic nghiệp vụ của backend.
* **Actual:** API trả về mã trạng thái **HTTP 400 Bad Request**, nhưng file test đang thiết lập kì vọng trả về **HTTP 200 OK**, dẫn đến test suite bị lỗi đỏ (Fail).
* **Severity:** Major
* **Trạng thái:** Đã sửa (Fixed)

---

### ID: BUG-003
* **Summary:** Lỗi crash kiểm thử Frontend Login do thiếu định nghĩa hàm Page Object `getPasswordLengthValidationError` trong `LoginPage.ts`.
* **Steps:**
  1. Khởi chạy test suite frontend bằng lệnh: `npx playwright test tests/login.spec.ts`.
  2. Chạy đến test case kiểm thử độ dài mật khẩu: *"Hiển thị lỗi validate khi nhập mật khẩu quá ngắn"*.
* **Expected:** Lớp Page Object `LoginPage.ts` phải chứa đầy đủ khai báo các thành phần UI (Locators) và phương thức hỗ trợ để test suite có thể tương tác bình thường và PASS.
* **Actual:** Test suite bị dừng đột ngột và báo lỗi `TypeError: loginPage.getPasswordLengthValidationError is not a function`.
* **Severity:** Critical
* **Trạng thái:** Đã sửa (Fixed)

---

### ID: BUG-004
* **Summary:** Endpoint tạo lịch hẹn (`POST /api/appointments/create`) lưu trực tiếp `driverId` mà không xác thực sự tồn tại của tài xế trong cơ sở dữ liệu.
* **Steps:**
  1. Gửi request `POST` tới `/api/appointments/create`.
  2. Truyền payload đăng ký lịch hẹn đầy đủ, ngoại trừ trường `driverId` sử dụng một chuỗi ID ngẫu nhiên không tồn tại (ví dụ: `60c72b2f9b1d8e1f5c8f8b89`).
  3. Kiểm tra phản hồi của API và kiểm tra database.
* **Expected:** API phải chặn tạo lịch hẹn và trả về mã trạng thái **HTTP 400 Bad Request** kèm thông điệp lỗi: *"Tài xế không tồn tại trong hệ thống."*
* **Actual:** API trả về mã trạng thái **HTTP 201 Created**, ghi nhận lịch hẹn thành công với tài xế không tồn tại (lỗi dữ liệu mồ côi).
* **Severity:** Major
* **Trạng thái:** Chưa sửa (Open - Lỗi nghiệp vụ backend)

---

### ID: BUG-005
* **Summary:** API lấy chi tiết bãi đỗ (`GET /api/yards/:id`) vẫn trả về dữ liệu của bãi đỗ đã bị xóa mềm (`isDeleted = true`).
* **Steps:**
  1. Thực hiện xóa mềm một bãi đỗ bằng cách gửi request `DELETE` tới `/api/yards/:yardId`.
  2. Gửi request `GET` tới `/api/yards/:yardId` để lấy thông tin chi tiết của bãi đỗ vừa xóa đó.
  3. Xem phản hồi trả về từ hệ thống.
* **Expected:** API phải chặn truy cập và trả về mã trạng thái **HTTP 400 Bad Request** hoặc **HTTP 404 Not Found** kèm thông điệp: *"Không tìm thấy bãi đỗ"*.
* **Actual:** API trả về mã trạng thái **HTTP 200 OK** kèm theo đầy đủ chi tiết thông tin của bãi đỗ đã xóa mềm.
* **Severity:** Medium
* **Trạng thái:** Chưa sửa (Open - Lỗi nghiệp vụ backend)

---

### ID: BUG-006
* **Summary:** API cập nhật cấu hình bãi đỗ (`PATCH /api/yards/:id/slots`) cho phép sửa đổi cấu hình slots của bãi đỗ đã bị xóa mềm (`isDeleted = true`).
* **Steps:**
  1. Lấy ID của một bãi đỗ đã bị xóa mềm (`isDeleted: true`).
  2. Gửi request `PATCH` tới `/api/yards/:yardId/slots` kèm theo cấu hình slots mới trong body.
  3. Kiểm tra kết quả phản hồi và bản ghi trong database.
* **Expected:** API phải trả về mã trạng thái **HTTP 400 Bad Request** báo lỗi: *"Không thể cấu hình bãi đỗ đã bị xóa"*.
* **Actual:** API phản hồi mã trạng thái **HTTP 200 OK** thông báo *"Cập nhật cấu hình bãi đỗ thành công"* và thay đổi cấu hình slots của bãi đỗ đã bị xóa bình thường.
* **Severity:** Medium
* **Trạng thái:** Chưa sửa (Open - Lỗi nghiệp vụ backend)
