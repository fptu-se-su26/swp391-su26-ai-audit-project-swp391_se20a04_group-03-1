# 📊 BÁO CÁO KIỂM THỬ — LOGIPORT ADMIN FRONTEND

> **Dự án:** SWP391 — SE20A04 Group 03  
> **Module:** Frontend (Next.js) — Kiểm thử E2E bằng Playwright  
> **Người lập báo cáo:** Team Lead Test — SE20A04 Group 03  
> **Ngày kiểm thử:** 12/07/2026  
> **Ngày tạo báo cáo:** 15/07/2026  
> **Công cụ kiểm thử:** Playwright v1.40+ · TypeScript · Page Object Model (POM)  
> **Môi trường:** Windows · Node.js v18+ · Chromium (headless)  
> **URL Frontend:** `http://localhost:3000`  
> **URL Backend:** `http://localhost:4000`

---

## 🗂️ Tóm tắt kết quả tổng

| Chỉ số | Giá trị |
|---|---|
| **Tổng số test case** | 30 |
| ✅ **PASS** | 28 |
| ❌ **FAIL** | 1 (cố ý — demo báo lỗi) |
| ⏭️ **SKIP** | 1 (thiếu điều kiện DB) |
| 📁 **Số file test** | 9 file |
| ⏱️ **Thời gian chạy** | ~11 giây (tuần tự, 1 worker) |

> **Lưu ý quan trọng:** `TC-030` (demo-failure.spec.ts) **cố tình FAIL** để minh chứng cơ chế sinh screenshot + trace khi lỗi — **không phải bug**.  
> `TC-005` tự SKIP vì tài khoản `inactive@logiport.com` chưa có trong DB lần chạy này.

---

## 📋 Bảng Test Cases Chi Tiết

---

### 🔷 NHÓM 1 — SMOKE TEST / KIỂM TRA MÔI TRƯỜNG

> **File:** `smoke.spec.ts` · **Loại:** 🌐 Backend thật · **Precondition chung:** Next.js app đang chạy tại `http://localhost:3000`

| ID | Description | Precondition | Test Steps | Expected Result | Actual Result | Status | Note |
|---|---|---|---|---|---|---|---|
| TC-001 | Trang chủ tải được — kiểm tra app khởi động thành công | App Next.js chạy tại `:3000` | 1. Truy cập `http://localhost:3000` 2. Chờ trang load | HTTP status < 400; thẻ `<body>` visible trên DOM | Trang tải thành công, `<body>` visible, status 200 | ✅ PASS | **Smoke Test** — Kiểm tra cơ bản nhất: app có sống không. Không dùng BVA/EP; đây là điều kiện tiên quyết trước mọi test khác. |

---

### 🔷 NHÓM 2 — ĐĂNG NHẬP ADMIN (E2E — BACKEND THẬT)

> **File:** `login.spec.ts` · **Loại:** 🌐 Backend thật · **Page Object:** `LoginPage.ts` (extends `BasePage`)  
> **Precondition chung:** (1) App `:3000` chạy; (2) Backend `:4000` chạy; (3) `.env.test` có `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` hợp lệ; (4) Truy cập `/admin/login` thành công.

| ID | Description | Precondition | Test Steps | Expected Result | Actual Result | Status | Note |
|---|---|---|---|---|---|---|---|
| TC-002 | Đăng nhập thành công với tài khoản Admin hợp lệ | Backend chạy; tài khoản SUPER_ADMIN có trong DB và `isActive=true` | 1. Mở `/admin/login` 2. Nhập email hợp lệ (`admin@logiport.com`) 3. Nhập mật khẩu đúng 4. Click "Đăng nhập" | Text "ĐĂNG XUẤT" hiển thị; URL chứa `dashboard` | "ĐĂNG XUẤT" visible; URL redirect đúng sang `/admin/dashboard` | ✅ PASS | **EP (Valid Class)** — Phân lớp tương đương: email đúng định dạng + tồn tại, mật khẩu đúng ≥ 6 ký tự → lớp hợp lệ. **Happy Path.** |
| TC-003 | Đăng nhập thất bại khi nhập sai mật khẩu | Backend chạy; email tồn tại trong DB | 1. Mở `/admin/login` 2. Nhập email hợp lệ 3. Nhập **mật khẩu sai** 4. Click "Đăng nhập" | `errorMessage` locator hiển thị trên trang | Error message visible | ✅ PASS | **EP (Invalid Class — sai credentials)** — Lớp tương đương sai mật khẩu. **Error Guessing**: mật khẩu sai là lỗi người dùng phổ biến nhất. |
| TC-004 | Đăng nhập thất bại với email không tồn tại trên hệ thống | Backend chạy | 1. Mở `/admin/login` 2. Nhập email **không tồn tại** (`nonexistent.admin@logiport.com`) 3. Nhập mật khẩu bất kỳ 4. Click "Đăng nhập" | Toast error chứa text "không chính xác" hiển thị | Toast "Tài khoản hoặc mật khẩu không chính xác" visible | ✅ PASS | **EP (Invalid Class — email không tồn tại)** — Lớp tương đương: email đúng định dạng nhưng không có trong DB. Hệ thống không phân biệt sai email hay sai pass để tránh user enumeration. |
| TC-005 | Đăng nhập thất bại với tài khoản chưa được kích hoạt | Backend chạy; tồn tại tài khoản `isActive=false` trong DB | 1. Mở `/admin/login` 2. Nhập email tài khoản **chưa kích hoạt** 3. Nhập mật khẩu đúng 4. Click "Đăng nhập" | Toast "Tài khoản của bạn không được kích hoạt" hiển thị | Tài khoản inactive chưa có trong DB → test **tự SKIP** | ⏭️ SKIP | **Error Guessing / State-based** — Kịch bản tài khoản bị khóa. SKIP vì điều kiện DB chưa thỏa mãn (cần seed thêm). Không tính là lỗi hệ thống. |
| TC-006 | Đăng nhập thất bại với tài khoản đã bị xóa | Backend chạy; tài khoản có `isDeleted=true` | 1. Mở `/admin/login` 2. Nhập email tài khoản **đã xóa** 3. Nhập mật khẩu đúng 4. Click "Đăng nhập" | Toast chứa text "không chính xác" hiển thị | Toast error visible — hệ thống xử lý tài khoản xóa như email không tồn tại | ✅ PASS | **Error Guessing** — Kiểm tra edge case: tài khoản soft-delete. Hệ thống không tiết lộ trạng thái xóa, trả về lỗi giống email không tồn tại (bảo mật). |
| TC-007 | Hiển thị lỗi validate khi bỏ trống tất cả các trường | Không cần backend | 1. Mở `/admin/login` 2. **Không nhập gì** 3. Click "Đăng nhập" | Lỗi "Vui lòng nhập email công vụ." và "Vui lòng nhập mật khẩu." đồng thời hiển thị | Cả 2 lỗi validation visible | ✅ PASS | **Decision Table** — Bảng quyết định: `Email=rỗng × Pass=rỗng` → cả 2 lỗi hiện. **EP (Null/Empty Class)**. Kiểm tra client-side validation không phụ thuộc backend. |
| TC-008 | Hiển thị lỗi validate khi nhập email sai định dạng | Không cần backend | 1. Mở `/admin/login` 2. Nhập email **sai định dạng** (`invalid-email-format`) 3. Nhập mật khẩu hợp lệ 4. Click "Đăng nhập" | Lỗi "Định dạng email không hợp lệ." hiển thị | Error message "Định dạng email không hợp lệ." visible | ✅ PASS | **EP (Invalid Format Class)** — Lớp tương đương: chuỗi không chứa `@domain.ext`. Regex validation phía client phải bắt được. |
| TC-009 | Hiển thị lỗi validate khi nhập mật khẩu quá ngắn | Không cần backend | 1. Mở `/admin/login` 2. Nhập email hợp lệ 3. Nhập mật khẩu **5 ký tự** (`12345`) 4. Click "Đăng nhập" | Lỗi "Mật khẩu phải chứa ít nhất 6 ký tự." hiển thị | Error message visible | ✅ PASS | **BVA (Boundary Value Analysis)** — Ranh giới min-length = 6: kiểm tra giá trị `length=5` (dưới ranh giới → invalid). Giá trị biên dưới cận ngoài. |
| TC-010 | Ẩn/Hiện mật khẩu khi bấm vào biểu tượng con mắt | Không cần backend | 1. Mở `/admin/login` 2. Nhập mật khẩu bất kỳ 3. Click icon "con mắt" lần 1 4. Click icon "con mắt" lần 2 | Lần 1: `type` input chuyển `password` → `text`; Lần 2: chuyển lại `text` → `password` | Attribute `type` toggle đúng qua 2 lần click | ✅ PASS | **State Transition** — Biểu đồ trạng thái: `Hidden ↔ Visible`. Kiểm tra cả 2 chiều chuyển trạng thái. |
| TC-011 | Chuyển hướng thành công sang trang Quên mật khẩu | Không cần backend | 1. Mở `/admin/login` 2. Click link "Quên mật khẩu?" | URL chứa `forgot-password` sau khi click | URL redirect đúng sang `/admin/forgot-password` | ✅ PASS | **Navigation / Usability** — Kiểm tra link điều hướng hoạt động. Không cần dữ liệu đầu vào. |
| TC-012 | Cho phép gửi form đăng nhập bằng cách nhấn phím Enter | Backend chạy; tài khoản hợp lệ | 1. Mở `/admin/login` 2. Nhập email hợp lệ 3. Nhập mật khẩu đúng 4. Nhấn phím **Enter** trên ô mật khẩu | Đăng nhập thành công; URL chứa `dashboard` | Đăng nhập thành công khi nhấn Enter | ✅ PASS | **Usability / Accessibility** — Kiểm tra keyboard submission. Người dùng thường dùng Enter thay click nút — phải hỗ trợ. |
| TC-013 | Kiểm tra giao diện responsive khi mở bằng màn hình điện thoại | Không cần backend | 1. Mở `/admin/login` 2. Set viewport → `375×812` (iPhone 12 Pro) 3. Kiểm tra layout | Brand panel bên trái **ẩn**; Login card bên phải **vẫn hiển thị** | Brand panel hidden, Login card visible ở viewport 375px | ✅ PASS | **UI / Responsive Testing** — Kiểm tra breakpoint Tailwind `lg` (1024px). Viewport `375px < 1024px` → panel trái phải ẩn. **BVA** áp dụng ở breakpoint CSS. |

---

### 🔷 NHÓM 3 — ĐĂNG NHẬP ADMIN (API MOCK)

> **File:** `loginPOM.spec.ts` · **Loại:** 🎭 API Mock · **Page Object:** `login.pom.ts` (standalone)  
> **Precondition chung:** App `:3000` chạy; API `POST /auth/login` được mock bởi Playwright `page.route()`; truy cập `/admin/login` thành công.

| ID | Description | Precondition | Test Steps | Expected Result | Actual Result | Status | Note |
|---|---|---|---|---|---|---|---|
| TC-014 | Happy path: Đăng nhập thành công (API mock trả 200) | API mock: `POST /auth/login` → `{code:'success', token:'mock-token'}` | 1. Mock API trả về 200 thành công 2. Nhập email/pass hợp lệ 3. Click "Đăng nhập" | Toast "Đăng nhập thành công!" visible; URL chứa `dashboard` | Toast thành công hiển thị; URL redirect đúng | ✅ PASS | **Happy Path + API Mocking** — Kiểm tra UI xử lý response 200 đúng: hiện toast, redirect. Tách biệt logic UI khỏi backend thật. **EP (Valid Mock Class)**. |
| TC-015 | Đăng nhập thất bại khi sai mật khẩu (API mock trả 400) | API mock: `POST /auth/login` → `{code:'error', message:'...không chính xác.'}` | 1. Mock API trả về 400 lỗi 2. Nhập email/pass (bất kỳ) 3. Click "Đăng nhập" | Toast error "Tài khoản hoặc mật khẩu không chính xác." visible | Toast lỗi hiển thị đúng message từ API mock | ✅ PASS | **EP (Invalid Mock Class) + API Mocking** — Kiểm tra UI xử lý response 400 đúng: hiện toast lỗi. Đảm bảo error message từ API được propagate lên UI. |
| TC-016 | Kiểm tra UI Validation — bỏ trống email | Không cần API mock (client-side validation) | 1. Để trống email 2. Nhập password hợp lệ 3. Click "Đăng nhập" | Error message "Vui lòng nhập email công vụ." visible | Error message validation hiển thị trước khi gọi API | ✅ PASS | **EP (Empty Email Class) + Client-side Validation** — Xác nhận form không gửi request khi email rỗng. API không bị gọi. Kiểm tra validation layer độc lập. |

---

### 🔷 NHÓM 4 — TRANG CHỦ (POM MẪU)

> **File:** `home.pom.spec.ts` · **Loại:** 🌐 Thật · **Page Object:** `HomePage.ts`  
> **Precondition chung:** App `:3000` chạy.

| ID | Description | Precondition | Test Steps | Expected Result | Actual Result | Status | Note |
|---|---|---|---|---|---|---|---|
| TC-017 | Mở được trang chủ qua HomePage POM | App chạy tại `:3000` | 1. Khởi tạo `HomePage` object 2. Gọi `home.open()` → `page.goto('/')` 3. Kiểm tra DOM | Thẻ `<body>` element visible trên DOM | `<body>` visible, trang load thành công | ✅ PASS | **Smoke / POM Sanity Test** — File mẫu tham chiếu (template). Mục đích: minh họa kiến trúc POM cho team. Không áp dụng BVA/EP — đây là navigation test cơ bản. |

---

### 🔷 NHÓM 5 — QUẢN LÝ BÃI ĐỖ (API MOCK)

> **File:** `yard-management.spec.ts` · **Loại:** 🎭 API Mock · **Page Object:** `yard.page.ts` (extends `BasePage`)  
> **Precondition chung:** App `:3000` chạy; các API sau được mock: `POST /auth/login` (login thành công), `GET /settings/me/permissions` (role SUPER_ADMIN), `GET /yards` (danh sách trống ban đầu), `POST /yards/create` (tạo thành công).

| ID | Description | Precondition | Test Steps | Expected Result | Actual Result | Status | Note |
|---|---|---|---|---|---|---|---|
| TC-018 | Thêm mới bãi đỗ thành công với thông tin hợp lệ | Tất cả API đã mock; cookie `tokenAdmin` đã inject | 1. Mở `/admin/yard` (sau mock auth) 2. Click nút "Thêm bãi đỗ" 3. Nhập tên bãi đỗ hợp lệ (có timestamp) 4. Nhập Camera IP `192.168.1.50` 5. Submit form | Toast "Tạo bãi đỗ thành công" visible; row mới xuất hiện trong bảng | Toast thành công hiển thị; bảng cập nhật thêm row mới | ✅ PASS | **Happy Path + API Mocking** — Kiểm tra toàn bộ luồng Create. Timestamp trong tên đảm bảo unique. **EP (Valid Input Class)**: tên không rỗng + IP đúng định dạng. |

---

### 🔷 NHÓM 6 — QUẢN LÝ LỊCH HẸN ADMIN (API MOCK)

> **File:** `appointment.pom.spec.ts` · **Loại:** 🎭 API Mock · **Page Object:** `appointment.pom.ts`  
> **URL:** `/admin/appointments`  
> **Precondition chung:** App `:3000` chạy; cookie `tokenAdmin` mock inject; các API sau được mock: `GET /settings/me/permissions` (SUPER_ADMIN), `GET /trucks`, `GET /containers`, `GET /drivers`, `GET /appointments` (state động).

| ID | Description | Precondition | Test Steps | Expected Result | Actual Result | Status | Note |
|---|---|---|---|---|---|---|---|
| TC-019 | Happy path: Tạo lịch hẹn mới thành công | Mock danh sách xe/container/tài xế; `POST /appointments/create` → mock success | 1. Mở `/admin/appointments` 2. Click "Đăng ký lịch hẹn" 3. Chọn xe `51C-12345`, container `CONT1234567`, tài xế `Nguyen Van A` 4. Chọn ngày hôm nay, khung giờ `08:00-09:00` 5. Submit | Toast "Đăng ký lịch hẹn thành công!" visible; badge "Chờ Duyệt" xuất hiện trong bảng | Toast thành công và badge Pending visible | ✅ PASS | **Happy Path + API Mocking** — End-to-end flow tạo appointment với mock state. Kiểm tra cả UI update sau thành công. **EP (Valid Input Class)**. |
| TC-020 | UI check trạng thái "Chờ Duyệt" — badge màu cam | Mock state có sẵn 1 appointment `status: 'Pending'` | 1. Inject mock appointment `status: Pending` vào state 2. Reload trang 3. Kiểm tra badge của xe `29A-99999` | Badge "Chờ Duyệt" visible; có class CSS màu cam `bg-[#ffa42b]/10` | Badge visible với class màu cam đúng | ✅ PASS | **UI Assertion** — Kiểm tra ánh xạ `status → màu badge`. Đảm bảo design system hiển thị đúng màu theo trạng thái. |
| TC-021 | Exception case (BVA): Chọn ngày quá khứ — input bị invalid | Không cần mock đặc biệt; form đang mở | 1. Click "Đăng ký lịch hẹn" 2. Kiểm tra attribute `min` của date-input = ngày hôm nay 3. Cưỡng ép nhập ngày quá khứ `2020-01-01` qua JavaScript 4. Click "Đăng ký" | `input.validity.rangeUnderflow === true`; form không submit (API không được gọi) | `rangeUnderflow = true` xác nhận; API không bị gọi | ✅ PASS | **BVA (Boundary Value Analysis)** — Ranh giới: ngày min = hôm nay. Kiểm tra giá trị dưới ranh giới (`2020-01-01 < today`). Native HTML5 validation `min` attribute chặn submit. |
| TC-022 | UI check Validation — bỏ trống form lịch hẹn | Form đang mở | 1. Click "Đăng ký lịch hẹn" 2. **Không điền gì** 3. Click "Đăng ký" ngay lập tức | Ít nhất 1 lỗi validation từ JustValidate hiển thị | Có ≥ 1 lỗi validation visible | ✅ PASS | **EP (Empty Input Class) + Decision Table** — Khi toàn bộ required fields trống → tất cả lỗi validate phải hiện. JustValidate library xử lý client-side validation. |
| TC-023 | Action Flow: Duyệt lịch hẹn (Approve) | Mock state có `status: Pending`; `PATCH /appointments/status/:id` → mock success | 1. Inject appointment `status: Pending` 2. Reload trang 3. Click nút "Duyệt" của xe `99Z-11111` 4. Xác nhận | Toast "Đã cập nhật trạng thái lịch hẹn sang: Đã duyệt" visible | Toast thành công hiển thị đúng message | ✅ PASS | **State Transition + Happy Path** — Chuyển trạng thái `Pending → Approved`. Kiểm tra Admin action flow. Mock API trả về 200 để test UI response. |

---

### 🔷 NHÓM 7 — LỊCH HẸN CÔNG TY (API MOCK)

> **File:** `appointment.spec.ts` · **Loại:** 🎭 API Mock  
> **URL:** `/client/company/appointments`  
> **Precondition chung:** App `:3000` chạy; các API liên quan được mock; auth cookie inject.

| ID | Description | Precondition | Test Steps | Expected Result | Actual Result | Status | Note |
|---|---|---|---|---|---|---|---|
| TC-024 | Tạo lịch hẹn thành công và hiển thị trạng thái Pending — phía Công ty | Mock API tạo appointment; danh sách xe/tài xế/container mock | 1. Mở `/client/company/appointments` 2. Điền thông tin lịch hẹn hợp lệ 3. Submit form | Lịch hẹn mới xuất hiện trong danh sách với trạng thái "Pending" | Appointment mới visible với trạng thái Pending | ✅ PASS | **Happy Path + API Mocking** — Kiểm tra luồng tạo lịch hẹn từ phía Client (Company role), tách biệt với flow Admin. **EP (Valid Input Class)**. |

---

### 🔷 NHÓM 8 — QUẢN LÝ TÀI XẾ ADMIN (E2E — BACKEND THẬT)

> **File:** `drivers.pom.spec.ts` · **Loại:** 🌐 Backend thật · **Page Object:** `DriversPage.ts` (extends `BasePage`)  
> **URL:** `/admin/drivers` · **Mode:** `serial` (tránh xung đột Redis single-session)  
> **Precondition chung:** (1) App `:3000` chạy; (2) Backend `:4000` chạy; (3) `.env.test` có `E2E_ADMIN_EMAIL`/`E2E_ADMIN_PASSWORD` (tài khoản SUPER_ADMIN); (4) `npm run seed:rbac` đã chạy trên backend.

| ID | Description | Precondition | Test Steps | Expected Result | Actual Result | Status | Note |
|---|---|---|---|---|---|---|---|
| TC-025 | Tải trang: hiển thị tiêu đề và các control chính | Login API thật thành công; cookie `tokenAdmin` được set | 1. Login qua API `POST /auth/login` 2. Mở `/admin/drivers` 3. Kiểm tra các element | Heading "Quản lý Tài Xế", nút "Thùng rác", ô tìm kiếm, nút "Thêm tài xế" đều visible | Tất cả 4 element visible | ✅ PASS | **Happy Path / UI Sanity** — Kiểm tra page render đúng sau auth. Tài khoản SUPER_ADMIN → nút "Thêm tài xế" phải render (RBAC). |
| TC-026 | Bảng danh sách: render tiêu đề cột và dữ liệu tài xế từ backend | Backend trả dữ liệu thật | 1. Login thật 2. Mở `/admin/drivers` 3. Chờ list load xong 4. Kiểm tra cột và dữ liệu | Cột "Họ Tên" và "Công Ty" visible; có ≥ 1 dòng dữ liệu (hoặc empty-state nếu DB trống) | Cột header visible; có dòng dữ liệu từ DB thật | ✅ PASS | **Integration Test** — Kiểm tra kết nối frontend–backend thật. Xử lý cả 2 trường hợp: DB có dữ liệu và DB trống (graceful empty-state). |
| TC-027 | Tìm kiếm: gõ từ khóa bật nút "Xóa lọc", bấm xóa thì làm rỗng ô tìm | List đã load xong | 1. Xác nhận nút "Xóa lọc" **disabled** ban đầu 2. Gõ `"Nguyen"` vào ô tìm kiếm 3. Kiểm tra nút "Xóa lọc" enabled 4. Click "Xóa lọc" 5. Kiểm tra ô tìm kiếm rỗng | Nút "Xóa lọc": disabled → enabled; sau click → ô tìm kiếm value = "" | Toggle state đúng; clear input hoạt động | ✅ PASS | **State Transition** — 3 trạng thái: `Idle (disabled)` → `Searching (enabled)` → `Cleared (disabled)`. **Usability**: nút xóa filter là pattern chuẩn. |
| TC-028 | Tìm kiếm từ khóa không tồn tại: hiển thị empty-state | List đã load xong; debounce 500ms | 1. Gõ `"zzz-khong-ton-tai-9999"` 2. Chờ debounce 500ms + API refetch 3. Kiểm tra empty-state | Text "Không tìm thấy tài xế nào." visible | Empty-state message visible sau debounce | ✅ PASS | **EP (No Result Class)** — Lớp tương đương: từ khóa không match bất kỳ record nào. Kiểm tra UI xử lý kết quả rỗng. Timeout 10s để chờ debounce + network. |
| TC-029 | Form thêm tài xế: mở form hiện các field và validate khi bỏ trống | Tài khoản SUPER_ADMIN đã đăng nhập | 1. Click nút "Thêm tài xế" 2. Kiểm tra 4 field: CCCD, Họ tên, SĐT, Chọn công ty 3. Click "Lưu" mà không nhập gì | Cả 4 field visible; ≥ 1 lỗi "Bắt buộc" từ JustValidate hiển thị | 4 field visible; lỗi validate hiển thị | ✅ PASS | **EP (Empty Required Fields) + Decision Table** — Khi toàn bộ required fields trống → lỗi "Bắt buộc" cho mỗi field. **RBAC**: chỉ SUPER_ADMIN thấy nút thêm tài xế. |

---

### 🔷 NHÓM 9 — DEMO BÁO LỖI (CỐ TÌNH FAIL)

> **File:** `demo-failure.spec.ts` · **Loại:** ⚠️ Demo  
> **Precondition chung:** App `:3000` chạy.

| ID | Description | Precondition | Test Steps | Expected Result | Actual Result | Status | Note |
|---|---|---|---|---|---|---|---|
| TC-030 | DEMO fail — selector cố tình sai để sinh screenshot + trace | App chạy | 1. Mở trang bất kỳ 2. Tìm element bằng `data-testid` **không tồn tại** trên DOM 3. Assert element visible | Test **FAIL** → Playwright tự sinh: `test-failed-1.png` + `trace.zip` | Test FAIL như dự kiến; screenshot + trace được sinh trong `test-results/` | ❌ FAIL (Cố ý) | **Không phải bug.** Test này là **demo hạ tầng báo lỗi**: xác nhận cấu hình `screenshot: 'only-on-failure'` và `trace: 'retain-on-failure'` trong `playwright.config.ts` hoạt động đúng. |

---

## 📈 Tổng kết theo nhóm tính năng

| Nhóm | Tính năng | Số TC | ✅ PASS | ⏭️ SKIP | ❌ FAIL | Loại test |
|---|---|---|---|---|---|---|
| 1 | Smoke / Môi trường | 1 | 1 | 0 | 0 | 🌐 E2E thật |
| 2 | Đăng nhập Admin (E2E) | 12 | 11 | 1 | 0 | 🌐 E2E thật |
| 3 | Đăng nhập Admin (Mock) | 3 | 3 | 0 | 0 | 🎭 API Mock |
| 4 | Trang chủ POM | 1 | 1 | 0 | 0 | 🌐 E2E thật |
| 5 | Quản lý Bãi đỗ | 1 | 1 | 0 | 0 | 🎭 API Mock |
| 6 | Quản lý Lịch hẹn Admin | 5 | 5 | 0 | 0 | 🎭 API Mock |
| 7 | Lịch hẹn Công ty | 1 | 1 | 0 | 0 | 🎭 API Mock |
| 8 | Quản lý Tài xế (E2E) | 5 | 5 | 0 | 0 | 🌐 E2E thật |
| 9 | Demo Fail | 1 | 0 | 0 | 1 | ⚠️ Demo |
| **Tổng** | | **30** | **28** | **1** | **1** | |

---

## 🧪 Kỹ thuật kiểm thử đã áp dụng

| Kỹ thuật | Viết tắt | Test Case áp dụng |
|---|---|---|
| **Equivalence Partitioning** | EP | TC-002, TC-003, TC-004, TC-008, TC-014, TC-015, TC-016, TC-018, TC-024, TC-027, TC-028, TC-029 |
| **Boundary Value Analysis** | BVA | TC-009 (pass 5 ký tự — dưới min 6), TC-013 (viewport 375px — dưới breakpoint lg:1024), TC-021 (ngày quá khứ — dưới min date) |
| **Decision Table** | DT | TC-007 (matrix email×pass rỗng), TC-022 (form rỗng toàn bộ), TC-029 (required fields) |
| **State Transition** | ST | TC-010 (toggle password), TC-023 (Pending→Approved), TC-027 (filter idle→searching→cleared) |
| **Error Guessing** | EG | TC-003 (sai pass), TC-005 (inactive account), TC-006 (deleted account), TC-004 (email không tồn tại) |
| **Happy Path** | HP | TC-002, TC-014, TC-018, TC-019, TC-024, TC-025 |
| **API Mocking** | Mock | TC-014, TC-015, TC-016, TC-018, TC-019, TC-020, TC-021, TC-022, TC-023, TC-024 |
| **Smoke Test** | Smoke | TC-001, TC-017 |
| **UI / Usability** | UI | TC-011, TC-012, TC-013, TC-020, TC-025, TC-026 |

---

## 🔴 Danh sách trang chưa được kiểm thử (Backlog)

| Nhóm | Trang chưa test | Ưu tiên |
|---|---|---|
| **Admin** | `dashboard`, `companies`, `container-providers`, `containers` | Cao |
| **Admin** | `gate` (logs), `reports`, `settings/*` (admins, roles, client-roles) | Trung bình |
| **Admin** | `yard/[id]/config`, `appointments/{edit,completed,trash}`, `drivers/{edit,trash}` | Trung bình |
| **Client / Company** | `dashboard`, `drivers`, `trucks` | Cao |
| **Client / Provider** | `dashboard`, `containers`, `settings` | Trung bình |
| **Auth** | `forgot-password`, `reset-password/[email]` | Cao |

---

## ⚙️ Môi trường kiểm thử

| Thông số | Giá trị |
|---|---|
| **OS** | Windows |
| **Node.js** | v18+ |
| **Playwright** | v1.40+ |
| **Trình duyệt** | Chromium (headless) |
| **Framework** | Next.js (TypeScript) |
| **Pattern** | Page Object Model (POM) |
| **Workers** | 1 (tuần tự — `fullyParallel: false`) |
| **Frontend URL** | `http://localhost:3000` |
| **Backend URL** | `http://localhost:4000` |
| **Cấu hình** | `playwright.config.ts` |

---

*Báo cáo tạo ngày: 15/07/2026 — SWP391 SE20A04 Group 03 — Team Lead Test*
