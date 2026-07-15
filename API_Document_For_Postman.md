# TÀI LIỆU HƯỚNG DẪN TEST API QUA POSTMAN

Hệ thống Backend của bạn đã được deploy thành công và trỏ về tên miền chính thức:
👉 **Base URL:** `https://api.datnotes.click/api`

Vì dự án có tới hơn **400+ endpoints** được tôi thiết kế rất chi tiết trải dài qua các modules khác nhau (Admin, Client, Auth, Appointments, v.v.), việc liệt kê từng API một trong tài liệu này là quá dài. Thay vào đó, tài liệu này sẽ hướng dẫn bạn **Cấu trúc chuẩn** của các API và **Cách thiết lập Postman** để bạn (hoặc giáo viên) có thể test bất kỳ module nào một cách chuyên nghiệp nhất.

---

## 1. HƯỚNG DẪN THIẾT LẬP POSTMAN (Môi trường)

Đừng gõ tay từng đường link vào Postman! Hãy dùng **Environment Variables** để tự động hoá:

1. Mở Postman, ở góc trên bên phải bấm vào **Environments** (Biểu tượng con mắt) -> **Add**.
2. Đặt tên môi trường: `DatNotes Production`
3. Thêm 2 biến sau:
   - `baseUrl` : `https://api.datnotes.click/api`
   - `token` : *(Để trống, sẽ tự động điền sau khi login)*
4. Đánh dấu tích (Select) môi trường vừa tạo để sử dụng.

Từ giờ, trên thanh URL của Postman, thay vì gõ `https://api.datnotes.click/api/auth/login`, bạn chỉ cần gõ `{{baseUrl}}/auth/login`.

---

## 2. QUY TRÌNH TEST VÀ CHỨNG THỰC (AUTHENTICATION)

Hầu hết các API của dự án đều yêu cầu đăng nhập. Hệ thống sử dụng **JWT Token** truyền qua Header hoặc Cookies.

### Bước 1: Gọi API Login (VD: Admin)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/auth/login`
- **Body (JSON):**
```json
{
  "email": "admin@example.com",
  "password": "yourpassword"
}
```
- **Kết quả trả về:** Bạn sẽ nhận được `code: 200` và chuỗi `token` cùng thông tin user.

### Bước 2: Tự động hoá Token cho các API khác
Sau khi lấy được chuỗi token (VD: `eyJhbGci...`), với các API cần quyền (như tạo lịch hẹn, xem tài xế), bạn hãy vào mục **Authorization** trong Postman:
- Type: `Bearer Token`
- Token: Nhập chuỗi token vừa copy (hoặc điền `{{token}}` nếu bạn biết dùng biến).

---

## 3. CẤU TRÚC (PATTERN) CỦA CÁC MODULE API

Hệ thống được thiết kế theo chuẩn RESTful. Tức là mọi module (`appointments`, `yards`, `companies`, `gates`, `drivers`, `containers`, `trucks`) đều tuân theo chung một cấu trúc CRUD (Thêm, Sửa, Xoá, Đọc).

**Dưới đây là ví dụ chuẩn áp dụng cho BẤT KỲ module nào (Tôi lấy ví dụ module `appointments` - Lịch hẹn):**

### 1. Lấy danh sách (GET ALL / SEARCH / PAGINATION)
- **Method:** `GET`
- **URL:** `{{baseUrl}}/appointments?page=1&limit=10&search=keyword&status=active`
- **Tác dụng:** Lấy danh sách lịch hẹn, có phân trang, tìm kiếm và lọc trạng thái.

### 2. Xem chi tiết một bản ghi (GET ONE)
- **Method:** `GET`
- **URL:** `{{baseUrl}}/appointments/:id` (Thay `:id` bằng ID của bản ghi).
- **Tác dụng:** Lấy toàn bộ thông tin chi tiết của 1 lịch hẹn.

### 3. Tạo mới (CREATE)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/appointments/create`
- **Body:** JSON chứa thông tin lịch hẹn mới.

### 4. Cập nhật (UPDATE)
- **Method:** `PATCH` (hoặc `PUT`)
- **URL:** `{{baseUrl}}/appointments/edit/:id`
- **Body:** JSON chứa các thông tin cần sửa.

### 5. Xoá (DELETE)
- **Method:** `PATCH` hoặc `DELETE`
- **URL:** `{{baseUrl}}/appointments/delete/:id`
- **Tác dụng:** Chuyển trạng thái bản ghi thành `isDeleted: true` (Xoá mềm).

---

## 4. DANH SÁCH CÁC MODULE ĐỊNH TUYẾN CHÍNH (ROUTERS)

Bạn có thể thay từ khoá `appointments` ở trên bằng bất kỳ từ khoá nào dưới đây để test tương ứng:

1. **`{{baseUrl}}/auth`** - Quản lý đăng nhập, cấp lại mật khẩu cho Admin.
2. **`{{baseUrl}}/client/auth`** - Quản lý đăng nhập, cấp lại mật khẩu cho Khách hàng (Company/Provider).
3. **`{{baseUrl}}/yards`** - Quản lý Bãi đỗ xe/Khu vực.
4. **`{{baseUrl}}/companies`** - Quản lý các công ty vận tải.
5. **`{{baseUrl}}/container-providers`** - Quản lý các hãng sở hữu container.
6. **`{{baseUrl}}/gates`** - Quản lý các Cổng và Camera (RTSP).
7. **`{{baseUrl}}/drivers`** - Quản lý Tài xế.
8. **`{{baseUrl}}/trucks`** - Quản lý Đầu kéo xe tải.
9. **`{{baseUrl}}/containers`** - Quản lý Thùng container.
10. **`{{baseUrl}}/scan`** - API nội bộ dành cho AI Camera (Pi 5) để quét biển số tự động.
11. **`{{baseUrl}}/settings`** - Cấu hình hệ thống chung.

---

## 5. ĐỊNH DẠNG TRẢ VỀ (RESPONSE FORMAT)

Như tôi đã nâng cấp hệ thống ở bản cập nhật trước, toàn bộ API của bạn giờ đây đã trả về chuẩn HTTP Status Code. Giáo viên của bạn sẽ thấy cấu trúc trả về chuyên nghiệp như sau:

**✅ Khi thành công (Status: 200 OK):**
```json
{
  "code": "success",
  "data": { ... },
  "message": "Thao tác thành công"
}
```

**❌ Khi có lỗi (Status: 400 Bad Request / 500 Server Error):**
```json
{
  "code": "error",
  "message": "Lỗi lấy danh sách tài khoản..."
}
```


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
### Module: /api/reports (RBAC: resource `reports`)
| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| **GET** | `/api/reports/overview?from=&to=` | `view` | KPIs + biểu đồ + cảnh báo cho khoảng ngày (mặc định 30 ngày gần nhất) |
| **GET** | `/api/reports/export?type=&from=&to=` | `export` | Xuất PDF; `type` ∈ all\|traffic\|yard\|container\|performance\|alerts |
