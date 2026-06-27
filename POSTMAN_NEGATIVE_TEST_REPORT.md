# BÁO CÁO KIỂM THỬ API - NEGATIVE CASES (POSTMAN)

Hệ thống **LogiPort** đã được triển khai cấu hình các trường hợp kiểm thử lỗi (Negative Testing) trên Postman và căn chỉnh mã lỗi HTTP Status Code ở phía Backend để đúng theo chuẩn RESTful API.

---

## 1. Môi trường kiểm thử (Testing Environment)
*   **Môi trường**: Local Development
*   **Backend Base URL**: `http://localhost:4000/api`
*   **Database**: MongoDB (Local)
*   **Cache / Session Store**: Redis (Local - Port 6379)

---

## 2. Danh sách Test Cases kiểm thử lỗi (Negative Test Cases)

Dưới đây là các kịch bản kiểm thử lỗi được thiết lập trong thư mục **`Negative Tests`** của Postman Collection:

| STT | Tên Test Case | Dữ liệu đầu vào (Input) | Kết quả mong đợi (Expected Output) | Kết quả thực tế (Actual Output) | Trạng thái |
|:---:|---|---|---|---|:---:|
| **1** | Thiếu trường bắt buộc (Missing Field) | **Body (Login)**: Xóa trường `password` lúc đăng nhập | Trả về thông báo lỗi, Status **400 Bad Request** | Trả về lỗi Joi "Mật khẩu là bắt buộc", Status **400** | **PASSED** |
| **2** | Sai định dạng dữ liệu (Wrong Type) | **Body (Login)**: Điền email sai định dạng (thiếu @...) | Trả về thông báo lỗi, Status **400 Bad Request** | Trả về lỗi Joi "Email không đúng định dạng", Status **400** | **PASSED** |
| **3** | Thiếu Token / Sai Token (Unauthorized) | **Headers (Get Yards)**: Gửi request với Cookie `tokenAdmin` không hợp lệ | Trả về Status **401 Unauthorized** | Trả về lỗi xác thực "Vui lòng đăng nhập", Status **401** | **PASSED** |
| **4** | Sai thông tin nghiệp vụ (Wrong Password) | **Body (Login)**: Nhập đúng định dạng nhưng sai mật khẩu | Trả về mã lỗi nghiệp vụ, Status **400 Bad Request** | Trả về lỗi "Tài khoản hoặc mật khẩu không chính xác", Status **400** | **PASSED** |

---

## 3. Các thay đổi và căn chỉnh mã lỗi ở Backend
Để Postman nhận đúng mã lỗi mong đợi theo tiêu chuẩn kiểm thử, các file nguồn Backend đã được điều chỉnh như sau:

1.  **Joi Validators (Lỗi 400)**:
    *   Cập nhật `auth.validator.ts`, `yard.validator.ts`, và `appointment.validator.ts` thiết lập `res.status(400).json(...)` thay vì mặc định `res.json(...)` khi Joi kiểm thử định dạng hoặc thiếu trường dữ liệu đầu vào thất bại.
2.  **Auth Middlewares (Lỗi 401)**:
    *   Cập nhật `auth.middleware.ts` (các hàm xác thực `requireAuth`, `requireAuthCompany`, `requireAuthProvider`) trả về mã lỗi `401 Unauthorized` thay vì `400` khi cookie phiên đăng nhập trống hoặc không hợp lệ.
3.  **Tự động kích hoạt khi đăng ký**:
    *   Cập nhật `auth.controller.ts` tự động gán `isActive: true` cho tài khoản Admin khi đăng ký qua API `POST /auth/register` để phục vụ test local dễ dàng.

---

## 4. Kết quả kiểm thử tự động (Test Runner)

*   **Bộ Unit Test & Integration Test (Backend)**: Đã chạy thành công 100% (**125/125** test cases pass xanh).
*   **Postman Collection Runner**: Toàn bộ **12/12 assertions** trong collection bao gồm Happy Path (Auth, Yards) và 4 kịch bản lỗi trong thư mục `Negative Tests` đều vượt qua kiểm thử thành công (Passed).

---
*Báo cáo được lập bởi: Lê Tự Minh Quang's Workspace*  
*Dự án: LogiPort - SWP391 - FPT University*
