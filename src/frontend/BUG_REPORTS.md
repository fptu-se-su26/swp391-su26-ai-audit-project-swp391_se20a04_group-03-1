# 🐛 DANH SÁCH BÁO CÁO LỖI (BUG REPORTS) — TUẦN 7

> **Môn học:** SWT301 — Kiểm thử phần mềm  
> **Dự án:** LogiPort Management System  
> **Mẫu báo cáo:** Chuẩn template slide SWT301 - FPT University  

---

### ID: BUG-001
* **Tiêu đề:** API tạo bãi đỗ (Yards) trả về HTTP status 200 OK thay vì 400 Bad Request khi thiếu trường `cameraIp`
* **Severity:** Major | **Priority:** P2 | **Module:** Quản lý bãi đỗ (Yards) / Backend Validator
* **Môi trường:** Windows 11, Node.js v18, Database MongoDB Local, API Client (Supertest / Postman)
* **Bước tái hiện:**
  1. Gửi request `POST` đến endpoint `/api/yards/create`.
  2. Gửi payload chỉ có `name` (ví dụ: `{"name": "Bãi đỗ thiếu IP"}`) và bỏ trống trường `cameraIp`.
  3. Kiểm tra mã trạng thái HTTP (Status Code) và phản hồi từ hệ thống.
* **Kết quả thực tế:** Hệ thống phản hồi mã trạng thái **HTTP 200 OK** mặc dù payload thất bại và trả về thông tin lỗi Joi validation.
* **Kết quả mong đợi:** Hệ thống phải phản hồi mã trạng thái **HTTP 400 Bad Request** vì dữ liệu đầu vào không hợp lệ (thiếu tham số bắt buộc).
* **Evidence:** `[API Response: POST /api/yards/create -> HTTP 200 OK, body: {"code":"error", "message":"cameraIp is required"}]`

---

### ID: BUG-002
* **Tiêu đề:** Lỗi assertion fail tại API đặt lịch hẹn (Appointments) khi khung giờ đặt chỗ đã đầy (Capacity đạt tối đa)
* **Severity:** Major | **Priority:** P2 | **Module:** Quản lý lịch hẹn / Backend Controller
* **Môi trường:** Windows 11, Jest & Supertest, Database MongoDB Test
* **Bước tái hiện:**
  1. Chạy test suite `appointment.api.test.ts` (test case `TC_INT_3`).
  2. Giả lập luồng đặt lịch hẹn liên tục vào cùng một khung giờ cho đến khi số lượng đặt lịch đạt giới hạn tối đa (max capacity).
  3. Tiếp tục gửi thêm một yêu cầu đặt lịch hẹn mới vào khung giờ đó.
* **Kết quả thực tế:** API trả về mã trạng thái **HTTP 400 Bad Request**, nhưng file test đang thiết lập kỳ vọng khẳng định (**assertion**) trả về **HTTP 200 OK**, dẫn đến test suite bị crash (Fail).
* **Kết quả mong đợi:** Test suite cần cập nhật assertion kỳ vọng mã trả về đúng là **HTTP 400 Bad Request** khi hết lượt đặt chỗ để phản ánh đúng logic nghiệp vụ của backend.
* **Evidence:** `[Jest Failure log: expected 200, received 400 in appointment.api.test.ts]`

---

### ID: BUG-003
* **Tiêu đề:** Lỗi crash kiểm thử Frontend Login do thiếu định nghĩa hàm Page Object `getPasswordLengthValidationError` trong `LoginPage.ts`
* **Severity:** Critical | **Priority:** P1 | **Module:** Authentication / Frontend E2E Page Object
* **Môi trường:** Windows 11, Chromium 125, Playwright runner, http://localhost:3000/admin/login
* **Bước tái hiện:**
  1. Khởi chạy test suite frontend bằng lệnh: `npx playwright test tests/login.spec.ts`.
  2. Chạy đến test case kiểm thử độ dài mật khẩu: *"Hiển thị lỗi validate khi nhập mật khẩu quá ngắn"*.
* **Kết quả thực tế:** Test suite bị dừng đột ngột và báo lỗi `TypeError: loginPage.getPasswordLengthValidationError is not a function`.
* **Kết quả mong đợi:** Lớp Page Object `LoginPage.ts` phải chứa đầy đủ khai báo các thành phần UI (Locators) và phương thức hỗ trợ để test suite có thể tương tác bình thường và PASS.
* **Evidence:** `[Playwright Error Log: TypeError: loginPage.getPasswordLengthValidationError is not a function]`
