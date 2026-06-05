# AI Audit Log

## 1. Thông tin chung

| Thông tin | Nội dung |
|---|---|
| Môn học | Software development project |
| Mã môn học | SWP391 |
| Lớp | SE20A04 |
| Học kỳ | SU26 |
| Tên bài tập / Project | LogiPort - Port Operations Management Solution |
| Tên sinh viên / Nhóm | 3 |
| MSSV / Danh sách MSSV | DE190953, DE191024, DE190478, DE190972, DE190658 |
| Giảng viên hướng dẫn | QuangLTN3 |
| Ngày bắt đầu | 15/05/2026 |
| Ngày hoàn thành |  |

---

## 2. Công cụ AI đã sử dụng

Đánh dấu các công cụ AI đã sử dụng trong quá trình thực hiện bài tập/project.

- [ ] ChatGPT
- [x] Gemini
- [x] Claude
- [ ] GitHub Copilot
- [ ] Cursor
- [ ] Antigravity
- [ ] Perplexity
- [ ] Microsoft Copilot
- [ ] Công cụ khác: ....................................

---

## 3. Mục tiêu sử dụng AI

Mô tả ngắn gọn sinh viên/nhóm đã sử dụng AI để hỗ trợ những công việc nào.

Ví dụ:

- Phân tích yêu cầu bài toán
- Gợi ý ý tưởng giải pháp
- Thiết kế database
- Thiết kế giao diện
- Viết code mẫu
- Debug lỗi
- Tối ưu code
- Viết test case
- Kiểm tra bảo mật
- Viết báo cáo
- Chuẩn bị slide thuyết trình
- Tìm hiểu công nghệ mới

### Mô tả mục tiêu sử dụng AI

```text
Viết tại đây...

## 4. Nhật ký sử dụng AI chi tiết

> Mỗi lần sử dụng AI cho một phần quan trọng của bài tập/project, sinh viên cần ghi lại theo mẫu bên dưới.  
> Sinh viên/nhóm có thể nhân bản mẫu “Lần sử dụng AI” nhiều lần tùy theo số lần sử dụng AI thực tế.

---

### Lần sử dụng AI số 1

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 19/05/2026 |
| Công cụ AI | Claude |
| Mục đích |  |
| Phần việc liên quan | Front end |
| Mức độ sử dụng | Hỏi sinh code  |

#### 4.1. Prompt đã sử dụng

```text

"IoT:Hệ thống quản lý xe container ra/vào cổng cảng
Ý tưởng:
Quản lý xe container khi vào/ra cảng: tài xế, biển số xe, mã container, mã booking, thời gian vào, thời gian ra, trạng thái xử lý.
-> đặt lịch xe container vào cảng(Doanh nghiệp vận tải đặt trước khung giờ cho xe container vào cảng để giảm ùn tắc ở cổng. Đây là bài toán thực tế vì gate congestion là thách thức phổ biến ở container terminal; các nghiên cứu gần đây xem truck appointment system là cách giảm hàng chờ và điều phối lượng xe theo thời gian)
-> Trước khi vào cổng cảng, xe container có thể vào bãi chờ. Hệ thống quản lý xe đang lưu trú trong bãi, vị trí đỗ, thời gian vào, thời gian ra, phí lưu trú.
- >Quản lý container nằm trong bãi: số container, loại container, hàng/rỗng, vị trí block/bay/row/tier, ngày vào bãi, ngày ra bãi, tình trạng lưu bãi.
-> Hệ thống gợi ý vị trí đỗ/lưu container trong bãi
-> Hệ thống quản lý phiếu nâng/hạ container
->Mỗi ô đỗ trong bãi container có cảm biến phát hiện có xe hay không. Hệ thống hiển thị ô trống/đang sử dụng trên dashboard.
-> Hệ thống giám sát niêm phong container bằng IoT"

"Các cảng container thường gặp nhiều vấn đề trong vận hành cổng và bãi:

Xe container đến cảng không theo kế hoạch, gây ùn tắc cổng;
Doanh nghiệp vận tải thiếu thông tin về khung giờ phù hợp để đưa xe vào cảng;
Cổng cảng khó dự báo số lượng xe theo từng khung giờ;
Bãi chờ thiếu dữ liệu thời gian thực về vị trí trống/đang sử dụng;
Việc quản lý container trong bãi còn phụ thuộc nhiều vào thao tác thủ công;
Vị trí lưu container chưa tối ưu, dẫn đến tăng số lần nâng/hạ, đảo chuyển container;
Phiếu nâng/hạ container chưa được số hóa đầy đủ;
Niêm phong container khó giám sát liên tục;
RQ1.

Hệ thống đặt lịch xe container vào cổng cảng có thể giúp giảm ùn tắc và thời gian chờ tại cổng không?

RQ2.

Dữ liệu IoT từ ô đỗ trong bãi chờ có giúp nâng cao độ chính xác trong quản lý trạng thái bãi không?

RQ3.

Có thể xây dựng mô hình gợi ý vị trí đỗ xe hoặc vị trí lưu container dựa trên loại container, thời gian dự kiến xử lý và trạng thái bãi không?

RQ4.

Việc số hóa phiếu nâng/hạ container có giúp giảm sai sót và cải thiện khả năng truy vết trong vận hành cảng không?

RQ5.

Giám sát niêm phong container bằng IoT có thể hỗ trợ phát hiện sớm bất thường trong quá trình container lưu bãi không?"

"Mục tiêu tổng quát

Xây dựng hệ thống IoT hỗ trợ quản lý xe container ra/vào cổng cảng, đặt lịch khung giờ, quản lý bãi chờ, quản lý container trong bãi và giám sát trạng thái ô đỗ/niêm phong container, nhằm cải thiện hiệu quả vận hành và giảm ùn tắc tại cổng cảng.

Mục tiêu cụ thể
Thiết kế cơ sở dữ liệu quản lý xe container, tài xế, doanh nghiệp vận tải, booking, container, lịch hẹn và trạng thái xử lý.
Xây dựng chức năng Truck Appointment System cho phép doanh nghiệp vận tải đăng ký khung giờ xe vào cảng.
Xây dựng chức năng quản lý xe ra/vào cổng:
Check-in;
Check-out;
kiểm tra booking;
kiểm tra container;
ghi nhận thời gian vào/ra;
cập nhật trạng thái xử lý.
Xây dựng chức năng quản lý bãi chờ xe container:
vị trí ô đỗ;
trạng thái ô đỗ;
thời gian vào/ra;
tính phí lưu trú.
Xây dựng chức năng quản lý container trong bãi:
số container;
loại container;
hàng/rỗng;
vị trí block/bay/row/tier;
ngày vào/ra;
tình trạng lưu bãi.
Xây dựng thuật toán gợi ý vị trí đỗ hoặc vị trí lưu container dựa trên trạng thái bãi và tiêu chí vận hành.
Xây dựng chức năng quản lý phiếu nâng/hạ container.
Mô phỏng cảm biến IoT phát hiện ô đỗ trống/đang sử dụng và hiển thị trạng thái trên dashboard.
Mô phỏng hoặc triển khai thiết bị IoT giám sát niêm phong container.
Xây dựng dashboard quản trị giúp cảng theo dõi:
số xe đang chờ;
số xe đã vào/ra;
tỷ lệ sử dụng bãi;
số container đang lưu bãi;
cảnh báo bất thường;
hiệu suất xử lý theo khung giờ"

Từ bối cảnh trên, bạn là 1 senior đầy kinh nghiệm về nextJs, trong phần front end đi từ src/frontend, hãy dùng các component từ shadcn ui hoặc các thư viện có sẵn, tạo cho tôi các trang cần thiết và quan trọng cho dự án. Với những trang xác thực sẽ nằm trong frontend/src/app/admin/(auth), và những trang còn lại sẽ nằm trong frontend/src/app/admin. Yêu cầu về giao diện: dễ nhìn, dễ hiểu và dễ thao tác, màu sắc nhẹ nhàng.
```

#### 4.2. Kết quả AI gợi ý

Tóm tắt nội dung AI đã trả lời hoặc gợi ý.

```text
AI đã tạo được các trang cơ bản với nội dung sau: 
- Triển khai ReportsPage với các tùy chọn lọc và bảng báo cáo
- Tạo SealPage để theo dõi trạng thái niêm phong với cảnh báo và bảng dữ liệu
- Phát triển YardPage để quản lý các vị trí đỗ xe và hiển thị tổng quan bãi đỗ xe
- Thêm HomePage làm trang chủ với điều hướng đến bảng điều khiển và đăng nhập
- Giới thiệu AdminLayout để có cấu trúc bố cục nhất quán trên các trang quản trị
- Tạo các thành phần giao diện người dùng có thể tái sử dụng: Nút, Thẻ, Ô nhập liệu, Nhãn và VideoStream
- Triển khai các thành phần bố cục: Đầu trang, Chân trang và Thanh bên để điều hướng
- Thêm các hàm tiện ích để hợp nhất tên lớp
```

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

Mô tả rõ phần nào được sử dụng lại từ gợi ý của AI.

```text
- Triển khai ReportsPage với các tùy chọn lọc và bảng báo cáo
- Tạo SealPage để theo dõi trạng thái niêm phong với cảnh báo và bảng dữ liệu
- Phát triển YardPage để quản lý các vị trí đỗ xe và hiển thị tổng quan bãi đỗ xe
- Thêm HomePage làm trang chủ với điều hướng đến bảng điều khiển và đăng nhập
- Giới thiệu AdminLayout để có cấu trúc bố cục nhất quán trên các trang quản trị
- Tạo các thành phần giao diện người dùng có thể tái sử dụng: Nút, Thẻ, Ô nhập liệu, Nhãn và VideoStream
- Triển khai các thành phần bố cục: Đầu trang, Chân trang và Thanh bên để điều hướng
- Thêm các hàm tiện ích để hợp nhất tên lớp
```

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

Mô tả sinh viên/nhóm đã thay đổi, kiểm tra, sửa lỗi hoặc cải tiến gì so với gợi ý ban đầu của AI.

```text
Trong trang Gate và Yard mà AI đã gen bị thiếu khung video streaming từ camera lên. Em đã thêm vào khung video streaming.
Một vài tiêu đề hoặc tên dự án chưa đồng bị hoặc hợp lí, em đã sửa lại nó
```

#### 4.5. Minh chứng

| Loại minh chứng | Nội dung |
|---|---|
| Link commit | https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a04_group-03-1/commit/2d7a0b7406063f917bc74946d71ecd1eac60c27f |
| File liên quan |  |
| Screenshot |  |
| Kết quả chạy/test |  |
| Link video demo |  |
| Ghi chú khác |  |

#### 4.6. Nhận xét cá nhân/nhóm

Sinh viên/nhóm học được gì sau lần sử dụng AI này?

```text
Muốn AI hiểu được dự án, hiểu công việc làm gì cần phải cung cấp rõ ngữ cảnh và yêu cầu cụ thể cho AI
```

---

### Lần sử dụng AI số 2

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 19/05/2026 |
| Công cụ AI | Gemini Claude GitHub Copilot Antigravity |
| Mục đích sử dụng | Xây dựng Frontend cho hệ thống |
| Phần việc liên quan | Design Frontend  |
| Mức độ sử dụng | Hỗ trợ sinh code, tối ưu giao diện  |

#### 4.1. Prompt đã sử dụng

```text
# Dự án: LogiPort System - Hê thống quản lý  cảng v2.0

## Tổng quan hệ thống
Xây dựng hệ thống quản lý xe container ra/vào cổng cảng tích hợp IoT, phục vụ 3 nhóm người dùng:
- **Port Admin**: quản trị toàn bộ hệ thống
- **Gate Operator**: xử lý check-in/check-out tại cổng
- **Transport Company**: đặt lịch và theo dõi xe

---

## Tech Stack
- **Framework**: Next.js 15 (App Router), TypeScript
- **UI Library**: shadcn/ui + Tailwind CSS
- **State**: Zustand hoặc React Query (TanStack Query v5)
- **Charts**: Recharts hoặc Tremor
- **Icons**: Lucide React
- **Form**: React Hook Form + Zod
- **Cấu trúc thư mục**: `src/frontend`
  - Auth pages: `frontend/src/app/admin/(auth)/`
  - Protected pages: `frontend/src/app/admin/`

---

## Yêu cầu giao diện
- Màu sắc: nhẹ nhàng, chuyên nghiệp – tone trung tính (slate/zinc/blue nhạt)
- Layout: sidebar cố định trái + header + content area
- Responsive: ưu tiên desktop (1280px+), hỗ trợ tablet
- Typography: rõ ràng, dễ đọc, phân cấp thông tin tốt
- Trạng thái ô đỗ / container nên dùng màu sắc trực quan (xanh = trống, đỏ = chiếm dụng, vàng = cảnh báo)
- Dashboard phải cảm giác real-time (có thể dùng skeleton loader, badge pulse animation)
- Tham khảo thêm các hình ảnh về giáo diện UI được cung cấp bằng việc sủ dụng stitchAI

---

## Danh sách trang cần tạo

1. Admin: Trong role Admin chứa các trang: Dashboard, yard map, container matrix, analysis, inventory, shipment

---

### Protected — `frontend/src/app/admin/`

#### Dashboard
3. **`page.tsx`** (Dashboard tổng quan)
   - KPI cards: xe đang trong cảng, xe đang chờ ở bãi, tỷ lệ lấp đầy bãi, số container đang lưu, cảnh báo niêm phong
   - Biểu đồ: lưu lượng xe theo khung giờ trong ngày (bar chart), tỷ lệ sử dụng bãi theo ngày (line chart)
   - Bảng: top xe đang chờ lâu nhất, cảnh báo bất thường gần nhất

#### yard map
4. **`gate/check-in/page.tsx`** — xử lý xe vào cổng
   - Form: biển số xe, mã booking, mã container, thông tin tài xế
   - Validate booking hợp lệ, hiển thị thông tin booking/container tự động sau khi nhập mã
   - Nút xác nhận check-in, in phiếu
5.  xử lý xe ra cổng
   - Tìm xe theo biển số / mã booking
   - Hiển thị thời gian vào, phí phát sinh, trạng thái container
   - Nút xác nhận check-out
6. **`gate/history/page.tsx`** — lịch sử ra/vào cổng
   - Table có filter: ngày, biển số, mã booking, trạng thái
   - Export CSV

'container matrix'
7. **`appointments/page.tsx`** — danh sách lịch hẹn
   - Table: mã lịch hẹn, tên doanh nghiệp, biển số, khung giờ, trạng thái (pending/confirmed/cancelled/completed)
   - Filter theo ngày, khung giờ, trạng thái
   - Badge màu trạng thái
8. **`appointments/create/page.tsx`** — tạo lịch hẹn mới
   - Form: chọn doanh nghiệp, biển số xe, mã container, mã booking, chọn ngày + khung giờ
   - Hiển thị số slot còn lại trong khung giờ đã chọn (real-time từ API)
   - Validate conflict
9. **`appointments/[id]/page.tsx`** — chi tiết lịch hẹn
   - Timeline trạng thái, thông tin booking/container, lịch sử thay đổi

#### Waiting Yard (Bãi chờ xe) — `waiting-yard/`
10. **`waiting-yard/page.tsx`** — tổng quan bãi chờ
    - Grid map bãi chờ: mỗi ô hiển thị trạng thái (trống/đang dùng/bảo trì), tooltip khi hover (biển số, thời gian vào, phí tích lũy)
    - Bảng xe đang lưu trú: biển số, ô đỗ, thời gian vào, thời gian dự kiến ra, phí
    - Realtime indicator (pulse badge)
11. **`waiting-yard/assign/page.tsx`** — phân ô đỗ cho xe
    - Gợi ý ô đỗ tối ưu (thuật toán nearest-available hoặc group-by-departure-time)
    - Chọn xe, confirm phân ô

#### Container Yard (Bãi container) — `container-yard/`
12. **`container-yard/page.tsx`** — tổng quan bãi container
    - 3D-like block/bay/row/tier selector hoặc dạng bảng phân cấp
    - Filter: loại container (20/40ft), hàng/rỗng, trạng thái
    - Tỷ lệ lấp đầy từng block
13. **`container-yard/containers/page.tsx`** — danh sách container
    - Table: số container, loại, hàng/rỗng, vị trí (block/bay/row/tier), ngày vào, ngày ra dự kiến, trạng thái niêm phong
    - Filter, search, sort đầy đủ
14. **`container-yard/containers/[id]/page.tsx`** — chi tiết container
    - Timeline lịch sử di chuyển vị trí
    - Trạng thái niêm phong IoT (sensor data)
    - Lịch sử phiếu nâng/hạ
15. **`container-yard/suggest/page.tsx`** — gợi ý vị trí lưu container
    - Input: loại container, thời gian dự kiến lưu bãi, hàng/rỗng
    - Output: danh sách vị trí gợi ý kèm lý do (minimize re-handling, cluster by departure)


20. **`iot/seal-monitoring/page.tsx`** — giám sát niêm phong container
    - Danh sách container đang giám sát
    - Trạng thái seal: intact / tampered / unknown
    - Badge cảnh báo, thời gian phát hiện bất thường
    - Alert log với severity level

#### Master Data — `settings/`
21. **`settings/companies/page.tsx`** — quản lý doanh nghiệp vận tải
22. **`settings/drivers/page.tsx`** — quản lý tài xế
23. **`settings/vehicles/page.tsx`** — quản lý đầu xe
24. **`settings/users/page.tsx`** — quản lý tài khoản hệ thống (RBAC)

---

## Component dùng chung (tạo trong `components/`)
- `AppSidebar` — navigation sidebar với nhóm menu rõ ràng
- `AppHeader` — header với breadcrumb, notification bell, user menu
- `StatsCard` — KPI card với trend indicator
- `StatusBadge` — badge màu theo trạng thái (confirmed/pending/cancelled/alert/ok)
- `YardGrid` — grid map bãi (dùng cho cả waiting yard và parking sensor)
- `DataTable` — table tái sử dụng với sorting, filtering, pagination
- `ContainerPositionDisplay` — hiển thị block/bay/row/tier dạng breadcrumb hoặc badge

---

## Mock Data
- Mỗi trang sử dụng mock data tĩnh (TypeScript interfaces + faker-style constants)
- Không cần gọi API thật, nhưng cấu trúc phải chuẩn để sau này swap sang real API dễ dàng
- Dùng `const mockXxx: XxxType[] = [...]` trong `lib/mock/` hoặc ngay trong file page

---

## Conventions
- Mỗi file page chỉ là layout + composition, logic tách vào custom hooks nếu phức tạp
- Tất cả form dùng React Hook Form + Zod schema
- Tất cả table dùng DataTable component tái sử dụng với TanStack Table v8
- Màu trạng thái nhất quán toàn hệ thống qua `STATUS_COLORS` constant
- Sidebar navigation grouping:
  - **Tổng quan**: Dashboard
  - **Cổng cảng**: Check-in, Check-out, Lịch sử cổng
  - **Đặt lịch**: Danh sách, Tạo mới
  - **Bãi chờ xe**: Tổng quan, Phân ô
  - **Bãi container**: Tổng quan, Container, Gợi ý vị trí
  - **Nâng/Hạ**: Phiếu nâng/hạ
  - **IoT**: Cảm biến ô đỗ, Giám sát niêm phong
  - **Cài đặt**: Doanh nghiệp, Tài xế, Xe, Tài khoản
```

#### 4.2. Kết quả AI gợi ý

```text
 AI đã triển khai các trang cơ bản với nội dung sau: 
- Triển khai tốt các page liên quan đến Admin đã đề cập trên prompt
- Tạo Inventory để theo dõi, quan lý các thung hàng cho các xe booking, chưa booking
- Phát triển YardPage để quản lý các vị trí đỗ xe và hiển thị tổng quan bãi đỗ xe
- Thêm HomePage làm trang chủ với điều hướng đến bảng điều khiển và đăng nhập
- Page Container Matrix xác định vị trí theo dạng ma trận chỗ đỗ xe cho booked car
- Tạo các thành phần giao diện người dùng có thể tái sử dụng: Nút, Thẻ, Ô nhập liệu, Nhãn và VideoStream
- Triển khai các thành phần bố cục: Đầu trang, Chân trang và Thanh bên để điều hướng
- Thêm các hàm tiện ích để hợp nhất tên lớp
```

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

```text
- Triển khai tốt các page liên quan đến Admin đã đề cập trên prompt
- Tạo Inventory để theo dõi, quan lý các thung hàng cho các xe booking, chưa booking
- Phát triển YardPage để quản lý các vị trí đỗ xe và hiển thị tổng quan bãi đỗ xe
- Thêm HomePage làm trang chủ với điều hướng đến bảng điều khiển và đăng nhập
- Page Container Matrix xác định vị trí theo dạng ma trận chỗ đỗ xe cho booked car
- Tạo các thành phần giao diện người dùng có thể tái sử dụng: Nút, Thẻ, Ô nhập liệu, Nhãn và VideoStream
- Triển khai các thành phần bố cục: Đầu trang, Chân trang và Thanh bên để điều hướng
- Thêm các hàm tiện ích để hợp nhất tên lớp
```

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
  Vẫn còn có một số lỗi giữa các kích thước, phân bố navigation, layout, lệch kích thước giữa các button. Đã yêu cầu cải tiến thêm. Mục yard map cần cập nhật lại video live streaming
```

#### 4.5. Minh chứng

| Loại minh chứng | Nội dung |
|---|---|
| Link commit | 	https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a04_group-03-1/compare/main...DE190478-frontend |
| File liên quan |  |
| Screenshot |  |
| Kết quả chạy/test |  |
| Link video demo |  |
| Ghi chú khác |  |

#### 4.6. Nhận xét cá nhân/nhóm

```text
Viết tại đây...
```

---

### Lần sử dụng AI số 3

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 21/05/2026 |
| Công cụ AI | Antigravity |
| Mục đích sử dụng | Tạo api register |
| Phần việc liên quan | coding|
| Mức độ sử dụng | Hỏi sinh code |

#### 4.1. Prompt đã sử dụng

```text
Phân tích dự án hiện có , hãy bắt đầu viết tính năng register. Từ trang register của frontend hãy sửa lại dùng just-validate để xác thực và lấy dữ liệu gửi lên backend,  xong hãy viết tiếp tính năng này cho backend, yêu cầu sử dụng các thư viện đã cài, dùng joi để validate cho người dùng, viết schema cho account-admin trong model (yêu cầu schema đầy đủ các thuộc tính cần có của account-admin trong dự án, viết schema đơn giản không cần các cú pháp phức tạp như enum, ....) 
```

#### 4.2. Kết quả AI gợi ý

```text
# Bàn giao tính năng - Đăng ký (Register / Account Admin)

Tính năng Đăng ký tài khoản (Register) đã được triển khai hoàn chỉnh ở cả Frontend (Giao diện) và Backend (Máy chủ API), đáp ứng đầy đủ các tiêu chuẩn bảo mật, cấu trúc module hiện đại và trải nghiệm người dùng tối ưu.

---

## 🌟 Các thay đổi chính đã thực hiện

### 1. Nâng cấp Frontend với `Just-Validate`
- Đã cài đặt thư viện `just-validate` (`v4.3.0`) thay thế hoàn toàn cơ chế tự viết validate bằng `useState` thủ công.
- **Tích hợp vào React Component:**
  - Đã tái cấu trúc file [register/page.tsx](file:///d:/SWP/swp391-su26-ai-audit-project-swp391_se20a04_group-03-1/src/frontend/src/app/admin/(auth)/register/page.tsx) bằng cách sử dụng `useRef` cho thẻ `<form>`.
  - Khởi tạo thư viện `JustValidate` thông minh trong `useEffect`. Nó tự động dán các bộ luật: `required`, `email`, `minLength` và hàm so sánh chuỗi (để đối chiếu xác nhận mật khẩu).
  - Tự động thay đổi class viền đỏ `border-red-500` vào input lỗi và hiện thông báo tiếng Việt trực quan phía bên dưới input ngay khi người dùng gõ.
- **Kết nối Backend:** Thêm lệnh `fetch` gọi API thực tế tới `POST http://localhost:4000/api/auth/register`, xử lý JSON từ máy chủ và điều hướng sang trang Đăng nhập sau 2 giây khi thành công.

### 2. Xây dựng cấu trúc API Backend chuẩn (Express + MongoDB)
Hệ thống backend đã được thiết lập cấu trúc MVC hoàn chỉnh thông qua các tệp:

- **Model (Mongoose):** [account-admin.model.ts](file:///d:/SWP/swp391-su26-ai-audit-project-swp391_se20a04_group-03-1/src/backend/models/account-admin.model.ts)
  - Khởi tạo bảng `AccountAdmin` với các trường đơn giản: `fullName`, `email`, `role`, và `password`. Không sử dụng Enum hay khóa phụ phức tạp theo đúng yêu cầu.

- **Validator (Joi):** [auth.validator.ts](file:///d:/SWP/swp391-su26-ai-audit-project-swp391_se20a04_group-03-1/src/backend/validators/auth.validator.ts)
  - Bộ kiểm duyệt dữ liệu khắt khe trước khi chạm vào CSDL. Mọi thông tin rác hay email sai định dạng sẽ bị chặn lập tức bằng Joi và trả về thông báo lỗi 400 thân thiện.

- **Controller (Bcryptjs):** [auth.controller.ts](file:///d:/SWP/swp391-su26-ai-audit-project-swp391_se20a04_group-03-1/src/backend/controllers/auth.controller.ts)
  - Thực thi quy trình đăng ký:
    1. Kiểm tra Validate qua Joi.
    2. Chặn các trường hợp đăng ký bằng email đã tồn tại.
    3. **Bảo mật:** Băm (hash) mật khẩu mạnh mẽ bằng chuỗi Salt (10 vòng lặp) của thư viện `bcryptjs`.
    4. Lưu bản ghi dữ liệu vào CSDL MongoDB.

- **Router Configuration:**
  - [auth.router.ts](file:///d:/SWP/swp391-su26-ai-audit-project-swp391_se20a04_group-03-1/src/backend/routers/auth.router.ts) cấu hình đường dẫn nội bộ cho chức năng Auth.
  - [index.ts (routers)](file:///d:/SWP/swp391-su26-ai-audit-project-swp391_se20a04_group-03-1/src/backend/routers/index.ts) tập hợp tất cả thành `rootRouter`.
  - [index.ts (main)](file:///d:/SWP/swp391-su26-ai-audit-project-swp391_se20a04_group-03-1/src/backend/index.ts) tích hợp toàn bộ các APIs vào tiền tố nhánh `/api`.

---

## 🛡️ Kết quả chạy kiểm thử hệ thống

> [!TIP]
> Backend đã biên dịch và khởi động thành công trên cổng 4000. Dữ liệu khi đăng ký ngoài frontend sẽ đi qua quá trình chặn lỗi nghiêm ngặt của Just-Validate, sau đó được gửi lên Backend Joi kiểm chứng lần hai, mã hóa an toàn và ghi nhận vĩnh viễn vào hệ cơ sở dữ liệu MongoDB.

Bây giờ bạn chỉ cần mở các terminal cho cả 2 cổng (`npm run dev` ở Frontend và Backend) là toàn bộ tính năng này có thể hoạt động hoàn hảo!
```

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

```text
- Sử dụng Just-Validate để xác thực Frontend
- Sử dụng Joi để validate Backend
- Model AccountAdmin với các trường: fullName, email, role, password
- Router Auth kết nối tới API: POST http://localhost:4000/api/auth/register
- API sẽ xử lý logic đăng ký: kiểm tra email đã tồn tại, băm mật khẩu với bcryptjs, lưu vào MongoDB
```

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
- Chỉ lấy được đoạn mã trong phần Backend, phần frontend cần chỉnh sửa lại
- Cần thêm điều kiện ràng buộc về phần Frontend
- Tính năng của hàm trong validator AI sử dụng trong controller nhưng em đã tách ra thành 1 middleware và nhúng vào route auth (em đã chỉnh sửa trong file auth.router.ts)
```

#### 4.5. Minh chứng

| Loại minh chứng | Nội dung |
|---|---|
| Link commit | https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a04_group-03-1/compare/feat/de191024-computer-vision...main |
| File liên quan |  |
| Screenshot |  |
| Kết quả chạy/test |  |
| Link video demo |  |
| Ghi chú khác |  |

#### 4.6. Nhận xét cá nhân/nhóm

```text
Viết tại đây...
```


### Lần sử dụng AI số 4

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 24/05/2026 |
| Công cụ AI | Gemini / Claude / GitHub Copilot / Cursor / Antigravity |
| Mục đích sử dụng | Hỗ trợ xây dựng và tối ưu Computer Vision Service |
| Phần việc liên quan | Testing / Debug / Design / Requirement|
| Mức độ sử dụng | Hỗ trợ ý tưởng |

#### 4.1. Prompt đã sử dụng

```text
computer-vision/
├── models/                  # Nơi lưu trữ các file trọng số AI (.pt, .onnx)
│   ├── best.pt              # File weight YOLO chuyên dò biển số xe
│   └── container_model.pt   # File weight YOLO chuyên dò mã container (nếu có)
│
├── src/                     # Toàn bộ mã nguồn chính của hệ thống
│   ├── __init__.py
│   ├── config.py            # Lưu các hằng số: URL Backend, Port Flask, Thống số Camera
│   ├── services/
│   │   ├── ai_processor.py  # Hàm xử lý YOLO + EasyOCR cốt lõi
│   │   └── api_client.py    # Hàm chuyên gọi requests.post sang NodeJS Backend
│   └── app.py               # File chạy chính (Khởi chạy Flask Server phát stream)
│
├── tests/                   # Thư mục chứa các file nháp, test nhanh phần cứng
│   ├── test_camera.py       # Script đơn giản test xem Iriun Webcam có lên hình không
│   └── quick_test_cv.py     # File test nháp cũ của bạn (giữ lại để đối chiếu)
│
├── .gitignore               # Bỏ qua môi trường ảo (venv) và các file log khi push lên GitHub
├── requirements.txt         # Danh sách các thư viện Python cần cài đặt
└── venv/                    # Thư mục môi trường ảo của Python (Tự động sinh ra)    

dựa vào cấu trúc thư mục như này và xem file python mẫu và tôi đã gửi, hãy phân tích thư mục src/computer-vision và hoàn thành các tính năng chính cho tôi[quick_test_cv.py](file;file:///d%3A/SWP/computer-vision/quick_test_cv.py) 
```

#### 4.2. Kết quả AI gợi ý

```text
AI đã triển khai hỗ trợ và gợi ý với các nội dung sau:
- AI gợi ý kế hoạch triển khai Computer Vision Service bằng Flask.
- AI hỗ trợ thiết kế cấu trúc thư mục và tổ chức module Python.
- AI gợi ý tích hợp YOLOv8 và EasyOCR cho nhận diện biển số và container.
- AI hỗ trợ xây dựng cơ chế cooldown de-duplication tránh gửi dữ liệu OCR trùng lặp.
- AI hỗ trợ xây dựng Flask API cho stream video và health check.
- AI hỗ trợ xử lý lỗi import package trong Python project.
- AI hỗ trợ kiểm thử và xác minh hoạt động của hệ thống Computer Vision.
```

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

```text
- AI gợi ý kế hoạch triển khai Computer Vision Service bằng Flask.
- AI hỗ trợ thiết kế cấu trúc thư mục và tổ chức module Python.
- AI gợi ý tích hợp YOLOv8 và EasyOCR cho nhận diện biển số và container.
- AI hỗ trợ xây dựng cơ chế cooldown de-duplication tránh gửi dữ liệu OCR trùng lặp.
- AI hỗ trợ xây dựng Flask API cho stream video và health check.
- AI hỗ trợ xử lý lỗi import package trong Python project.
- AI hỗ trợ kiểm thử và xác minh hoạt động của hệ thống Computer Vision.
```

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
Sử dụng nguyên văn các gợi ý từ AI để có thể xây dựng phần Computer Vision.
```

#### 4.5. Minh chứng

| Loại minh chứng | Nội dung |
|---|---|
| Link commit | https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a04_group-03-1/compare/feat/de191024-computer-vision...main |
| File liên quan |  |
| Screenshot |  |
| Kết quả chạy/test |  |
| Link video demo |  |
| Ghi chú khác |  |

#### 4.6. Nhận xét cá nhân/nhóm

```text
Viết tại đây...
```

---

### Lần sử dụng AI số 5

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 24/05/2026 |
| Công cụ AI | Antigravity |
| Mục đích sử dụng | Phát triển tính năng đặt lịch hẹn |
| Phần việc liên quan | coding|
| Mức độ sử dụng | Hỏi hướng dẫn  |

#### 4.1. Prompt đã sử dụng

```text
Module 1: 	Đặt lịch xe container vào cảng
	Doanh nghiệp vận tải đặt trước khung giờ cho xe container vào cảng. Hệ thống kiểm tra:

	Dữ liệu	Ý nghĩa
	Biển số xe	Xác định xe
	Tài xế	Người điều khiển xe
	Mã container	Container cần giao/nhận
	Mã booking	Liên kết với lệnh giao/nhận
	Khung giờ	Slot được phép vào cảng
	Trạng thái	Chờ duyệt, đã xác nhận, đã vào, đã ra, hủy

Từ module 1 như trên, hãy cho tôi work-flow chi tiết 
```

#### 4.2. Kết quả AI gợi ý

```text
AI đã phân tích và thiết kế một Workflow chi tiết cho quá trình đặt lịch, bao gồm các giai đoạn:
1. **Trước khi đến cảng (Pre-arrival):** Doanh nghiệp vận tải nhập thông tin tạo lịch hẹn. Hệ thống kiểm tra sức chứa (Capacity) theo khung giờ để tránh quá tải.
2. **Khi đến cổng (At Gate):** So khớp dữ liệu lịch hẹn với kết quả quét AI (biển số, mã container).
3. **Trong cảng (In-yard):** Thay đổi trạng thái lịch hẹn thành "Đã vào".
4. **Hoàn thành (Completion):** Xe rời cảng, đổi trạng thái thành "Đã ra".
Đồng thời, AI còn vạch ra các API cần thiết (`POST /appointments`, `GET /appointments`, `PATCH /appointments/:id/status`) và cách triển khai trên Frontend.
```

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

```text
- Áp dụng Workflow này làm kim chỉ nam để xây dựng toàn bộ Module 1.
- Xây dựng giao diện Frontend (`/admin/appointments`) hiển thị danh sách lịch hẹn bằng Data Table phân trang (Pagination).
- Xây dựng form Thêm mới/Chỉnh sửa (`/admin/appointments/edit/[id]`) sử dụng `just-validate` để bắt lỗi nhập liệu.
- Viết Backend API (Router, Controller, Model `appointment.model.ts`) xử lý các bộ lọc tìm kiếm (từ ngày... đến ngày...) và phân trang trực tiếp từ Database.
```

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
- Nhóm đã liên tục trao đổi với AI (Antigravity) qua nhiều prompt tiếp theo để fix các lỗi phát sinh trong quá trình code như: Frontend không gọi được API, lỗi Route `params.id` bị thiếu `await` trong Next.js.
- Nhóm chủ động yêu cầu AI làm thêm tính năng **"Thùng rác" (Soft Delete)**: Thêm nút "Xóa tạm", tạo trang chứa lịch hẹn đã xóa, và nút "Khôi phục" hoặc "Xóa vĩnh viễn" - những tính năng nâng cao không có trong prompt gốc.
```

#### 4.5. Minh chứng

| Loại minh chứng | Nội dung |
|---|---|
| Link commit | https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a04_group-03-1/commit/e6fd46150a16a218258cd199ed650e8116842f0c |
| File liên quan | `src/frontend/src/app/admin/appointments/page.tsx`, `src/backend/controllers/appointment.controller.ts` |
| Screenshot | (Ảnh màn hình danh sách lịch hẹn và Thùng rác) |
| Kết quả chạy/test | Form validate chính xác, lọc và phân trang 10 items/trang hoạt động tốt, API xử lý nhanh chóng. |
| Link video demo |  |
| Ghi chú khác | Prompt này là bước đệm tuyệt vời để thiết kế kiến trúc hệ thống trước khi lao vào code. |

#### 4.6. Nhận xét cá nhân/nhóm

```text
Viết tại đây...
```

### Lần sử dụng AI số 6

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 25/05/2026 |
| Công cụ AI | GithubCopilot, Gemini |
| Mục đích sử dụng | Xây dựng cấu trúc thư mục cho mobile app, triển khai các trang giao diện cần thiết cho một tài xế sử dụng mobile  |
| Phần việc liên quan | coding|
| Mức độ sử dụng | Hỏi hướng dẫn  |

#### 6.1. Prompt đã sử dụng

```text
Từ bối cảnh trên, bạn là 1 senior đầy kinh nghiệm về reactnative mobile app, trong phần mobile expo đi từ src/mobile , hãy dùng các component từ shadcn ui hoặc các thư viện có sẵn, tạo cho tôi các trang cần thiết và quan trọng cho dự án. Những trang giao diện sẽ nằm trong mobile-expo/src/component/pages. Yêu cầu về giao diện: dễ nhìn, dễ hiểu và dễ thao tác, màu sắc nhẹ nhàng kết hợp với hình ảnh thiết kế UI của stitch mà tôi đinhs kèm. Bây giờ hãy thiết kế trang dashboard, trang dashboard yêu cầu trong trang dashboard có hiển thị mã QR khi bấm vào button, tài xế chỉ việc đưa mã QR cho người quản lý nhà xe để quét, kết hợp ý tưởng mà bạn đã đưa ra cùng với việc xử lý nghiệp vụ
```

#### 6.2. Kết quả AI gợi ý

```text
Mục tiêu chính: ưu tiên quét QR nhanh (QR-first) và hiển thị Driver Pass tức thì.
UI/UX:
Thêm/điều chỉnh màn quét QR lớn, khung QR tập trung ở trên cùng, kích thước và padding giảm để thao tác nhanh hơn.
Hiển thị DriverPassModal ngay khi quét hợp lệ, kèm haptics/feedback.
Thêm toast/snackbar vị trí top-right cho thông báo đăng nhập/scan (đã mở rộng Snackbar để hỗ trợ vị trí).
Card và block nội dung được compact (giới hạn maxWidth, giảm padding) để tránh chiếm chỗ thừa trên màn nhỏ.
Header của ScreenShell giảm kích thước để cân bằng không gian.
Tích hợp hoạt động:
Liên kết chặt với auth store (điều hướng về (tabs) sau login/guest, nhận authToast để show toast).
Quét → xử lý luồng (validate → show modal → commit) đã được nối với state hiện tại.
File chính thay đổi: DashboardScreen.tsx, Dashboard.style.ts, DriverPassModal (component), Snackbar.tsx (vị trí), và một vài chỉnh style chung (ScreenShell.tsx).
```

#### 6.3. Phần sinh viên/nhóm đã sử dụng từ AI

```text
Mục tiêu: ưu tiên quét QR (QR-first) và hiển thị Driver Pass tức thì.
Giao diện & bố cục:
Thêm khung quét QR lớn, đặt ở vị trí nổi bật trên đầu màn hình để quét nhanh.
Giảm padding / thu nhỏ các card và giới hạn maxWidth để giao diện compact, phù hợp màn nhỏ.
Giảm kích thước header trong ScreenShell để nhường không gian cho QR.
Tương tác & phản hồi:
Khi quét hợp lệ: tự động mở DriverPassModal và bật phản hồi haptics.
Thông báo đăng nhập/scan dùng Snackbar với vị trí top-right (đã mở rộng component để hỗ trợ vị trí).
Luồng quét → validate → show modal → commit đã nối với auth store (điều hướng về (tabs) sau login/guest).
Files (chỉnh sửa chính):
DashboardScreen.tsx — UI/flow quét QR.
Dashboard.style.ts — compact layout, kích thước QR/card.
ScreenShell.tsx — giảm header/padding chung.
Snackbar.tsx — hỗ trợ vị trí top-right.
DriverPassModal (component) — hiển thị dữ liệu sau quét.
```

#### 6.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
Mục tiêu: ưu tiên quét QR (QR-first) và hiển thị Driver Pass tức thì.
Giao diện: giảm padding, giới hạn maxWidth, khung QR lớn ở vị trí nổi bật, header nhỏ lại để nhường không gian QR.
Hành vi: quét → validate → mở DriverPassModal → commit; kích hoạt haptics; thông báo dùng Snackbar vị trí top-right.
```

#### 6.5. Minh chứng

| Loại minh chứng | Nội dung |
|---|---|
| Link commit | https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a04_group-03-1/commit/3b0ab134fd71c7c94878970ab11ce884027974d3 |
| File liên quan | `src/frontend_mobile-expo/src/modules/dashboard/screens/DashboardScreen.tsx`, `src/frontend_mobile-expo/src/modules/dashboard/components/DriverPassModal.tsx`,  |
| Screenshot | (Ảnh màn hình trang dashboard) |
| Kết quả chạy/test |Khi quét hợp lệ: tự động mở DriverPassModal và bật phản hồi haptics. Thông báo đăng nhập/scan dùng Snackbar với vị trí top-right (đã mở rộng component để hỗ trợ vị trí). Luồng quét → validate → show modal → commit đã nối với auth store (điều hướng về (tabs) sau login/guest). |
| Link video demo |  |
| Ghi chú khác | Prompt này cho phep tai xe co the su dung truc tiep nhanh chong. |

#### 6.6. Nhận xét cá nhân/nhóm

```text
Viết tại đây...
```

---

### Lần sử dụng AI số 7

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 25/05/2026 |
| Công cụ AI | GithubCopilot, Gemini |
| Mục đích sử dụng | Xây dựng trang lịch hẹn   |
| Phần việc liên quan | coding|
| Mức độ sử dụng | Hỏi hướng dẫn  |

#### 7.1. Prompt đã sử dụng

```text
Từ bối cảnh trên, bạn là 1 senior đầy kinh nghiệm về reactnative mobile app, trong phần mobile expo đi từ src/mobile , hãy dùng các component từ shadcn ui hoặc các thư viện có sẵn, tạo cho tôi các trang cần thiết và quan trọng cho dự án. Những trang giao diện sẽ nằm trong mobile-expo/src/component/pages. Yêu cầu về giao diện: dễ nhìn, dễ hiểu và dễ thao tác, màu sắc nhẹ nhàng kết hợp với hình ảnh thiết kế UI của stitch mà tôi đinhs kèm. Bây giờ hãy thiết kế trang dashboard, trang dashboard yêu cầu trong trang dashboard có hiển thị mã QR khi bấm vào button, tài xế chỉ việc đưa mã QR cho người quản lý nhà xe để quét, kết hợp ý tưởng mà bạn đã đưa ra cùng với việc xử lý nghiệp vụ
```

#### 7.2. Kết quả AI gợi ý

```text
AI đã phân tích và thiết kế một Workflow chi tiết cho quá trình đặt lịch, bao gồm các giai đoạn:
1. **Trước khi đến cảng (Pre-arrival):** Doanh nghiệp vận tải nhập thông tin tạo lịch hẹn. Hệ thống kiểm tra sức chứa (Capacity) theo khung giờ để tránh quá tải.
2. **Khi đến cổng (At Gate):** So khớp dữ liệu lịch hẹn với kết quả quét AI (biển số, mã container).
3. **Trong cảng (In-yard):** Thay đổi trạng thái lịch hẹn thành "Đã vào".
4. **Hoàn thành (Completion):** Xe rời cảng, đổi trạng thái thành "Đã ra".
Đồng thời, AI còn vạch ra các API cần thiết (`POST /appointments`, `GET /appointments`, `PATCH /appointments/:id/status`) và cách triển khai trên Frontend.
```

#### 7.3. Phần sinh viên/nhóm đã sử dụng từ AI

```text
- Áp dụng Workflow này làm kim chỉ nam để xây dựng toàn bộ Module 1.
- Xây dựng giao diện Frontend (`/admin/appointments`) hiển thị danh sách lịch hẹn bằng Data Table phân trang (Pagination).
- Xây dựng form Thêm mới/Chỉnh sửa (`/admin/appointments/edit/[id]`) sử dụng `just-validate` để bắt lỗi nhập liệu.
- Viết Backend API (Router, Controller, Model `appointment.model.ts`) xử lý các bộ lọc tìm kiếm (từ ngày... đến ngày...) và phân trang trực tiếp từ Database.
```

#### 7.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
- Nhóm đã liên tục trao đổi với AI (Antigravity) qua nhiều prompt tiếp theo để fix các lỗi phát sinh trong quá trình code như: Frontend không gọi được API, lỗi Route `params.id` bị thiếu `await` trong Next.js.
- Nhóm chủ động yêu cầu AI làm thêm tính năng **"Thùng rác" (Soft Delete)**: Thêm nút "Xóa tạm", tạo trang chứa lịch hẹn đã xóa, và nút "Khôi phục" hoặc "Xóa vĩnh viễn" - những tính năng nâng cao không có trong prompt gốc.
```

#### 7.5. Minh chứng

| Loại minh chứng | Nội dung |
|---|---|
| Link commit | https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a04_group-03-1/commit/e6fd46150a16a218258cd199ed650e8116842f0c |
| File liên quan | `src/frontend/src/app/admin/appointments/page.tsx`, `src/backend/controllers/appointment.controller.ts` |
| Screenshot | (Ảnh màn hình danh sách lịch hẹn và Thùng rác) |
| Kết quả chạy/test | Form validate chính xác, lọc và phân trang 10 items/trang hoạt động tốt, API xử lý nhanh chóng. |
| Link video demo |  |
| Ghi chú khác | Prompt này là bước đệm tuyệt vời để thiết kế kiến trúc hệ thống trước khi lao vào code. |

#### 7.6. Nhận xét cá nhân/nhóm

```text
Viết tại đây...
```

---

### Lần sử dụng AI số 8

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 25/05/2026 |
| Công cụ AI | GithubCopilot, Gemini |
| Mục đích sử dụng | Xây dựng cấu trúc thư mục cho mobile app, triển khai các trang giao diện cần thiết cho một tài xế sử dụng mobile  |
| Phần việc liên quan | coding|
| Mức độ sử dụng | Hỏi hướng dẫn  |

#### 8.1. Prompt đã sử dụng

```text
Từ bối cảnh trên, bạn là 1 senior đầy kinh nghiệm về reactnative mobile app, trong phần mobile expo đi từ src/mobile , hãy dùng các component từ shadcn ui hoặc các thư viện có sẵn, tạo cho tôi các trang cần thiết và quan trọng cho dự án. Những trang giao diện sẽ nằm trong mobile-expo/src/component/pages. Yêu cầu về giao diện: dễ nhìn, dễ hiểu và dễ thao tác, màu sắc nhẹ nhàng kết hợp với hình ảnh thiết kế UI của stitch mà tôi đinhs kèm. Bây giờ hãy thiết kế trang dashboard, trang dashboard yêu cầu trong trang dashboard có hiển thị mã QR khi bấm vào button, tài xế chỉ việc đưa mã QR cho người quản lý nhà xe để quét, kết hợp ý tưởng mà bạn đã đưa ra cùng với việc xử lý nghiệp vụ
```

#### 8.2. Kết quả AI gợi ý

```text
AI đã phân tích và thiết kế một Workflow chi tiết cho quá trình đặt lịch, bao gồm các giai đoạn:
1. **Trước khi đến cảng (Pre-arrival):** Doanh nghiệp vận tải nhập thông tin tạo lịch hẹn. Hệ thống kiểm tra sức chứa (Capacity) theo khung giờ để tránh quá tải.
2. **Khi đến cổng (At Gate):** So khớp dữ liệu lịch hẹn với kết quả quét AI (biển số, mã container).
3. **Trong cảng (In-yard):** Thay đổi trạng thái lịch hẹn thành "Đã vào".
4. **Hoàn thành (Completion):** Xe rời cảng, đổi trạng thái thành "Đã ra".
Đồng thời, AI còn vạch ra các API cần thiết (`POST /appointments`, `GET /appointments`, `PATCH /appointments/:id/status`) và cách triển khai trên Frontend.
```

#### 8.3. Phần sinh viên/nhóm đã sử dụng từ AI

```text
- Áp dụng Workflow này làm kim chỉ nam để xây dựng toàn bộ Module 1.
- Xây dựng giao diện Frontend (`/admin/appointments`) hiển thị danh sách lịch hẹn bằng Data Table phân trang (Pagination).
- Xây dựng form Thêm mới/Chỉnh sửa (`/admin/appointments/edit/[id]`) sử dụng `just-validate` để bắt lỗi nhập liệu.
- Viết Backend API (Router, Controller, Model `appointment.model.ts`) xử lý các bộ lọc tìm kiếm (từ ngày... đến ngày...) và phân trang trực tiếp từ Database.
```

#### 8.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
- Nhóm đã liên tục trao đổi với AI (Antigravity) qua nhiều prompt tiếp theo để fix các lỗi phát sinh trong quá trình code như: Frontend không gọi được API, lỗi Route `params.id` bị thiếu `await` trong Next.js.
- Nhóm chủ động yêu cầu AI làm thêm tính năng **"Thùng rác" (Soft Delete)**: Thêm nút "Xóa tạm", tạo trang chứa lịch hẹn đã xóa, và nút "Khôi phục" hoặc "Xóa vĩnh viễn" - những tính năng nâng cao không có trong prompt gốc.
```

#### 8.5. Minh chứng

| Loại minh chứng | Nội dung |
|---|---|
| Link commit | https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a04_group-03-1/commit/e6fd46150a16a218258cd199ed650e8116842f0c |
| File liên quan | `src/frontend/src/app/admin/appointments/page.tsx`, `src/backend/controllers/appointment.controller.ts` |
| Screenshot | (Ảnh màn hình danh sách lịch hẹn và Thùng rác) |
| Kết quả chạy/test | Form validate chính xác, lọc và phân trang 10 items/trang hoạt động tốt, API xử lý nhanh chóng. |
| Link video demo |  |
| Ghi chú khác | Prompt này là bước đệm tuyệt vời để thiết kế kiến trúc hệ thống trước khi lao vào code. |

#### 8.6. Nhận xét cá nhân/nhóm

```text
Viết tại đây...
```

---

## 5. Bảng tổng hợp mức độ sử dụng AI

Đánh dấu mức độ AI hỗ trợ ở từng hạng mục.

| Hạng mục | Không dùng AI | AI hỗ trợ ít | AI hỗ trợ nhiều | AI sinh chính | Ghi chú |
|---|:---:|:---:|:---:|:---:|---|
| Phân tích yêu cầu |  |  |  |  |  |
| Viết user story/use case |  |  |  |  |  |
| Thiết kế database |  |  |  |  |  |
| Thiết kế kiến trúc hệ thống |  |  |  |  |  |
| Thiết kế giao diện |  |  |  |  |  |
| Code frontend |  |  |  |  |  |
| Code backend |  |  |  |  |  |
| Debug lỗi |  |  |  |  |  |
| Viết test case |  |  |  |  |  |
| Kiểm thử sản phẩm |  |  |  |  |  |
| Tối ưu code |  |  |  |  |  |
| Viết báo cáo |  |  |  |  |  |
| Làm slide thuyết trình |  |  |  |  |  |

---

## 6. Các lỗi hoặc hạn chế từ AI

Ghi lại các trường hợp AI trả lời sai, thiếu, chưa phù hợp hoặc sinh code không chạy.

| STT | Lỗi/hạn chế từ AI | Cách phát hiện | Cách xử lý/cải tiến |
|---:|---|---|---|
| 1 |  |  |  |
| 2 |  |  |  |
| 3 |  |  |  |

---

## 7. Kiểm chứng kết quả AI

Mô tả cách sinh viên/nhóm kiểm tra lại kết quả do AI gợi ý.

Có thể bao gồm:

- Chạy thử chương trình
- Viết test case
- So sánh với yêu cầu đề bài
- Kiểm tra output
- Đối chiếu tài liệu môn học
- Hỏi lại giảng viên
- Review cùng thành viên nhóm
- Kiểm tra lỗi bảo mật
- Kiểm tra bằng dữ liệu mẫu
- So sánh trước và sau khi dùng AI

### Nội dung kiểm chứng

```text
Viết tại đây...
```

---

## 8. Đóng góp cá nhân hoặc đóng góp nhóm

### 8.1. Đối với bài cá nhân

Mô tả phần sinh viên tự làm, phần AI hỗ trợ và phần đã tự cải tiến.

```text
Viết tại đây...
```

### 8.2. Đối với bài nhóm

| Thành viên | MSSV | Nhiệm vụ chính | Có sử dụng AI không? | Minh chứng đóng góp |
|---|---|---|---|---|
|  |  |  | Có / Không |  |
|  |  |  | Có / Không |  |
|  |  |  | Có / Không |  |
|  |  |  | Có / Không |  |

---

## 9. Reflection cuối bài

### 9.1. AI đã hỗ trợ em/nhóm ở điểm nào?

```text
Viết tại đây...
```

### 9.2. Phần nào em/nhóm không sử dụng theo gợi ý của AI? Vì sao?

```text
Viết tại đây...
```

### 9.3. Em/nhóm đã kiểm tra tính đúng đắn của kết quả AI như thế nào?

```text
Viết tại đây...
```

### 9.4. Nếu không có AI, phần nào sẽ khó khăn nhất?

```text
Viết tại đây...
```

### 9.5. Sau bài tập/project này, em/nhóm học được gì về môn học?

```text
Viết tại đây...
```

### 9.6. Sau bài tập/project này, em/nhóm học được gì về cách sử dụng AI có trách nhiệm?

```text
Viết tại đây...
```

---

## 10. Cam kết học thuật

Sinh viên/nhóm cam kết rằng:

- Nội dung AI hỗ trợ đã được ghi nhận trung thực.
- Không nộp nguyên văn kết quả AI mà không kiểm tra.
- Có khả năng giải thích các phần đã nộp.
- Chịu trách nhiệm về tính đúng đắn của sản phẩm cuối cùng.
- Hiểu rằng việc sử dụng AI không khai báo có thể ảnh hưởng đến kết quả đánh giá.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
|  |  |
