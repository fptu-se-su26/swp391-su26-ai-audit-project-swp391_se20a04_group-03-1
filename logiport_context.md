# LOGIPORT - PROJECT CONTEXT FOR TESTING

Tài liệu này cung cấp các thông tin nền tảng về hệ thống Logiport phục vụ cho QA và Automation Testing.

## 1. Tech Stack Overview
- **Frontend Framework**: Next.js (16.2.6), React 19, TypeScript
- **Styling & UI**: TailwindCSS 4, Radix UI, Shadcn, Framer Motion
- **State & Data Management**: Zustand (Global State), React-Query (Data Fetching)
- **Form & Validation**: React-Hook-Form, Zod, just-validate
- **Backend Framework**: Node.js, Express 5.2.1
- **Database**: MongoDB (Mongoose 9), Redis
- **Authentication**: JWT (JSON Web Token), bcryptjs
- **Real-time**: Socket.io (Client & Server)

## 2. Môi trường (Environments)
Hệ thống hiện tại được thiết lập để chạy trên các domain và port sau:

- **Môi trường Development (Local)**:
  - Frontend Base URL: `http://localhost:3000`
  - Backend API Base URL: `http://localhost:4000/api`

> **Lưu ý E2E Script**: Các file Automation (Cypress / Playwright) nên cấu hình `baseUrl` trỏ về biến môi trường (ví dụ: `CYPRESS_BASE_URL` hoặc `PLAYWRIGHT_TEST_BASE_URL`) tương ứng để chạy test thuận tiện.

---

## 3. Danh sách API (Dành cho Tuần 5 - Postman)

Dưới đây là một số API cốt lõi trong hệ thống, bao gồm Auth và quản lý Bãi đỗ (Yards), phù hợp để đưa vào Collection kiểm thử của Postman.

### Bảng tóm tắt Endpoint

| Endpoint | Method | Chức năng | Role cần thiết |
| --- | --- | --- | --- |
| `/auth/login` | `POST` | Đăng nhập Admin / Company | Public |
| `/auth/register` | `POST` | Đăng ký tài khoản Admin | Public |
| `/auth/logout` | `GET` | Đăng xuất (xóa Cookie/Session) | Public |
| `/auth/client-roles`| `GET` | Lấy danh sách loại doanh nghiệp | Public |
| `/yards` | `GET` | Lấy danh sách bãi đỗ | Auth Required |
| `/yards/create` | `POST` | Tạo bãi đỗ mới | Auth Required |
| `/yards/:id` | `GET` | Lấy thông tin chi tiết 1 bãi đỗ | Public (cho AI Python) |

### Payload mẫu cho các API quan trọng

**1. Auth - Login (`POST /api/auth/login`)**
- **Request Body:**
```json
{
  "email": "admin@logiport.com",
  "password": "password123"
}
```
- **Response Body (Success):**
*(Lưu ý: JWT Token `tokenAdmin` được trả về qua Header `Set-Cookie`)*
```json
{
  "code": "success",
  "message": "Đăng nhập thành công!"
}
```
- **Response Body (Error - Sai MK):**
```json
{
  "code": "error",
  "message": "Tài khoản hoặc mật khẩu không chính xác"
}
```

**2. Yards - Create Yard (`POST /api/yards/create`)**
- **Request Body:**
```json
{
  "name": "Bãi đỗ Khu A",
  "cameraIp": "rtsp://192.168.1.100/stream"
}
```
- **Response Body (Success):**
```json
{
  "code": "success",
  "message": "Tạo bãi đỗ thành công",
  "data": {
    "_id": "60d5ecb8b392a400155b4e9f",
    "name": "Bãi đỗ Khu A",
    "cameraIp": "rtsp://192.168.1.100/stream",
    "slots": [],
    "isDeleted": false,
    "createdAt": "2024-03-10T10:00:00.000Z"
  }
}
```

---

## 4. Core User Flows (Dành cho Tuần 6 - E2E Testing)

Dưới đây là 3 luồng nghiệp vụ chính đại diện cho các chức năng nền tảng trong Logiport, kèm theo gợi ý CSS/DOM selectors để hỗ trợ cho việc viết Automation Script.

### Flow 1: Đăng nhập Hệ thống (Admin / Company)
Luồng này kiểm tra việc người dùng đăng nhập bằng thông tin hợp lệ và được điều hướng thành công vào Dashboard.

- **Các bước:**
  1. Truy cập trang `/admin/login`.
  2. Nhập Email và Password hợp lệ.
  3. Click nút "Đăng nhập".
  4. Xác nhận hệ thống chuyển hướng sang `/admin/dashboard` và hiển thị lời chào.
- **DOM Selectors gợi ý:**
  - Email Input: `input[name="email"]` hoặc `input[type="email"]`
  - Password Input: `input[name="password"]` hoặc `input[type="password"]`
  - Submit Button: `button[type="submit"]`
  - Báo lỗi (nếu sai MK): `div[role="alert"]` hoặc element chứa text "không chính xác".

### Flow 2: Quản lý Bãi đỗ - Thêm mới dữ liệu (Admin)
Luồng thao tác thêm mới một cấu hình bãi đỗ trong phân hệ Admin.

- **Các bước:**
  1. Từ trang Dashboard, điều hướng vào menu quản lý bãi đỗ (`/admin/yard`).
  2. Bấm nút "Thêm mới" hoặc mở form tạo bãi đỗ.
  3. Điền Tên bãi đỗ và URL IP Camera.
  4. Submit form và xác minh thông báo "Tạo bãi đỗ thành công".
  5. Xác minh bãi đỗ mới xuất hiện trên danh sách/table.
- **DOM Selectors gợi ý:**
  - Nút thêm mới: `button.btn-create-yard` hoặc button có chứa chữ "Thêm bãi đỗ"
  - Yard Name Input: `input[name="name"]`
  - Camera IP Input: `input[name="cameraIp"]`
  - Form Submit: `button[type="submit"]`
  - Bảng danh sách: `table.yards-table` hoặc `.grid` chứa danh sách card.

### Flow 3: Quản lý Lịch hẹn - Xem & Thêm mới (Client/Company)
Luồng kiểm tra khả năng thao tác với tính năng đặt lịch hẹn (Appointments) cho các xe vận tải.

- **Các bước:**
  1. Truy cập phân hệ `/admin/appointments` (hoặc Client App).
  2. Xem danh sách lịch hẹn hiển thị dữ liệu chính xác.
  3. Chọn "Tạo lịch hẹn", điền thông tin (Biển số xe, Tên tài xế, Khung giờ).
  4. Submit và kiểm tra lịch hẹn được thêm vào hệ thống trạng thái "Pending" (Chờ duyệt).
- **DOM Selectors gợi ý:**
  - Appointment Date Input: `input[name="appointmentDate"]` hoặc `[data-testid="date-picker"]`
  - Truck/Driver Select: `select[name="truckId"]`, `select[name="driverId"]`
  - Status Badge: `.badge-status-pending` hoặc element chứa text "Pending".
