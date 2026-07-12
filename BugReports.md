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
  2. Truyền payload đăng ký lịch hẹn đầy đủ, ngoại trừ trường `driverId` sử dụng một chuỗi ID ngẫu nhiên không tồn tại.
  3. Kiểm tra phản hồi của API và kiểm tra database.
* **Expected:** API phải chặn tạo lịch hẹn và trả về mã trạng thái **HTTP 400 Bad Request** kèm thông điệp lỗi: *"Tài xế không tồn tại trong hệ thống."*
* **Actual:** API trả về mã trạng thái **HTTP 201 Created**, ghi nhận lịch hẹn thành công với tài xế không tồn tại.
* **Severity:** Major
* **Trạng thái:** Chưa sửa (Open - Lỗi nghiệp vụ backend)

---

### ID: BUG-005
* **Summary:** API lấy chi tiết bãi đỗ (`GET /api/yards/:id`) vẫn trả về dữ liệu của bãi đỗ đã bị xóa mềm (`isDeleted = true`).
* **Steps:**
  1. Thực hiện xóa mềm một bãi đỗ bằng cách gửi request `DELETE` tới `/api/yards/:yardId`.
  2. Gửi request `GET` tới `/api/yards/:yardId`.
* **Expected:** API phải chặn truy cập và trả về mã trạng thái **HTTP 404 Not Found**.
* **Actual:** API trả về mã trạng thái **HTTP 200 OK** kèm theo đầy đủ chi tiết.
* **Severity:** Medium
* **Trạng thái:** Chưa sửa (Open - Lỗi nghiệp vụ backend)

---

### ID: BUG-006
* **Summary:** API cập nhật cấu hình bãi đỗ (`PATCH /api/yards/:id/slots`) cho phép sửa đổi cấu hình slots của bãi đỗ đã bị xóa mềm.
* **Steps:**
  1. Lấy ID của một bãi đỗ đã bị xóa mềm (`isDeleted: true`).
  2. Gửi request `PATCH` tới `/api/yards/:yardId/slots` kèm theo cấu hình slots mới trong body.
  3. Kiểm tra kết quả phản hồi và bản ghi trong database.
* **Expected:** API phải trả về mã trạng thái **HTTP 400 Bad Request** báo lỗi: *"Không thể cấu hình bãi đỗ đã bị xóa"*.
* **Actual:** API phản hồi mã trạng thái **HTTP 200 OK** thông báo *"Cập nhật cấu hình bãi đỗ thành công"* và thay đổi cấu hình slots của bãi đỗ đã bị xóa bình thường.
* **Severity:** Medium
* **Trạng thái:** Chưa sửa (Open - Lỗi nghiệp vụ backend)

---

### ID: BUG-007
* **Summary:** API xóa vĩnh viễn tài xế (`DELETE /api/drivers/:id/hard-delete`) không kiểm tra xem tài xế có đang nằm trong thùng rác (`isDeleted = true`) hay không, cho phép xóa vĩnh viễn tài xế đang hoạt động.
* **Steps:**
  1. Tìm một tài xế đang hoạt động bình thường (`isDeleted: false`) và lấy `_id` của tài xế đó.
  2. Gửi request `DELETE` trực tiếp tới `/api/drivers/:id/hard-delete` với ID tài xế vừa lấy (tài xế chưa qua bước soft-delete).
  3. Kiểm tra phản hồi của API và kiểm tra bản ghi trong database.
* **Expected:** API phải trả về **HTTP 400 Bad Request** kèm thông điệp: *"Chỉ có thể xóa vĩnh viễn tài xế đang trong thùng rác."* và từ chối xóa tài xế vẫn đang hoạt động.
* **Actual:** API trả về mã trạng thái **HTTP 200 OK** thông báo *"Xóa vĩnh viễn tài xế thành công"* và xóa hoàn toàn bản ghi tài xế đang hoạt động khỏi database, gây mất dữ liệu nghiệp vụ vĩnh viễn.
* **Severity:** Critical
* **Trạng thái:** Chưa sửa (Open - Lỗi nghiệp vụ backend)

---

### ID: BUG-008
* **Summary:** API cập nhật tài xế (`PATCH /api/drivers/:id`) cho phép cập nhật thông tin của tài xế đã bị xóa mềm (`isDeleted = true`) mà không có cảnh báo hoặc ngăn chặn.
* **Steps:**
  1. Tìm một tài xế đã bị soft-delete (`isDeleted: true`) và lấy `_id` của tài xế đó.
  2. Gửi request `PATCH` tới `/api/drivers/:id` với payload cập nhật thông tin (tên, số điện thoại,...).
  3. Kiểm tra phản hồi của API và kiểm tra bản ghi trong database.
* **Expected:** API phải từ chối cập nhật và trả về **HTTP 400 Bad Request** kèm thông báo: *"Không thể cập nhật tài xế đã bị xóa. Vui lòng khôi phục trước."*
* **Actual:** Hàm `findByIdAndUpdate` trong `drivers.controller.ts` không kiểm tra `isDeleted`, API trả về **HTTP 200 OK** và cập nhật thành công thông tin của tài xế đang nằm trong thùng rác, gây mâu thuẫn dữ liệu.
* **Severity:** Medium
* **Trạng thái:** Chưa sửa (Open - Lỗi nghiệp vụ backend)

---

### ID: BUG-009
* **Summary:** Endpoint chỉnh sửa lịch hẹn (`PATCH /api/appointments/edit`) không kiểm tra ngày hẹn trong quá khứ, cho phép cập nhật lịch hẹn thành một ngày đã qua.
* **Steps:**
  1. Tìm một lịch hẹn đang ở trạng thái `Pending` và lấy `id` của lịch hẹn đó.
  2. Gửi request `PATCH` tới `/api/appointments/edit` với payload trong đó `scheduledDate` là một ngày trong quá khứ (ví dụ: `"2020-01-01"`).
  3. Kiểm tra phản hồi của API.
* **Expected:** API phải trả về **HTTP 400 Bad Request** kèm thông báo: *"Ngày hẹn không được trong quá khứ."*, tương tự như validation đã có trong endpoint tạo mới (`POST /api/appointments/create`).
* **Actual:** API trả về **HTTP 200 OK** và cập nhật `scheduledDate` thành ngày quá khứ thành công, vi phạm tính nhất quán giữa endpoint tạo mới và chỉnh sửa lịch hẹn.
* **Severity:** Major
* **Trạng thái:** Chưa sửa (Open - Lỗi nghiệp vụ backend)

---

### ID: BUG-010
* **Summary:** API đặt lại mật khẩu (`POST /api/auth/reset-password`) không kiểm tra độ mạnh của mật khẩu mới, cho phép đặt mật khẩu quá ngắn hoặc dạng đơn giản như `"1"`.
* **Steps:**
  1. Thực hiện luồng quên mật khẩu để lấy OTP hợp lệ: gọi `POST /api/auth/forgot-password` với email tồn tại trong hệ thống.
  2. Lấy mã OTP từ hộp thư email.
  3. Gọi `POST /api/auth/reset-password` với payload `{ "email": "...", "otp": "...", "password": "1" }` (mật khẩu chỉ 1 ký tự).
  4. Kiểm tra phản hồi API.
* **Expected:** API phải trả về **HTTP 400 Bad Request** kèm thông báo lỗi: *"Mật khẩu phải có ít nhất 8 ký tự."* để đảm bảo chính sách bảo mật mật khẩu được áp dụng nhất quán.
* **Actual:** API chấp nhận mật khẩu `"1"` và trả về **HTTP 200 OK** thông báo *"Đặt lại mật khẩu thành công"*, cho phép người dùng đặt mật khẩu cực kỳ yếu, gây rủi ro bảo mật nghiêm trọng.
* **Severity:** Major
* **Trạng thái:** Chưa sửa (Open - Lỗi bảo mật backend)
