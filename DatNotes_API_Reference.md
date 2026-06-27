# 📚 DATNOTES API REFERENCE

**Version:** 1.0.0  
**Base URL:** `https://api.datnotes.click/api`  
**Description:** Tài liệu API chính thức cho hệ thống Quản lý Bãi đỗ xe và Container tự động (Tích hợp AI).

---

## 🔐 1. XÁC THỰC (AUTHENTICATION)
Toàn bộ các API (trừ Đăng nhập/Đăng ký) đều yêu cầu xác thực bằng **JSON Web Token (JWT)**.
Bạn phải truyền token này vào Header của mỗi HTTP Request.

**Cấu trúc Header:**
```http
Authorization: Bearer <YOUR_ACCESS_TOKEN>
Content-Type: application/json
```

**Mã lỗi xác thực thường gặp:**
- `401 Unauthorized`: Token bị thiếu, sai hoặc đã hết hạn.
- `403 Forbidden`: Tài khoản của bạn không có quyền truy cập chức năng này (VD: Client không được gọi API của Admin).

---

## 📦 2. CHUẨN ĐỊNH DẠNG TRẢ VỀ (RESPONSE FORMAT)
Tất cả các API đều tuân thủ cấu trúc RESTful và trả về định dạng JSON chung:

**Thành công (200 OK):**
```json
{
  "code": "success",
  "data": { ... }, // Dữ liệu trả về (Object hoặc Array)
  "message": "Thao tác thành công", // Tùy chọn
  "pagination": { // Chỉ có ở các API lấy danh sách
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 48,
    "limit": 10
  }
}
```

**Thất bại (400 Bad Request / 500 Internal Error):**
```json
{
  "code": "error",
  "message": "Lỗi: Không tìm thấy tài liệu yêu cầu."
}
```

---

## 🚀 3. TÀI LIỆU CÁC MODULE CHÍNH (CORE APIS)

### 3.1. Module Xác thực (Auth)
Module cung cấp quyền truy cập hệ thống cho Quản trị viên (Admin) và Khách hàng (Client).

#### 🟢 Đăng nhập
`POST /auth/login`
- **Mô tả:** Cấp phát Token để truy cập hệ thống.
- **Request Body:**
  ```json
  {
    "email": "admin@datnotes.com",
    "password": "yourpassword123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "code": "success",
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "60d5ecb8b392...",
      "fullName": "System Admin",
      "email": "admin@datnotes.com",
      "role": "admin"
    }
  }
  ```

#### 🟢 Đổi mật khẩu
`POST /auth/reset-password`
- **Mô tả:** Đặt lại mật khẩu dựa trên mã xác nhận gửi qua email.
- **Request Body:**
  ```json
  {
    "email": "admin@datnotes.com",
    "otp": "123456",
    "newPassword": "newpassword123"
  }
  ```

---

### 3.2. Module Lịch Hẹn (Appointments)
Quản lý các lịch trình check-in/check-out của tài xế vào bãi container.

#### 🟢 Lấy danh sách lịch hẹn
`GET /appointments`
- **Mô tả:** Lấy danh sách lịch hẹn (Có hỗ trợ lọc và phân trang).
- **Query Parameters:**
  - `page` (int): Trang hiện tại (Mặc định: 1)
  - `limit` (int): Số lượng trên 1 trang (Mặc định: 10)
  - `search` (string): Tìm kiếm theo biển số xe hoặc mã container.
  - `status` (string): Trạng thái (pending, approved, completed, cancelled).
- **Response (200 OK):** Trả về mảng các `Appointment Object` kèm `pagination`.

#### 🟢 Tạo lịch hẹn mới
`POST /appointments/create`
- **Mô tả:** Khách hàng (Company) tạo lịch điều xe đến lấy/trả container.
- **Request Body:**
  ```json
  {
    "truckId": "65b1c23...", 
    "driverId": "65b1c45...",
    "containerId": "65b1c67...",
    "yardId": "65b1c89...",
    "purpose": "Lấy container",
    "expectedTime": "2024-10-24T08:00:00Z"
  }
  ```

#### 🟢 Cập nhật trạng thái
`PATCH /appointments/edit/:id`
- **Mô tả:** Admin hoặc Cổng AI duyệt/chỉnh sửa lịch hẹn.
- **Path Params:** `id` - ID của lịch hẹn.
- **Request Body:**
  ```json
  {
    "status": "approved",
    "note": "Đã kiểm tra hợp lệ"
  }
  ```

---

### 3.3. Module Bãi & Cổng AI (Yards & Gates)
Quản lý khu vực bãi đỗ và cấu hình AI Camera nhận diện tại cổng.

#### 🟢 Xem danh sách Bãi
`GET /yards`
- **Mô tả:** Lấy thông tin các bãi đỗ hiện có trên hệ thống.

#### 🟢 Tạo Cổng (Gate) tích hợp Camera AI
`POST /gates/create`
- **Mô tả:** Thêm cổng mới và cấu hình địa chỉ IP Camera.
- **Request Body:**
  ```json
  {
    "gateName": "Cổng Bắc - Làn 1",
    "yardId": "65b1c89...",
    "cameraIp": "rtsp://admin:123456@192.168.1.10:554/stream",
    "isActive": true
  }
  ```

---

### 3.4. Module Nhận diện AI (Scan)
API kết nối trực tiếp với thiết bị Raspberry Pi 5 / AI Server.

#### 🟢 Gửi tín hiệu AI nhận diện (Webhook)
`POST /scan/detect`
- **Mô tả:** Gắn vào Code Python để bắn kết quả nhận diện biển số về Backend. Backend sẽ kiểm tra chéo với Lịch hẹn (Appointment) để quyết định mở cổng.
- **Request Body:**
  ```json
  {
    "gateId": "65b1c...",
    "licensePlate": "51C-12345",
    "containerCode": "MSKU1234567",
    "confidence": 0.98,
    "timestamp": "2024-10-24T08:05:22Z"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "code": "success",
    "action": "OPEN_GATE",
    "message": "Biển số hợp lệ, ra lệnh mở cổng Servo."
  }
  ```

---

## 🧩 4. BẢNG MÃ TRẠNG THÁI (STATUS CODES SUMMARY)

| HTTP Status | Message | Giải thích |
|-------------|---------|------------|
| **200** | OK | Request thành công và trả về dữ liệu. |
| **201** | Created | Đã tạo thành công một bản ghi mới (VD: Tạo lịch hẹn). |
| **400** | Bad Request | Dữ liệu bạn gửi lên bị thiếu hoặc sai định dạng. |
| **401** | Unauthorized | Bạn chưa đăng nhập (Thiếu Token). |
| **403** | Forbidden | Bạn không có quyền thực hiện hành động này. |
| **404** | Not Found | Không tìm thấy đường dẫn API hoặc không tìm thấy ID bản ghi. |
| **500** | Server Error | Lỗi phát sinh từ phía Server (Database sập, crash code). |

---
*Tài liệu này trình bày kiến trúc cốt lõi của hệ thống. Bạn có thể áp dụng nguyên tắc Request/Response Body tương tự cho các thực thể còn lại như: `drivers`, `trucks`, `containers`, `companies`...*


---

## 6. DANH SÁCH CHI TIẾT TẤT CẢ ENDPOINTS

Dưới đây là danh sách được trích xuất tự động từ mã nguồn Backend. Lưu ý thay thế {{baseUrl}} bằng `https://api.datnotes.click` khi cấu hình trong Postman.

### Module: /api/appointments
| Method | Endpoint |
|---|---|
| **POST** | `/api/appointments/create` |
| **GET** | `/api/appointments` |
| **GET** | `/api/appointments/detail/:id` |
| **PATCH** | `/api/appointments/edit` |
| **PATCH** | `/api/appointments/status/:id` |
| **PATCH** | `/api/appointments/delete/:id` |
| **GET** | `/api/appointments/trash` |
| **PATCH** | `/api/appointments/restore/:id` |
| **DELETE** | `/api/appointments/hard-delete/:id` |

### Module: /api/auth
| Method | Endpoint |
|---|---|
| **POST** | `/api/auth/register` |
| **POST** | `/api/auth/login` |
| **GET** | `/api/auth/client-roles` |
| **GET** | `/api/auth/logout` |
| **POST** | `/api/auth/forgot-password` |
| **POST** | `/api/auth/reset-password` |

### Module: /api/companies
| Method | Endpoint |
|---|---|
| **GET** | `/api/companies` |
| **GET** | `/api/companies/detail/:id` |
| **GET** | `/api/companies/trash` |
| **PATCH** | `/api/companies/restore/:id` |
| **DELETE** | `/api/companies/hard-delete/:id` |
| **POST** | `/api/companies/create` |
| **PATCH** | `/api/companies/edit` |
| **PATCH** | `/api/companies/status/:id` |
| **PATCH** | `/api/companies/delete/:id` |

### Module: /api/container-providers
| Method | Endpoint |
|---|---|
| **GET** | `/api/container-providers` |
| **GET** | `/api/container-providers/detail/:id` |
| **GET** | `/api/container-providers/trash` |
| **PATCH** | `/api/container-providers/restore/:id` |
| **DELETE** | `/api/container-providers/hard-delete/:id` |
| **POST** | `/api/container-providers/create` |
| **PATCH** | `/api/container-providers/edit` |
| **PATCH** | `/api/container-providers/status/:id` |
| **PATCH** | `/api/container-providers/delete/:id` |

### Module: /api/containers
| Method | Endpoint |
|---|---|
| **GET** | `/api/containers` |
| **GET** | `/api/containers/detail/:id` |
| **POST** | `/api/containers/create` |
| **PATCH** | `/api/containers/update` |
| **PATCH** | `/api/containers/soft-delete/:id` |
| **GET** | `/api/containers/trash` |
| **PATCH** | `/api/containers/restore/:id` |
| **DELETE** | `/api/containers/hard-delete/:id` |

### Module: /api/drivers
| Method | Endpoint |
|---|---|
| **GET** | `/api/drivers` |
| **POST** | `/api/drivers` |
| **GET** | `/api/drivers/trash/list` |
| **GET** | `/api/drivers/:id` |
| **PATCH** | `/api/drivers/:id` |
| **DELETE** | `/api/drivers/:id` |
| **PATCH** | `/api/drivers/:id/restore` |
| **DELETE** | `/api/drivers/:id/force` |

### Module: /api/gates
| Method | Endpoint |
|---|---|
| **GET** | `/api/gates` |
| **POST** | `/api/gates/create` |
| **GET** | `/api/gates/:id` |
| **PATCH** | `/api/gates/:id/info` |
| **DELETE** | `/api/gates/:id` |
| **GET** | `/api/gates/trash/list` |
| **PATCH** | `/api/gates/:id/restore` |
| **DELETE** | `/api/gates/:id/force` |

### Module: /api/scan
| Method | Endpoint |
|---|---|
| **POST** | `/api/scan` |
| **GET** | `/api/scan/logs` |
| **GET** | `/api/scan/logs/paginated` |
| **GET** | `/api/scan/logs/trash/list` |
| **GET** | `/api/scan/logs/:id` |
| **DELETE** | `/api/scan/logs/:id` |
| **DELETE** | `/api/scan/logs/:id/force` |
| **PATCH** | `/api/scan/logs/:id/restore` |
| **PATCH** | `/api/scan/logs/:id/checkout` |

### Module: /api/settings
| Method | Endpoint |
|---|---|
| **GET** | `/api/settings/admins` |
| **POST** | `/api/settings/admins` |
| **PATCH** | `/api/settings/admins/:id` |
| **PATCH** | `/api/settings/admins/:id/status` |
| **PATCH** | `/api/settings/admins/:id/delete` |
| **GET** | `/api/settings/admins/trash` |
| **PATCH** | `/api/settings/admins/:id/restore` |
| **DELETE** | `/api/settings/admins/:id/force` |
| **GET** | `/api/settings/client-roles` |
| **POST** | `/api/settings/client-roles` |
| **PATCH** | `/api/settings/client-roles/:id` |
| **PATCH** | `/api/settings/client-roles/:id/status` |
| **PATCH** | `/api/settings/client-roles/:id/delete` |
| **GET** | `/api/settings/client-roles/trash` |
| **PATCH** | `/api/settings/client-roles/:id/restore` |
| **DELETE** | `/api/settings/client-roles/:id/hard-delete` |

### Module: /api/yards
| Method | Endpoint |
|---|---|
| **GET** | `/api/yards` |
| **POST** | `/api/yards/create` |
| **GET** | `/api/yards/:id` |
| **PATCH** | `/api/yards/:id/slots` |
| **PATCH** | `/api/yards/:id/info` |
| **POST** | `/api/yards/:id/snapshot` |
| **DELETE** | `/api/yards/:id` |
| **POST** | `/api/yards/:id/sync-status` |
| **GET** | `/api/yards/trash/list` |
| **PATCH** | `/api/yards/:id/restore` |
| **DELETE** | `/api/yards/:id/force` |

### Module: /api/client/appointments
| Method | Endpoint |
|---|---|
| **POST** | `/api/client/appointments/create` |
| **GET** | `/api/client/appointments` |
| **GET** | `/api/client/appointments/detail/:id` |
| **PATCH** | `/api/client/appointments/edit` |
| **PATCH** | `/api/client/appointments/status/:id` |
| **PATCH** | `/api/client/appointments/delete/:id` |
| **GET** | `/api/client/appointments/trash` |
| **PATCH** | `/api/client/appointments/restore/:id` |
| **DELETE** | `/api/client/appointments/hard-delete/:id` |

### Module: /api/client/auth
| Method | Endpoint |
|---|---|
| **POST** | `/api/client/auth/register` |
| **POST** | `/api/client/auth/login` |
| **GET** | `/api/client/auth/logout` |
| **POST** | `/api/client/auth/password/forgot` |
| **POST** | `/api/client/auth/password/otp` |
| **POST** | `/api/client/auth/password/reset` |

### Module: /api/client/drivers
| Method | Endpoint |
|---|---|
| **GET** | `/api/client/drivers` |
| **POST** | `/api/client/drivers` |
| **GET** | `/api/client/drivers/trash/list` |
| **GET** | `/api/client/drivers/:id` |
| **PATCH** | `/api/client/drivers/:id` |
| **DELETE** | `/api/client/drivers/:id` |
| **PATCH** | `/api/client/drivers/:id/restore` |
| **DELETE** | `/api/client/drivers/:id/force` |

### Module: /api/client/trucks
| Method | Endpoint |
|---|---|
| **GET** | `/api/client/trucks` |
| **POST** | `/api/client/trucks` |
| **GET** | `/api/client/trucks/trash/list` |
| **GET** | `/api/client/trucks/:id` |
| **PATCH** | `/api/client/trucks/:id` |
| **DELETE** | `/api/client/trucks/:id` |
| **PATCH** | `/api/client/trucks/:id/restore` |
| **DELETE** | `/api/client/trucks/:id/force` |