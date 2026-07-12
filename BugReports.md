# Bug Reports — LogiPort System

Tài liệu này ghi nhận danh sách các lỗi bảo mật phân quyền, kiểm tra tính hợp lệ dữ liệu đầu vào (input validation) và logic nghiệp vụ (business logic) được phát hiện thông qua quá trình **Exploratory Testing** trên hệ thống LogiPort.

---

### 1. BUG-001: Lỗi tạo lịch hẹn (Create Appointment) không kiểm tra sự tồn tại của Tài xế (Driver) trong hệ thống
* **Summary:** Endpoint tạo lịch hẹn (`POST /api/appointments/create`) nhận tham số `driverId` từ client nhưng lưu trực tiếp vào cơ sở dữ liệu mà không kiểm tra xem `driverId` này có trỏ tới một bản ghi tài xế hợp lệ nào trong bảng `drivers` hay không. Điều này cho phép tạo các lịch hẹn mồ côi (orphan records) liên kết với tài xế ảo.
* **Steps to Reproduce:**
  1. Gửi một yêu cầu `POST` tới địa chỉ `/api/appointments/create`.
  2. Truyền payload hợp lệ chứa thông tin đăng ký lịch hẹn, ngoại trừ trường `driverId` điền một mã ID ngẫu nhiên không tồn tại trong hệ thống (ví dụ: `60c72b2f9b1d8e1f5c8f8b89`).
  3. Kiểm tra kết quả phản hồi của API và đối chiếu bản ghi trong MongoDB.
* **Expected Result:** API phải từ chối tạo lịch hẹn và trả về mã trạng thái **HTTP 400 Bad Request** kèm thông báo lỗi: *"Tài xế không tồn tại trong hệ thống."*
* **Actual Result:** API trả về mã trạng thái **HTTP 201 Created** kèm thông báo *"Tạo lịch hẹn thành công"* và bản ghi ảo được lưu vào cơ sở dữ liệu.
* **Severity:** Major

---

### 2. BUG-002: Lỗi API lấy chi tiết bãi đỗ (Yard Detail API) vẫn trả về dữ liệu bãi đỗ đã bị xóa mềm (isDeleted = true)
* **Summary:** Endpoint lấy thông tin chi tiết bãi đỗ (`GET /api/yards/:id`) sử dụng hàm truy vấn `Yard.findById` mà không kiểm tra cờ xóa mềm `isDeleted`. Điều này làm phá vỡ logic nghiệp vụ ẩn các thực thể đã xóa của hệ thống.
* **Steps to Reproduce:**
  1. Thực hiện xóa mềm một bãi đỗ bằng cách gửi request `DELETE` tới `/api/yards/:yardId`. (Trạng thái bãi đỗ chuyển thành `isDeleted: true`).
  2. Gửi request `GET` tới `/api/yards/:yardId` để lấy thông tin chi tiết của bãi đỗ vừa xóa đó.
  3. Xem dữ liệu trả về từ API.
* **Expected Result:** API phải trả về mã trạng thái **HTTP 400 Bad Request** hoặc **HTTP 404 Not Found** kèm thông điệp lỗi: *"Không tìm thấy bãi đỗ"* vì bãi đỗ này đã bị xóa khỏi hệ thống.
* **Actual Result:** API trả về mã trạng thái **HTTP 200 OK** kèm theo đầy đủ thông tin chi tiết bãi đỗ đã xóa.
* **Severity:** Medium

---

### 3. BUG-003: Lỗi API cập nhật cấu hình bãi đỗ (Update Yard Slots) cho phép chỉnh sửa thực thể đã bị xóa mềm
* **Summary:** Endpoint cập nhật cấu hình vị trí slots của bãi đỗ (`PATCH /api/yards/:id/slots`) cho phép người dùng thay đổi danh sách slots của một bãi đỗ đã bị đánh dấu xóa mềm (`isDeleted: true`).
* **Steps to Reproduce:**
  1. Lấy ID của một bãi đỗ đã bị xóa mềm (`isDeleted: true`).
  2. Gửi request `PATCH` tới endpoint `/api/yards/:yardId/slots` kèm theo danh sách slots mới trong body.
  3. Kiểm tra phản hồi từ server và kiểm tra lại tài liệu trong MongoDB.
* **Expected Result:** API phải chặn chỉnh sửa và trả về mã lỗi **HTTP 400 Bad Request** với thông điệp: *"Không thể cấu hình bãi đỗ đã bị xóa"*.
* **Actual Result:** API phản hồi mã trạng thái **HTTP 200 OK** với thông báo *"Cập nhật cấu hình bãi đỗ thành công"* và danh sách slots mới vẫn được ghi đè vào database của bãi đỗ đã bị xóa.
* **Severity:** Medium
