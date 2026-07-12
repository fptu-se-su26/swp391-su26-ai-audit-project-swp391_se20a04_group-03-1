# 🐛 BUG REPORTS — WEEK 7 (ISSUE 7)

Tài liệu báo cáo lỗi kiểm thử tự do (Exploratory Testing) trên hệ thống LogiPort theo đúng yêu cầu của Week 7.

---

### ID: BUG-001
* **Summary:** Endpoint tạo lịch hẹn (`POST /api/appointments/create`) lưu trực tiếp `driverId` mà không xác thực sự tồn tại của tài xế trong cơ sở dữ liệu.
* **Steps:**
  1. Gửi request `POST` tới `/api/appointments/create`.
  2. Truyền payload đăng ký lịch hẹn đầy đủ, ngoại trừ trường `driverId` sử dụng một chuỗi ID ngẫu nhiên không tồn tại (ví dụ: `60c72b2f9b1d8e1f5c8f8b89`).
  3. Kiểm tra phản hồi của API và kiểm tra database.
* **Expected:** API phải chặn tạo lịch hẹn và trả về mã trạng thái **HTTP 400 Bad Request** kèm thông điệp lỗi: *"Tài xế không tồn tại trong hệ thống."*
* **Actual:** API trả về mã trạng thái **HTTP 201 Created**, ghi nhận lịch hẹn thành công với tài xế không tồn tại (lỗi dữ liệu mồ côi).
* **Severity:** Major

---

### ID: BUG-002
* **Tiêu đề / Summary:** API lấy chi tiết bãi đỗ (`GET /api/yards/:id`) vẫn trả về dữ liệu của bãi đỗ đã bị xóa mềm (`isDeleted = true`).
* **Steps:**
  1. Thực hiện xóa mềm một bãi đỗ bằng cách gửi request `DELETE` tới `/api/yards/:yardId`.
  2. Gửi request `GET` tới `/api/yards/:yardId` để lấy thông tin chi tiết của bãi đỗ vừa xóa đó.
  3. Xem phản hồi trả về từ hệ thống.
* **Expected:** API phải chặn truy cập và trả về mã trạng thái **HTTP 400 Bad Request** hoặc **HTTP 404 Not Found** kèm thông điệp: *"Không tìm thấy bãi đỗ"*.
* **Actual:** API trả về mã trạng thái **HTTP 200 OK** kèm theo đầy đủ chi tiết thông tin của bãi đỗ đã xóa mềm.
* **Severity:** Medium

---

### ID: BUG-003
* **Tiêu đề / Summary:** API cập nhật cấu hình bãi đỗ (`PATCH /api/yards/:id/slots`) cho phép sửa đổi cấu hình slots của bãi đỗ đã bị xóa mềm (`isDeleted = true`).
* **Steps:**
  1. Lấy ID của một bãi đỗ đã bị xóa mềm (`isDeleted: true`).
  2. Gửi request `PATCH` tới `/api/yards/:yardId/slots` kèm theo cấu hình slots mới trong body.
  3. Kiểm tra kết quả phản hồi và bản ghi trong database.
* **Expected:** API phải trả về mã trạng thái **HTTP 400 Bad Request** báo lỗi: *"Không thể cấu hình bãi đỗ đã bị xóa"*.
* **Actual:** API phản hồi mã trạng thái **HTTP 200 OK** thông báo *"Cập nhật cấu hình bãi đỗ thành công"* và thay đổi cấu hình slots của bãi đỗ đã bị xóa bình thường.
* **Severity:** Medium
