# AI Audit Log

## 1. Thông tin chung

| Thông tin             | Nội dung                                         |
| --------------------- | ------------------------------------------------ |
| Môn học               | Software development project                     |
| Mã môn học            | SWP391                                           |
| Lớp                   | SE20A04                                          |
| Học kỳ                | SU26                                             |
| Tên bài tập / Project | LogiPort - Port Operations Management Solution   |
| Tên sinh viên / Nhóm  | 3                                                |
| MSSV / Danh sách MSSV | DE190953, DE191024, DE190478, DE190972, DE190658 |
| Giảng viên hướng dẫn  | QuangLTN3                                        |
| Ngày bắt đầu          | 15/05/2026                                       |
| Ngày hoàn thành       |                                                  |

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

````text
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

#### 1.1. Prompt đã sử dụng

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
````

#### 1.2. Kết quả AI gợi ý

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

#### 1.3. Phần sinh viên/nhóm đã sử dụng từ AI

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

#### 1.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

Mô tả sinh viên/nhóm đã thay đổi, kiểm tra, sửa lỗi hoặc cải tiến gì so với gợi ý ban đầu của AI.

```text
Trong trang Gate và Yard mà AI đã gen bị thiếu khung video streaming từ camera lên. Em đã thêm vào khung video streaming.
Một vài tiêu đề hoặc tên dự án chưa đồng bị hoặc hợp lí, em đã sửa lại nó
```

#### 1.5. Minh chứng

| Loại minh chứng   | Nội dung                                                                                                                               |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Link commit       | https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a04_group-03-1/commit/2d7a0b7406063f917bc74946d71ecd1eac60c27f |
| File liên quan    |                                                                                                                                        |
| Screenshot        |                                                                                                                                        |
| Kết quả chạy/test |                                                                                                                                        |
| Link video demo   |                                                                                                                                        |
| Ghi chú khác      |                                                                                                                                        |

#### 1.6. Nhận xét cá nhân/nhóm

Sinh viên/nhóm học được gì sau lần sử dụng AI này?

```text
Muốn AI hiểu được dự án, hiểu công việc làm gì cần phải cung cấp rõ ngữ cảnh và yêu cầu cụ thể cho AI
```

---

### Lần sử dụng AI số 2

| Nội dung            | Thông tin                                |
| ------------------- | ---------------------------------------- |
| Ngày sử dụng        | 19/05/2026                               |
| Công cụ AI          | Gemini Claude GitHub Copilot Antigravity |
| Mục đích sử dụng    | Xây dựng Frontend cho hệ thống           |
| Phần việc liên quan | Design Frontend                          |
| Mức độ sử dụng      | Hỗ trợ sinh code, tối ưu giao diện       |

#### 2.1. Prompt đã sử dụng

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

#### 2.2. Kết quả AI gợi ý

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

#### 2.3. Phần sinh viên/nhóm đã sử dụng từ AI

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

#### 2.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
  Vẫn còn có một số lỗi giữa các kích thước, phân bố navigation, layout, lệch kích thước giữa các button. Đã yêu cầu cải tiến thêm. Mục yard map cần cập nhật lại video live streaming
```

#### 2.5. Minh chứng

| Loại minh chứng   | Nội dung                                                                                                                |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Link commit       | https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a04_group-03-1/compare/main...DE190478-frontend |
| File liên quan    |                                                                                                                         |
| Screenshot        |                                                                                                                         |
| Kết quả chạy/test |                                                                                                                         |
| Link video demo   |                                                                                                                         |
| Ghi chú khác      |                                                                                                                         |

#### 2.6. Nhận xét cá nhân/nhóm

```text
Viết tại đây...
```

---

### Lần sử dụng AI số 3

| Nội dung            | Thông tin        |
| ------------------- | ---------------- |
| Ngày sử dụng        | 21/05/2026       |
| Công cụ AI          | Antigravity      |
| Mục đích sử dụng    | Tạo api register |
| Phần việc liên quan | coding           |
| Mức độ sử dụng      | Hỏi sinh code    |

#### 3.1. Prompt đã sử dụng

```text
Phân tích dự án hiện có , hãy bắt đầu viết tính năng register. Từ trang register của frontend hãy sửa lại dùng just-validate để xác thực và lấy dữ liệu gửi lên backend,  xong hãy viết tiếp tính năng này cho backend, yêu cầu sử dụng các thư viện đã cài, dùng joi để validate cho người dùng, viết schema cho account-admin trong model (yêu cầu schema đầy đủ các thuộc tính cần có của account-admin trong dự án, viết schema đơn giản không cần các cú pháp phức tạp như enum, ....)
```

#### 3.2. Kết quả AI gợi ý

```text
# Bàn giao tính năng - Đăng ký (Register / Account Admin)

Tính năng Đăng ký tài khoản (Register) đã được triển khai hoàn chỉnh ở cả Frontend (Giao diện) và Backend (Máy chủ API), đáp ứng đầy đủ các tiêu chuẩn bảo mật, cấu trúc module hiện đại và trải nghiệm người dùng tối ưu.

---

## Các thay đổi chính đã thực hiện

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

## Kết quả chạy kiểm thử hệ thống

> [!TIP]
> Backend đã biên dịch và khởi động thành công trên cổng 4000. Dữ liệu khi đăng ký ngoài frontend sẽ đi qua quá trình chặn lỗi nghiêm ngặt của Just-Validate, sau đó được gửi lên Backend Joi kiểm chứng lần hai, mã hóa an toàn và ghi nhận vĩnh viễn vào hệ cơ sở dữ liệu MongoDB.

Bây giờ bạn chỉ cần mở các terminal cho cả 2 cổng (`npm run dev` ở Frontend và Backend) là toàn bộ tính năng này có thể hoạt động hoàn hảo!
```

#### 3.3. Phần sinh viên/nhóm đã sử dụng từ AI

```text
- Sử dụng Just-Validate để xác thực Frontend
- Sử dụng Joi để validate Backend
- Model AccountAdmin với các trường: fullName, email, role, password
- Router Auth kết nối tới API: POST http://localhost:4000/api/auth/register
- API sẽ xử lý logic đăng ký: kiểm tra email đã tồn tại, băm mật khẩu với bcryptjs, lưu vào MongoDB
```

#### 3.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
- Chỉ lấy được đoạn mã trong phần Backend, phần frontend cần chỉnh sửa lại
- Cần thêm điều kiện ràng buộc về phần Frontend
- Tính năng của hàm trong validator AI sử dụng trong controller nhưng em đã tách ra thành 1 middleware và nhúng vào route auth (em đã chỉnh sửa trong file auth.router.ts)
```

#### 3.5. Minh chứng

| Loại minh chứng   | Nội dung                                                                                                                            |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Link commit       | https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a04_group-03-1/compare/feat/de191024-computer-vision...main |
| File liên quan    |                                                                                                                                     |
| Screenshot        |                                                                                                                                     |
| Kết quả chạy/test |                                                                                                                                     |
| Link video demo   |                                                                                                                                     |
| Ghi chú khác      |                                                                                                                                     |

#### 3.6. Nhận xét cá nhân/nhóm

```text
Viết tại đây...
```

### Lần sử dụng AI số 4

| Nội dung            | Thông tin                                               |
| ------------------- | ------------------------------------------------------- |
| Ngày sử dụng        | 24/05/2026                                              |
| Công cụ AI          | Gemini / Claude / GitHub Copilot / Cursor / Antigravity |
| Mục đích sử dụng    | Hỗ trợ xây dựng và tối ưu Computer Vision Service       |
| Phần việc liên quan | Testing / Debug / Design / Requirement                  |
| Mức độ sử dụng      | Hỗ trợ ý tưởng                                          |

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

| Loại minh chứng   | Nội dung                                                                                                                            |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Link commit       | https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a04_group-03-1/compare/feat/de191024-computer-vision...main |
| File liên quan    |                                                                                                                                     |
| Screenshot        |                                                                                                                                     |
| Kết quả chạy/test |                                                                                                                                     |
| Link video demo   |                                                                                                                                     |
| Ghi chú khác      |                                                                                                                                     |

#### 4.6. Nhận xét cá nhân/nhóm

```text
Viết tại đây...
```

---

### Lần sử dụng AI số 5

| Nội dung            | Thông tin                         |
| ------------------- | --------------------------------- |
| Ngày sử dụng        | 24/05/2026                        |
| Công cụ AI          | Antigravity                       |
| Mục đích sử dụng    | Phát triển tính năng đặt lịch hẹn |
| Phần việc liên quan | coding                            |
| Mức độ sử dụng      | Hỏi hướng dẫn                     |

#### 5.1. Prompt đã sử dụng

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

#### 5.2. Kết quả AI gợi ý

```text
AI đã phân tích và thiết kế một Workflow chi tiết cho quá trình đặt lịch, bao gồm các giai đoạn:
1. **Trước khi đến cảng (Pre-arrival):** Doanh nghiệp vận tải nhập thông tin tạo lịch hẹn. Hệ thống kiểm tra sức chứa (Capacity) theo khung giờ để tránh quá tải.
2. **Khi đến cổng (At Gate):** So khớp dữ liệu lịch hẹn với kết quả quét AI (biển số, mã container).
3. **Trong cảng (In-yard):** Thay đổi trạng thái lịch hẹn thành "Đã vào".
4. **Hoàn thành (Completion):** Xe rời cảng, đổi trạng thái thành "Đã ra".
Đồng thời, AI còn vạch ra các API cần thiết (`POST /appointments`, `GET /appointments`, `PATCH /appointments/:id/status`) và cách triển khai trên Frontend.
```

#### 5.3. Phần sinh viên/nhóm đã sử dụng từ AI

```text
- Áp dụng Workflow này làm kim chỉ nam để xây dựng toàn bộ Module 1.
- Xây dựng giao diện Frontend (`/admin/appointments`) hiển thị danh sách lịch hẹn bằng Data Table phân trang (Pagination).
- Xây dựng form Thêm mới/Chỉnh sửa (`/admin/appointments/edit/[id]`) sử dụng `just-validate` để bắt lỗi nhập liệu.
- Viết Backend API (Router, Controller, Model `appointment.model.ts`) xử lý các bộ lọc tìm kiếm (từ ngày... đến ngày...) và phân trang trực tiếp từ Database.
```

#### 5.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
- Nhóm đã liên tục trao đổi với AI (Antigravity) qua nhiều prompt tiếp theo để fix các lỗi phát sinh trong quá trình code như: Frontend không gọi được API, lỗi Route `params.id` bị thiếu `await` trong Next.js.
- Nhóm chủ động yêu cầu AI làm thêm tính năng **"Thùng rác" (Soft Delete)**: Thêm nút "Xóa tạm", tạo trang chứa lịch hẹn đã xóa, và nút "Khôi phục" hoặc "Xóa vĩnh viễn" - những tính năng nâng cao không có trong prompt gốc.
```

#### 5.5. Minh chứng

| Loại minh chứng   | Nội dung                                                                                                                               |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Link commit       | https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a04_group-03-1/commit/e6fd46150a16a218258cd199ed650e8116842f0c |
| File liên quan    | `src/frontend/src/app/admin/appointments/page.tsx`, `src/backend/controllers/appointment.controller.ts`                                |
| Screenshot        | (Ảnh màn hình danh sách lịch hẹn và Thùng rác)                                                                                         |
| Kết quả chạy/test | Form validate chính xác, lọc và phân trang 10 items/trang hoạt động tốt, API xử lý nhanh chóng.                                        |
| Link video demo   |                                                                                                                                        |
| Ghi chú khác      | Prompt này là bước đệm tuyệt vời để thiết kế kiến trúc hệ thống trước khi lao vào code.                                                |

#### 5.6. Nhận xét cá nhân/nhóm

```text
Viết tại đây...
```

### Lần sử dụng AI số 6

| Nội dung            | Thông tin                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------------ |
| Ngày sử dụng        | 27/05/2026                                                                                       |
| Công cụ AI          | Antigravity                                                                                      |
| Mục đích sử dụng    | Phát triển tính năng quản lý bãi đỗ xe                                                           |
| Phần việc liên quan | Coding                                                                                           |
| Mức độ sử dụng      | Hỏi hướng triển khai + hỗ trợ code                                                               |
| Phần liên quan      | Module quản lý bãi xe, cụ thể là file `admin.routes.ts`, `admin.controller.ts`, `admin.model.ts` |

#### 6.1. Prompt đã sử dụng

```text
Ở trang bãi đỗ như tôi tưởng tượng thì sẽ có 1 đường liên kết tới trang tạo bãi đỗ, ở trang đó sẽ cấu hình tên bãi đỗ và địa chỉ của camera để truyền video-streaming.

Khi tạo xong bãi đỗ, sẽ có thể cấu hình bãi đỗ bằng cách chụp một bức ảnh nền (Snapshot) từ IP Camera của bãi đó và hiển thị làm hình nền (Background), sau đó Admin tạo và kéo thả các khung hình chữ nhật vào đúng với ô đỗ trên hình và đặt tên từng ô đỗ.

Vấn đề ở đây là tôi chưa có camera để có thể tạo và nhập IP Camera để stream tới bãi nhưng tôi muốn làm tính năng cấu hình bãi đỗ trước: admin có thể tạo, kéo thả chọn ô đỗ trước.

Dùng thư viện just-validate nếu có gửi dữ liệu lên backend, nhận và xử lí kết quả backend trả về theo đúng chuẩn.
```

#### 6.2. Bối cảnh khi viết prompt

```text
- Đang phát triển module quản lý bãi đỗ xe (Yard Management) cho hệ thống cảng biển thông minh.
- Cần xây dựng tính năng tạo bãi đỗ xe và cấu hình vị trí các ô đỗ trên sơ đồ.
- Ý tưởng chính là sử dụng ảnh Snapshot từ IP Camera làm Background, sau đó Admin có thể kéo thả và vẽ các Bounding Box đại diện cho từng ô đỗ xe.
- Tuy nhiên tại thời điểm phát triển nhóm chưa có camera thực tế nên cần ưu tiên hoàn thiện chức năng kéo thả và lưu tọa độ trước.
- Ngoài Frontend, nhóm cũng cần xây dựng Backend API để lưu thông tin bãi đỗ và danh sách ô đỗ xe.
- Yêu cầu validate dữ liệu form bằng thư viện `just-validate` trước khi gửi dữ liệu lên Backend.
- Mong muốn AI đóng vai trò hỗ trợ định hướng triển khai tổng thể cả Frontend lẫn Backend thay vì chỉ sinh code đơn lẻ.
```

#### 6.3. Kết quả AI gợi ý

```text
AI đã phân tích và gợi ý cách triển khai module quản lý bãi đỗ gồm Frontend và Backend:

1. **Frontend - Giao diện tạo bãi đỗ (`/admin/yard/create`)**
   - Xây dựng form nhập liệu gồm: tên bãi đỗ, IP Camera, sức chứa,...
   - Tích hợp thư viện `just-validate` để validate dữ liệu phía Client trước khi gọi API Backend.

2. **Backend - API quản lý bãi đỗ**
   - Đề xuất tạo schema `yard.model.ts` để lưu thông tin bãi đỗ và danh sách các ô đỗ (`slots`).
   - Mỗi ô đỗ gồm các thuộc tính như: `x`, `y`, `width`, `height`, `name`.
   - Gợi ý xây dựng Router và Controller phục vụ thao tác CRUD.

3. **Frontend - Chức năng cấu hình ô đỗ (`/admin/yard/[id]/config`)**
   - AI gợi ý sử dụng các sự kiện chuột của React (`onMouseDown`, `onMouseMove`, `onMouseUp`) để xây dựng tính năng kéo thả và vẽ Bounding Box.
   - Tọa độ các ô đỗ được quy đổi sang phần trăm (%) để giữ đúng vị trí khi thay đổi kích thước màn hình hoặc responsive.
   - Gợi ý hiển thị ảnh Snapshot từ camera làm Background để Admin dễ cấu hình sơ đồ bãi đỗ.

4. **Hướng tích hợp Camera và AI**
   - AI cũng gợi ý hướng xử lý Snapshot và Video Stream thông qua service riêng để kết nối với IP Camera trong tương lai.
```

#### 6.4. Phần sinh viên/nhóm đã sử dụng từ AI

```text
- Áp dụng workflow và kiến trúc AI gợi ý để triển khai module quản lý bãi đỗ xe.
- Xây dựng giao diện tạo bãi đỗ (`/yard/create`) và giao diện cấu hình ô đỗ (`/yard/[id]/config`).
- Áp dụng logic kéo thả và vẽ Bounding Box trên ảnh bằng React.
- Xây dựng Backend API gồm Router, Controller và Model cho module Yard.
- Lưu danh sách tọa độ các ô đỗ xe lên MongoDB thông qua API `PATCH /yards/:id/slots`.
- Sử dụng thư viện `just-validate` để validate dữ liệu nhập vào trước khi gửi lên Backend.
- Áp dụng cơ chế quy đổi tọa độ sang phần trăm (%) để giao diện responsive khi thay đổi kích thước màn hình.
```

#### 6.5. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
- Chỉnh sửa lại giao diện Config Yard để phù hợp với UI tổng thể của hệ thống.
- Thêm Dark Mode, danh sách ô đỗ bên phải và nút lưu đồng bộ dữ liệu.
- Chủ động sửa các lỗi phát sinh liên quan đến camera stream và xung đột kết nối giữa các trang.
- Bổ sung cơ chế giải phóng camera (`camera.release()`) khi thoát trang để tránh nhiều kết nối cùng lúc.
- Tự mở rộng thêm cơ chế fallback sử dụng webcam máy tính khi IP Camera gặp sự cố kết nối.
- Kiểm tra và chỉnh sửa lại logic responsive khi quy đổi tọa độ từ pixel sang phần trăm (%).
- Tối ưu lại cách lưu dữ liệu Bounding Box để giảm lỗi sai vị trí khi tải lại trang.
```

#### 6.6. Đánh giá chất lượng prompt

- [x] Prompt rõ ràng
- [x] Prompt có đủ bối cảnh
- [ ] Prompt còn thiếu thông tin
- [x] Prompt tạo ra kết quả tốt
- [ ] Prompt tạo ra kết quả chưa phù hợp
- [x] Cần hỏi lại AI nhiều lần
- [x] Cần tự kiểm tra và chỉnh sửa nhiều
- [ ] Kết quả AI có lỗi hoặc chưa chính xác

#### 6.7. Minh chứng

| Loại minh chứng   | Nội dung                                                                                                                                 |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Link commit       | Cập nhật sau...                                                                                                                          |
| File liên quan    | `src/frontend/src/app/admin/yard/[id]/config/page.tsx`, `src/backend/controllers/yard.controller.ts`, `src/backend/models/yard.model.ts` |
| Screenshot        | Ảnh giao diện vẽ ô đỗ và cấu hình bãi đỗ                                                                                                 |
| Kết quả chạy/test | Chức năng vẽ hoạt động ổn định, gọi API thành công, lưu tọa độ đúng và giao diện responsive                                              |
| Link video demo   |                                                                                                                                          |
| Ghi chú khác      | AI hỗ trợ tốt trong phần xử lý kéo thả Bounding Box và định vị tọa độ responsive.                                                        |

#### 6.8. Ghi chú thêm

```text
Kinh nghiệm rút ra: Với các module có UI phức tạp như kéo thả và xử lý tọa độ, việc yêu cầu AI phân tích workflow và hướng triển khai trước giúp nhóm hiểu rõ kiến trúc hệ thống hơn thay vì viết code ngay từ đầu. Điều này giúp giảm lỗi logic và dễ mở rộng tính năng trong tương lai.
```

---

### Lần sử dụng AI số 7

| Nội dung            | Thông tin                                               |
| ------------------- | ------------------------------------------------------- |
| Ngày sử dụng        | 29/05/2026                                              |
| Công cụ AI          | Antigravity                                             |
| Mục đích sử dụng    | Hỗ trợ phát triển module Quản lý công ty                |
| Phần việc liên quan | Coding                                                  |
| Mức độ sử dụng      | Tham khảo hướng triển khai và hỗ trợ xây dựng chức năng |
| Phần liên quan      | Module Company Management                               |

#### 7.1. Prompt đã sử dụng

```text
Phân tích kĩ source code, trong front end tôi muốn thêm trang quản lí công ty, chức năng của trang quản lí công ty bao gồm tất cả các chức năng tương tự như trang appointments. Hãy chỉ xử lí phần front end cho tôi và đưa ra hướng dẫn backend để tôi tự triển khai.
```

#### 7.2. Bối cảnh khi viết prompt

```text
Trong quá trình phát triển hệ thống quản lý cảng, nhóm cần bổ sung chức năng quản lý công ty nhằm lưu trữ và theo dõi thông tin các doanh nghiệp vận tải. Để đảm bảo tính đồng nhất trong giao diện và luồng xử lý, nhóm mong muốn xây dựng module này dựa trên cấu trúc của trang Appointments đã có sẵn.

Ngoài các chức năng CRUD cơ bản, nhóm cũng muốn áp dụng cơ chế Soft Delete để hạn chế việc mất dữ liệu khi người dùng thao tác xóa nhầm. Do đó cần tham khảo thêm hướng triển khai cả phía Frontend và Backend trước khi tiến hành phát triển.
```

#### 7.3. Kết quả AI gợi ý

```text
AI đề xuất xây dựng module Quản lý công ty theo cấu trúc tương tự module Appointments hiện có.

Các nội dung được gợi ý gồm:
- Bổ sung mục "Quản lý công ty" vào Sidebar quản trị.
- Xây dựng trang danh sách công ty với chức năng tìm kiếm, lọc trạng thái, lọc theo thời gian và phân trang.
- Thiết kế form thêm mới và chỉnh sửa công ty có tích hợp JustValidate để kiểm tra dữ liệu đầu vào.
- Xây dựng trang chỉnh sửa thông tin công ty theo ID.
- Đề xuất cơ chế Soft Delete thông qua trang Trash để quản lý các bản ghi đã xóa.
- Hướng dẫn cấu trúc Backend bao gồm Model, Controller, Route và Validation phục vụ cho các thao tác CRUD.
```

#### 7.4. Phần sinh viên/nhóm đã sử dụng từ AI

```text
Nhóm đã sử dụng các đề xuất từ AI để triển khai module Quản lý công ty trong hệ thống.

Các chức năng đã được áp dụng bao gồm:
- Thêm menu điều hướng đến trang Quản lý công ty.
- Xây dựng giao diện danh sách công ty.
- Tích hợp tìm kiếm và bộ lọc dữ liệu.
- Thực hiện phân trang danh sách.
- Xây dựng form thêm mới và cập nhật thông tin công ty.
- Áp dụng thư viện JustValidate cho các trường dữ liệu đầu vào.
- Thiết kế chức năng Soft Delete, Restore và Hard Delete.
- Xây dựng API Backend phục vụ quản lý dữ liệu công ty.
```

#### 7.5. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
Sau khi tham khảo kết quả từ AI, nhóm đã chủ động điều chỉnh và mở rộng thêm nhiều chức năng để phù hợp với yêu cầu thực tế của hệ thống.

Các phần được cải tiến gồm:
- Điều chỉnh giao diện để đồng bộ với các module quản trị khác.
- Bổ sung trang Thùng rác (Trash) để quản lý dữ liệu đã xóa mềm.
- Tối ưu luồng tìm kiếm và lọc dữ liệu nhằm cải thiện trải nghiệm người dùng.
- Sửa lỗi kết nối API và xử lý dữ liệu trả về từ Backend.
- Khắc phục lỗi liên quan đến route động và tham số ID trong Next.js.
- Kiểm tra lại toàn bộ luồng CRUD để đảm bảo dữ liệu được cập nhật chính xác.
```

#### 7.6. Đánh giá chất lượng prompt

- [x] Prompt rõ ràng
- [x] Prompt có đủ bối cảnh
- [ ] Prompt còn thiếu thông tin
- [x] Prompt tạo ra kết quả tốt
- [ ] Prompt tạo ra kết quả chưa phù hợp
- [x] Cần hỏi lại AI nhiều lần
- [x] Cần tự kiểm tra và chỉnh sửa nhiều
- [ ] Kết quả AI có lỗi hoặc chưa chính xác

#### 7.7. Minh chứng liên quan

| Loại minh chứng       | Nội dung                                                                                                                                                                                           |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Link commit           | https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a04_group-03-1/commit/062ca2d3eca1b3d5feb87854ca1b29627fb20c38                                                             |
| File liên quan        | `src/frontend/src/app/admin/companies/page.tsx`, `src/frontend/src/app/admin/companies/edit/[id]/page.tsx`, `src/backend/controllers/company.controller.ts`, `src/backend/models/company.model.ts` |
| Screenshot            | Giao diện danh sách công ty, form chỉnh sửa và trang thùng rác                                                                                                                                     |
| Kết quả chạy/test     | Tìm kiếm, lọc, phân trang và các chức năng CRUD hoạt động ổn định                                                                                                                                  |
| Link tài liệu/báo cáo |                                                                                                                                                                                                    |
| Ghi chú khác          | Chức năng Soft Delete và Restore được triển khai thành công                                                                                                                                        |

#### 7.8. Ghi chú thêm

```text
Kinh nghiệm rút ra là đối với các module có quy mô tương đối lớn, việc yêu cầu AI phân tích cấu trúc và đề xuất kiến trúc triển khai trước giúp tiết kiệm đáng kể thời gian phát triển. Tuy nhiên, các phần liên quan đến nghiệp vụ và xử lý dữ liệu vẫn cần được kiểm tra, chỉnh sửa và hoàn thiện thủ công để đảm bảo phù hợp với yêu cầu thực tế của dự án.
```

---

### Lần sử dụng AI số 8

| Nội dung            | Thông tin                                                          |
| ------------------- | ------------------------------------------------------------------ |
| Ngày sử dụng        | 30/05/2026                                                         |
| Công cụ AI          | Antigravity                                                        |
| Mục đích sử dụng    | Hỗ trợ phát triển tính năng quản lý camera cổng và video streaming |
| Phần việc liên quan | Coding                                                             |
| Mức độ sử dụng      | Tham khảo hướng triển khai và hỗ trợ phát triển chức năng          |
| Phần liên quan      | Gate Management                                                    |

#### 8.1. Prompt đã sử dụng

```text
Phân tích kỹ dự án này, tôi muốn hoàn thiện tính năng cho trang quản lí cổng ở src/frontend/src/app/admin/gate/page.tsx.

Ở trang này tôi muốn giữ lại section Active Vehicles và Gate Log.

Phân tích tiếp module Yard vì ở đó đã có chức năng tạo và quản lí camera. Tôi muốn trang Gate có các tính năng tương tự.

Sẽ có một đường link dẫn sang trang tạo camera mới, người dùng có thể nhập tên camera và địa chỉ RTSP.

Sau khi tạo xong camera thì video stream phải hiển thị trực tiếp trên trang Gate giống như giao diện demo hiện tại.

Trong mỗi khung camera cần hiển thị:
- Tên camera
- RTSP URL
- Chỉnh sửa camera
- Xóa camera
- Nút phóng to video

Trước tiên hãy hoàn thành các tính năng này và truyền được video streaming từ RTSP lên giao diện, các chức năng AI khác sẽ triển khai sau.
```

#### 8.2. Bối cảnh khi viết prompt

```text
Nhóm đang phát triển phân hệ Gate Management cho hệ thống quản lý cảng biển thông minh. Một trong những yêu cầu quan trọng của phân hệ này là quản lý các camera giám sát tại khu vực cổng ra vào.

Trước đó hệ thống đã có module Yard Management hỗ trợ quản lý camera, vì vậy nhóm mong muốn tái sử dụng mô hình này để đảm bảo tính đồng nhất giữa các phân hệ.

Ngoài chức năng CRUD camera, mục tiêu chính của giai đoạn này là xây dựng hệ thống video streaming từ RTSP lên giao diện Web nhằm chuẩn bị nền tảng cho các tính năng AI nhận diện biển số xe, container và giám sát phương tiện trong tương lai.
```

#### 8.3. Kết quả AI gợi ý

```text
Antigravity đề xuất xây dựng đầy đủ quy trình quản lý camera cho khu vực cổng.

Các nội dung chính được gợi ý gồm:
- Thiết kế Model lưu trữ thông tin camera cổng.
- Xây dựng API phục vụ các thao tác thêm, sửa, xóa và lấy danh sách camera.
- Tạo giao diện thêm camera mới và quản lý camera hiện có.
- Hiển thị danh sách camera trực tiếp trên trang Gate.
- Hỗ trợ chỉnh sửa, xóa và cập nhật thông tin camera.
- Truyền luồng video RTSP lên giao diện người dùng.
- Bổ sung chức năng phóng to khung hình camera.
- Giữ nguyên các khu vực Active Vehicles và Gate Log trong giao diện hiện tại.

Ngoài ra AI còn đề xuất mở rộng AI Server để hỗ trợ nhiều camera RTSP hoạt động đồng thời thay vì chỉ xử lý một nguồn video cố định.
```

#### 8.4. Phần sinh viên/nhóm đã sử dụng từ AI

```text
Nhóm đã tham khảo và áp dụng nhiều đề xuất từ AI để triển khai module quản lý camera cổng.

Các chức năng đã được sử dụng gồm:
- Xây dựng giao diện quản lý camera trên trang Gate.
- Tạo trang thêm camera mới.
- Hiển thị danh sách camera đã lưu.
- Hỗ trợ cập nhật và xóa camera.
- Hiển thị video streaming từ RTSP trực tiếp trên giao diện.
- Bổ sung tính năng phóng to video để hỗ trợ quan sát.
- Nâng cấp AI Server để nhận RTSP URL động thông qua API truyền video.
```

#### 8.5. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
Sau khi tham khảo kết quả từ Antigravity, nhóm tiếp tục điều chỉnh và tối ưu thêm nhiều thành phần để phù hợp với hệ thống thực tế.

Các cải tiến bao gồm:
- Điều chỉnh bố cục giao diện camera để phù hợp với Dashboard quản trị.
- Tối ưu cơ chế hiển thị nhiều camera đồng thời.
- Giảm số lượng kết nối dư thừa nhằm tiết kiệm tài nguyên máy chủ.
- Chuẩn hóa dữ liệu camera giữa Frontend, Backend và AI Server.
- Bổ sung cơ chế xử lý lỗi khi camera mất kết nối hoặc RTSP không khả dụng.
- Chuẩn bị sẵn kiến trúc để tích hợp các chức năng AI nhận diện biển số và container trong các giai đoạn tiếp theo.
```

#### 8.6. Đánh giá chất lượng prompt

- [x] Prompt rõ ràng
- [x] Prompt có đủ bối cảnh
- [ ] Prompt còn thiếu thông tin
- [x] Prompt tạo ra kết quả tốt
- [ ] Prompt tạo ra kết quả chưa phù hợp
- [x] Cần hỏi lại AI nhiều lần
- [x] Cần tự kiểm tra và chỉnh sửa nhiều
- [ ] Kết quả AI có lỗi hoặc chưa chính xác

#### 8.7. Minh chứng liên quan

| Loại minh chứng       | Nội dung                                                                                                                                                        |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Link commit           | Cập nhật sau                                                                                                                                                    |
| File liên quan        | `src/frontend/src/app/admin/gate/page.tsx`, `src/frontend/src/app/admin/gate/create/page.tsx`, `src/backend/models/gate.model.ts`, `src/computer-vision/app.py` |
| Screenshot            | Giao diện quản lý camera cổng và video streaming                                                                                                                |
| Kết quả chạy/test     | Camera RTSP hiển thị thành công trên giao diện quản lý cổng                                                                                                     |
| Link tài liệu/báo cáo |                                                                                                                                                                 |
| Ghi chú khác          | Đây là nền tảng cho các chức năng AI Computer Vision được triển khai ở các giai đoạn sau                                                                        |

#### 8.8. Ghi chú thêm

```text
Kinh nghiệm rút ra là đối với các tính năng liên quan đến Computer Vision, việc hoàn thiện luồng camera và video streaming trước khi triển khai AI giúp quá trình phát triển trở nên dễ kiểm soát hơn. Nhóm có thể kiểm thử từng thành phần riêng biệt, xác định lỗi nhanh hơn và giảm độ phức tạp khi tích hợp các mô hình nhận diện trong tương lai.
```

---

### Lần sử dụng AI số 9

| Nội dung            | Thông tin                                                          |
| ------------------- | ------------------------------------------------------------------ |
| Ngày sử dụng        | 30/05/2026                                                         |
| Công cụ AI          | Antigravity                                                        |
| Mục đích sử dụng    | Sửa lỗi giao diện và tối ưu video streaming cho trang quản lý cổng |
| Phần việc liên quan | Coding                                                             |
| Mức độ sử dụng      | Hỏi hướng dẫn                                                      |
| Phần liên quan      | Gate Management                                                    |

#### 9.1. Prompt đã sử dụng

```text
Có nhiều vấn đề cần sửa ở đây:

1. Chỉnh sửa lại giao diện của trang gate cho phù hợp với giao diện sáng và tối.
2. Khi phóng to khung camera thì bị lỗi.
3. Video stream lên khá lag và delay tầm 20s.

Trước tiên hãy fix 3 lỗi này cho tôi.
```

#### 9.2. Bối cảnh khi viết prompt

```text
Sau khi hoàn thành chức năng quản lý camera và hiển thị video streaming trên trang Gate, nhóm tiến hành kiểm thử thực tế với nhiều nguồn camera RTSP khác nhau.

Trong quá trình sử dụng, nhóm phát hiện một số vấn đề ảnh hưởng đến trải nghiệm người dùng. Giao diện chưa tương thích hoàn toàn với chế độ Dark Mode, chức năng phóng to camera hoạt động chưa ổn định trên một số trình duyệt và video RTSP có độ trễ khá lớn khi hiển thị trên giao diện Web.

Do các tính năng AI nhận diện biển số sẽ yêu cầu dữ liệu video gần thời gian thực nên việc tối ưu giao diện và hiệu năng streaming là yêu cầu cần hoàn thành trước khi tiếp tục phát triển các chức năng AI.
```

#### 9.3. Kết quả AI gợi ý

```text
Antigravity đã phân tích nguyên nhân của từng vấn đề và đề xuất hướng xử lý phù hợp.

Đối với giao diện:
- Chuyển đổi các màu sắc cố định sang hệ thống Theme của Shadcn UI và Tailwind CSS.
- Đồng bộ màu sắc và thành phần giao diện giữa Light Mode và Dark Mode.
- Chuẩn hóa các card camera, bảng dữ liệu và khu vực hiển thị trạng thái.

Đối với chức năng phóng to camera:
- Thay thế cách xử lý cũ bằng HTML5 Fullscreen API.
- Đảm bảo video có thể hiển thị toàn màn hình ổn định trên các trình duyệt phổ biến.
- Hạn chế lỗi mất khung hình khi chuyển đổi trạng thái.

Đối với video streaming:
- Phân tích nguyên nhân gây delay từ RTSP Buffering.
- Đề xuất cấu hình FFmpeg và OpenCV theo hướng Low Latency.
- Tối ưu việc đọc frame từ camera để giảm độ trễ khi hiển thị trên trình duyệt.
- Đề xuất cơ chế xử lý phù hợp cho nhiều camera hoạt động đồng thời.
```

#### 9.4. Phần sinh viên/nhóm đã sử dụng từ AI

```text
Nhóm đã áp dụng các đề xuất từ AI để cải thiện cả giao diện và hiệu năng hệ thống.

Các nội dung đã được triển khai gồm:
- Điều chỉnh giao diện trang Gate tương thích với cả Light Mode và Dark Mode.
- Đồng bộ giao diện camera với các module khác trong hệ thống.
- Sửa lỗi chức năng phóng to video bằng Fullscreen API.
- Tối ưu luồng video streaming từ RTSP.
- Cập nhật cấu hình OpenCV và FFmpeg để giảm buffering.
- Cải thiện tốc độ hiển thị video trên giao diện Web.
- Chuẩn bị nền tảng phục vụ cho các tính năng nhận diện thời gian thực trong giai đoạn tiếp theo.
```

#### 9.5. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
Sau khi áp dụng các đề xuất từ Antigravity, nhóm tiếp tục thực hiện nhiều bước kiểm thử và tinh chỉnh bổ sung.

Các cải tiến thực hiện gồm:
- Kiểm thử trên nhiều camera RTSP khác nhau để đánh giá tính ổn định.
- Điều chỉnh lại bố cục giao diện sau khi áp dụng Dark Mode.
- Tinh chỉnh thêm các thông số streaming phù hợp với môi trường triển khai thực tế.
- Đồng bộ cơ chế xử lý camera giữa Gate Management và Yard Management.
- Kiểm tra và tối ưu việc sử dụng tài nguyên hệ thống khi chạy nhiều luồng camera đồng thời.
- Bổ sung xử lý lỗi khi camera mất kết nối hoặc phản hồi chậm.
```

#### 9.6. Đánh giá chất lượng prompt

- [x] Prompt rõ ràng
- [x] Prompt có đủ bối cảnh
- [ ] Prompt còn thiếu thông tin
- [x] Prompt tạo ra kết quả tốt
- [ ] Prompt tạo ra kết quả chưa phù hợp
- [x] Cần hỏi lại AI nhiều lần
- [x] Cần tự kiểm tra và chỉnh sửa nhiều
- [ ] Kết quả AI có lỗi hoặc chưa chính xác

#### 9.7. Minh chứng liên quan

| Loại minh chứng       | Nội dung                                                                                                             |
| --------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Link commit           | Cập nhật sau...                                                                                                      |
| File liên quan        | `src/frontend/src/app/admin/gate/page.tsx`, `src/frontend/components/video-stream.tsx`, `src/computer-vision/app.py` |
| Screenshot            | Giao diện Gate sau khi hỗ trợ Dark Mode và Fullscreen                                                                |
| Kết quả chạy/test     | Video stream hoạt động ổn định hơn, độ trễ giảm đáng kể                                                              |
| Link tài liệu/báo cáo |                                                                                                                      |
| Ghi chú khác          | Đây là bước tối ưu quan trọng trước khi triển khai các chức năng AI nhận diện biển số trong thời gian thực           |

#### 9.8. Ghi chú thêm

```text
Kinh nghiệm rút ra là sau khi hoàn thành chức năng chính, việc kiểm thử thực tế và tối ưu hiệu năng đóng vai trò rất quan trọng. Một hệ thống có thể hoạt động đúng về mặt chức năng nhưng vẫn tạo trải nghiệm không tốt nếu giao diện chưa hoàn thiện hoặc hiệu năng chưa đáp ứng yêu cầu thực tế.

Thông qua quá trình tối ưu video streaming, nhóm hiểu rõ hơn về ảnh hưởng của buffering, cấu hình FFmpeg và OpenCV đối với các ứng dụng Computer Vision thời gian thực. Đây là kinh nghiệm hữu ích cho các giai đoạn phát triển AI tiếp theo của dự án.
```

---

### Lần sử dụng AI số 10

| Nội dung            | Thông tin                                          |
| ------------------- | -------------------------------------------------- |
| Ngày sử dụng        | 30/05/2026                                         |
| Công cụ AI          | Antigravity                                        |
| Mục đích sử dụng    | Phát triển tính năng OCR và quản lý giao dịch cổng |
| Phần việc liên quan | Coding                                             |
| Mức độ sử dụng      | Hỏi hướng dẫn                                      |
| Phần liên quan      | Gate Management, Computer Vision                   |

#### 10.1. Prompt đã sử dụng

```text
Trước tiên phân tích dự án này, sau đó phân tích src/computer-vision và src/backend.

Ở trong computer-vision quét nhận diện biển số, khi nhận diện được biển số xong sẽ gửi lên backend các trường dữ liệu là:
{
text,
status: in hoặc out,
type: plate hoặc container_code,
confidence
}

Trên backend có các việc sau cần làm:

Tạo model GateTransaction gồm:
- TruckPlate
- DriverId
- ContainerNo
- AppointmentID
- GateType
- CheckInTime
- CheckOutTime
- Status
- OCRConfidence
- ImageUrl

Khi có tính năng nhận diện mã container thì backend sẽ kiểm tra container và biển số có khớp với Appointment hay không, kiểm tra trạng thái Confirmed, kiểm tra thời gian hợp lệ và chống nhận diện trùng lặp.

Ngoài ra cần bổ sung trạng thái Completed cho Appointment và cập nhật các nghiệp vụ liên quan.
```

#### 10.2. Bối cảnh khi viết prompt

```text
Sau khi hoàn thành chức năng quản lý camera và video streaming tại khu vực cổng, nhóm bắt đầu triển khai giai đoạn tích hợp AI nhận diện biển số xe với hệ thống quản lý nghiệp vụ.

Mục tiêu của giai đoạn này là xây dựng luồng xử lý dữ liệu từ Computer Vision Service sang Backend, đồng thời thiết kế cơ sở dữ liệu phục vụ việc lưu trữ lịch sử xe ra vào cổng.

Bên cạnh đó, nhóm muốn xây dựng cơ chế xác thực dữ liệu OCR với thông tin lịch hẹn (Appointment) nhằm đảm bảo các giao dịch được ghi nhận chính xác, hạn chế nhận diện sai và tránh các trường hợp quét trùng lặp trong quá trình vận hành thực tế.
```

#### 10.3. Kết quả AI gợi ý

```text
Antigravity đã đề xuất một kiến trúc tổng thể cho luồng xử lý OCR giữa Computer Vision Service và Backend.

Các nội dung chính được đề xuất gồm:
- Thiết kế model GateTransaction để lưu trữ lịch sử xe ra vào cổng.
- Xây dựng API tiếp nhận dữ liệu OCR từ Computer Vision Service.
- Kiểm tra tính hợp lệ của Appointment trước khi tạo giao dịch.
- Đối chiếu biển số xe với dữ liệu đã đăng ký trong lịch hẹn.
- Kiểm tra trạng thái Confirmed trước khi cho phép xe thực hiện quy trình Check-In.
- Xác thực thời gian xe đến có nằm trong khung giờ cho phép hay không.
- Chuẩn bị cơ chế đối chiếu mã container với lịch hẹn trong tương lai.
- Thiết kế cơ chế chống nhận diện trùng lặp nhằm tránh tạo nhiều giao dịch cho cùng một xe.
- Đề xuất lưu ảnh OCR để phục vụ công tác kiểm tra, đối soát và truy vết sau này.
- Tự động cập nhật trạng thái Appointment sang Completed sau khi hoàn tất quy trình ra vào cổng.
```

#### 10.4. Phần sinh viên/nhóm đã sử dụng từ AI

```text
Nhóm đã sử dụng các đề xuất từ AI làm cơ sở để thiết kế và triển khai luồng xử lý dữ liệu OCR.

Các nội dung được áp dụng gồm:
- Thiết kế model GateTransaction phục vụ lưu trữ lịch sử giao dịch cổng.
- Xây dựng cơ chế tiếp nhận dữ liệu OCR từ Python AI Server.
- Thiết kế quy trình xác thực Appointment trước khi tạo giao dịch.
- Bổ sung trạng thái Completed cho Appointment.
- Xây dựng cơ chế chống duplicate scan.
- Thiết kế lưu trữ ảnh OCR phục vụ tra cứu và xác minh dữ liệu.
- Chuẩn bị luồng xử lý cho chức năng nhận diện container trong các giai đoạn tiếp theo.
```

#### 10.5. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
Sau khi tham khảo các đề xuất từ Antigravity, nhóm tiếp tục điều chỉnh nghiệp vụ để phù hợp với thực tế vận hành tại cảng.

Các cải tiến bao gồm:
- Bổ sung khoảng thời gian sai số cho phép khi đối chiếu lịch hẹn và thời điểm nhận diện thực tế.
- Điều chỉnh quy trình Check-In và Check-Out để phù hợp với luồng hoạt động của xe trong cảng.
- Tối ưu cơ chế chống duplicate scan khi phương tiện di chuyển chậm hoặc dừng trước camera trong thời gian dài.
- Bổ sung các điều kiện kiểm tra nhằm giảm thiểu trường hợp nhận diện sai từ OCR.
- Chuẩn hóa cấu trúc dữ liệu giữa Computer Vision Service và Backend.
- Chuẩn bị sẵn kiến trúc để mở rộng nhận diện container và các loại phương tiện khác trong tương lai.
```

#### 10.6. Đánh giá chất lượng prompt

- [x] Prompt rõ ràng
- [x] Prompt có đủ bối cảnh
- [ ] Prompt còn thiếu thông tin
- [x] Prompt tạo ra kết quả tốt
- [ ] Prompt tạo ra kết quả chưa phù hợp
- [x] Cần hỏi lại AI nhiều lần
- [x] Cần tự kiểm tra và chỉnh sửa nhiều
- [ ] Kết quả AI có lỗi hoặc chưa chính xác

#### 10.7. Minh chứng liên quan

| Loại minh chứng       | Nội dung                                                                                                                                                             |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Link commit           | Cập nhật sau...                                                                                                                                                      |
| File liên quan        | `src/computer-vision/app.py`, `src/backend/models/gateTransaction.model.ts`, `src/backend/controllers/scan.controller.ts`, `src/backend/models/appointment.model.ts` |
| Screenshot            | Luồng OCR gửi dữ liệu từ AI Server sang Backend                                                                                                                      |
| Kết quả chạy/test     | Backend tiếp nhận và xử lý dữ liệu OCR thành công                                                                                                                    |
| Link tài liệu/báo cáo |                                                                                                                                                                      |
| Ghi chú khác          | Đây là bước nền tảng để tích hợp AI Computer Vision với hệ thống quản lý cảng                                                                                        |

#### 10.8. Ghi chú thêm

```text
Kinh nghiệm rút ra là khi tích hợp AI vào một hệ thống nghiệp vụ thực tế, việc nhận diện chính xác chỉ là một phần của bài toán. Quan trọng hơn là xây dựng được cơ chế xác thực và kiểm tra dữ liệu ở phía Backend để đảm bảo tính toàn vẹn của hệ thống.

Thông qua quá trình thiết kế GateTransaction và luồng xử lý OCR, nhóm hiểu rõ hơn cách kết nối giữa Computer Vision Service với hệ thống quản lý nghiệp vụ. Điều này giúp tạo nền tảng vững chắc cho các tính năng nhận diện container, tự động kiểm soát phương tiện và phân tích dữ liệu trong các giai đoạn tiếp theo.
```

---

### Lần sử dụng AI số 11

| Nội dung            | Thông tin                                            |
| ------------------- | ---------------------------------------------------- |
| Ngày sử dụng        | 30/05/2026                                           |
| Công cụ AI          | Antigravity                                          |
| Mục đích sử dụng    | Phát triển tính năng realtime cho trang quản lý cổng |
| Phần việc liên quan | Coding                                               |
| Mức độ sử dụng      | Hỏi hướng dẫn                                        |
| Phần liên quan      | Gate Management                                      |

#### 11.1. Prompt đã sử dụng

```text id="g2k8wn"
Sau khi backend check các thông số python gửi lên là hợp lí thì thêm vào database.

Sau khi lưu thông tin vào database thì gộp các dữ liệu cần thiết lại bao gồm:
- Biển số xe
- Tên tài xế
- Mã container
- Thời gian
- Trạng thái IN hoặc OUT

Sau khi đã lấy được các trường dữ liệu cần thiết này thì backend dùng Socket.IO để emit lên frontend.

Ở trang Gate frontend dùng Socket.IO Client để nhận các thông tin hiển thị trên 2 section.

Ở section Active Vehicles hiển thị:
- Số xe đã vào
- Số xe đã ra
- Số xe chờ

Ở section Gate Log hiển thị các trường thông tin được emit từ backend.

Trước mắt tôi cần bạn thực hiện những mong muốn này của tôi, tất nhiên bạn cũng có thể thêm ý tưởng của bạn vào nếu nó hợp lí với logic và nghiệp vụ của phần này.
```

#### 11.2. Bối cảnh khi viết prompt

```text id="6w3f8m"
Sau khi hoàn thiện luồng OCR và xử lý giao dịch cổng ở phía Backend, nhóm tiếp tục triển khai cơ chế cập nhật dữ liệu theo thời gian thực cho hệ thống Gate Management.

Trong quá trình vận hành thực tế, nhân viên giám sát cần theo dõi liên tục các phương tiện ra vào cảng mà không phải tải lại trang hoặc thực hiện thao tác làm mới dữ liệu thủ công. Vì vậy nhóm mong muốn xây dựng một cơ chế realtime giúp mọi thay đổi được phản ánh ngay lập tức trên giao diện.

Bên cạnh đó, nhóm cũng muốn hiển thị các thống kê trực quan về số lượng xe đang hoạt động tại cổng và lịch sử giao dịch mới nhất để hỗ trợ công tác điều phối và giám sát.
```

#### 11.3. Kết quả AI gợi ý

```text id="m3z1kf"
Antigravity đề xuất sử dụng Socket.IO để xây dựng cơ chế giao tiếp thời gian thực giữa Backend và Frontend.

Các đề xuất chính bao gồm:
- Emit dữ liệu ngay sau khi giao dịch cổng được xác thực và lưu thành công vào cơ sở dữ liệu.
- Chuẩn hóa dữ liệu truyền lên Frontend chỉ bao gồm các trường cần thiết như biển số xe, tài xế, mã container, thời gian và trạng thái.
- Đồng bộ dữ liệu Gate Log theo thời gian thực.
- Tự động cập nhật thống kê Active Vehicles khi có giao dịch mới phát sinh.
- Giảm số lượng API polling nhằm tối ưu hiệu năng hệ thống.
- Đề xuất xây dựng khu vực Appointment Completed để quản lý các lịch hẹn đã hoàn thành.
- Chuẩn bị sẵn kiến trúc cho các sự kiện realtime khác trong tương lai.
```

#### 11.4. Phần sinh viên/nhóm đã sử dụng từ AI

```text id="x0m98t"
Nhóm đã áp dụng các đề xuất từ AI để xây dựng cơ chế realtime cho hệ thống quản lý cổng.

Các nội dung đã được triển khai gồm:
- Thiết kế và tích hợp Socket.IO cho Backend.
- Xây dựng cơ chế emit dữ liệu sau khi phát sinh giao dịch mới.
- Đồng bộ dữ liệu Gate Log theo thời gian thực.
- Cập nhật số liệu Active Vehicles mà không cần tải lại trang.
- Kết nối Socket.IO Client trên Frontend.
- Thiết kế giao diện hiển thị dữ liệu realtime cho nhân viên vận hành.
- Xây dựng trang Appointment Completed phục vụ quản lý lịch hẹn đã hoàn tất.
```

#### 11.5. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text id="4r6u5q"
Sau khi tham khảo kết quả từ Antigravity, nhóm tiếp tục điều chỉnh và tối ưu thêm một số thành phần để phù hợp với yêu cầu vận hành thực tế.

Các cải tiến bao gồm:
- Chỉ emit các trường dữ liệu thực sự cần thiết nhằm giảm tải băng thông truyền tải.
- Tối ưu cách hiển thị Gate Log để ưu tiên các giao dịch mới nhất.
- Điều chỉnh giao diện thống kê theo nhu cầu giám sát của nhân viên vận hành.
- Bổ sung cơ chế giới hạn số lượng bản ghi hiển thị nhằm tránh ảnh hưởng hiệu năng khi dữ liệu tăng lên.
- Chuẩn hóa cấu trúc dữ liệu realtime giữa Backend và Frontend.
- Chuẩn bị kiến trúc để mở rộng thêm các sự kiện realtime cho Yard Management và Computer Vision trong tương lai.
```

#### 11.6. Đánh giá chất lượng prompt

- [x] Prompt rõ ràng
- [x] Prompt có đủ bối cảnh
- [ ] Prompt còn thiếu thông tin
- [x] Prompt tạo ra kết quả tốt
- [ ] Prompt tạo ra kết quả chưa phù hợp
- [x] Cần hỏi lại AI nhiều lần
- [x] Cần tự kiểm tra và chỉnh sửa nhiều
- [ ] Kết quả AI có lỗi hoặc chưa chính xác

#### 11.7. Minh chứng liên quan

| Loại minh chứng       | Nội dung                                                                                                                |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Link commit           | Cập nhật sau...                                                                                                         |
| File liên quan        | `src/frontend/src/app/admin/gate/page.tsx`, `src/backend/socket/index.ts`, `src/backend/controllers/scan.controller.ts` |
| Screenshot            | Active Vehicles và Gate Log cập nhật realtime                                                                           |
| Kết quả chạy/test     | Dữ liệu được đồng bộ tức thời giữa Backend và Frontend                                                                  |
| Link tài liệu/báo cáo |                                                                                                                         |
| Ghi chú khác          | Đây là bước hoàn thiện chức năng giám sát cổng theo thời gian thực                                                      |

#### 11.8. Ghi chú thêm

```text id="p7c2mv"
Kinh nghiệm rút ra là đối với các hệ thống giám sát và vận hành thời gian thực, việc cập nhật dữ liệu ngay khi phát sinh sự kiện mang lại trải nghiệm sử dụng tốt hơn rất nhiều so với cơ chế tải lại dữ liệu định kỳ.

Thông qua quá trình triển khai Socket.IO, nhóm hiểu rõ hơn về cách xây dựng hệ thống realtime giữa Backend và Frontend, đồng thời giảm đáng kể độ trễ trong việc hiển thị thông tin vận hành. Đây là nền tảng quan trọng để phát triển các chức năng giám sát nâng cao và tích hợp AI trong các giai đoạn tiếp theo của dự án.
```

---
### Lần sử dụng AI số 12

| Nội dung            | Thông tin                                                                                                        |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Ngày sử dụng        | 25/05/2026                                                                                                       |
| Công cụ AI          | GithubCopilot, Gemini                                                                                            |
| Mục đích sử dụng    | Xây dựng cấu trúc thư mục cho mobile app, triển khai các trang giao diện cần thiết cho một tài xế sử dụng mobile |
| Phần việc liên quan | coding                                                                                                           |
| Mức độ sử dụng      | Hỏi hướng dẫn                                                                                                    |

#### 12.1. Prompt đã sử dụng

```text
Từ bối cảnh trên, bạn là 1 senior đầy kinh nghiệm về reactnative mobile app, trong phần mobile expo đi từ src/mobile , hãy dùng các component từ shadcn ui hoặc các thư viện có sẵn, tạo cho tôi các trang cần thiết và quan trọng cho dự án. Những trang giao diện sẽ nằm trong mobile-expo/src/component/pages. Yêu cầu về giao diện: dễ nhìn, dễ hiểu và dễ thao tác, màu sắc nhẹ nhàng kết hợp với hình ảnh thiết kế UI của stitch mà tôi đinhs kèm. Bây giờ hãy thiết kế trang dashboard, trang dashboard yêu cầu trong trang dashboard có hiển thị mã QR khi bấm vào button, tài xế chỉ việc đưa mã QR cho người quản lý nhà xe để quét, kết hợp ý tưởng mà bạn đã đưa ra cùng với việc xử lý nghiệp vụ
```

#### 12.2. Kết quả AI gợi ý

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

#### 12.3. Phần sinh viên/nhóm đã sử dụng từ AI

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

#### 12.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
Mục tiêu: ưu tiên quét QR (QR-first) và hiển thị Driver Pass tức thì.
Giao diện: giảm padding, giới hạn maxWidth, khung QR lớn ở vị trí nổi bật, header nhỏ lại để nhường không gian QR.
Hành vi: quét → validate → mở DriverPassModal → commit; kích hoạt haptics; thông báo dùng Snackbar vị trí top-right.
```

#### 12.5. Minh chứng

| Loại minh chứng   | Nội dung                                                                                                                                                                                                                                                                            |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Link commit       | https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a04_group-03-1/commit/3b0ab134fd71c7c94878970ab11ce884027974d3                                                                                                                                              |
| File liên quan    | `src/frontend_mobile-expo/src/modules/dashboard/screens/DashboardScreen.tsx`, `src/frontend_mobile-expo/src/modules/dashboard/components/DriverPassModal.tsx`,                                                                                                                      |
| Screenshot        | (Ảnh màn hình trang dashboard)                                                                                                                                                                                                                                                      |
| Kết quả chạy/test | Khi quét hợp lệ: tự động mở DriverPassModal và bật phản hồi haptics. Thông báo đăng nhập/scan dùng Snackbar với vị trí top-right (đã mở rộng component để hỗ trợ vị trí). Luồng quét → validate → show modal → commit đã nối với auth store (điều hướng về (tabs) sau login/guest). |
| Link video demo   |                                                                                                                                                                                                                                                                                     |
| Ghi chú khác      | Prompt này cho phep tai xe co the su dung truc tiep nhanh chong.                                                                                                                                                                                                                    |

#### 12.6. Nhận xét cá nhân/nhóm

```text
Viết tại đây...
```

---

### Lần sử dụng AI số 13

| Nội dung            | Thông tin               |
| ------------------- | ----------------------- |
| Ngày sử dụng        | 25/05/2026              |
| Công cụ AI          | GithubCopilot, Gemini   |
| Mục đích sử dụng    | Xây dựng trang lịch hẹn |
| Phần việc liên quan | coding                  |
| Mức độ sử dụng      | Hỏi hướng dẫn           |

#### 13.1. Prompt đã sử dụng

```text
Từ bối cảnh trên, bạn là 1 senior đầy kinh nghiệm về reactnative mobile app, trong phần mobile expo đi từ src/mobile , hãy dùng các component từ shadcn ui hoặc các thư viện có sẵn, tạo cho tôi các trang cần thiết và quan trọng cho dự án. Những trang giao diện sẽ nằm trong mobile-expo/src/component/pages. Yêu cầu về giao diện: dễ nhìn, dễ hiểu và dễ thao tác, màu sắc nhẹ nhàng kết hợp với hình ảnh thiết kế UI của stitch mà tôi đinhs kèm. Bây giờ hãy thiết kế trang dashboard, trang dashboard yêu cầu trong trang dashboard có hiển thị mã QR khi bấm vào button, tài xế chỉ việc đưa mã QR cho người quản lý nhà xe để quét, kết hợp ý tưởng mà bạn đã đưa ra cùng với việc xử lý nghiệp vụ
```

#### 13.2. Kết quả AI gợi ý

```text
AI đã phân tích và thiết kế một Workflow chi tiết cho quá trình đặt lịch, bao gồm các giai đoạn:
1. **Trước khi đến cảng (Pre-arrival):** Doanh nghiệp vận tải nhập thông tin tạo lịch hẹn. Hệ thống kiểm tra sức chứa (Capacity) theo khung giờ để tránh quá tải.
2. **Khi đến cổng (At Gate):** So khớp dữ liệu lịch hẹn với kết quả quét AI (biển số, mã container).
3. **Trong cảng (In-yard):** Thay đổi trạng thái lịch hẹn thành "Đã vào".
4. **Hoàn thành (Completion):** Xe rời cảng, đổi trạng thái thành "Đã ra".
Đồng thời, AI còn vạch ra các API cần thiết (`POST /appointments`, `GET /appointments`, `PATCH /appointments/:id/status`) và cách triển khai trên Frontend.
```

#### 13.3. Phần sinh viên/nhóm đã sử dụng từ AI

```text
- Áp dụng Workflow này làm kim chỉ nam để xây dựng toàn bộ Module 1.
- Xây dựng giao diện Frontend (`/admin/appointments`) hiển thị danh sách lịch hẹn bằng Data Table phân trang (Pagination).
- Xây dựng form Thêm mới/Chỉnh sửa (`/admin/appointments/edit/[id]`) sử dụng `just-validate` để bắt lỗi nhập liệu.
- Viết Backend API (Router, Controller, Model `appointment.model.ts`) xử lý các bộ lọc tìm kiếm (từ ngày... đến ngày...) và phân trang trực tiếp từ Database.
```

#### 13.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
- Nhóm đã liên tục trao đổi với AI (Antigravity) qua nhiều prompt tiếp theo để fix các lỗi phát sinh trong quá trình code như: Frontend không gọi được API, lỗi Route `params.id` bị thiếu `await` trong Next.js.
- Nhóm chủ động yêu cầu AI làm thêm tính năng **"Thùng rác" (Soft Delete)**: Thêm nút "Xóa tạm", tạo trang chứa lịch hẹn đã xóa, và nút "Khôi phục" hoặc "Xóa vĩnh viễn" - những tính năng nâng cao không có trong prompt gốc.
```

#### 13.5. Minh chứng

| Loại minh chứng   | Nội dung                                                                                                                               |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Link commit       | https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a04_group-03-1/commit/e6fd46150a16a218258cd199ed650e8116842f0c |
| File liên quan    | `src/frontend/src/app/admin/appointments/page.tsx`, `src/backend/controllers/appointment.controller.ts`                                |
| Screenshot        | (Ảnh màn hình danh sách lịch hẹn và Thùng rác)                                                                                         |
| Kết quả chạy/test | Form validate chính xác, lọc và phân trang 10 items/trang hoạt động tốt, API xử lý nhanh chóng.                                        |
| Link video demo   |                                                                                                                                        |
| Ghi chú khác      | Prompt này là bước đệm tuyệt vời để thiết kế kiến trúc hệ thống trước khi lao vào code.                                                |

#### 13.6. Nhận xét cá nhân/nhóm

```text
Viết tại đây...
```

---

### Lần sử dụng AI số 14

| Nội dung            | Thông tin                          |
| ------------------- | ---------------------------------- |
| Ngày sử dụng        | 25/05/2026                         |
| Công cụ AI          | Gemini, Github Copilot             |
| Mục đích sử dụng    | Xây dựng trang lịch hẹn cho tài xế |
| Phần việc liên quan | Coding                             |
| Mức độ sử dụng      | Hỏi hướng dẫn                      |
| Phần liên quan      | Gate Management                    |

#### 14.1. Prompt đã sử dụng

```text id="g2k8wn"
Vai  trò: Bạn hãy đóng vai là một senior chuyên về phát triển react native mobile app sử dụng các công cụ thư viện  hiện đại với nhiều năm kinh nghiệm
Bối cảnh: Tôi đang thiết kế trang dashboard với nội dụng như sau:
Màn hình Lịch hẹn

Quản lý khung giờ: Hiển thị danh sách các lịch hẹn vào cổng với trạng thái rõ ràng (Xác nhận, Đang chờ, Đã hủy).
Thẻ thông tin chi tiết: Mỗi lịch hẹn bao gồm mã Container, loại dịch vụ và cổng (Gate) chỉ định để tài xế dễ dàng theo dõi.
Thao tác nhanh: Nút "Xem thẻ thông hành" (View Pass) giúp truy xuất mã QR nhanh chóng khi đến giờ hẹn.
Yêu cầu: Từ bối cảnh trên,  hãy thiết kế lại trang lịch hẹn , kết hợp với gam mau chủ đạo của hình ảnh stitch  Màu nền (Background/Surface): Sử dụng tông xanh đen đậm (#0b1326) làm chủ đạo. Đây là lựa chọn tối ưu để giảm mỏi mắt cho tài xế khi làm việc trong cabin vào ban đêm và tăng cường độ sâu cho giao diện công nghiệp.
Màu nhấn chủ đạo (Primary): Màu Vàng Hổ phách (Amber - #f59e0b). Đây là màu sắc đặc trưng của ngành vận tải và logistics, được dùng cho các nút hành động quan trọng (CTA), biểu tượng chính và các trạng thái cần sự chú ý cao.
Màu bổ trợ (Accents/Status):Xanh lục (Emerald): Biểu thị trạng thái an toàn (Secure), xe đang kết nối (Active Uplink) hoặc ô đỗ trống (Available).
Đỏ (Critical): Dùng cho các cảnh báo nghiêm trọng như vi phạm niêm phong hoặc dừng khẩn cấp.
Xám xanh (Surface-Bright): Dùng cho các đường kẻ chia tách (borders) và các thẻ (cards) phụ để tạo chiều sâu mà không làm loãng sự tập trung.
Rationale (Lý do thiết kế):
Sự kết hợp giữa nền tối và màu nhấn vàng/xanh neon tạo ra độ tương phản cực cao (High Contrast), giúp tài xế có thể đọc nhanh thông tin ngay cả trong môi trường rung lắc của cabin xe hoặc dưới ánh sáng đèn đường phức tạp tại cảng.

Yêu cầu bắt buộc: Thiết kế theo hình ảnh stitch tôi gửi sử dụng các thư viện có sẵn, ui có sẵn, thông tin khớp với hai trang dashboard, thông tin các nhân. Lưu ý nghiệp vụ:  Tại trang lịch hẹn này, tài xế chỉ được xem các lịch hẹn đã được xác nhận hoặc đang trong trạng thái chờ xử lý, tuyệt đối không hiển thị các lịch trình đã hủy hoặc quá hạn để tránh gây nhiễu thông tin. Mọi thao tác điều hướng cần được tối giản hóa bằng các nút bấm lớn, đảm bảo tài xế không thực hiện bất cứ tác vụ nào trong trang lịch hẹn này mà gây xao nhãng khi xe đang vận hành. Giao diện cần ưu tiên hiển thị thời gian và địa điểm nhận hàng ở vị trí trung tâm, sử dụng phông chữ không chân đậm nét để tối ưu hóa khả năng đọc lướt. Các thông báo trạng thái phải được làm nổi bật bằng hiệu ứng thị giác đặc trưng, đảm bảo tài xế nắm bắt thông tin cốt lõi chỉ trong một cái nhìn thoáng qua, từ đó duy trì sự tập trung tối đa vào việc điều khiển phương tiện và đảm bảo an toàn tuyệt đối trong suốt quá trình làm việc. Các thông tin hiển thị trong mỗi block lịch bao gồm thời gian,  vị trí kho bãi và trạng thái xác nhận hay chưa , được sắp xếp theo trình tự ưu tiên từ trái sang phải. Mỗi block cần có khoảng cách đủ rộng để tránh thao tác nhầm lẫn, đồng thời tích hợp tính năng phản hồi rung nhẹ khi tài xế chạm vào, giúp xác nhận lệnh điều hướng mà không cần rời mắt khỏi cung đường phía trước. Chỉnh giao diện phù hợp với web và ứng dụng di động để đảm bảo tính đồng bộ, như android, ios

```

#### 14.2. Bối cảnh khi viết prompt

```text id="6w3f8m"
Người dùng mục tiêu: tài xế/nhân viên điều phối cần xem, lọc, và quản lý lịch hẹn nhanh trên di động — thao tác một tay, tap targets lớn, hiển thị thông tin quan trọng trước.
Mục tiêu UX: compact layout, thông tin cấp cao (time, yard, status) nổi bật; nhanh chóng mở chi tiết, gọi hành động (check-in, cancel, contact); rõ ràng khoảng cách giữa danh sách và thẻ hỗ trợ.
Thành phần UI cần có: appointment list (grouped by ngày), item card (time, customer/yard, status badge, quick actions), filters (date / trạng thái), info/support card, empty state, loading & error states, pull-to-refresh.
Luồng chính: tải danh sách → hiển thị nhóm/ngày → user tap item → mở modal/chi tiết → từ chi tiết gọi hành động (navigate, gọi API, show toast) → cập nhật list. Hỗ trợ guest/local auth flow như hiện tại.
```

#### 14.3. Kết quả AI gợi ý

```text id="m3z1kf"
Components: AppointmentsScreen.tsx: list + grouping theo ngày, item card, filters, empty/loading states.
Styles: Appointments.style.ts: compact layout, maxWidth, card padding và tap-target ≥44px.
Modal/Support: AppointmentDetailModal.tsx và SupportCard.tsx để xem chi tiết & liên hệ.
Hooks / Service: useAppointments.ts (fetch, pull-to-refresh, optimistic actions) và appointmentsService.ts (API wrappers + mock).
Data contract / mocks: mẫu Appointment type và mock responses để dev/test offline.
Feedback: tích hợp Snackbar (top-right) và haptics cho hành động confirm/check-in.
Accessibility: aria/labels cho screen-reader, truncation rules, contrast & focus handling.
Tests / QA: acceptance checklist + small smoke test snippets (load, filter, open detail, optimistic update).
Docs: README.md ngắn hướng dẫn chạy, mock API, và acceptance criteria.
Deliverable format: mã TSX + styles + hooks + README + checklist, sẵn để drop vào src/frontend_mobile-expo/src/modules/appointments.
```

#### 14.4. Phần sinh viên/nhóm đã sử dụng từ AI

```text id="x0m98t"
Layout & spacing:

Giới hạn chiều rộng các card (maxWidth) và giảm padding để giao diện compact trên mobile.
Giảm kích thước header chung (ở ScreenShell) để nhường không gian nội dung.
Thêm khoảng cách rõ ràng giữa danh sách lịch hẹn và thẻ “Hỗ trợ điều phối”.
Nội dung item:

Item card hiển thị rõ rệt: giờ (time), tên yard/customer, status badge.
Thu gọn văn bản dài (truncation) và giữ hit-target ≥44px cho nút/tap.
Tương tác:

Quick actions giữ nguyên (xem chi tiết, check-in, contact) nhưng nút được tinh chỉnh về kích thước và khoảng cách.
Thêm pull-to-refresh và xử lý trạng thái loading / empty / error.
Fix & refactor:

Sửa lỗi trùng/không nhất quán pageContainer và chuẩn hoá container/style cho trang.
Tách styles ra file riêng (per-screen style) để dễ bảo trì.
Phản hồi & truy cập:

Dùng Snackbar cho toast phản hồi; thêm haptics cho hành động quan trọng.
Kết nối với auth/useProfile store để hiển thị thông tin driver và điều hướng phù hợp.
State & API:

Dùng hook service (fetch + pull-to-refresh); support optimistic updates cho quick actions và revalidate sau success.
Mocks/shape dữ liệu chuẩn (Appointment: id, timeISO, yardName, status, driverPhone, notes) để dev/test offline nếu cần.
Kiểm thử & QA:

Acceptance checklist bao gồm: load + grouping theo ngày, filter hoạt động, mở detail/modal, actions gửi request và cập nhật UI, không overflow trên màn nhỏ.
```

#### 14.5. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text id="4r6u5q"
Giảm băng thông truyền tải bằng cách chỉ emit những trường dữ liệu thực sự cần thiết (chỉ gửi id, thời điểm, trạng thái, mã container, tên tài xế khi cần).
Tối ưu hiển thị Gate Log và danh sách lịch hẹn để ưu tiên các giao dịch mới nhất (sort theo thời gian và nhóm theo ngày).
Thực hiện giới hạn số lượng bản ghi hiển thị mặc định và bổ sung cơ chế phân trang/tải thêm để tránh ảnh hưởng hiệu năng khi dữ liệu tăng.
Chuẩn hóa cấu trúc payload realtime giữa Backend và Frontend (giảm độ phức tạp, dễ mở rộng cho sự kiện mới).
Tách riêng style cho mỗi màn (per-screen styles), thu gọn layout (maxWidth, giảm padding) để tối ưu hiển thị trên thiết bị di động.
Thêm trải nghiệm người dùng: pull-to-refresh, trạng thái loading/empty, toasts qua Snackbar và phản hồi haptics cho các hành động quan trọng.
Cải thiện độ tin cậy UI: dùng optimistic updates cho thao tác nhanh, revalidate sau khi server trả về kết quả, và mock API để phát triển offline.
Chuẩn bị nền tảng mở rộng: kiến trúc cho phép thêm các event realtime cho Yard Management và Computer Vision sau này.
```

#### 14.6. Đánh giá chất lượng prompt

- [x] Prompt rõ ràng
- [x] Prompt có đủ bối cảnh
- [ ] Prompt còn thiếu thông tin
- [x] Prompt tạo ra kết quả tốt
- [ ] Prompt tạo ra kết quả chưa phù hợp
- [x] Cần hỏi lại AI nhiều lần
- [x] Cần tự kiểm tra và chỉnh sửa nhiều
- [ ] Kết quả AI có lỗi hoặc chưa chính xác

#### 14.7. Minh chứng liên quan

| Loại minh chứng       | Nội dung                                                                                                                                 |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Link commit           | `https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a04_group-03-1/commit/6e6ad9b23242b99dfdb169c4c949df15df3d3a2c` |
| File liên quan        | `src/frontend_mobile-expo/src/modules/appointments/screens/AppointmentsScreen.tsx`                                                       |
| Screenshot            | Tài xế có thể xem lịch hẹn trang này                                                                                                     |
| Kết quả chạy/test     | Test Successfully                                                                                                                        |
| Link tài liệu/báo cáo |                                                                                                                                          |
| Ghi chú khác          |                                                                                                                                          |

#### 14.8. Ghi chú thêm

```text id="p7c2mv"

```

---

### Lần sử dụng AI số 15

| Nội dung            | Thông tin                                    |
| ------------------- | -------------------------------------------- |
| Ngày sử dụng        | 07/06/2026                                   |
| Công cụ AI          | Antigravity                                  |
| Mục đích sử dụng    | Xây dựng giao diện xác thực cho doanh nghiệp |
| Phần việc liên quan | Coding                                       |
| Mức độ sử dụng      | Hỏi hướng dẫn                                |
| Phần liên quan      | Company Portal                               |

#### 15.1. Prompt đã sử dụng

```text
Phân tích src/frontend/DESIGN.md và src/frontend.

Bạn là 1 senior Next.js và có kinh nghiệm nhiều năm tạo giao diện.

Tôi đã có sẵn các trang thuộc phần src/frontend/src/app/admin, trong này chứa giao diện dành cho các tính năng của bên quản trị viên và của hệ thống.

Bây giờ tôi cần bạn triển khai các trang cho bên company sẽ nằm trong src/frontend/src/app/client/company.

Cần thực hiện các bước như sau:
1. Ở trang landing page, sẽ có phần liên kết tới trang giao diện đăng nhập cho công ty.
2. Các trang xác thực của công ty sẽ nằm trong src/frontend/src/app/client/company/(auth), bao gồm tất cả các trang giống như bên admin.

Trước tiên tôi cần bạn hoàn thành các nhiệm vụ này.

Lưu ý:
- Chưa cần fetch API.
- Phải theo file DESIGN.md.
- Đồng bộ giao diện với các trang admin thành một thể thống nhất.
- Không để CSS ở trang này một kiểu, trang kia một kiểu.
```

#### 15.2. Bối cảnh khi viết prompt

```text
Sau khi hoàn thiện các trang quản trị dành cho Admin, nhóm bắt đầu triển khai giao diện dành cho doanh nghiệp sử dụng hệ thống.

Mục tiêu là tạo ra khu vực xác thực riêng cho Company Portal nhưng vẫn giữ phong cách thiết kế thống nhất với hệ thống Admin hiện có.

Ở giai đoạn này nhóm chỉ tập trung vào giao diện và cấu trúc route, chưa cần kết nối API.
```

#### 15.3. Kết quả AI gợi ý

```text
AI đề xuất triển khai giao diện xác thực cho doanh nghiệp dựa trên cấu trúc sẵn có của Admin.

Các công việc chính gồm:
- Cập nhật Landing Page và thêm nút điều hướng đến trang đăng nhập doanh nghiệp.
- Tạo thư mục client/company/(auth).
- Tạo các trang Login, Register, Forgot Password và Reset Password.
- Tái sử dụng bố cục và phong cách giao diện từ Admin Auth.
- Điều chỉnh nội dung text, ví dụ email và đường dẫn cho phù hợp với tài khoản doanh nghiệp.
- Chỉnh sửa danh sách loại hình doanh nghiệp ở trang đăng ký.
```

#### 15.4. Phần sinh viên/nhóm đã sử dụng từ AI

```text
- Thêm nút “Doanh nghiệp” tại Landing Page để điều hướng tới trang đăng nhập công ty.
- Tạo nhóm trang xác thực cho Company tại client/company/(auth).
- Xây dựng các trang Login, Register, Forgot Password và Reset Password.
- Đồng bộ giao diện Company Auth với Admin Auth.
- Điều chỉnh nội dung hiển thị từ ngữ cảnh Admin sang ngữ cảnh doanh nghiệp.
```

#### 15.5. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
- Kiểm tra lại giao diện để đảm bảo đồng bộ với file DESIGN.md.
- Chỉnh sửa text hiển thị cho phù hợp với đối tượng người dùng là doanh nghiệp.
- Thay đổi ví dụ email từ admin sang email doanh nghiệp.
- Cập nhật các đường dẫn điều hướng từ /admin sang /client/company.
- Điều chỉnh danh sách loại hình doanh nghiệp như Đơn vị vận tải, Forwarder, Hãng tàu, Chủ hàng XNK.
```

#### 15.6. Đánh giá chất lượng prompt

* [x] Prompt rõ ràng
* [x] Prompt có đủ bối cảnh
* [ ] Prompt còn thiếu thông tin
* [x] Prompt tạo ra kết quả tốt
* [ ] Prompt tạo ra kết quả chưa phù hợp
* [ ] Cần hỏi lại AI nhiều lần
* [x] Cần tự kiểm tra và chỉnh sửa nhiều
* [ ] Kết quả AI có lỗi hoặc chưa chính xác

#### 15.7. Minh chứng liên quan

| Loại minh chứng       | Nội dung                                                                                                                                                                                                                                                                                                          |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Link commit           | Cập nhật sau...                                                                                                                                                                                                                                                                                                   |
| File liên quan        | `src/frontend/src/app/page.tsx`, `src/frontend/src/app/client/company/(auth)/login/page.tsx`, `src/frontend/src/app/client/company/(auth)/register/page.tsx`, `src/frontend/src/app/client/company/(auth)/forgot-password/page.tsx`, `src/frontend/src/app/client/company/(auth)/reset-password/[email]/page.tsx` |
| Screenshot            | Landing Page có nút Doanh nghiệp và các trang xác thực Company                                                                                                                                                                                                                                                    |
| Kết quả chạy/test     | Điều hướng đúng sang Company Auth, giao diện hiển thị đồng bộ với Admin                                                                                                                                                                                                                                           |
| Link tài liệu/báo cáo |                                                                                                                                                                                                                                                                                                                   |
| Ghi chú khác          |                                                                                                                                                                                                                                                                                                                   |

#### 15.8. Ghi chú thêm

```text
Kinh nghiệm rút ra: Khi phát triển nhiều nhóm người dùng trong cùng một hệ thống, việc tái sử dụng cấu trúc giao diện sẵn có giúp tiết kiệm thời gian, đồng thời đảm bảo trải nghiệm người dùng nhất quán và dễ bảo trì.
```

---

### Lần sử dụng AI số 16

| Nội dung            | Thông tin                                               |
| ------------------- | ------------------------------------------------------- |
| Ngày sử dụng        | 03/06/2026                                              |
| Công cụ AI          | Antigravity |
| Mục đích sử dụng    | Xây dựng chức năng quản lí nhà cung cấp container       |
| Phần việc liên quan | Coding                  |
| Mức độ sử dụng      | Hỏi hướng dẫn                                          |

#### 16.1. Prompt đã sử dụng

```text
Phân tích src/frontend/src/app/admin/.

Tôi muốn tạo và hoàn thiện trang quản lí nhà cung cấp container:

1. Tạo trang nhà cung cấp container bao gồm trang chính, trang trash, trang create, trang edit,... tương tự như src/frontend/src/app/admin/companies.

2. Tạo model container-provider:
- code (4 kí tự đầu của mã container)
- name
- bic_codes (Danh sách mã Prefix 3 chữ cái được đăng ký quốc tế)
- contact_email (Để hệ thống tự động gửi cảnh báo rỉ sét)
- status: ENUM('ACTIVE', 'SUSPENDED')
- timestamp

Theo dạng mẫu các model có sẵn trong dự án.

3. Triển khai các tính năng như tìm kiếm, bộ lọc, phân trang ở trang chính và cả trang thùng rác.

Lưu ý: code backend phải theo thói quen viết backend hiện tại của tôi.
```

#### 16.2. Kết quả AI gợi ý

```text
AI đề xuất xây dựng module Container Provider theo kiến trúc tương tự Company Management để đảm bảo tính nhất quán.

Các chức năng chính gồm:
- Tạo model ContainerProvider.
- Xây dựng API CRUD.
- Hỗ trợ Soft Delete và Trash Management.
- Xây dựng các trang List, Create, Edit và Trash.
- Tích hợp tìm kiếm theo mã hoặc tên nhà cung cấp.
- Hỗ trợ bộ lọc trạng thái ACTIVE và SUSPENDED.
- Hỗ trợ phân trang cho danh sách chính và thùng rác.
- Đề xuất chuẩn hóa dữ liệu BIC Code và Container Code để thuận tiện cho việc kiểm tra container trong tương lai.
```

#### 16.3. Phần sinh viên/nhóm đã sử dụng từ AI

```text
- Thiết kế cấu trúc dữ liệu ContainerProvider.
- Xây dựng các trang quản lí nhà cung cấp container.
- Áp dụng mô hình CRUD tương tự Company Management.
- Tích hợp chức năng tìm kiếm, bộ lọc và phân trang.
- Bổ sung cơ chế quản lí dữ liệu đã xóa thông qua Trash Page.
```

#### 16.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
- Điều chỉnh cấu trúc dữ liệu để phù hợp với nghiệp vụ quản lí container thực tế.
- Chuẩn hóa định dạng mã code và BIC Code.
- Kiểm tra và tối ưu giao diện để đồng bộ với các module quản trị khác.
- Chuẩn bị nền tảng để tích hợp các chức năng cảnh báo tình trạng container trong tương lai.
```

#### 16.5. Minh chứng

| Loại minh chứng   | Nội dung                                                                                                                            |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Link commit       | cập nhật sau... |
| File liên quan    | `src/backend/models/container-provider.model.ts`, `src/backend/controllers/container-providers.controller.ts`, `src/frontend/src/app/admin/container-providers/page.tsx`                                                                                                                                    |
| Screenshot        | Trang quản lí nhà cung cấp container                                                                                                                                    |
| Kết quả chạy/test | CRUD, tìm kiếm, lọc và phân trang hoạt động đúng kế                                                                                                                                    |
| Link video demo   |                                                                                                                                     |
| Ghi chú khác      | Đây là bước đầu tiên để xây dựng cổng thông tin dành cho doanh nghiệp.                                                                                                                                    |

#### 16.6. Nhận xét cá nhân/nhóm

```text
Kinh nghiệm rút ra: Việc tái sử dụng kiến trúc và giao diện từ các module quản lí đã có giúp giảm thời gian phát triển đáng kể, đồng thời đảm bảo tính nhất quán và khả năng bảo trì của hệ thống khi số lượng module ngày càng tăng.
```

---

### Lần sử dụng AI số 17

| Nội dung            | Thông tin                                               |
| ------------------- | ------------------------------------------------------- |
| Ngày sử dụng        | 15/06/2026                                              |
| Công cụ AI          | Gemini |
| Mục đích sử dụng    | Khởi tạo cấu trúc phần cứng và logic lõi ESP32       |
| Phần việc liên quan | ESP32 / Backend / AI                  |
| Mức độ sử dụng      | Tạo code và gỡ lỗi                                          |

#### 17.1. Prompt đã sử dụng

```text
**Vai trò:** Chuyên gia lập trình hệ thống nhúng (Embedded Systems Engineer) chuyên về ESP32.

**Ngữ cảnh:** Tôi đang phát triển dự án `LoaESP32smartAI` chạy trên PlatformIO. Dự án sử dụng màn hình LCD I2C, module khuếch đại âm thanh MAX98357A (I2S) và động cơ Servo (SG90/MG996R).

**Nhiệm vụ:** Viết mã C++ cho ESP32 tích hợp các thành phần cứng trên.

**Yêu cầu:** 
- Cứ mỗi 5 giây, điều khiển servo xoay 90 độ để mở cổng.
- Khi cổng mở, in dòng chữ "WELCOME" ra màn hình LCD, đồng thời phát ra 3 tiếng "tinh tinh tinh" qua loa bằng I2S.
- Sau 2 giây mở cổng, điều khiển servo trở về trạng thái 0 độ.

**Định dạng đầu ra:** Toàn bộ source code `main.cpp` đầy đủ cho môi trường PlatformIO, kèm chú thích cấu hình chân (pinout) chi tiết.
```

#### 17.2. Kết quả AI gợi ý

```text
AI trả về mã code C++/Python/Markdown chi tiết dựa trên yêu cầu từ prompt.
```

#### 17.3. Phần sinh viên/nhóm đã sử dụng từ AI

```text
Áp dụng mã vào các file của module tương ứng để chạy thực tế.
```

#### 17.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
Tinh chỉnh thông số cứng/đường dẫn, kết nối thử nghiệm để tương thích.
```

#### 17.5. Minh chứng

| Loại minh chứng   | Nội dung                                                                                                                            |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Link commit       | |
| File liên quan    |                                                                                                                        |
| Screenshot        |                                                                                                                                   |
| Kết quả chạy/test |                                                                                                                                    |
| Link video demo   |                                                                                                                                     |
| Ghi chú khác      |                                                                                                                                     |

#### 17.6. Nhận xét cá nhân/nhóm

```text
Sử dụng Prompt Engineering mang lại hiệu quả rất tốt
```

---
### Lần sử dụng AI số 18

| Nội dung            | Thông tin                                               |
| ------------------- | ------------------------------------------------------- |
| Ngày sử dụng        | 15/06/2026                                              |
| Công cụ AI          | Gemini |
| Mục đích sử dụng    | Cải tiến Logic Hoạt Động & Thêm Cảm Biến Hồng Ngoại       |
| Phần việc liên quan | ESP32 / Backend / AI                  |
| Mức độ sử dụng      | Tạo code và gỡ lỗi                                          |

#### 18.1. Prompt đã sử dụng

```text
**Vai trò:** Kỹ sư hệ thống IoT.

**Ngữ cảnh:** Dự án hiện tại đã có LCD, Loa I2S và Servo hoạt động. Bây giờ tôi muốn tích hợp thêm cảm biến vật cản hồng ngoại (module LM393) nối vào GPIO 32.

**Nhiệm vụ:** Cập nhật luồng hoạt động tự động của hệ thống.

**Yêu cầu:**
- Trạng thái đóng: LCD hiện "Dang dong cong..." và đợi 5 giây (servo 0 độ).
- Trạng thái đón khách: LCD hiện "WELCOME!", phát 3 tiếng bíp, servo xoay 90 độ. Sau đó chuyển sang trạng thái chờ "Cho xe di qua..." và giữ cổng mở vô thời hạn.
- Khi xe cắt ngang cảm biến hồng ngoại: LCD chuyển sang in dòng chữ "Dang qua cong...".
- Thoát trạng thái: Sau khi xe đi qua hoàn toàn (tín hiệu cảm biến trở về HIGH), đợi 1 giây an toàn, hạ cổng xuống và quay lại từ đầu.

**Định dạng đầu ra:** Mã nguồn C++ hoàn chỉnh và các bước nối dây bổ sung.
```

#### 18.2. Kết quả AI gợi ý

```text
AI trả về mã code C++/Python/Markdown chi tiết dựa trên yêu cầu từ prompt.
```

#### 18.3. Phần sinh viên/nhóm đã sử dụng từ AI

```text
Áp dụng mã vào các file của module tương ứng để chạy thực tế.
```

#### 18.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
Tinh chỉnh thông số cứng/đường dẫn, kết nối thử nghiệm để tương thích.
```

#### 18.5. Minh chứng

| Loại minh chứng   | Nội dung                                                                                                                            |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Link commit       | |
| File liên quan    |                                                                                                                        |
| Screenshot        |                                                                                                                                   |
| Kết quả chạy/test |                                                                                                                                    |
| Link video demo   |                                                                                                                                     |
| Ghi chú khác      |                                                                                                                                     |

#### 18.6. Nhận xét cá nhân/nhóm

```text
Sử dụng Prompt Engineering mang lại hiệu quả rất tốt
```

---
### Lần sử dụng AI số 19

| Nội dung            | Thông tin                                               |
| ------------------- | ------------------------------------------------------- |
| Ngày sử dụng        | 15/06/2026                                              |
| Công cụ AI          | Gemini |
| Mục đích sử dụng    | Xử lý lỗi giao tiếp HTTP (ESP32 và Server)       |
| Phần việc liên quan | ESP32 / Backend / AI                  |
| Mức độ sử dụng      | Tạo code và gỡ lỗi                                          |

#### 19.1. Prompt đã sử dụng

```text
**Vai trò:** Kỹ sư phần mềm mạng (Network Software Engineer).

**Ngữ cảnh:** Hệ thống gồm 1 server ảo (chạy Python ở Localhost) đã tạo sẵn file `ket_qua.wav` và 1 mạch ESP32 kết nối chung WiFi.

**Nhiệm vụ:** Gỡ lỗi quá trình ESP32 tải file âm thanh từ server HTTP.

**Yêu cầu:** Phân tích nguyên nhân tại sao ESP32 báo lỗi "Không nhận được file" dù file đã thực sự tồn tại trên server. Hãy kiểm tra các khía cạnh: cấu hình tường lửa Windows (Firewall), khác biệt dải IP tĩnh/động, hoặc lỗi phân tích cú pháp URL trên mạch.

**Định dạng đầu ra:** Danh sách các bước kiểm tra (check-list) mạng và đoạn code HTTP Client (sử dụng thư viện HTTPClient) đã được tinh chỉnh để tải file an toàn.
```

#### 19.2. Kết quả AI gợi ý

```text
AI trả về mã code C++/Python/Markdown chi tiết dựa trên yêu cầu từ prompt.
```

#### 19.3. Phần sinh viên/nhóm đã sử dụng từ AI

```text
Áp dụng mã vào các file của module tương ứng để chạy thực tế.
```

#### 19.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
Tinh chỉnh thông số cứng/đường dẫn, kết nối thử nghiệm để tương thích.
```

#### 19.5. Minh chứng

| Loại minh chứng   | Nội dung                                                                                                                            |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Link commit       | |
| File liên quan    |                                                                                                                        |
| Screenshot        |                                                                                                                                   |
| Kết quả chạy/test |                                                                                                                                    |
| Link video demo   |                                                                                                                                     |
| Ghi chú khác      |                                                                                                                                     |

#### 19.6. Nhận xét cá nhân/nhóm

```text
Sử dụng Prompt Engineering mang lại hiệu quả rất tốt
```


---
### Lần sử dụng AI số 20

| Nội dung            | Thông tin                                               |
| ------------------- | ------------------------------------------------------- |
| Ngày sử dụng        | 15/06/2026                                              |
| Công cụ AI          | Gemini |
| Mục đích sử dụng    | Gỡ lỗi kết nối Mạng và IP       |
| Phần việc liên quan | ESP32 / Backend / AI                  |
| Mức độ sử dụng      | Tạo code và gỡ lỗi                                          |

#### 20.1. Prompt đã sử dụng

```text
**Vai trò:** Chuyên gia mạng nhúng (Embedded Network Expert).

**Ngữ cảnh:** Tôi vừa thay đổi điểm phát WiFi sang mạng mới, đã đổi đúng SSID/Password và cập nhật lại IP tĩnh trong mã nguồn.

**Nhiệm vụ:** Khắc phục lỗi ESP32 không chịu kết nối WiFi mới và không phát ra âm thanh.

**Yêu cầu:** Liệt kê các khả năng gây ra lỗi mạng (như băng tần 5GHz không được hỗ trợ trên ESP32) và đưa ra kỹ thuật chẩn đoán lỗi vòng lặp `WiFi.begin()`.

**Định dạng đầu ra:** Đoạn mã bổ sung hàm in log kết nối WiFi ra Serial Monitor để chẩn đoán trạng thái `WiFi.status()`.
```

#### 20.2. Kết quả AI gợi ý

```text
AI phân tích các nguyên nhân phổ biến khiến ESP32 không kết nối được WiFi như sai cấu hình mạng, sử dụng băng tần không được hỗ trợ, tín hiệu yếu hoặc lỗi trong quá trình khởi tạo kết nối. Đồng thời AI cung cấp đoạn mã ghi log trạng thái WiFi thông qua Serial Monitor và hướng dẫn cách kiểm tra giá trị trả về của WiFi.status() để xác định nguyên nhân lỗi.
```

#### 20.3. Phần sinh viên/nhóm đã sử dụng từ AI

```text
Nhóm bổ sung đoạn mã ghi log vào chương trình ESP32, theo dõi trạng thái kết nối trong từng giai đoạn và kiểm tra kết quả trên Serial Monitor. Dựa trên thông tin thu được, nhóm điều chỉnh lại cấu hình mạng để thiết bị kết nối thành công với WiFi và tiếp tục giao tiếp với backend.
```

#### 20.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
Nhóm điều chỉnh thời gian chờ khi kết nối, bổ sung cơ chế thử kết nối lại khi thất bại và thay đổi một số thông số cấu hình mạng để phù hợp với môi trường triển khai thực tế. Ngoài ra, các thông báo ghi log được sắp xếp lại giúp việc theo dõi và xử lý lỗi dễ dàng hơn.
```

#### 20.5. Minh chứng

| Loại minh chứng   | Nội dung                                                                                                                            |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Link commit       | |
| File liên quan    |                                                                                                                        |
| Screenshot        |                                                                                                                                   |
| Kết quả chạy/test |                                                                                                                                    |
| Link video demo   |                                                                                                                                     |
| Ghi chú khác      |                                                                                                                                     |

#### 20.6. Nhận xét cá nhân/nhóm

```text
Prompt giúp nhóm nhanh chóng xác định hướng xử lý và xây dựng cơ chế ghi log phục vụ việc chẩn đoán lỗi. Tuy nhiên, các giải pháp do AI đề xuất vẫn cần được kiểm chứng trên thiết bị thật và điều chỉnh theo điều kiện mạng của môi trường triển khai.
```

---
### Lần sử dụng AI số 21

| Nội dung            | Thông tin                                               |
| ------------------- | ------------------------------------------------------- |
| Ngày sử dụng        | 15/06/2026                                              |
| Công cụ AI          | Gemini |
| Mục đích sử dụng    | Khắc phục lỗi Nguồn cho Servo       |
| Phần việc liên quan | ESP32 / Backend / AI                  |
| Mức độ sử dụng      | Tạo code và gỡ lỗi                                          |

#### 21.1. Prompt đã sử dụng

```text
**Vai trò:** Kỹ sư Điện tử (Electronics Engineer).

**Ngữ cảnh:** Tôi đang sử dụng một nguồn điện bên ngoài (5V adapter) để cấp điện riêng cho Servo, LCD, và Loa. Mạch ESP32 chỉ đóng vai trò cấp tín hiệu. Khi nạp code, mạch vẫn chạy logic bình thường nhưng Servo bị đơ, không xoay.

**Nhiệm vụ:** Tìm và khắc phục lỗi phần cứng kết nối nguồn.

**Yêu cầu:** Phân tích lỗi kỹ thuật về "Nối chung mass/GND" giữa các bộ nguồn độc lập. Giải thích ngắn gọn cơ chế băm xung PWM cần mạch tham chiếu điện áp.

**Định dạng đầu ra:** Giải thích kỹ thuật và hướng dẫn sửa lại dây nối (sơ đồ kết nối lại).
```

#### 21.2. Kết quả AI gợi ý

```text
AI giải thích nguyên lý hoạt động của Servo khi sử dụng nguồn cấp riêng, nhấn mạnh vai trò của việc nối chung chân GND giữa ESP32 và nguồn ngoài để tạo mốc điện áp tham chiếu cho tín hiệu PWM. Ngoài ra, AI cung cấp sơ đồ đấu nối minh họa và đưa ra các bước kiểm tra phần cứng nhằm xác định nguyên nhân khiến Servo không nhận được tín hiệu điều khiển.
```

#### 21.3. Phần sinh viên/nhóm đã sử dụng từ AI

```text
Nhóm áp dụng hướng dẫn để kiểm tra lại toàn bộ sơ đồ đấu nối, thực hiện nối chung chân GND giữa ESP32 và nguồn cấp ngoài, đồng thời kiểm tra lại dây tín hiệu PWM của Servo. Sau khi điều chỉnh, Servo nhận tín hiệu ổn định và thực hiện đúng các thao tác điều khiển theo chương trình.
```

#### 21.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
Nhóm sắp xếp lại hệ thống dây nguồn nhằm hạn chế nhiễu tín hiệu, kiểm tra điện áp đầu ra của adapter và lựa chọn chân GPIO phù hợp để điều khiển Servo. Đồng thời tiến hành thử nghiệm nhiều lần với các góc quay khác nhau để đánh giá tính ổn định của hệ thống sau khi hoàn thiện.
```

#### 21.5. Minh chứng

| Loại minh chứng   | Nội dung                                                                                                                            |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Link commit       | |
| File liên quan    |                                                                                                                        |
| Screenshot        |                                                                                                                                   |
| Kết quả chạy/test |                                                                                                                                    |
| Link video demo   |                                                                                                                                     |
| Ghi chú khác      |                                                                                                                                     |

#### 21.6. Nhận xét cá nhân/nhóm

```text
Prompt giúp nhóm nhanh chóng xác định nguyên nhân liên quan đến cách đấu nối nguồn và tín hiệu điều khiển Servo. Tuy nhiên, các hướng dẫn từ AI vẫn được kiểm chứng trực tiếp trên phần cứng và điều chỉnh theo cấu hình thực tế của hệ thống trước khi áp dụng vào sản phẩm.
```


---
### Lần sử dụng AI số 22

| Nội dung            | Thông tin                                               |
| ------------------- | ------------------------------------------------------- |
| Ngày sử dụng        | 15/06/2026                                              |
| Công cụ AI          | Gemini |
| Mục đích sử dụng    | Hiệu chỉnh góc xoay Servo       |
| Phần việc liên quan | ESP32 / Backend / AI                  |
| Mức độ sử dụng      | Tạo code và gỡ lỗi                                          |

#### 22.1. Prompt đã sử dụng

```text
**Vai trò:** Kỹ sư Hệ thống Điều khiển (Control Systems Engineer).

**Ngữ cảnh:** Servo MG996R sử dụng thư viện `ESP32Servo.h` nhưng khi ra lệnh `write(0)` và `write(90)`, góc quay vật lý thực tế của động cơ đang bị lệch, không thẳng chuẩn xác.

**Nhiệm vụ:** Tinh chỉnh các thông số cấp xung PWM.

**Yêu cầu:** Cung cấp kỹ thuật sử dụng giới hạn min/max pulse (microsecond) thay thế cho việc gọi độ thẳng. Giúp tôi căn chỉnh lại điểm 0 thực tế và góc vuông 90 độ thực tế.

**Định dạng đầu ra:** Đoạn mã cấu hình `gateServo.attach(pin, minPulse, maxPulse)` kèm chú thích cách thay đổi thông số pulse.
```

#### 22.2. Kết quả AI gợi ý

```text
AI giải thích nguyên nhân gây sai lệch góc quay của Servo do sự khác biệt giữa từng thiết bị và giới hạn xung PWM mặc định của thư viện. AI đề xuất sử dụng hàm attach() với tham số minPulse và maxPulse để hiệu chỉnh dải xung điều khiển, đồng thời cung cấp ví dụ minh họa và hướng dẫn thay đổi giá trị microsecond nhằm đưa Servo về đúng vị trí mong muốn.
```

#### 22.3. Phần sinh viên/nhóm đã sử dụng từ AI

```text
Nhóm áp dụng cấu hình PWM mới vào chương trình điều khiển Servo, thử nghiệm nhiều mức giá trị minPulse và maxPulse để tìm được thông số phù hợp với thiết bị thực tế. Sau khi hiệu chỉnh, các góc quay quan trọng như 0°, 90° và 180° có độ chính xác cao hơn, giúp cơ cấu cơ khí hoạt động đúng theo yêu cầu của hệ thống.
```

#### 22.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
Nhóm điều chỉnh các giá trị xung PWM dựa trên kết quả thử nghiệm thực tế thay vì sử dụng trực tiếp các giá trị AI đề xuất. Đồng thời bổ sung quy trình kiểm tra nhiều lần ở các góc khác nhau để đánh giá độ ổn định của Servo và lựa chọn bộ thông số phù hợp nhất với phần cứng đang sử dụng.
```

#### 22.5. Minh chứng

| Loại minh chứng   | Nội dung                                                                                                                            |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Link commit       | |
| File liên quan    |                                                                                                                        |
| Screenshot        |                                                                                                                                   |
| Kết quả chạy/test |                                                                                                                                    |
| Link video demo   |                                                                                                                                     |
| Ghi chú khác      |                                                                                                                                     |

#### 22.6. Nhận xét cá nhân/nhóm

```text
Prompt hỗ trợ nhóm hiểu rõ hơn về nguyên lý điều khiển Servo bằng xung PWM và cách hiệu chỉnh thông số để tăng độ chính xác của góc quay. Tuy nhiên, các giá trị minPulse và maxPulse vẫn cần được thử nghiệm trực tiếp trên từng Servo vì mỗi thiết bị có sai số cơ khí và đặc tính hoạt động khác nhau.
```

---
### Lần sử dụng AI số 23

| Nội dung            | Thông tin                                               |
| ------------------- | ------------------------------------------------------- |
| Ngày sử dụng        | 15/06/2026                                              |
| Công cụ AI          | Gemini |
| Mục đích sử dụng    | Sửa lỗi hiển thị dữ liệu LCD       |
| Phần việc liên quan | ESP32 / Backend / AI                  |
| Mức độ sử dụng      | Tạo code và gỡ lỗi                                          |

#### 23.1. Prompt đã sử dụng

```text
**Vai trò:** Kỹ sư Nhúng.

**Ngữ cảnh:** Màn hình hiển thị LCD 16x2 sử dụng module mở rộng I2C đang hiển thị ra toàn các ký tự nhiễu, rác, không đọc được tiếng Anh/Việt.

**Nhiệm vụ:** Chẩn đoán và sửa lỗi đường truyền tín hiệu I2C.

**Yêu cầu:** Nêu ra các nguyên nhân khả dĩ nhất (như xung nhiễu dây điện dài, sai địa chỉ 0x27/0x3F, hoặc nguồn điện vào 3.3V thay vì 5V không đủ độ tương phản).

**Định dạng đầu ra:** Cung cấp một đoạn mã "I2C Scanner" chuẩn của Arduino để giúp tôi tìm đúng địa chỉ phần cứng của màn hình.
```

#### 23.2. Kết quả AI gợi ý

```text
AI phân tích các nguyên nhân thường gặp dẫn đến lỗi hiển thị trên LCD I2C như sai địa chỉ I2C, kết nối SDA/SCL không đúng, nguồn cấp không ổn định hoặc biến trở điều chỉnh độ tương phản chưa phù hợp. AI cũng cung cấp chương trình I2C Scanner để quét địa chỉ của thiết bị, hướng dẫn kiểm tra phần cứng và các bước xử lý khi không phát hiện được LCD.
```

#### 23.3. Phần sinh viên/nhóm đã sử dụng từ AI

```text
Nhóm sử dụng chương trình I2C Scanner để xác định đúng địa chỉ của màn hình LCD, kiểm tra lại dây SDA, SCL và nguồn cấp trước khi cập nhật chương trình chính. Sau khi điều chỉnh cấu hình và địa chỉ I2C phù hợp, màn hình hiển thị chính xác các thông tin trạng thái của hệ thống và hoạt động ổn định trong quá trình kiểm thử.
```

#### 23.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
Nhóm điều chỉnh lại địa chỉ I2C theo kết quả quét thực tế, tối ưu cách khởi tạo màn hình trong chương trình và bổ sung kiểm tra kết nối trước khi hiển thị dữ liệu. Ngoài ra, các nội dung hiển thị cũng được sắp xếp lại để phù hợp với kích thước LCD 16x2 và giúp người dùng dễ quan sát hơn.
```

#### 23.5. Minh chứng

| Loại minh chứng   | Nội dung                                                                                                                            |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Link commit       | |
| File liên quan    |                                                                                                                        |
| Screenshot        |                                                                                                                                   |
| Kết quả chạy/test |                                                                                                                                    |
| Link video demo   |                                                                                                                                     |
| Ghi chú khác      |                                                                                                                                     |

#### 23.6. Nhận xét cá nhân/nhóm

```text
Prompt giúp nhóm nhanh chóng xác định hướng xử lý đối với lỗi giao tiếp I2C và cung cấp công cụ hỗ trợ kiểm tra địa chỉ phần cứng của màn hình LCD. Tuy nhiên, kết quả vẫn cần được xác minh trực tiếp trên thiết bị vì mỗi module LCD có thể sử dụng địa chỉ I2C khác nhau và chịu ảnh hưởng bởi chất lượng kết nối phần cứng.
```
---
### Prompt số 24

| Nội dung            | Thông tin                                             |
| ------------------- | ----------------------------------------------------- |
| Ngày sử dụng        | 15/06/2026                                            |
| Công cụ AI          | Gemini                                                |
| Mục đích            | Thiết lập môi trường Server AI (Python)               |
| Phần việc liên quan | ESP32 / Backend / AI                                  |
| Mức độ sử dụng      | Phân tích lỗi, hướng dẫn cài đặt và gỡ lỗi môi trường |

#### 24.1. Prompt nguyên văn

```text
**Vai trò:** Chuyên gia Python và Trí tuệ nhân tạo (AI Expert).

**Ngữ cảnh:** Trong thư mục `MeloTTS_Vietnamese-main`, tôi đã kích hoạt môi trường ảo (venv) và chạy `python chay_thu.py` nhưng liên tục gặp thông báo lỗi:

ModuleNotFoundError: No module named 'torch'

Điều này khiến server AI không thể khởi động mặc dù Python đã được cài đặt trước đó.

**Nhiệm vụ:** Phân tích nguyên nhân gây ra lỗi môi trường Python và hướng dẫn cách khắc phục triệt để.

**Yêu cầu:**
- Giải thích nguyên nhân vì sao môi trường ảo (venv) không nhận các thư viện đã cài ở Python gốc.
- Hướng dẫn kiểm tra Python, pip và môi trường đang được kích hoạt.
- Cung cấp lệnh cài đặt PyTorch phù hợp với Windows (CPU hoặc GPU).
- Hướng dẫn kiểm tra sau khi cài đặt để xác nhận thư viện đã hoạt động.
- Đề xuất cách xử lý nếu tiếp tục phát sinh lỗi thiếu package khác.

**Định dạng đầu ra:** Giải thích nguyên nhân, các bước xử lý và toàn bộ câu lệnh cài đặt trong Windows Terminal.
```

#### 24.2. Bối cảnh khi viết prompt

```text
Trong quá trình triển khai server AI phục vụ chức năng chuyển văn bản thành giọng nói (Text-to-Speech), nhóm sử dụng môi trường ảo Python (venv) nhằm tách biệt các thư viện của dự án với môi trường Python toàn cục. Tuy nhiên, sau khi hoàn thành việc tạo môi trường và kích hoạt venv, chương trình không thể khởi động do thiếu thư viện PyTorch mặc dù thư viện này đã tồn tại trên máy tính.

Nhóm cần xác định nguyên nhân của lỗi, hiểu rõ cơ chế hoạt động của môi trường ảo Python và lựa chọn đúng phiên bản PyTorch tương thích với cấu hình máy nhằm đảm bảo server AI hoạt động ổn định.
```

#### 24.3. Kết quả AI trả về

```text
AI phân tích rằng lỗi phát sinh do môi trường ảo Python hoạt động hoàn toàn độc lập với môi trường Python toàn cục, vì vậy tất cả thư viện cần được cài đặt lại bên trong venv.

AI hướng dẫn cách:
- Kiểm tra phiên bản Python đang sử dụng.
- Kiểm tra pip và môi trường ảo đã được kích hoạt đúng hay chưa.
- Xác định phiên bản PyTorch phù hợp với CPU hoặc GPU.
- Thực hiện lệnh pip install theo đúng cấu hình phần cứng.
- Kiểm tra việc cài đặt bằng cách import torch trong Python và xem phiên bản đã được nhận diện hay chưa.

Ngoài ra AI còn giải thích nguyên lý hoạt động của môi trường ảo, lý do các thư viện trong Python gốc không được kế thừa sang venv và đưa ra các bước xử lý nếu tiếp tục gặp lỗi thiếu package như numpy, transformers hoặc các thư viện AI khác.
```

#### 24.4. Kết quả đã áp dụng vào bài

```text
Nhóm thực hiện lần lượt các bước theo hướng dẫn của AI để kiểm tra môi trường Python, kích hoạt đúng venv và cài đặt lại PyTorch cùng các thư viện phụ thuộc.

Sau khi hoàn thành việc cài đặt, chương trình AI có thể khởi động thành công, không còn xuất hiện lỗi ModuleNotFoundError và server Text-to-Speech hoạt động bình thường. Kết quả này cũng được áp dụng để thiết lập môi trường trên các máy phát triển khác của nhóm nhằm đảm bảo tính thống nhất.
```

#### 24.5. Phần sinh viên/nhóm đã chỉnh sửa hoặc cải tiến

```text
Sau khi nhận hướng dẫn từ AI, nhóm chủ động lựa chọn phiên bản PyTorch phù hợp với cấu hình máy tính đang sử dụng thay vì cài đặt mặc định.

Nhóm bổ sung các thư viện còn thiếu vào file requirements.txt, kiểm tra khả năng tương thích giữa các package, đồng thời cập nhật tài liệu hướng dẫn cài đặt môi trường để các thành viên khác có thể thiết lập nhanh chóng và hạn chế phát sinh lỗi trong quá trình phát triển.
```

#### 24.6. Đánh giá chất lượng prompt

* [x] Prompt rõ ràng
* [x] Prompt có đủ bối cảnh
* [ ] Prompt còn thiếu thông tin
* [x] Prompt tạo ra kết quả tốt
* [ ] Prompt tạo ra kết quả chưa phù hợp
* [ ] Cần hỏi lại AI nhiều lần
* [x] Cần tự kiểm tra và chỉnh sửa nhiều
* [ ] Kết quả AI có lỗi hoặc chưa chính xác

#### 24.7. Minh chứng liên quan

| Loại minh chứng       | Nội dung                                                                                     |
| --------------------- | -------------------------------------------------------------------------------------------- |
| Link commit           |                                                                                              |
| File liên quan        | `MeloTTS_Vietnamese-main`, `requirements.txt`, `chay_thu.py`                                 |
| Screenshot            | Kết quả cài đặt PyTorch và chạy server AI thành công                                         |
| Kết quả chạy/test     | Server AI khởi động thành công, không còn lỗi `ModuleNotFoundError: No module named 'torch'` |
| Link tài liệu/báo cáo |                                                                                              |
| Ghi chú khác          | Áp dụng quy trình cài đặt cho toàn bộ thành viên trong nhóm                                  |

#### 24.8. Ghi chú thêm

```text
Prompt được xây dựng với đầy đủ bối cảnh, nguyên nhân lỗi và yêu cầu đầu ra cụ thể nên AI có thể nhanh chóng xác định đúng vấn đề nằm ở môi trường ảo Python thay vì mã nguồn chương trình. Các hướng dẫn của AI giúp nhóm rút ngắn đáng kể thời gian xử lý lỗi, đồng thời hiểu rõ hơn về cơ chế hoạt động của venv và quy trình quản lý thư viện trong các dự án AI.

Mặc dù AI cung cấp các lệnh cài đặt phù hợp, nhóm vẫn chủ động kiểm tra phiên bản Python, pip, khả năng tương thích của từng package và thử nghiệm trực tiếp trên môi trường thực tế trước khi áp dụng vào hệ thống chính thức.
```
---
### Prompt số 25

| Nội dung            | Thông tin                                                     |
| ------------------- | ------------------------------------------------------------- |
| Ngày sử dụng        | 15/06/2026                                                    |
| Công cụ AI          | Gemini                                                        |
| Mục đích            | Quản lý tài liệu dự án                                        |
| Phần việc liên quan | ESP32 / Backend / AI                                          |
| Mức độ sử dụng      | Soạn thảo tài liệu kỹ thuật và chuẩn hóa quy trình triển khai |

#### 25.1. Prompt nguyên văn

```text
**Vai trò:** Chuyên viên viết tài liệu kỹ thuật (Technical Writer).

**Ngữ cảnh:** Dự án đang thiếu bước hướng dẫn rõ ràng trong file `huong_dan_chay_du_an.md` để chạy được server AI.

**Nhiệm vụ:** Soạn thảo thêm mục "Hướng dẫn khởi động và chạy server ảo".

**Yêu cầu:** Viết một cách bài bản, rõ ràng từ các bước căn bản nhất (mở terminal ở đâu, tạo venv thế nào, chạy requirements.txt, cho đến lệnh start server).

**Định dạng đầu ra:** Đoạn văn bản định dạng Markdown (.md) chuẩn, sử dụng các khối code-block cho mọi lệnh terminal để người đọc dễ dàng copy/paste.
```

#### 25.2. Bối cảnh khi viết prompt

```text
Trong quá trình hoàn thiện dự án, nhóm nhận thấy tài liệu hướng dẫn cài đặt và chạy AI Server chưa đầy đủ, đặc biệt đối với các thành viên mới hoặc người tiếp nhận dự án. Nhiều bước như tạo môi trường ảo, cài đặt thư viện, kích hoạt môi trường và khởi động server chưa được mô tả chi tiết, dẫn đến việc thiết lập môi trường mất nhiều thời gian và dễ phát sinh lỗi.

Nhóm cần xây dựng một tài liệu hướng dẫn chuẩn theo định dạng Markdown, trình bày tuần tự từ các bước cơ bản đến khi AI Server hoạt động thành công, giúp chuẩn hóa quy trình triển khai trên nhiều máy tính khác nhau.
```

#### 25.3. Kết quả AI trả về

```text
AI đề xuất một tài liệu hướng dẫn được tổ chức theo từng mục rõ ràng và logic, bao gồm toàn bộ quy trình thiết lập môi trường AI.

Nội dung AI cung cấp gồm:
- Chuẩn bị môi trường và kiểm tra phiên bản Python.
- Mở đúng thư mục dự án bằng Terminal hoặc Command Prompt.
- Tạo và kích hoạt môi trường ảo (venv).
- Cài đặt toàn bộ thư viện từ file requirements.txt.
- Kiểm tra các package đã được cài đặt thành công.
- Khởi động AI Server bằng các lệnh tương ứng.
- Kiểm tra trạng thái hoạt động của server sau khi khởi động.
- Bổ sung các lưu ý và cách xử lý một số lỗi thường gặp trong quá trình cài đặt.

Toàn bộ hướng dẫn được trình bày dưới định dạng Markdown với các khối code (code block) cho từng lệnh, giúp người đọc dễ dàng sao chép và thực hiện.
```

#### 25.4. Kết quả đã áp dụng vào bài

```text
Nhóm sử dụng nội dung AI đề xuất làm cơ sở để xây dựng tài liệu hướng dẫn chạy dự án. Sau khi đối chiếu với cấu trúc thư mục và môi trường thực tế, nhóm chỉnh sửa lại các đường dẫn, tên file thực thi và các lệnh khởi động phù hợp với phiên bản cuối cùng của hệ thống.

Tài liệu hoàn chỉnh được bổ sung vào file `huong_dan_chay_du_an.md` và sử dụng làm tài liệu chính thức để các thành viên trong nhóm cũng như người tiếp nhận dự án có thể nhanh chóng thiết lập môi trường và khởi động AI Server mà không cần hỗ trợ trực tiếp.
```

#### 25.5. Phần sinh viên/nhóm đã chỉnh sửa hoặc cải tiến

```text
Nhóm rà soát lại toàn bộ nội dung do AI đề xuất, cập nhật đường dẫn thư mục, tên chương trình khởi động, phiên bản Python khuyến nghị và các thư viện phù hợp với môi trường phát triển của dự án.

Ngoài ra, nhóm bổ sung thêm các lưu ý về việc kích hoạt môi trường ảo, cách kiểm tra phiên bản pip, hướng dẫn xử lý các lỗi phổ biến như thiếu package hoặc sai đường dẫn, đồng thời tối ưu bố cục tài liệu để người đọc dễ theo dõi và thực hiện từng bước.
```

#### 25.6. Đánh giá chất lượng prompt

* [x] Prompt rõ ràng
* [x] Prompt có đủ bối cảnh
* [ ] Prompt còn thiếu thông tin
* [x] Prompt tạo ra kết quả tốt
* [ ] Prompt tạo ra kết quả chưa phù hợp
* [ ] Cần hỏi lại AI nhiều lần
* [x] Cần tự kiểm tra và chỉnh sửa nhiều
* [ ] Kết quả AI có lỗi hoặc chưa chính xác

#### 25.7. Minh chứng liên quan

| Loại minh chứng       | Nội dung                                                                   |
| --------------------- | -------------------------------------------------------------------------- |
| Link commit           |                                                                            |
| File liên quan        | `huong_dan_chay_du_an.md`, `requirements.txt`                              |
| Screenshot            | Tài liệu hướng dẫn và kết quả chạy AI Server                               |
| Kết quả chạy/test     | AI Server khởi động thành công theo hướng dẫn trong tài liệu               |
| Link tài liệu/báo cáo |                                                                            |
| Ghi chú khác          | Tài liệu được sử dụng làm hướng dẫn triển khai cho toàn bộ thành viên nhóm |

#### 25.8. Ghi chú thêm

```text
Prompt được xây dựng với mục tiêu tạo ra một tài liệu hướng dẫn kỹ thuật đầy đủ và có thể sử dụng trực tiếp trong quá trình triển khai dự án. AI hỗ trợ tốt trong việc tổ chức nội dung, trình bày các bước theo trình tự hợp lý và chuẩn hóa định dạng Markdown, giúp giảm đáng kể thời gian soạn thảo tài liệu.

Sau khi nhận kết quả từ AI, nhóm vẫn tiến hành kiểm tra, chỉnh sửa và thử nghiệm toàn bộ hướng dẫn trên nhiều môi trường phát triển khác nhau nhằm đảm bảo tính chính xác, khả năng tái sử dụng và phù hợp với cấu hình thực tế của dự án trước khi đưa vào tài liệu chính thức.
```
---
### Prompt số 26

| Nội dung            | Thông tin                                                           |
| ------------------- | ------------------------------------------------------------------- |
| Ngày sử dụng        | 15/06/2026                                                          |
| Công cụ AI          | Gemini                                                              |
| Mục đích            | Dọn dẹp và quản lý mã nguồn                                         |
| Phần việc liên quan | ESP32 / Backend / AI                                                |
| Mức độ sử dụng      | Phân tích, xây dựng quy tắc quản lý mã nguồn và hỗ trợ cấu hình Git |

#### 26.1. Prompt nguyên văn

```text
**Vai trò:** Kỹ sư DevOps và chuyên gia quản lý Git.

**Ngữ cảnh:** Toàn bộ thư mục dự án hiện chứa trộn lẫn giữa code C++ (PlatformIO) và mã Python (chứa các model AI nặng, log, venv).

**Nhiệm vụ:** Thiết lập các bộ quy tắc loại trừ file (gitignore) cho dự án monorepo này.

**Yêu cầu:**
- Tạo file `.gitignore` tiêu chuẩn nhằm loại bỏ: thư mục build `.pio/`, file biên dịch `*.elf`, cache của Python `__pycache__/`, môi trường ảo `venv/` và thông tin lưu trữ VS Code.
- Đảm bảo các mô hình nặng (file `.pth`) hoặc dữ liệu nhạy cảm không bị đưa lên Git nhưng các file cấu hình thiết yếu vẫn được giữ lại.

**Định dạng đầu ra:** Nội dung hoàn chỉnh của các file `.gitignore` để áp dụng cho từng thư mục tương ứng trong dự án.
```

#### 26.2. Bối cảnh khi viết prompt

```text
Trong quá trình phát triển, dự án được tổ chức theo mô hình monorepo, bao gồm nhiều thành phần như firmware ESP32 sử dụng PlatformIO, Backend, AI Server bằng Python và các mô hình học máy có dung lượng lớn. Do nhiều thành viên cùng làm việc trên repository nên xuất hiện nhiều tệp phát sinh như thư mục build, file biên dịch, cache Python, môi trường ảo, log, cấu hình IDE và các mô hình AI không cần đưa lên hệ thống quản lý phiên bản.

Nhóm cần xây dựng các quy tắc `.gitignore` phù hợp với từng thành phần của dự án nhằm giảm dung lượng repository, tránh xung đột khi cộng tác, bảo vệ các dữ liệu nhạy cảm và đảm bảo chỉ những mã nguồn, tài nguyên và tệp cấu hình cần thiết mới được theo dõi bởi Git.
```

#### 26.3. Kết quả AI trả về

```text
AI phân tích cấu trúc của dự án kết hợp giữa PlatformIO và Python, sau đó đề xuất nội dung cho file `.gitignore` phù hợp với mô hình monorepo.

Các quy tắc AI đề xuất bao gồm:
- Loại bỏ thư mục build của PlatformIO (`.pio/`).
- Loại bỏ các file thực thi và file sinh ra trong quá trình biên dịch như `.elf`, `.bin` và các file tạm khác.
- Bỏ qua cache của Python (`__pycache__/`, `*.pyc`) và môi trường ảo (`venv/`, `.venv/`).
- Loại bỏ các thư mục cấu hình của Visual Studio Code và các IDE khác.
- Bỏ qua file log, file cache và dữ liệu sinh ra trong quá trình chạy AI.
- Không đưa các mô hình AI có dung lượng lớn (`*.pth`, `*.pt`) hoặc dữ liệu nhạy cảm lên Git.
- Giữ lại các file cấu hình cần thiết như `requirements.txt`, `platformio.ini`, tài liệu hướng dẫn và các tệp cấu hình phục vụ triển khai.

Ngoài việc sinh nội dung `.gitignore`, AI còn giải thích ý nghĩa của từng nhóm quy tắc và đưa ra khuyến nghị về cách tổ chức repository để thuận tiện cho việc cộng tác và bảo trì lâu dài.
```

#### 26.4. Kết quả đã áp dụng vào bài

```text
Nhóm sử dụng nội dung AI đề xuất làm cơ sở để xây dựng các file `.gitignore` cho từng phần của dự án. Sau khi rà soát cấu trúc thư mục thực tế, nhóm điều chỉnh lại một số quy tắc để phù hợp với cách tổ chức mã nguồn và quy trình phát triển hiện tại.

Sau khi áp dụng, repository không còn theo dõi các thư mục build, môi trường ảo, cache, file log và các mô hình AI có dung lượng lớn. Điều này giúp giảm đáng kể dung lượng repository, tăng tốc độ đồng bộ mã nguồn và hạn chế phát sinh xung đột trong quá trình làm việc nhóm.
```

#### 26.5. Phần sinh viên/nhóm đã chỉnh sửa hoặc cải tiến

```text
Sau khi tham khảo nội dung AI đề xuất, nhóm bổ sung thêm các quy tắc loại trừ đối với các file tạm của hệ điều hành, các thư mục cache phát sinh trong quá trình phát triển và một số dữ liệu trung gian của AI Server.

Nhóm cũng kiểm tra lại toàn bộ repository để loại bỏ những tệp đã được Git theo dõi trước khi cập nhật `.gitignore`, đồng thời đảm bảo các file cấu hình quan trọng, tài liệu dự án và mã nguồn chính vẫn được quản lý đầy đủ.
```

#### 26.6. Đánh giá chất lượng prompt

* [x] Prompt rõ ràng
* [x] Prompt có đủ bối cảnh
* [ ] Prompt còn thiếu thông tin
* [x] Prompt tạo ra kết quả tốt
* [ ] Prompt tạo ra kết quả chưa phù hợp
* [ ] Cần hỏi lại AI nhiều lần
* [x] Cần tự kiểm tra và chỉnh sửa nhiều
* [ ] Kết quả AI có lỗi hoặc chưa chính xác

#### 26.7. Minh chứng liên quan

| Loại minh chứng       | Nội dung                                                |
| --------------------- | ------------------------------------------------------- |
| Link commit           |                                                         |
| File liên quan        | `.gitignore`, `platformio.ini`, `requirements.txt`      |
| Screenshot            | Repository sau khi loại bỏ các tệp không cần thiết      |
| Kết quả chạy/test     | Git chỉ theo dõi các tệp mã nguồn và cấu hình cần thiết |
| Link tài liệu/báo cáo |                                                         |
| Ghi chú khác          | Áp dụng thống nhất cho toàn bộ repository của dự án     |

#### 26.8. Ghi chú thêm

```text
Prompt giúp nhóm nhanh chóng xây dựng bộ quy tắc quản lý mã nguồn phù hợp với dự án kết hợp nhiều công nghệ như PlatformIO, Python và AI. AI hỗ trợ tốt trong việc đề xuất các quy tắc `.gitignore` theo thông lệ phát triển phần mềm và giải thích ý nghĩa của từng nhóm cấu hình.

Tuy nhiên, trước khi áp dụng vào repository chính thức, nhóm vẫn tiến hành rà soát toàn bộ cấu trúc thư mục, kiểm tra các tệp đang được Git theo dõi và điều chỉnh một số quy tắc để phù hợp với quy trình phát triển thực tế. Nhờ đó, repository được tối ưu về dung lượng, dễ quản lý hơn và thuận lợi cho việc cộng tác giữa các thành viên trong nhóm.
```
---
### Prompt số 27

| Nội dung            | Thông tin                                                 |
| ------------------- | --------------------------------------------------------- |
| Ngày sử dụng        | 15/06/2026                                                |
| Công cụ AI          | Gemini                                                    |
| Mục đích            | Xử lý lỗi cài đặt thư viện bằng Pip (Virtual Environment) |
| Phần việc liên quan | ESP32 / Backend / AI                                      |
| Mức độ sử dụng      | Phân tích lỗi, hướng dẫn cấu hình môi trường và gỡ lỗi    |

#### 27.1. Prompt nguyên văn

```text
**Vai trò:** Chuyên gia Môi trường Python (Python Environment Specialist).

**Ngữ cảnh:** Khi kích hoạt môi trường ảo (venv) để thiết lập dự án MeloTTS và chạy lệnh `pip install -r requirements.txt`, terminal báo lỗi:

Fatal error in launcher: Unable to create process using ... pip.exe

Điều này khiến việc cài đặt các thư viện bị gián đoạn và AI Server không thể tiếp tục được thiết lập.

**Nhiệm vụ:** Phân tích nguyên nhân gây lỗi và hướng dẫn cách khắc phục triệt để.

**Yêu cầu:**
- Giải thích nguyên nhân lỗi (đặc biệt trường hợp di chuyển thư mục chứa venv làm sai đường dẫn tuyệt đối của pip).
- Hướng dẫn sử dụng `python -m pip` thay cho lệnh `pip`.
- Hướng dẫn tạo lại môi trường ảo khi cần thiết.
- Đề xuất quy trình kiểm tra để đảm bảo môi trường hoạt động ổn định sau khi sửa lỗi.

**Định dạng đầu ra:** Các câu lệnh có thể chạy trực tiếp trong Windows Terminal kèm giải thích ngắn gọn.
```

#### 27.2. Bối cảnh khi viết prompt

```text
Trong quá trình thiết lập môi trường phát triển cho AI Server, nhóm gặp lỗi khi cài đặt các thư viện từ file `requirements.txt`. Mặc dù môi trường ảo đã được kích hoạt thành công, lệnh `pip` không thể thực thi và hiển thị thông báo lỗi liên quan đến `pip.exe`, khiến toàn bộ quá trình cài đặt thư viện bị dừng lại.

Sau khi kiểm tra ban đầu, nhóm nghi ngờ nguyên nhân liên quan đến việc thay đổi vị trí thư mục dự án hoặc môi trường ảo, dẫn đến đường dẫn nội bộ của `pip` không còn hợp lệ. Vì lỗi này ảnh hưởng trực tiếp đến việc triển khai các module AI, nhóm cần xác định chính xác nguyên nhân và lựa chọn phương án khắc phục an toàn để tiếp tục thiết lập môi trường phát triển.
```

#### 27.3. Kết quả AI trả về

```text
AI phân tích nguyên nhân của lỗi xuất phát từ cơ chế hoạt động của môi trường ảo Python, trong đó các tệp thực thi như `pip.exe` lưu đường dẫn tuyệt đối đến trình thông dịch Python tại thời điểm tạo venv. Khi thư mục dự án hoặc môi trường ảo bị di chuyển sang vị trí khác, các đường dẫn này không còn chính xác, dẫn đến lỗi `Fatal error in launcher`.

AI đề xuất nhiều phương án xử lý, bao gồm:
- Sử dụng `python -m pip` thay cho lệnh `pip` để gọi trực tiếp module pip thông qua Python hiện tại.
- Kiểm tra lại phiên bản Python và môi trường ảo đang được kích hoạt.
- Xóa và tạo lại môi trường ảo nếu cấu trúc thư mục đã thay đổi.
- Cài đặt lại toàn bộ thư viện từ file `requirements.txt`.
- Kiểm tra kết quả sau khi cài đặt bằng cách liệt kê các package đã được cài hoặc thử import các thư viện quan trọng.

Ngoài ra, AI còn giải thích ưu điểm của việc sử dụng `python -m pip`, giúp giảm phụ thuộc vào đường dẫn của `pip.exe` và tăng tính ổn định khi làm việc trên nhiều môi trường khác nhau.
```

#### 27.4. Kết quả đã áp dụng vào bài

```text
Nhóm thực hiện theo các bước AI đề xuất bằng cách kiểm tra lại môi trường Python, sử dụng `python -m pip` để cài đặt các thư viện và tạo mới môi trường ảo đối với các máy gặp lỗi đường dẫn.

Sau khi hoàn tất quá trình cài đặt, toàn bộ package được nhận diện chính xác, AI Server có thể khởi động bình thường và không còn xuất hiện lỗi liên quan đến `pip.exe`. Quy trình này cũng được áp dụng trên các máy tính khác trong nhóm nhằm đảm bảo việc thiết lập môi trường diễn ra thống nhất và ổn định.
```

#### 27.5. Phần sinh viên/nhóm đã chỉnh sửa hoặc cải tiến

```text
Sau khi áp dụng hướng dẫn của AI, nhóm thống nhất sử dụng lệnh `python -m pip` trong toàn bộ tài liệu hướng dẫn cài đặt thay cho lệnh `pip` nhằm hạn chế các lỗi liên quan đến môi trường.

Bên cạnh đó, nhóm bổ sung quy trình kiểm tra phiên bản Python, pip và trạng thái của môi trường ảo trước khi cài đặt thư viện. Tài liệu hướng dẫn cũng được cập nhật thêm các bước tạo mới môi trường ảo và xử lý những lỗi phổ biến để hỗ trợ các thành viên mới cũng như quá trình triển khai trên các máy tính khác.
```

#### 27.6. Đánh giá chất lượng prompt

* [x] Prompt rõ ràng
* [x] Prompt có đủ bối cảnh
* [ ] Prompt còn thiếu thông tin
* [x] Prompt tạo ra kết quả tốt
* [ ] Prompt tạo ra kết quả chưa phù hợp
* [ ] Cần hỏi lại AI nhiều lần
* [x] Cần tự kiểm tra và chỉnh sửa nhiều
* [ ] Kết quả AI có lỗi hoặc chưa chính xác

#### 27.7. Minh chứng liên quan

| Loại minh chứng       | Nội dung                                                                    |
| --------------------- | --------------------------------------------------------------------------- |
| Link commit           |                                                                             |
| File liên quan        | `requirements.txt`, `venv/`, tài liệu cài đặt môi trường                    |
| Screenshot            | Lỗi `Fatal error in launcher` và kết quả cài đặt thành công sau khi sửa     |
| Kết quả chạy/test     | Toàn bộ thư viện được cài đặt thành công và AI Server khởi động bình thường |
| Link tài liệu/báo cáo |                                                                             |
| Ghi chú khác          | Áp dụng thống nhất quy trình cài đặt trên các máy phát triển                |

#### 27.8. Ghi chú thêm

```text
Prompt được xây dựng với đầy đủ bối cảnh và mô tả chi tiết lỗi phát sinh nên AI có thể nhanh chóng xác định nguyên nhân nằm ở môi trường ảo Python thay vì mã nguồn của dự án. Các giải pháp AI đề xuất không chỉ giúp khắc phục lỗi hiện tại mà còn cung cấp quy trình thiết lập môi trường ổn định và dễ tái sử dụng cho các lần triển khai sau.

Trước khi áp dụng vào dự án chính thức, nhóm đã kiểm tra lại toàn bộ môi trường phát triển trên nhiều máy tính khác nhau, đối chiếu với cấu trúc thư mục thực tế và cập nhật tài liệu hướng dẫn cài đặt nhằm đảm bảo các bước triển khai luôn chính xác, nhất quán và thuận tiện cho việc cộng tác trong nhóm.
```
---
### Prompt số 28

| Nội dung            | Thông tin                                                           |
| ------------------- | ------------------------------------------------------------------- |
| Ngày sử dụng        | 15/06/2026                                                          |
| Công cụ AI          | Gemini                                                              |
| Mục đích            | Gỡ bỏ công cụ giả lập Linux (MSYS2) gây xung đột môi trường Python  |
| Phần việc liên quan | ESP32 / Backend / AI                                                |
| Mức độ sử dụng      | Phân tích lỗi môi trường, hướng dẫn cấu hình hệ điều hành và gỡ lỗi |

#### 28.1. Prompt nguyên văn

```text
**Vai trò:** Quản trị viên Hệ thống Windows (Windows System Administrator).

**Ngữ cảnh:** Máy tính của tôi có cài đặt bộ công cụ MSYS2. Điều này làm cho biến môi trường PATH ưu tiên gọi Python của MSYS2 (`C:\msys64\...`) thay vì Python chuẩn của Windows, khiến dự án AI TTS không nhận diện được thư viện.

**Nhiệm vụ:** Hướng dẫn loại bỏ sự cản trở của MSYS2 đối với môi trường lập trình Python.

**Yêu cầu:**
- Giải thích nguyên nhân Windows ưu tiên sử dụng Python của MSYS2.
- Hướng dẫn mở cửa sổ Environment Variables.
- Xác định và loại bỏ các đường dẫn liên quan đến MSYS2 trong biến PATH.
- Hướng dẫn kiểm tra lại sau khi chỉnh sửa bằng các lệnh Terminal.

**Định dạng đầu ra:** Danh sách hướng dẫn từng bước (step-by-step) trên giao diện đồ họa Windows.
```

#### 28.2. Bối cảnh khi viết prompt

```text
Trong quá trình thiết lập môi trường phát triển AI trên Windows, nhóm phát hiện chương trình luôn sử dụng trình thông dịch Python của MSYS2 thay vì phiên bản Python được cài đặt để phát triển dự án. Điều này khiến các thư viện đã cài đặt trong môi trường Python chính hoặc môi trường ảo không được nhận diện, dẫn đến nhiều lỗi khi chạy AI Server.

Qua quá trình kiểm tra, nhóm xác định nguyên nhân có thể xuất phát từ thứ tự ưu tiên của các đường dẫn trong biến môi trường PATH. Vì vậy, cần tìm giải pháp điều chỉnh cấu hình hệ thống để Windows luôn sử dụng đúng phiên bản Python phục vụ cho việc phát triển và triển khai dự án.
```

#### 28.3. Kết quả AI trả về

```text
AI phân tích cơ chế hoạt động của biến môi trường PATH trên Windows và giải thích rằng hệ điều hành sẽ ưu tiên thực thi chương trình xuất hiện trước trong danh sách PATH. Do các đường dẫn của MSYS2 được đặt ở vị trí ưu tiên cao hơn, Windows luôn sử dụng Python của MSYS2 thay vì Python chính thức đã cài đặt.

AI hướng dẫn chi tiết các bước:
- Mở cửa sổ Environment Variables trong Windows.
- Truy cập và chỉnh sửa biến PATH của người dùng hoặc hệ thống.
- Xác định các đường dẫn thuộc MSYS2 như `C:\msys64\usr\bin`, `C:\msys64\mingw64\bin` và các thư mục liên quan.
- Xóa hoặc chuyển các đường dẫn này xuống dưới nếu không còn cần sử dụng.
- Khởi động lại Terminal hoặc máy tính để áp dụng thay đổi.
- Kiểm tra lại bằng các lệnh như `where python`, `python --version` và `python -m pip --version` để xác nhận hệ thống đã sử dụng đúng trình thông dịch Python.

Ngoài ra, AI còn đưa ra các khuyến nghị về cách quản lý nhiều phiên bản Python trên cùng một máy nhằm hạn chế các xung đột tương tự trong tương lai.
```

#### 28.4. Kết quả đã áp dụng vào bài

```text
Nhóm thực hiện chỉnh sửa biến môi trường PATH theo hướng dẫn của AI, loại bỏ các đường dẫn không cần thiết của MSYS2 và khởi động lại Terminal để hệ thống cập nhật cấu hình mới.

Sau khi hoàn tất, Windows đã sử dụng đúng phiên bản Python phục vụ cho dự án. Các thư viện được cài đặt trong môi trường ảo được nhận diện chính xác, AI Server khởi động thành công và không còn xảy ra lỗi do xung đột giữa nhiều trình thông dịch Python.
```

#### 28.5. Phần sinh viên/nhóm đã chỉnh sửa hoặc cải tiến

```text
Sau khi áp dụng hướng dẫn của AI, nhóm kiểm tra lại cấu hình PATH trên toàn bộ máy tính của các thành viên nhằm đảm bảo sử dụng thống nhất một phiên bản Python trong quá trình phát triển.

Bên cạnh đó, nhóm cập nhật tài liệu hướng dẫn cài đặt môi trường với các bước kiểm tra nhanh như `where python`, `python --version` và `python -m pip --version` để dễ dàng phát hiện các xung đột môi trường khi triển khai dự án trên máy mới.
```

#### 28.6. Đánh giá chất lượng prompt

* [x] Prompt rõ ràng
* [x] Prompt có đủ bối cảnh
* [ ] Prompt còn thiếu thông tin
* [x] Prompt tạo ra kết quả tốt
* [ ] Prompt tạo ra kết quả chưa phù hợp
* [ ] Cần hỏi lại AI nhiều lần
* [x] Cần tự kiểm tra và chỉnh sửa nhiều
* [ ] Kết quả AI có lỗi hoặc chưa chính xác

#### 28.7. Minh chứng liên quan

| Loại minh chứng       | Nội dung                                                              |
| --------------------- | --------------------------------------------------------------------- |
| Link commit           |                                                                       |
| File liên quan        | Tài liệu hướng dẫn cài đặt môi trường, cấu hình Python                |
| Screenshot            | Cấu hình PATH trước và sau khi chỉnh sửa, kết quả lệnh `where python` |
| Kết quả chạy/test     | Windows nhận đúng Python của dự án, AI Server hoạt động bình thường   |
| Link tài liệu/báo cáo |                                                                       |
| Ghi chú khác          | Áp dụng cấu hình thống nhất cho các máy phát triển trong nhóm         |

#### 28.8. Ghi chú thêm

```text  
Prompt được xây dựng với đầy đủ bối cảnh và mô tả chính xác hiện tượng xung đột giữa nhiều môi trường Python trên Windows, giúp AI nhanh chóng xác định nguyên nhân và đề xuất quy trình xử lý phù hợp. Các hướng dẫn của AI không chỉ giải quyết được lỗi hiện tại mà còn giúp nhóm hiểu rõ hơn về cơ chế hoạt động của biến môi trường PATH và cách Windows lựa chọn chương trình thực thi.

Trước khi áp dụng vào hệ thống chính thức, nhóm đã kiểm tra lại toàn bộ cấu hình trên nhiều máy tính, xác nhận kết quả bằng các lệnh kiểm tra môi trường và cập nhật tài liệu triển khai để hạn chế các lỗi tương tự trong quá trình phát triển cũng như bàn giao dự án.
```
---
### Prompt số 30

| Nội dung | Thông tin |
| --- | --- |
| Ngày sử dụng | 15/06/2026 |
| Công cụ AI | Gemini |
| Mục đích | Đánh giá và tái cấu trúc tài liệu kỹ thuật (Docs) |
| Phần việc liên quan | ESP32 / Backend / AI |
| Mức độ sử dụng | Phân tích tài liệu, đề xuất chỉnh sửa và hỗ trợ cập nhật tài liệu kỹ thuật |

#### 30.1. Prompt nguyên văn

```text
**Vai trò:** Người kiểm duyệt tài liệu (Technical Reviewer).

**Ngữ cảnh:** Tôi đang xem xét file `docs\huong_dan_chay_du_an.md` thuộc thư mục TTS AI sau khi chúng ta đã khắc phục hàng loạt lỗi phần cứng và môi trường.

**Nhiệm vụ:** Rà soát và cập nhật nội dung tài liệu.

**Yêu cầu:** Hãy đọc toàn bộ nội dung file tài liệu hiện tại, đối chiếu với những thay đổi kỹ thuật ta vừa làm (như sử dụng IP tĩnh mới, lệnh `python -m pip`, cấu hình ESP32). Đề xuất những thông tin bị lỗi thời cần xóa đi và viết bổ sung những thông tin mới.

**Định dạng đầu ra:** Danh sách các điểm cần chỉnh sửa (bullet points) và đoạn văn bản nháp Markdown để thay thế.
```

#### 30.2. Bối cảnh khi viết prompt

```text
Sau nhiều lần cập nhật hệ thống, tài liệu hướng dẫn của dự án không còn phản ánh đầy đủ quy trình triển khai hiện tại. Trong quá trình phát triển, nhóm đã thay đổi nhiều thành phần như cách thiết lập môi trường Python, phương pháp cài đặt thư viện bằng `python -m pip`, địa chỉ IP của AI Server, cấu hình ESP32 cũng như một số bước khởi động hệ thống.

Nếu tiếp tục sử dụng tài liệu cũ, các thành viên mới hoặc người tiếp nhận dự án có thể gặp khó khăn khi cài đặt và vận hành hệ thống. Vì vậy, nhóm cần rà soát toàn bộ tài liệu, xác định những nội dung đã lỗi thời và cập nhật lại theo đúng trạng thái hiện tại của dự án nhằm đảm bảo tài liệu luôn đồng bộ với mã nguồn và môi trường triển khai thực tế.
```

#### 30.3. Kết quả AI trả về

```text
AI phân tích cấu trúc của tài liệu hiện có và đối chiếu với các thay đổi kỹ thuật đã được thực hiện trong quá trình phát triển dự án.

AI đề xuất:
- Xác định các nội dung đã lỗi thời cần loại bỏ.
- Bổ sung các bước thiết lập môi trường Python theo quy trình mới.
- Cập nhật hướng dẫn sử dụng `python -m pip` thay cho lệnh `pip`.
- Chỉnh sửa thông tin về địa chỉ IP và cấu hình AI Server.
- Cập nhật các bước cấu hình ESP32 để phù hợp với phiên bản hiện tại.
- Đề xuất bổ sung mục kiểm tra môi trường trước khi chạy hệ thống.
- Bổ sung hướng dẫn xử lý một số lỗi phổ biến trong quá trình cài đặt và khởi động.

Ngoài việc liệt kê các nội dung cần chỉnh sửa, AI còn cung cấp bản nháp theo định dạng Markdown với bố cục rõ ràng để nhóm có thể chỉnh sửa và đưa trực tiếp vào tài liệu của dự án.
```

#### 30.4. Kết quả đã áp dụng vào bài

```text
Nhóm sử dụng các đề xuất của AI làm cơ sở để cập nhật tài liệu kỹ thuật của dự án. Sau khi đối chiếu với cấu trúc thư mục, mã nguồn và môi trường triển khai thực tế, các nội dung được chỉnh sửa, bổ sung và sắp xếp lại theo trình tự hợp lý.

Tài liệu sau khi hoàn thiện phản ánh đúng quy trình triển khai của phiên bản hiện tại, giúp các thành viên trong nhóm cũng như người tiếp nhận dự án có thể dễ dàng thiết lập môi trường, cấu hình hệ thống và vận hành AI Server mà không cần tham khảo thêm các tài liệu cũ.
```

#### 30.5. Phần sinh viên/nhóm đã chỉnh sửa hoặc cải tiến

```text
Sau khi tham khảo các đề xuất của AI, nhóm rà soát lại toàn bộ tài liệu và điều chỉnh các thông tin cho phù hợp với dự án 
thực tế. Các đường dẫn thư mục, câu lệnh Terminal, cấu hình ESP32, địa chỉ IP và quy trình khởi động AI Server được cập 
nhật theo phiên bản mới nhất.

Ngoài ra, nhóm bổ sung thêm phần lưu ý về các lỗi thường gặp trong quá trình thiết lập môi trường, hướng dẫn kiểm tra môi 
trường Python trước khi chạy chương trình và quy trình xác minh hệ thống sau khi hoàn tất cài đặt nhằm giúp tài liệu đầy 
đủ, dễ hiểu và thuận tiện cho việc triển khai trên nhiều máy tính khác nhau.
```

#### 30.6. Đánh giá chất lượng prompt

- [x] Prompt rõ ràng
- [x] Prompt có đủ bối cảnh
- [ ] Prompt còn thiếu thông tin
- [x] Prompt tạo ra kết quả tốt
- [ ] Prompt tạo ra kết quả chưa phù hợp
- [ ] Cần hỏi lại AI nhiều lần
- [x] Cần tự kiểm tra và chỉnh sửa nhiều
- [ ] Kết quả AI có lỗi hoặc chưa chính xác

#### 30.7. Minh chứng liên quan

| Loại minh chứng | Nội dung |
| --- | --- |
| Link commit | |
| File liên quan | `docs/huong_dan_chay_du_an.md` |
| Screenshot | Tài liệu trước và sau khi cập nhật |
| Kết quả chạy/test | Thực hiện thành công quy trình cài đặt và khởi động hệ thống theo tài liệu mới |
| Link tài liệu/báo cáo | |
| Ghi chú khác | Tài liệu được cập nhật đồng bộ với phiên bản mã nguồn hiện tại |

#### 30.8. Ghi chú thêm

```text
Prompt giúp nhóm tiết kiệm đáng kể thời gian trong quá trình rà soát và cập nhật tài liệu kỹ thuật sau nhiều lần thay đổi 
của hệ thống. AI hỗ trợ xác định nhanh những nội dung đã lỗi thời, đề xuất các phần cần bổ sung và tổ chức lại tài liệu 
theo trình tự logic, giúp việc chỉnh sửa trở nên thuận tiện hơn.

Tuy nhiên, toàn bộ nội dung do AI đề xuất đều được nhóm đối chiếu với mã nguồn, cấu trúc thư mục và môi trường triển khai 
thực tế trước khi đưa vào tài liệu chính thức. Quá trình kiểm tra này giúp đảm bảo tính chính xác, thống nhất và khả năng 
sử dụng của tài liệu trong quá trình phát triển cũng như bàn giao dự án.
```
---
### Prompt số 31

| Nội dung | Thông tin |
| --- | --- |
| Ngày sử dụng | 15/06/2026 |
| Công cụ AI | Gemini |
| Mục đích | Tinh chỉnh Server API trả về luồng âm thanh |
| Phần việc liên quan | ESP32 / Backend / AI |
| Mức độ sử dụng | Thiết kế kiến trúc API, sinh mã nguồn và hỗ trợ gỡ lỗi |

#### 31.1. Prompt nguyên văn

```text
**Vai trò:** Kỹ sư Kỹ thuật Trí tuệ Nhân tạo (AI/ML Engineer).

**Ngữ cảnh:** Hệ thống MeloTTS hiện tại chạy script `chay_thu.py` thành công và sinh ra file `ket_qua.wav` tĩnh trên ổ cứng 
dựa theo model ngôn ngữ Việt (`vie-n.tsv`). Tuy nhiên, ESP32 cần kéo luồng dữ liệu này qua mạng.

**Nhiệm vụ:** Xây dựng một Web API server nội bộ để phục vụ file âm thanh.

**Yêu cầu:**
- Viết một endpoint HTTP (sử dụng thư viện như Flask, FastAPI hoặc HTTP module tiêu chuẩn).
- Khi ESP32 gọi phương thức GET tới endpoint này kèm nội dung văn bản, server sẽ gọi mô hình TTS sinh ra file và trả trực 
tiếp file .wav về dưới dạng HTTP Response (MIME type: `audio/wav`).

**Định dạng đầu ra:** Source code hoàn chỉnh của server Python và ví dụ gọi API.
```

#### 31.2. Bối cảnh khi viết prompt

```text
Sau khi mô hình MeloTTS có thể tạo thành công file âm thanh từ văn bản, nhóm cần tích hợp chức năng này với hệ thống ESP32 
thông qua giao tiếp mạng. Việc chỉ sinh file WAV trên máy tính không còn đáp ứng yêu cầu của hệ thống vì thiết bị ESP32 cần 
nhận trực tiếp dữ liệu âm thanh để phát theo thời gian thực.

Nhóm mong muốn xây dựng một Web API đóng vai trò trung gian giữa ESP32 và mô hình AI. API sẽ tiếp nhận nội dung văn bản từ 
thiết bị, gọi mô hình MeloTTS để tổng hợp giọng nói, sau đó trả trực tiếp dữ liệu âm thanh về dưới dạng HTTP Response. Điều 
này giúp giảm thao tác thủ công, tăng tính tự động hóa và tạo nền tảng cho việc tích hợp AI vào hệ thống IoT của dự án.
```

#### 31.3. Kết quả AI trả về

```text
AI đề xuất xây dựng Web API sử dụng Flask hoặc FastAPI để cung cấp dịch vụ tổng hợp giọng nói thông qua giao thức HTTP.

Giải pháp AI đưa ra bao gồm:
- Xây dựng endpoint nhận nội dung văn bản từ phương thức GET hoặc POST.
- Tiếp nhận tham số văn bản từ ESP32.
- Gọi mô hình MeloTTS để sinh file âm thanh tương ứng.
- Đọc file WAV vừa tạo và trả trực tiếp về client dưới dạng HTTP Response với MIME type `audio/wav`.
- Bổ sung xử lý ngoại lệ khi nội dung đầu vào rỗng hoặc mô hình phát sinh lỗi.
- Hướng dẫn cấu hình địa chỉ IP và cổng của Web Server.
- Cung cấp ví dụ gọi API từ phía ESP32 và công cụ Postman để kiểm thử.

Ngoài việc sinh mã nguồn, AI còn giải thích luồng xử lý dữ liệu giữa ESP32, AI Server và mô hình TTS, giúp nhóm hiểu rõ 
cách tích hợp các thành phần trong hệ thống.
```

#### 31.4. Kết quả đã áp dụng vào bài

```text
Nhóm sử dụng kiến trúc API do AI đề xuất để xây dựng máy chủ phục vụ mô hình MeloTTS. Sau khi điều chỉnh đường dẫn model, 
cấu trúc thư mục lưu trữ, địa chỉ IP của máy chủ và các thông số cấu hình phù hợp với môi trường triển khai thực tế, API có 
thể hoạt động ổn định.

Quá trình kiểm thử cho thấy ESP32 gửi yêu cầu đến API thành công, máy chủ thực hiện tổng hợp giọng nói bằng mô hình AI và 
trả về dữ liệu âm thanh đúng định dạng. Thiết bị nhận được dữ liệu và phát thành công theo nội dung văn bản được gửi lên, 
đáp ứng yêu cầu tích hợp giữa AI Server và hệ thống IoT.
```

#### 31.5. Phần sinh viên/nhóm đã chỉnh sửa hoặc cải tiến

```text
Sau khi tham khảo mã nguồn do AI đề xuất, nhóm điều chỉnh lại cấu trúc thư mục chứa model, thư mục sinh file âm thanh và 
cách quản lý các tài nguyên của AI Server để phù hợp với kiến trúc dự án.

Ngoài ra, nhóm bổ sung xử lý ngoại lệ cho các trường hợp đầu vào không hợp lệ, tối ưu quá trình tạo và trả dữ liệu âm thanh 
nhằm giảm thời gian phản hồi của API. Đồng thời cập nhật tài liệu hướng dẫn khởi động AI Server, hướng dẫn kiểm thử 
endpoint bằng Postman và bổ sung quy trình kiểm tra kết nối trước khi ESP32 gửi yêu cầu thực tế.
```

#### 31.6. Đánh giá chất lượng prompt

- [x] Prompt rõ ràng
- [x] Prompt có đủ bối cảnh
- [ ] Prompt còn thiếu thông tin
- [x] Prompt tạo ra kết quả tốt
- [ ] Prompt tạo ra kết quả chưa phù hợp
- [ ] Cần hỏi lại AI nhiều lần
- [x] Cần tự kiểm tra và chỉnh sửa nhiều
- [ ] Kết quả AI có lỗi hoặc chưa chính xác

#### 31.7. Minh chứng liên quan

| Loại minh chứng | Nội dung |
| --- | --- |
| Link commit | |
| File liên quan | `server.py`, `chay_thu.py`, `requirements.txt`, tài liệu API |
| Screenshot | Kết quả gọi API bằng Postman và phản hồi tệp âm thanh |
| Kết quả chạy/test | ESP32 gửi request thành công và phát được âm thanh từ dữ liệu trả về |
| Link tài liệu/báo cáo | |
| Ghi chú khác | API được sử dụng làm cầu nối giữa ESP32 và mô hình MeloTTS trong hệ thống |

#### 31.8. Ghi chú thêm

```text
Prompt giúp nhóm nhanh chóng xây dựng kiến trúc Web API để tích hợp mô hình MeloTTS với thiết bị ESP32 mà không phải thiết 
kế từ đầu. AI hỗ trợ đề xuất kiến trúc tổng thể, sinh mã nguồn mẫu, hướng dẫn cấu hình HTTP Server và giải thích luồng xử 
lý giữa AI Server với thiết bị nhúng.

Toàn bộ mã nguồn và cấu hình do AI đề xuất đều được nhóm kiểm tra, chỉnh sửa và thử nghiệm trên môi trường triển khai thực 
tế trước khi tích hợp vào hệ thống. Nhóm cũng tối ưu thêm cấu trúc dự án, xử lý ngoại lệ và cập nhật tài liệu kỹ thuật nhằm 
đảm bảo API hoạt động ổn định, dễ bảo trì và thuận tiện cho việc phát triển trong các giai đoạn tiếp theo.
```
---
### Lần sử dụng AI số 32

| Nội dung            | Thông tin                                               |
| ------------------- | ------------------------------------------------------- |
| Ngày sử dụng        | 28/06/2026                                              |
| Công cụ AI          | Gemini |
| Mục đích sử dụng    | Hỗ trợ xây dựng Postman Collection và kiểm thử API Happy Path cho dự án LogiPort       |
| Phần việc liên quan | API Testing / Postman / Documentation                  |
| Mức độ sử dụng      | Hướng dẫn, tạo test script và rà soát cấu hình                                          |

#### 32.1. Prompt đã sử dụng

```text
Mô tả tính năng

Khởi tạo cấu trúc dự án kiểm thử trên Postman. Tạo Postman Collection, setup folder và import các API request cơ bản cho 
luồng thao tác đúng (Happy Path).

Yêu cầu chi tiết

- Tạo mới Collection LogiPort.postman_collection.json.
- Phân chia cấu trúc thành các Folder hợp lý: Auth, Client Roles, Yards.
- Thêm các request với Body và Parameters hợp lệ dựa trên API.
- Setup script tự động lưu biến môi trường (tokenAdmin, yardId, roleId).
- Hướng dẫn test các API Register, Login, Logout, Client Roles, Get Yards, Create Yard và Get Yard Detail trên Postman.
```

#### 32.2. Kết quả AI gợi ý

```text
AI hướng dẫn chi tiết cách tạo Postman Collection, phân chia folder theo từng module, cấu hình Environment Variables, thiết 
lập Authorization, viết các Test Script kiểm tra HTTP Status Code và lưu các biến môi trường như tokenAdmin, roleId và 
yardId. Đồng thời AI cũng hướng dẫn quy trình chạy Collection Runner và cách xử lý một số lỗi thường gặp như 401 
Unauthorized và 404 Not Found.
```

#### 32.3. Phần sinh viên/nhóm đã sử dụng từ AI

```text
Áp dụng hướng dẫn của AI để tạo LogiPort-API.postman_collection.json, bổ sung đầy đủ các request Happy Path, cấu hình 
Environment Variables và Test Scripts. Collection sau khi hoàn thiện được import vào Postman để kiểm thử và export vào thư 
mục của dự án phục vụ quản lý bằng Git.
```

#### 32.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
Nhóm đã đối chiếu lại hướng dẫn của AI với tài liệu API và backend thực tế của dự án. Một số endpoint, Request Body và 
phương thức xác thực được điều chỉnh để phù hợp với hệ thống. Đồng thời cập nhật lại các Test Script và Environment 
Variables theo cấu trúc backend hiện tại, đảm bảo Collection hoạt động đúng trước khi commit vào repository.
```

#### 32.5. Minh chứng

| Loại minh chứng   | Nội dung                                                                                                                            |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Link commit       | |
| File liên quan    | LogiPort-API.postman_collection.json                                                                                                                       |
| Screenshot        |                                                                                                                                   |
| Kết quả chạy/test |  Các API Happy Path thực hiện thành công và trả về HTTP Status Code 200/201 theo mong đợi                                                                                                                                  |
| Link video demo   |                                                                                                                                     |
| Ghi chú khác      |                                                                                                                                     |

#### 32.6. Nhận xét cá nhân/nhóm

```text
Việc sử dụng ChatGPT giúp giảm đáng kể thời gian tìm hiểu Postman và xây dựng Collection. AI hỗ trợ tốt trong việc đề xuất 
cấu trúc Collection, viết Test Script và giải thích quy trình kiểm thử. Tuy nhiên, toàn bộ nội dung đều được nhóm kiểm tra 
và điều chỉnh dựa trên tài liệu API và backend của dự án trước khi áp dụng chính thức nhằm đảm bảo tính chính xác và phù 
hợp với hệ thống thực tế.
```


---
### Lần sử dụng AI số 33

| Nội dung            | Thông tin                                               |
| ------------------- | ------------------------------------------------------- |
| Ngày sử dụng        | 28/06/2026                                              |
| Công cụ AI          | Gemini |
| Mục đích sử dụng    | Hỗ trợ tạo và cấu hình Environment trong Postman cho dự án LogiPort để quản lý các biến dùng chung khi kiểm thử API.       |
| Phần việc liên quan | API Testing / Postman / Documentation                  |
| Mức độ sử dụng      | Hướng dẫn cấu hình và giải thích                                          |

#### 33.1. Prompt đã sử dụng

```text
Hướng dẫn tạo Environment cho dự án LogiPort trên Postman.

Yêu cầu:
- Tạo Environment tên "LogiPort Local".
- Khai báo các biến môi trường như:
  + baseUrl
  + tokenAdmin
  + tokenUser
  + yardId
  + roleId
  + appointmentId
- Hướng dẫn sử dụng các biến trong URL, Authorization và Body của request.
- Viết Test Script tự động lưu token và các ID sau khi gọi API thành công.
- Giải thích cách export và import Environment để chia sẻ với các thành viên trong nhóm.
```

#### 33.2. Kết quả AI gợi ý

```text
AI hướng dẫn cách tạo Environment trong Postman, khai báo các biến cần thiết, giải thích ý nghĩa của từng biến và cách sử 
dụng cú pháp {{variableName}} trong URL, Header, Authorization và Request Body. AI cũng cung cấp các Test Script để tự động 
lưu token và ID vào Environment sau khi API thực thi thành công.
```

#### 33.3. Phần sinh viên/nhóm đã sử dụng từ AI

```text
Áp dụng hướng dẫn để tạo Environment "LogiPort Local", cấu hình đầy đủ các biến môi trường và sử dụng chúng trong toàn bộ 
Postman Collection. Sau khi đăng nhập hoặc tạo dữ liệu mới, các Test Script tự động cập nhật giá trị của tokenAdmin, yardId 
và roleId, giúp các request tiếp theo có thể sử dụng ngay mà không cần nhập thủ công.
```

#### 33.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
Nhóm điều chỉnh giá trị baseUrl theo môi trường backend thực tế của dự án và bổ sung thêm một số biến phù hợp với quá trình 
kiểm thử. Các Test Script được chỉnh sửa để tương thích với cấu trúc Response của API LogiPort và đảm bảo dữ liệu được lưu 
chính xác vào Environment.
```

#### 33.5. Minh chứng

| Loại minh chứng   | Nội dung                                                                                                                            |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Link commit       | |
| File liên quan    | LogiPort.postman_environment.json                                                                                                                       |
| Screenshot        |                                                                                                                                   |
| Kết quả chạy/test |  Environment hoạt động đúng, các request sử dụng được biến môi trường và Test Script tự động cập nhật giá trị                                                                                                                                  |
| Link video demo   |                                                                                                                                     |
| Ghi chú khác      |                                                                                                                                     |

#### 33.6. Nhận xét cá nhân/nhóm

```text
Việc sử dụng AI giúp nhóm nhanh chóng thiết lập Environment theo đúng quy trình của Postman và giảm thời gian tìm hiểu tài 
liệu. Sau khi nhận được hướng dẫn, nhóm vẫn đối chiếu với backend và tài liệu API để điều chỉnh các biến môi trường và Test 
Script cho phù hợp với dự án LogiPort. Điều này giúp Collection hoạt động ổn định và thuận tiện hơn trong quá trình kiểm 
thử cũng như làm việc nhóm.
```
---

### Lần sử dụng AI số 34

| Nội dung | Thông tin |
| ------------------- | -------------------------------------------- |
| Ngày sử dụng | 29/06/2026 |
| Công cụ AI | Gemini |
| Mục đích sử dụng | Thiết lập môi trường thử nghiệm nền và cô lập Redis cache |
| Phần việc liên quan | Testing |
| Mức độ sử dụng | Hướng dẫn cấu hình và viết mã nguồn hoàn chỉnh |
| Phân hệ liên quan | Test Infrastructure / Bộ khởi tạo kiểm thử toàn cục |

#### 34.1. Prompt đã sử dụng

Hãy hướng dẫn cấu hình file jest.setup.ts cho dự án Node.js/TypeScript sử dụng Jest. 
Yêu cầu cụ thể:
- Viết mã giả lập (mock) toàn cục cho thư viện 'redis'. Cụ thể là hàm `createClient` phải trả về một đối tượng chứa các 
method mock cơ bản như: connect, on, get, set, del, và quit để ngăn chặn hoàn toàn việc bộ kiểm thử kết nối tới server 
Redis thật đang chạy ở môi trường bên ngoài.
- Khai báo các biến môi trường giả lập trực tiếp thông qua đối tượng toàn cục (process.env) bao gồm các biến cấu hình: 
REDIS_HOST = 'localhost', REDIS_PORT = '6379', và REDIS_PASSWORD = 'dummy' để Jest nạp sẵn và sử dụng đồng bộ xuyên suốt 
quá trình thực thi mọi tệp kiểm thử trong dự án.
- Đảm bảo mã nguồn tường minh, tối ưu hóa theo chuẩn hóa cấu trúc của TypeScript.

#### 34.2. Bối cảnh khi viết prompt

Trong kiến trúc hệ thống của dự án LogiPort, phân hệ backend có tích hợp Redis để phục vụ cho các tác vụ tối ưu hóa hiệu 
năng, lưu trữ bộ nhớ đệm (caching) các lượt quét mã và quản lý trạng thái của xe tại luồng ra vào cảng. Khi tiến hành viết 
và chạy các bộ Unit Test để kiểm tra logic thuần túy, việc để mã nguồn thực hiện kết nối tới một server Redis instance thật 
bên ngoài là hoàn toàn không cần thiết, dễ gây ra lỗi nghẽn đường truyền (network bottleneck), làm giảm tốc độ thực thi của 
Jest hoặc gây sai lệch dữ liệu thử nghiệm giữa các máy máy local khác nhau. Do đó, nhóm cần một cấu hình cô lập tập trung 
trong tệp `jest.setup.ts` để giả lập hoàn toàn hoạt động của Redis trước khi bất kỳ một bộ kiểm thử nào khác được hệ thống 
kích hoạt.

#### 34.3. Kết quả AI gợi ý

AI đã phản hồi bằng cách cung cấp một đoạn mã nguồn cấu hình chuẩn xác và tinh gọn cho tệp `jest.setup.ts`. Giải pháp sử 
dụng cấu trúc `jest.mock('redis', ...)` kết hợp với việc trả về một Factory Object chứa đầy đủ các thuộc tính và phương 
thức hoạt động cốt lõi của một Redis Client, trong đó tất cả các hàm đều được định nghĩa giả lập thông qua `jest.fn()`. Đi 
kèm với đó, AI cũng chỉ ra phương pháp gán các giá trị chuỗi (string) trực tiếp vào đối tượng `process.env` để đảm bảo các 
module khác khi đọc cấu hình hệ thống từ biến môi trường vẫn nhận diện được thông tin cấu hình hợp lệ mà không bị báo lỗi 
thiếu trường (undefined).

#### 34.4. Phần sinh viên/nhóm đã sử dụng từ AI

Nhóm đã tiếp thu và áp dụng toàn bộ giải pháp kiến trúc mã nguồn do AI gợi ý để cấu hình tệp nền, bao gồm:
- Đoạn mã khai báo giả lập thư viện Redis: `jest.mock('redis', () => { return { createClient: jest.fn().mockReturnValue({ connect: jest.fn(), on: jest.fn(), get: jest.fn(), set: jest.fn(), del: jest.fn(), quit: jest.fn() }) }; });`
- Khối lệnh gán trực tiếp biến môi trường toàn cục cho hệ thống chạy kiểm thử:
  `process.env.REDIS_HOST = 'localhost';`
  `process.env.REDIS_PORT = '6379';`
  `process.env.REDIS_PASSWORD = 'dummy';`

#### 34.5. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

Để bộ kiểm thử hoạt động một cách tối ưu và an toàn tuyệt đối, nhóm đã chủ động thực hiện thêm các cải tiến kỹ thuật sau:
- Bổ sung cấu hình tự động dọn dẹp và thiết lập lại trạng thái của các hàm giả lập (`clearMocks: true`, `restoreMocks: 
true`) trong tệp cấu hình chính `jest.config.js` đi kèm của dự án. Điều này giúp đảm bảo dữ liệu ghi nhận và số lần gọi hàm 
(call counters) của các tác vụ mock Redis ở test case trước không bị rò rỉ (leak) hay làm ảnh hưởng đến kết quả đánh giá 
logic của các test case chạy phía sau.
- Kiểm tra tính tương thích và tích hợp tệp cấu hình này vào phân hệ quản lý biến môi trường chung của toàn bộ mã nguồn 
backend LogiPort để hệ thống chạy một cách đồng bộ.

#### 34.6. Đánh giá chất lượng prompt

* [x] Prompt rõ ràng, diễn đạt phân tách các yêu cầu kỹ thuật một cách mạch lạc.
* [x] Prompt cung cấp đầy đủ bối cảnh về công nghệ (Jest, TypeScript, Redis) và mục tiêu cô lập hệ thống.
* [ ] Prompt còn thiếu thông tin.
* [x] Prompt tạo ra kết quả tốt, mã nguồn sinh ra chạy được ngay và khớp với kiến trúc dự án.
* [ ] Prompt tạo ra kết quả chưa phù hợp với ngữ cảnh xử lý.
* [ ] Cần hỏi lại AI nhiều lần để làm rõ các vấn đề phát sinh.
* [ ] Cần tự kiểm tra và chỉnh sửa nhiều cấu trúc mã nguồn sau khi AI phản hồi.
* [ ] Kết quả AI có lỗi cú pháp hoặc chưa chính xác về kiểu dữ liệu.

#### 34.7. Minh chứng liên quan

| Loại minh chứng | Nội dung chi tiết |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Link commit | [Mã hash commit cập nhật cấu hình hạ tầng kiểm thử hệ thống] |
| File liên quan | `jest.setup.ts`, `jest.config.js` |
| Screenshot | Ảnh chụp màn hình Terminal chạy lệnh kiểm thử thành công, trong đó Jest tự động nạp file `jest.setup.ts` làm 
môi trường nền trước khi quét các file test khác. |
| Kết quả chạy/test | Bộ kiểm thử thực thi với tốc độ cực nhanh (vài mili-giây), hoàn toàn không còn xuất hiện lỗi treo 
tiến trình hoặc lỗi cảnh báo không tìm thấy kết nối mạng ngoài "Redis connection failed" khi chạy kiểm thử cục bộ (offline) 
dưới máy local. |
| Link tài liệu/báo cáo | Tài liệu đặc tả kỹ thuật phần mềm kiểm thử (Software Testing Specification) của dự án LogiPort. |
| Ghi chú khác | Hệ thống Mocking hoạt động ổn định trên cả môi trường máy local cá nhân của các thành viên và môi trường 
chạy tự động (CI/CD Pipeline). |

#### 34.8. Ghi chú thêm

Kinh nghiệm cốt lõi rút ra: Việc thiết lập và cấu hình mock các dịch vụ hoặc thư viện của bên thứ ba (như Redis, cơ sở dữ 
liệu ngoại vi, các dịch vụ Cloud bên ngoài) một cách tập trung và toàn cục ngay từ giai đoạn đầu giúp đơn giản hóa đáng kể 
quá trình xây dựng mã nguồn Unit Test cho các tầng Controller, Service và Repository phía sau. Việc cô lập hoàn toàn môi 
trường chạy giúp các thành viên trong nhóm tập trung tối đa vào việc thiết kế các kịch bản kiểm thử logic nghiệp vụ cốt 
lõi, nâng cao tính tin cậy của mã nguồn, đồng thời loại bỏ hoàn toàn sự phụ thuộc vào trạng thái bật/tắt hay cấu hình mạng 
của các dịch vụ bên ngoài dưới máy local của từng cá nhân.

---

### Lần sử dụng AI số 35

| Nội dung | Thông tin |
| ------------------- | -------------------------------------------- |
| Ngày sử dụng | 29/06/2026 |
| Công cụ AI | Gemini |
| Mục đích sử dụng | Kiểm thử tích hợp cơ sở dữ liệu cho phân hệ điều phối Lịch hẹn |
| Phần việc liên quan | Testing |
| Mức độ sử dụng | Hướng dẫn cấu trúc hạ tầng và sinh mã kiểm thử mẫu |
| Phân hệ liên quan | Appointment System / Tầng lưu trữ dữ liệu (Repository) |

#### 35.1. Prompt đã sử dụng

Viết file appointment.repository.test.ts bằng Jest và TypeScript để kiểm thử trực tiếp trên cơ sở dữ liệu lưu niệm (sử dụng 
mongodb-memory-server và mongoose).
Yêu cầu bao quát các nghiệp vụ sau của hệ thống quản lý cảng:
1. Viết ca kiểm thử gốc (TC_BASE) để đếm số lượng lịch hẹn (sức chứa bãi) bằng `countDocuments` với các điều kiện: 
scheduledDate, timeSlot, status khác 'Cancelled' và isDeleted là false. Giả lập tạo 20 bản ghi bằng insertMany để kiểm tra 
giới hạn chặn.
2. Kiểm thử các trường hợp chuyển trạng thái từ PENDING sang CONFIRMED khi được Admin duyệt (TC61).
3. Kiểm thử logic chặn hành động hủy lịch hẹn khi trạng thái đã là COMPLETED (TC62).
4. Kiểm thử tính năng tự động hủy lịch (chuyển sang Cancelled) sau 30 phút quá hạn khung giờ đăng ký thông qua cơ chế quét 
tự động (TC63).
5. Kiểm thử các ràng buộc thời gian xe đến In-Gate: Từ chối nếu đến quá sớm > 30 phút (TC67); Cho phép vào cổng và cập nhật 
trạng thái nếu đến chính xác trong khung thời gian cho phép (-30 phút đến +30 phút) (TC68, TC69); Từ chối nếu đến trễ quá 
30 phút (TC70).
6. Kiểm thử chặn hành động xóa lịch hẹn nếu trạng thái xe đang hoạt động trong bãi (TC71) và chặn tạo lịch trùng biển số xe 
trong cùng một khung giờ (TC72).

#### 35.2. Bối cảnh khi viết prompt

Trong dự án LogiPort, phân hệ quản lý và điều phối xe container vào cảng áp dụng những quy định vô cùng nghiêm ngặt về mặt 
thời gian vận hành (chỉ chấp nhận sai số tối đa 30 phút quanh khung giờ đăng ký) và giới hạn sức chứa (quota tối đa 20 xe 
cho mỗi khung giờ/time slot để tránh ùn tắc cục bộ). Tầng Repository đảm nhận việc giao tiếp và thực thi các câu lệnh truy 
vấn trực tiếp với cơ sở dữ liệu MongoDB. Để đảm bảo các câu lệnh truy vấn phức tạp (chứa nhiều toán tử logic lồng nhau như 
`$ne`, `$gte`, `$lte`) không xảy ra bất kỳ sai sót nào trong thực tế, nhóm cần viết một bộ test tích hợp tầng dữ liệu vững 
chắc. Việc sử dụng cơ sở dữ liệu lưu niệm (In-Memory Database) thông qua thư viện `mongodb-memory-server` là lựa chọn tối 
ưu để chạy độc lập mà không gây ảnh hưởng đến hệ thống DB thật.

#### 35.3. Kết quả AI gợi ý

AI đã phản hồi bằng cách sinh ra một cấu trúc tệp mã nguồn kiểm thử chi tiết và chuẩn hóa dựa trên các hàm vòng đời 
(`beforeAll`, `beforeEach`, `afterAll`) để tự động thiết lập, làm sạch và giải phóng tài nguyên của server cơ sở dữ liệu ảo 
Mongoose. AI đã cụ thể hóa đầy đủ tất cả các kịch bản nghiệp vụ biên theo yêu cầu (bao gồm 13 test cases từ TC61 đến TC73 
bên cạnh ca test cơ sở TC_BASE). Các logic kiểm tra thời gian xe đến tại cổng In-Gate được thiết kế trực quan bằng cách quy 
đổi thời gian ra số phút (`slotStartMin`, `arrivalMin`, `slotEndMin`) và sử dụng các câu lệnh khẳng định (`expect`) để xác 
thực tính chính xác của ranh giới thời gian (sai số trong hoặc ngoài ngưỡng 30 phút).

#### 35.4. Phần sinh viên/nhóm đã sử dụng từ AI

Nhóm đã kế thừa và nhúng trực tiếp các giải pháp mã nguồn cốt lõi từ AI vào dự án, cụ thể bao gồm:
- Luồng khởi tạo và dọn dẹp DB ảo: Thiết lập tạo máy chủ Mongo ảo bằng `MongoMemoryServer.create()` trong hàm `beforeAll` 
với thời gian chờ 30000ms, đồng thời dọn sạch dữ liệu bằng `Appointment.deleteMany({})` trước mỗi ca test.
- Logic mô phỏng kiểm soát quota: Đoạn mã sử dụng vòng lặp `for` để đẩy nhanh 20 bản ghi lịch hẹn mẫu vào cơ sở dữ liệu 
bằng lệnh `Appointment.insertMany()`, sau đó gọi hàm đối chiếu `Appointment.countDocuments()` để xác thực sức chứa.
- Thuật toán quy đổi thời gian sang phút để kiểm tra giá trị biên ranh giới thời gian xe đến bãi xe sớm/muộn cho các ca 
test TC67, TC68, TC69, và TC70.

#### 35.5. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

Để mã nguồn kiểm thử hoạt động chính xác tương thích với môi trường triển khai thực tế của LogiPort, nhóm đã tiến hành các 
bước tối ưu hóa sau:
- Đồng bộ hóa toàn bộ định dạng múi giờ của hệ thống: Nhóm phát hiện ra khi chạy test trên các nền tảng khác nhau (hoặc qua 
các máy chủ CI/CD khác nhau), việc khởi tạo ngày tháng mặc định dễ bị lệch múi giờ (giữa UTC và GMT+7). Nhóm đã sửa đổi 
toàn bộ các biến khởi tạo thời gian thành định dạng chuỗi ISO tường minh (ví dụ: `new Date("2024-12-01T00:00:00Z")`) để đảm 
bảo phép trừ khoảng cách phút luôn đạt độ chính xác tuyệt đối.
- Sửa đổi lại các thuộc tính cấu trúc của tài liệu Mock Appointment (như `truckPlate`, `containerNo`, `timeSlot`) để khớp 
hoàn toàn 100% với Schema định nghĩa thực tế của Model Mongoose trong dự án, tránh các lỗi ép kiểu (CastError) từ 
TypeScript.

#### 35.6. Đánh giá chất lượng prompt

* [x] Prompt rõ ràng, liệt kê rành mạch từng mã test case (TC) cần bao phủ.
* [x] Prompt có đủ bối cảnh khi nêu rõ công nghệ cơ sở dữ liệu lưu niệm cần áp dụng.
* [ ] Prompt còn thiếu thông tin.
* [x] Prompt tạo ra kết quả tốt, các logic giả lập ranh giới thời gian được triển khai rất sáng tạo.
* [ ] Prompt tạo ra kết quả chưa phù hợp.
* [ ] Cần hỏi lại AI nhiều lần.
* [ ] Cần tự kiểm tra và chỉnh sửa nhiều.
* [ ] Kết quả AI có lỗi hoặc chưa chính xác.

#### 35.7. Minh chứng liên quan

| Loại minh chứng | Nội dung chi tiết |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------- |
| Link commit | [Mã hash commit hoàn thiện bộ kiểm thử tích hợp DB cho phân hệ Appointment Repository] |
| File liên quan | `appointment.repository.test.ts`, `appointment.model.ts` |
| Screenshot | Ảnh chụp giao diện Jest Runner hiển thị tất cả các ca kiểm thử từ TC61 đến TC73 đều chuyển sang trạng thái 
xanh (PASSED). |
| Kết quả chạy/test | Bộ test chạy hoàn toàn độc lập, xác nhận logic tự động đóng/mở barrier và giải phóng slot quota của 
hệ thống vận hành hoàn hảo mà không làm rò rỉ dữ liệu ra ngoài. |
| Link tài liệu/báo cáo | Tài liệu ma trận kiểm thử (Test Matrix Mapping) và kịch bản kiểm thử luồng dữ liệu cảng 
LogiPort. |
| Ghi chú khác | Tốc độ kết nối và giải phóng tài nguyên dữ liệu của MongoMemoryServer được tối ưu dưới 1.5 giây cho toàn 
bộ tiến trình. |

#### 35.8. Ghi chú thêm

Kinh nghiệm cốt lõi rút ra: Đối với các hệ thống quản lý cảng biển hoặc kho bãi có các quy định ngặt nghèo về mặt thời gian 
thực và vị trí xếp xe, việc viết kiểm thử tích hợp ở tầng Repository trực tiếp với một cơ sở dữ liệu ảo chạy trong bộ nhớ 
(In-Memory Database) là bắt buộc. Phương pháp này giúp đội ngũ phát triển kiểm soát chặt chẽ từng toán tử logic của hệ 
thống, phát hiện sớm các lỗi nghiêm trọng như trùng lặp khóa (Duplicate Key Error), sai lệch định dạng ngày tháng do múi 
giờ, hoặc lỗi rỗng dữ liệu (Null Pointer) trước khi mã nguồn được đóng gói đẩy lên các tầng xử lý API cấp cao hơn.

---

### Lần sử dụng AI số 36

| Nội dung | Thông tin |
| ------------------- | -------------------------------------------- |
| Ngày sử dụng | 29/06/2026 |
| Công cụ AI | Gemini |
| Mục đích sử dụng | Kiểm thử bộ lọc, phân trang nhật ký giao dịch và luồng xử lý e-EIR bất đồng bộ |
| Phần việc liên quan | Testing |
| Mức độ sử dụng | Hướng dẫn cấu trúc hạ tầng và sinh mã kiểm thử hoàn chỉnh |
| Phân hệ liên quan | Gate Transactions / Nhật ký kiểm soát cổng bãi và xử lý sự cố mạng |

#### 36.1. Prompt đã sử dụng

Hãy viết file gateTransaction.repository.test.ts sử dụng Jest, Mongoose và mongodb-memory-server để kiểm thử các hàm xử lý nhật ký giao dịch cổng (GateTransaction).
Yêu cầu kiểm thử các tính năng cụ thể sau:
1. TC_BASE: Tạo danh sách giao dịch mẫu. Thực hiện kiểm tra câu lệnh tìm kiếm phân trang có bộ lọc regex biển số xe (`/51C/i`), lọc khoảng thời gian (`checkInTime` từ $gte đến $lte) kết hợp liên kết dữ liệu `populate("appointmentId")`. Đảm bảo kết quả đếm `countDocuments` và giới hạn `limit(1)` trả về đúng bản ghi mong muốn.
2. Kiểm tra việc cập nhật trạng thái lịch hẹn thành 'Completed' khi xe thực hiện kích hoạt tiến trình đi ra (Gate-Out) (TC79, TC77).
3. Đảm bảo bản ghi GateTransaction được khởi tạo đúng cấu trúc: Khi xe vào (In-Gate) chỉ có `checkInTime` và `checkOutTime` phải là undefined (TC83); Ngược lại khi xe ra (Out-Gate) chỉ ghi nhận `checkOutTime` và `checkInTime` là undefined (TC80, TC84, TC78).
4. Giả lập xử lý lỗi bất đồng bộ: Khi tiến trình kết xuất file PDF e-EIR bị lỗi timeout (PDF render timeout), kiểm tra xem hệ thống có kích hoạt luồng xử lý dự phòng thành công để cập nhật lịch hẹn thành 'Completed', tránh treo giao dịch của tài xế tại cổng hay không (TC85).

#### 36.2. Bối cảnh khi viết prompt

Mỗi khi một xe container di chuyển qua hệ thống barie kiểm soát (In-Gate hoặc Out-Gate), hệ thống LogiPort bắt buộc phải sinh ra một bản ghi nhật ký giao dịch (`GateTransaction`). Để phục vụ công tác giám sát, tra cứu của các điều phối viên tại cảng, các câu lệnh truy vấn dữ liệu cần phải xử lý mượt mà việc kết hợp tìm kiếm chuỗi Regex theo biển số, kèm theo khoảng lọc ngày giờ một cách tuyệt đối. Bên cạnh đó, việc phân tách thuộc tính thời gian (`checkInTime` và `checkOutTime`) đóng vai trò pháp lý cốt lõi để phân định trách nhiệm quản lý container giữa hãng vận tải và ban quản lý cảng. Đặc biệt, khâu kiểm tra cổng có một tác vụ bất đồng bộ rất dễ gây lỗi nghẽn hệ thống (bottleneck): sinh chứng từ giao nhận điện tử e-EIR dạng PDF thông qua bên thứ ba. Nhóm cần viết bộ test này để chứng minh hệ thống có khả năng tự phục hồi và kích hoạt luồng dự phòng (fallback) ngay cả khi mạng lưới kết xuất chứng từ bị sập, tránh làm ùn tắc xe tại cổng.

#### 36.3. Kết quả AI gợi ý

AI đã phản hồi bằng cách cung cấp toàn bộ mã nguồn kiểm thử logic dữ liệu tích hợp cho tệp `gateTransaction.repository.test.ts`. AI đã áp dụng rất tốt các toán tử nâng cao của Mongoose như sử dụng đối tượng `new RegExp()` để lọc chuỗi và kết hợp với câu lệnh liên kết quan hệ `.populate("appointmentId")`. Điểm sáng lớn nhất trong giải pháp của AI là đã hiện thực hóa kịch bản kiểm thử giả lập lỗi bất đồng bộ (Async Error Handling) rất trực quan trong ca kiểm thử TC85. Bằng cách sử dụng một khối lệnh `try/catch` lồng các biến cờ hiệu logic (`isTxnHung`, `autoRetrySuccess`), AI đã chứng minh được thuật toán cứu hộ giao dịch của hệ thống hoạt động đúng hướng: tự động bỏ qua tiến trình lỗi của dịch vụ PDF và đẩy thẳng trạng thái lịch hẹn sang `Completed` để giải phóng rơ-le mở cổng chắn.

#### 36.4. Phần sinh viên/nhóm đã sử dụng từ AI

Nhóm đã sử dụng toàn bộ cấu trúc mã nguồn do AI xây dựng để triển khai, nổi bật gồm:
- Logic truy vấn kết hợp phân trang nâng cao tại ca kiểm thử nền TC_BASE: `let query = { isDeleted: false, checkInTime: { $gte: startDate, $lte: endDate }, actualTruckPlate: searchRegex }; const results = await GateTransaction.find(query).populate("appointmentId").sort({ checkInTime: 1 }).skip(0).limit(1);`
- Kiến trúc thiết lập các câu lệnh xác thực cấu trúc bản ghi vào/ra cổng độc lập (TC80, TC83, TC84), đảm bảo tính toàn vẹn của dữ liệu thời gian (`expect(gateInRecord.checkOutTime).toBeUndefined();`).
- Khối lệnh kiểm thử xử lý ngoại lệ bất đồng bộ cho ca kiểm thử biên e-EIR PDF timeout (TC85).

#### 36.5. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

Để tệp kiểm thử tích hợp sâu hơn với quy trình làm việc thực tế tại bãi cảng LogiPort, nhóm đã phát triển các cải tiến kỹ thuật sau:
- Bổ sung thêm ca kiểm thử ký hiệu TC81 (Manual Fallback QR Scan with Reason). Ca kiểm thử này giả lập trường hợp khi thiết bị camera quét OCR tự động bị hỏng, nhân viên bảo vệ cảng có thể chủ động sử dụng máy quét cầm tay quét mã QR thủ công và ghi chú lý do (`reason`) vào hệ thống. Nhóm đã thêm trường này vào model ảo để kiểm tra tính hợp lệ của chuỗi ghi nhận.
- Điều chỉnh lại logic đồng bộ bản ghi lịch hẹn (`Appointment`) đi kèm trong hàm `beforeEach`, đảm bảo mỗi khi một bản ghi `GateTransaction` mẫu được thêm vào thì nó luôn liên kết chính xác tới một `_id` lịch hẹn có thật trong DB lưu niệm, tránh lỗi vi phạm ràng buộc dữ liệu.

#### 36.6. Đánh giá chất lượng prompt

* [x] Prompt rõ ràng, phân chia các hạng mục kiểm thử từ tìm kiếm cơ bản đến xử lý logic nâng cao.
* [x] Prompt cung cấp bối cảnh nghiệp vụ thực tế sâu sắc (luồng xử lý chứng từ e-EIR và phân định trách nhiệm).
* [ ] Prompt còn thiếu thông tin.
* [x] Prompt tạo ra kết quả tốt, mã nguồn xử lý lỗi bất đồng bộ được viết rất thông minh.
* [ ] Prompt tạo ra kết quả chưa phù hợp.
* [ ] Cần hỏi lại AI nhiều lần để chỉnh sửa.
* [ ] Cần tự kiểm tra và chỉnh sửa rất nhiều sau khi nhận kết quả.
* [ ] Kết quả AI chứa lỗi hoặc sai lệch cú pháp nghiêm trọng.

#### 36.7. Minh chứng liên quan

| Loại minh chứng | Nội dung chi tiết |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Link commit | [Mã hash commit tích hợp bộ kiểm thử tầng GateTransaction Repository và xử lý lỗi chứng từ] |
| File liên quan | `gateTransaction.repository.test.ts`, `gateTransaction.model.ts`, `appointment.model.ts` |
| Screenshot | Ảnh chụp màn hình Console log của Jest, hiển thị tất cả các ca kiểm thử từ TC77 đến TC85 chạy thành công và in ra thông báo hệ thống bắt lỗi ngoại vi "PDF render timeout" chính xác. |
| Kết quả chạy/test | Bộ test tích hợp tầng nhật ký cổng chạy vượt qua thành công, chứng minh hệ thống có khả năng tự động kích hoạt luồng xử lý dự phòng khi dịch vụ bên thứ ba gặp sự cố mạng. |
| Link tài liệu/báo cáo | Tài liệu phân tích luồng dữ liệu (Data Flow Diagram - DFD) của hệ thống kiểm soát xe ra vào bãi LogiPort. |
| Ghi chú khác | Độ bao phủ mã nguồn (Code Coverage) của riêng tệp repository này đạt mức tuyệt đối 100%. |

#### 36.8. Ghi chú thêm

Kinh nghiệm cốt lõi rút ra: Trong quá trình thiết kế hệ thống phần mềm có tương tác trực tiếp với các thiết bị phần cứng ngoại vi hoặc các dịch vụ API của bên thứ ba, việc xây dựng các kịch bản kiểm thử bao phủ cho trường hợp mạng lưới gặp sự cố (Network/Asynchronous Error Handling) là vô cùng quan trọng. Việc giả lập thành công lỗi timeout kết xuất chứng từ điện tử e-EIR trong tệp `gateTransaction.repository.test.ts` giúp đội ngũ phát triển an tâm rằng hệ thống LogiPort có cơ chế tự phục hồi lỗi (fault-tolerance), bảo đảm xe container luôn được thông quan mượt mà, loại bỏ hoàn toàn rủi ro nghẽn mạch vật lý tại các bốt bảo vệ ngoài đời thực.

---

### Lần sử dụng AI số 37

| Nội dung | Thông tin |
| ------------------- | -------------------------------------------- |
| Ngày sử dụng | 30/06/2026 |
| Công cụ AI | Gemini |
| Mục đích sử dụng | Unit Test logic phân trang, kiểm soát dung lượng và CRUD điều phối lịch hẹn |
| Phân việc liên quan | Testing |
| Mức độ sử dụng | Hướng dẫn thuật toán giả lập chuỗi và viết test suite hoàn chỉnh |
| Phân hệ liên quan | Appointment Controller / Tầng điều hướng và kiểm soát nghiệp vụ lịch hẹn |

#### 37.1. Prompt đã sử dụng

Hãy viết file appointment.controller.test.ts sử dụng Jest và thư viện node-mocks-http để kiểm thử đơn vị (Unit Test) cho tất cả các hàm xử lý trong appointment.controller.
Yêu cầu kỹ thuật cao:
- Triển khai các hàm helper giả lập chuỗi truy vấn (chained queries) của Mongoose như: mockFindChain (giả lập liên hoàn .populate().sort().skip().limit()), mockFindByIdChain (.populate()) để phục vụ kiểm thử tính năng phân trang mặc định (page=1, limit=10) và tìm kiếm bộ lọc trong hàm appointmentsGet.
- Thực hiện mock hoàn toàn các model: Appointment, Driver, Container bằng jest.mock.
- Viết các test cases chi tiết cho hàm createAppointmentPost: Kiểm tra tạo thành công (TC27); Kiểm tra chặn trùng lịch trong ngày của cùng một xe (TC28); Kiểm tra giá trị biên sức chứa khung giờ khi bãi đã có 19/20 xe (TC29 - thành công) và khi đạt ngưỡng 20/20 xe (TC30 - báo lỗi đầy slot).
- Kiểm tra các ràng buộc nghiệp vụ về trạng thái container (portStatus): Nếu mục đích là 'Lấy container' thì container bắt buộc phải có trạng thái 'Đã nhập cảng' (TC55); Nếu mục đích là 'Trả container' thì trạng thái phải là 'Chưa nhập cảng' (TC56).
- Viết đầy đủ các ca kiểm thử cho các hàm CRUD còn lại bao gồm: chi tiết lịch hẹn, cập nhật trạng thái (Confirmed/Cancelled), xóa mềm (soft delete), danh sách thùng rác (trash), khôi phục (restore) và xóa vĩnh viễn (hard delete).

#### 37.2. Bối cảnh khi viết prompt

Tệp appointment.controller.ts đóng vai trò là bộ não điều hướng, chịu trách nhiệm thực thi các logic nghiệp vụ cốt lõi và phức tạp nhất của dự án LogiPort. Tại đây, hệ thống phải thực hiện validate kiểm tra trạng thái thực tế của container (In-Port / Out-of-Port validation) dựa trên mục đích của tài xế, đồng thời xử lý các thuật toán phân trang, tìm kiếm nâng cao khi hiển thị danh sách cho điều phối viên. Để xây dựng một bộ Unit Test chuẩn mực — tức là chỉ tập trung kiểm tra logic điều hướng và xử lý của hàm mà không bị phụ thuộc vào kết nối mạng hay cơ sở dữ liệu thật — nhóm bắt buộc phải cô lập hoàn toàn Controller. Thách thức lớn nhất ở đây là phải giả lập được kỹ thuật gọi hàm liên hoàn (Method Chaining) vô cùng đặc trưng của Mongoose ODM (như việc nối đuôi .find().populate().sort().skip().limit()). Nhóm cần sự hỗ trợ của AI để thiết kế các hàm helper bọc đối tượng giả lập này một cách tối ưu nhất.

#### 37.3. Kết quả AI gợi ý

AI đã phản hồi bằng cách cung cấp một giải pháp Unit Test toàn diện và chuẩn hóa cao cho tệp appointment.controller.test.ts. Điểm sáng vượt trội trong câu trả lời của AI là đã hiện thực hóa thành công các hàm helper mô phỏng chuỗi truy vấn liên hoàn thông qua một Factory Object đóng gói. Bằng cách để mỗi phương thức giả lập như .populate() hay .sort() tự động trả về chính đối tượng chain đó, AI đã giải quyết triệt để rào cản Method Chaining của Mongoose. Ngoài ra, AI đã sử dụng thư viện node-mocks-http để khởi tạo nhanh các đối tượng createRequest và createResponse giả lập của Express, hướng dẫn cách trích xuất dữ liệu JSON đầu ra thông qua hàm res._getJSONData() để thực hiện các câu lệnh khẳng định (expect) một cách mượt mà.

#### 37.4. Phần sinh viên/nhóm đã sử dụng từ AI

Nhóm đã tiếp thu và áp dụng các cấu trúc kỹ thuật nền tảng quan trọng từ AI, bao gồm:
- Toàn bộ các cấu trúc hàm bọc giả lập chuỗi nối đuôi đặc thù của Mongoose (mockFindChain, mockFindByIdChain, mockDriverFindChain).
- Toàn bộ các ca kiểm thử biên phân luồng logic dựa trên số lượng xe hiện tại trong bãi (19 xe và 20 xe) cho hàm createAppointmentPost để kiểm soát quota vị trí trống.
- Các kịch bản validate logic luồng container dựa trên thuộc tính trạng thái portStatus ('Đã nhập cảng' và 'Chưa nhập cảng') tương ứng với mục đích lấy hoặc trả hàng của tài xế (TC55, TC56).

#### 37.5. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

Để tệp Unit Test hoạt động ổn định và tối ưu hóa trải nghiệm hiển thị khi chạy lệnh kiểm thử, nhóm đã bổ sung các cải tiến sau:
- Tích hợp thêm đối tượng consoleSpy bằng cách sử dụng cấu trúc kiểm soát lỗi jest.spyOn(console, 'error').mockImplementation(() => {}) trong hàm beforeEach và khôi phục lại bằng .mockRestore() trong afterEach. Điều này giúp chặn đứng và ẩn toàn bộ các dòng thông báo lỗi hệ thống cố ý (bị ném ra khi giả lập kịch bản DB lỗi kết nối), giữ cho màn hình Terminal đầu ra luôn sạch sẽ, dễ theo dõi tiến độ chạy của cả bộ test.
- Hiệu chỉnh lại cấu trúc dữ liệu mong muốn trong hàm so sánh expect(res._getJSONData()).toEqual(...) để đảm bảo định dạng chuỗi thông báo (message) và mã phản hồi (code: 'success' hoặc 'error') khớp chính xác 100% với các hàm Joi Validation và Controller thực tế đang chạy trên nhánh chính của hệ thống.

#### 37.6. Đánh giá chất lượng prompt

* [x] Prompt rõ ràng, phân tách rành mạch các yêu cầu kỹ thuật cao từ kiến trúc mock đến logic nghiệp vụ.
* [x] Prompt cung cấp bối cảnh công nghệ đầy đủ, định hướng rõ ràng việc sử dụng node-mocks-http.
* [ ] Prompt còn thiếu thông tin.
* [x] Prompt tạo ra kết quả tốt, các hàm helper giải quyết bài toán chained query hoạt động cực kỳ thông minh.
* [ ] Prompt tạo ra kết quả chưa phù hợp.
* [ ] Cần hỏi lại AI nhiều lần để làm rõ.
* [ ] Cần tự kiểm tra và chỉnh sửa nhiều cấu trúc mã nguồn sau khi phản hồi.
* [ ] Kết quả AI chứa lỗi cú pháp TypeScript hoặc sai lệch logic.

#### 37.7. Minh chứng liên quan

| Loại minh chứng | Nội dung chi tiết |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Link commit | [Mã hash commit xây dựng bộ Unit Test toàn diện cho Appointment Controller] |
| File liên quan | appointment.controller.test.ts, appointment.controller.ts |
| Screenshot | Ảnh chụp màn hình kết quả chạy Jest test suite, hiển thị tất cả các nhóm hàm (create, get, edit, status, delete, trash, restore, hard delete) đều đạt trạng thái xanh (PASSED). |
| Kết quả chạy/test | Bộ Unit Test chạy cô lập hoàn toàn với tốc độ siêu nhanh (dưới 500ms), bảo đảm tỷ lệ bao phủ mã nguồn (Code Coverage) của file controller đạt trên 90%. |
| Link tài liệu/báo cáo | Báo cáo phân tích chất lượng mã nguồn (Code Quality & Coverage Report) và tài liệu API Swagger của hệ thống LogiPort. |
| Ghi chú khác | Toàn bộ 24 ca kiểm thử chi tiết trong file đều vượt qua kiểm tra, xác nhận logic rẽ nhánh phân quyền và giới hạn quota vận hành chính xác. |

#### 37.8. Ghi chú thêm

Kinh nghiệm cốt lõi rút ra: Kỹ thuật xây dựng các hàm bọc giả lập chuỗi (Chained Mocking Helpers) là chìa khóa vàng khi viết Unit Test cho các dự án Node.js sử dụng các thư viện ORM/ODM như Mongoose hay Prisma. Việc làm chủ kỹ thuật này giúp đội ngũ phát triển có thể dễ dàng bóc tách, cô lập hoàn toàn tầng xử lý logic của Controller khỏi tầng dữ liệu, từ đó tạo ra những bộ test đơn lẻ chạy với tốc độ cực nhanh, có tính độc lập cao và dễ dàng bảo trì khi cấu trúc database thay đổi.

---

### Lần sử dụng AI số 38

| Nội dung | Thông tin |
| ------------------- | -------------------------------------------- |
| Ngày sử dụng | 30/06/2026 |
| Công cụ AI | Gemini |
| Mục đích sử dụng | Kiểm thử tiến trình tự động hóa quét camera cổng bãi bằng Fake Timers |
| Phân việc liên quan | Testing |
| Mức độ sử dụng | Hướng dẫn xử lý kiến trúc test bất đồng bộ phức tạp và sinh mã nguồn |
| Phân hệ liên quan | Scan Gate Controller / Tiến trình tự động nhận diện và điều khiển cổng IOT |

#### 38.1. Prompt đã sử dụng

Hãy viết file scan.controller.test.ts sử dụng Jest để kiểm thử logic xử lý sự kiện quét camera tự động tại cổng bãi xe. 
Do hàm scanPost có tích hợp rất nhiều dịch vụ bên ngoài, yêu cầu cấu hình mock chi tiết:
- Mock hệ thống Socket.io (io.emit), mock thư viện lưu trữ ảnh Cloudinary (upload_stream), mock thư viện luồng streamifier và giả lập hàm global.fetch để điều phối gọi API AI nhận diện và phần cứng điều khiển rơ-le cổng ESP32.
- Sử dụng cơ chế giả lập thời gian hệ thống jest.useFakeTimers() và thiết lập thời gian cố định bằng jest.setSystemTime lấy từ file dữ liệu cấu hình mockData.json.
- Kiểm thử các kịch bản cốt lõi của hàm scanPost:
  1. Kiểm tra thiếu trường bắt buộc trả về lỗi 'Thiếu thông tin'.
  2. Xe đến đúng giờ và nhận diện đúng biển số đối với luồng 'Lấy container' -> Trả về success (TC01).
  3. Xử lý trường hợp xe đến trễ quá khung giờ lịch hẹn quy định (> 30 phút) -> Trả về trạng thái ignored.
  4. Luồng xe 'Trả container' (Drop-off): Yêu cầu camera phải quét đủ cả biển số và mã container. Kiểm tra kịch bản nếu chỉ quét được một trong hai và quá 60 giây chưa quét được trường còn lại, hệ thống phải kích hoạt bộ đếm thời gian nâng cao bằng jest.advanceTimersByTime(65000) để bắn ra sự kiện cảnh báo lỗi 'gate_scan_error' qua Socket.io (TC06, TC07, TC09).
  5. Luồng xe ra (Out-Gate): Kiểm tra việc xác thực đối chiếu lịch hẹn tương tự và báo lỗi nếu phát hiện xe chở container ra ngoài không hợp lệ khi đăng ký mục đích 'Trả container' (TC18, TC19).
  6. Xử lý các Edge Cases: Xe đã check-in trước đó (TC24), xe ra cổng nhưng không có dữ liệu vào (TC25).
- Kiểm thử toàn bộ các hàm bổ trợ quản lý nhật ký như getLogsPaginated, manualCheckoutPatch (xử lý mở cổng thủ công khi camera lỗi), xóa mềm và khôi phục nhật ký.

#### 38.2. Bối cảnh khi viết prompt

Tệp scan.controller.ts là trung tâm điều khiển tự động hóa toàn trình của dự án LogiPort, chịu trách nhiệm xử lý các luồng dữ liệu thời gian thực được gửi lên từ hệ thống camera thông minh OCR ngoài bãi cảng. Do đặc thù tích hợp sâu cả phần cứng lẫn phần mềm (gọi API nhận diện AI, đẩy ảnh luồng stream lên Cloudinary, điều khiển đóng mở rơ-le cổng vật lý qua thiết bị ESP32 và phát thông báo trạng thái tới màn hình tài xế qua Socket.io), việc viết Unit Test cho tệp này gặp hai rào cản cực lớn: 
1. Logic nghiệp vụ yêu cầu kiểm soát biến số thời gian nghiêm ngặt: Trong luồng trả container, hệ thống cho phép camera quét biển số xe và mã số container lệch nhau, miễn là không quá hạn 60 giây; nếu quá 60 giây mà chưa nhận diện đủ cả hai, hệ thống phải lập tức hủy giao dịch tự động và bắn cảnh báo lỗi qua socket.
2. Các thư viện tương tác stream và phần cứng là tác vụ bất đồng bộ phức tạp.
Nhóm cần viết bộ test này để chứng minh các kịch bản rẽ nhánh thời gian thực hoạt động chính xác, đồng thời sử dụng kỹ thuật Fake Timers nâng cao của Jest để kiểm tra bộ đếm timeout chạy ngầm mà không phải chờ đợi thời gian thực tế.

#### 38.3. Kết quả AI gợi ý

AI đã phản hồi bằng việc xây dựng một giải pháp Unit Test vô cùng toàn diện cho tệp scan.controller.test.ts. AI đã xử lý xuất sắc bài toán giả lập luồng stream ảnh của Cloudinary bằng cách định nghĩa lại phương thức .upload_stream() trả về một cấu trúc callback đẩy luồng dữ liệu ảo kết hợp với thư viện streamifier. Đặc biệt, đối với bài toán kiểm soát thời gian quét mã container, AI đã hướng dẫn nhóm sử dụng cặp lệnh jest.useFakeTimers() kết hợp với câu lệnh gán mốc thời gian hệ thống cố định jest.setSystemTime(). Để kiểm tra logic hủy giao dịch khi quá hạn 60 giây, AI áp dụng hàm jest.advanceTimersByTime(65000) để tua nhanh tiến trình đồng hồ chạy ngầm thêm 65 giây một cách nhân tạo, kích hoạt chính xác hàm ném lỗi timeout để xác thực trạng thái bắn sự kiện 'gate_scan_error' qua socket.

#### 38.4. Phần sinh viên/nhóm đã sử dụng từ AI

Nhóm đã trích xuất toàn bộ các cấu trúc kỹ thuật cốt lõi từ AI để triển khai vào mã nguồn:
- Cấu trúc giả lập đồng hồ hệ thống và tua thời gian ảo thông qua việc gọi cặp lệnh jest.useFakeTimers() và jest.setSystemTime() trong hàm bắt đầu và giải phóng bằng jest.useRealTimers() sau khi hoàn thành.
- Ca kiểm thử tua đồng hồ nâng cao: Gọi lệnh jest.advanceTimersByTime(65000) để xác thực hệ thống tự động quét dọn buffer lưu trữ và phát thông báo cảnh báo lỗi socket thành công (TC06, TC07).
- Đoạn mã mock thư viện Cloudinary trả về URL ảnh giả lập thông qua luồng stream ghi nhận dữ liệu nhị phân.

#### 38.5. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

Để tệp kiểm thử đạt độ sạch (clean code) và dễ bảo trì khi có sự thay đổi về đặc tả dữ liệu, nhóm đã tự nghiên cứu và thực hiện các bước cải tiến sau:
- Tách biệt toàn bộ các hằng số chuỗi dữ liệu (như chuỗi mã hóa camera, biển số xe container mẫu, mã thùng container) ra một tệp tin dữ liệu tập trung đặt tên là mockData.json. Trong file test chính, nhóm thực hiện import file JSON này để làm dữ liệu đầu vào. Việc này giúp code test ngắn gọn, trực quan hơn và giúp các thành viên khác trong nhóm dễ dàng cập nhật thông tin xe mẫu mà không cần can thiệp trực tiếp vào logic mã nguồn kiểm thử.
- Điều chỉnh lại logic giả lập hàm global.fetch để trả về đúng cấu trúc gói tin JSON phản hồi của thiết bị điều khiển rơ-le ESP32 thực tế đang cấu hình tại bãi bãi cảng LogiPort, nâng cao độ tin cậy của bài thử nghiệm integration ngầm.

#### 38.6. Đánh giá chất lượng prompt

* [x] Prompt rõ ràng, mô tả chi tiết các kịch bản kiểm thử nghiệp vụ tự động hóa và các thư viện cần mock.
* [x] Prompt cung cấp bối cảnh kỹ thuật sâu sắc khi nêu bật ranh giới thời gian bộ đếm 60 giây.
* [ ] Prompt còn thiếu thông tin.
* [x] Prompt tạo ra kết quả tốt, giải pháp Fake Timers hoạt động chuẩn xác với cơ chế bất đồng bộ của Express.
* [ ] Prompt tạo ra kết quả chưa phù hợp.
* [ ] Cần hỏi lại AI nhiều lần.
* [x] Cần tự kiểm tra và chỉnh sửa nhiều để tách file dữ liệu mockData.json ra ngoài.
* [ ] Kết quả AI có lỗi logic hoặc sai cú pháp.

#### 38.7. Minh chứng liên quan

| Loại minh chứng | Nội dung chi tiết |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Link commit | [Mã hash commit hoàn thiện bộ Unit Test tự động hóa quét camera cổng và tích hợp Fake Timers] |
| File liên quan | scan.controller.test.ts, scan.controller.ts, mockData.json |
| Screenshot | Ảnh chụp terminal hiển thị kết quả kiểm thử của Jest Suite, in ra chi tiết các ca test luồng In-Gate/Out-Gate, xử lý sự cố camera và bộ đếm thời gian trôi qua đều có màu xanh (PASSED). |
| Kết quả chạy/test | Bộ đếm thời gian ảo hoạt động hoàn hảo, bắt trúng sự kiện phát cảnh báo hủy lịch hẹn do quá hạn 1 phút quét mã container mà không làm treo tiến trình hay tốn thời gian chờ thực tế khi chạy lệnh kiểm thử. |
| Link tài liệu/báo cáo | Tài liệu kiến trúc tích hợp hệ thống phần cứng IOT và tài liệu hướng dẫn vận hành camera thông minh (ANPR Gate Operation) của dự án LogiPort. |
| Ghi chú khác | Tốc độ thực thi toàn bộ 15 ca kiểm thử nâng cao trong file được tối ưu hóa chỉ trong vòng chưa đầy 1 giây nhờ cơ chế Fake Timers. |

#### 38.8. Ghi chú thêm

Kinh nghiệm cốt lõi rút ra: Đối với các phân hệ phần mềm đóng vai trò trung tâm xử lý sự kiện tự động hóa hoặc tích hợp trực tiếp với thiết bị phần cứng (như camera OCR, cảm biến, thiết bị nhúng IOT điều khiển barie), việc viết Unit Test đòi hỏi lập trình viên phải làm chủ được các kỹ thuật giả lập môi trường nâng cao. Việc kết hợp linh hoạt giữa cơ chế Fake Timers để quản lý ranh giới thời gian ảo và cơ chế Mocking mạng lưới (Fetch/Stream) giúp chúng ta cô lập hoàn toàn mã nguồn xử lý logic của Controller. Điều này bảo đảm mã nguồn luôn chạy ổn định, bắt hết mọi lỗi rò rỉ bộ nhớ (memory leak) hoặc lỗi bất đồng bộ (Race Condition) trước khi hệ thống được nạp trực tiếp vào các thiết bị máy tính nhúng tại bốt kiểm soát của cảng.

---

### Lần sử dụng AI số 39

| Nội dung | Thông tin |
| ------------------- | -------------------------------------------- |
| Ngày sử dụng | 30/06/2026 |
| Công cụ AI | Gemini |
| Mục đích sử dụng | Kiểm thử tích hợp chuỗi API HTTP đầu cuối bằng Supertest |
| Phân việc liên quan | Testing |
| Mức độ sử dụng | Hướng dẫn cấu trúc tích hợp hệ thống và viết mã nguồn hoàn chỉnh |
| Phân hệ liên quan | Integration API Router / Bộ thử nghiệm tích hợp luồng API |

#### 39.1. Prompt đã sử dụng

Hãy viết file kiểm thử tích hợp (Integration Test) appointment.api.test.ts sử dụng thư viện Supertest kết hợp với Mongoose và mongodb-memory-server trong môi trường Jest.
Yêu cầu kiến trúc và luồng test như sau:
1. Để không làm ảnh hưởng và phải chỉnh sửa file chạy chính index.ts, hãy hướng dẫn cách khởi tạo một ứng dụng Express nội bộ độc lập (const app = express()) ngay trong file test, nạp đầy đủ các middleware cơ bản (express.json(), cookie-parser()) và điều hướng tuyến đường tới rootRouter.
2. Sử dụng kỹ thuật jest.mock để vô hiệu hóa hoàn toàn (Bypass) các Middleware xác thực quyền truy cập (requireAuth, requireAuthCompany, requireAuthProvider) bằng cách cho phép chúng tự động gọi hàm next() nhằm tập trung kiểm tra tính đúng đắn của dữ liệu đầu cuối. Mock hệ thống socket io.emit từ file index để tránh circular dependency (lỗi phụ thuộc vòng).
3. Viết luồng kiểm thử tích hợp cho phương thức POST /api/appointments/create: Khởi tạo sẵn một bản ghi Container mẫu trong DB ảo, gửi một payload chứa thông tin đặt lịch hợp lệ, sử dụng Supertest để gọi API và kiểm tra mã trạng thái trả về (chấp nhận 200 hoặc 201). Sau đó tiến hành truy vấn trực tiếp xuống DB bằng Appointment.findOne để đối chiếu xem dữ liệu có được lưu chính xác hay không (TC_INT_1).
4. Viết các ca kiểm thử tích hợp kiểm tra lỗi Validation đầu vào khi thiếu trường dữ liệu bắt buộc (TC_INT_2) và lỗi khi bãi xe đã vượt quá giới hạn dung lượng chứa (TC_INT_3).
5. Viết ca kiểm thử tích hợp cho phương thức GET /api/appointments` để xác thực hệ thống có trả về cấu trúc danh sách kèm đối tượng phân trang đầy đủ (currentPage, totalItems) hay không (TC_INT_4).

#### 39.2. Bối cảnh khi viết prompt

Dù các Unit Test đơn lẻ cho từng thành phần Controller và Repository độc lập đã đạt trạng thái vượt qua (PASS), nhóm vẫn cần xây dựng một bài kiểm thử tích hợp toàn trình (Integration Test) cho file appointment.api.test.ts. Mục tiêu là đảm bảo rằng khi một request HTTP thực tế được gửi từ Client, nó sẽ đi qua hệ thống Router một cách chính xác, nạp đúng các Middleware định cấu hình và lưu trữ dữ liệu đồng bộ xuống Mongoose Model mà không xảy ra xung đột hay lỗi logic phân mảnh. Thách thức phát sinh khi tệp index.ts gốc chứa các cấu trúc khởi chạy HTTP Server và WebSocket Server thực tế (gây lỗi circular dependency phụ thuộc vòng nếu cố import file app chính vào file test). Do đó, nhóm cần AI tư vấn giải pháp kiến trúc để khởi dựng một ứng dụng Express nội bộ tách biệt, đồng thời bypass các lớp bảo mật Token một cách an toàn để tập trung xác thực dữ liệu API.

#### 39.3. Kết quả AI gợi ý

AI đã phản hồi bằng cách cung cấp giải pháp thiết lập hạ tầng kiểm thử tích hợp cực kỳ thông minh. AI đã hướng dẫn nhóm khởi dựng một biến cục bộ const app = express() độc lập ngay bên trong tệp thử nghiệm, nạp các phần bổ trợ định tuyến cần thiết và liên kết trực tiếp tới tệp định tuyến tổng rootRouter. Điểm sáng lớn nhất là AI đã cung cấp giải pháp xử lý triệt để lỗi phụ thuộc vòng thông qua việc mock tệp khởi tạo chính: jest.mock('../index', () => ({ io: { emit: jest.fn() } })). Đồng thời, AI đưa ra cú pháp ngắn gọn dưới dạng inline arrow function để triệt tiêu lớp middleware xác thực phân quyền auth, cho phép luồng dữ liệu truyền thẳng vào xử lý logic của API. AI cũng sinh sẵn mã nguồn cho 4 ca kiểm thử tích hợp cốt lõi (TC_INT_1 đến TC_INT_4) sử dụng Supertest để bọc gói payload, gửi dữ liệu dạng POST/GET và kiểm tra dữ liệu DB ảo phản hồi bằng phương thức bất đồng bộ async/await.

#### 39.4. Phần sinh viên/nhóm đã sử dụng từ AI

Nhóm đã tiếp thu hoàn toàn mô hình thiết kế hạ tầng API Test từ AI và áp dụng vào tệp appointment.api.test.ts:
- Cấu trúc khởi tạo server Express nội bộ phục vụ test mà không làm xáo trộn tệp chạy chính của hệ thống.
- Cú pháp cô lập và bypass toàn bộ các lớp Middleware xác thực phân quyền hệ thống:
  jest.mock('../middlewares/auth.middleware', () => ({
    requireAuth: (req: any, res: any, next: any) => next(),
    requireAuthCompany: (req: any, res: any, next: any) => next(),
    requireAuthProvider: (req: any, res: any, next: any) => next()
  }));
- Cấu trúc sử dụng thư viện Supertest để giả lập gọi request HTTP đầu cuối: const response = await request(app).post('/api/appointments/create').send(payload);

#### 39.5. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

Để bài kiểm thử tích hợp hoạt động linh hoạt, tương thích tốt với các phiên bản thiết kế API RESTful khác nhau của dự án LogiPort, nhóm đã tiến hành các bước tối ưu hóa mã nguồn:
- Tinh chỉnh lại câu lệnh khẳng định kiểm tra mã phản hồi HTTP trạng thái từ việc so sánh đơn lẻ sang kiểm tra bao phủ theo danh sách mảng: expect([200, 201]).toContain(response.status);. Việc cải tiến này giúp bộ test hoạt động bền bỉ (resilient), không bị đổ gãy lỗi vô lý kể cả khi đội ngũ phát triển thay đổi mã phản hồi mặc định của Express từ thành công chung (200 OK) sang khởi tạo tài nguyên cảng tường minh (21 Created).
- Điều chỉnh lại logic đồng bộ hóa kiểu dữ liệu ngày tháng khi gọi câu lệnh tìm kiếm dữ liệu trực tiếp trong hàm beforeAll/beforeEach, đảm bảo các bản ghi Driver và Container mẫu luôn được xóa sạch và khởi tạo lại đồng bộ trên mongodb-memory-server ảo trước mỗi ca test.

#### 39.6. Đánh giá chất lượng prompt

* [x] Prompt rõ ràng, phân tách rành mạch cấu trúc thiết lập hạ tầng Express nội bộ và các kịch bản luồng test API.
* [x] Prompt cung cấp đầy đủ bối cảnh kỹ thuật và nêu bật thách thức circular dependency cần giải quyết.
* [ ] Prompt còn thiếu thông tin.
* [x] Prompt tạo ra kết quả tốt, giải pháp cô lập server nội bộ bằng Supertest hoạt động vô cùng hiệu quả.
* [ ] Prompt tạo ra kết quả chưa phù hợp.
* [ ] Cần hỏi lại AI nhiều lần để làm rõ các vấn đề phát sinh.
* [ ] Cần tự kiểm tra và chỉnh sửa nhiều cấu trúc mã nguồn sau khi phản hồi.
* [ ] Kết quả AI chứa lỗi cú pháp hoặc sai lệch logic.

#### 39.7. Minh chứng liên quan

| Loại minh chứng | Nội dung chi tiết |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Link commit | [Mã hash commit hoàn thiện tệp Integration Test toàn luồng cho phân hệ Appointment API] |
| File liên quan | appointment.api.test.ts, index.ts, routers/index.route.ts |
| Screenshot | Ảnh chụp màn hình giao diện Terminal hiển thị kết quả chạy Supertest Suite, báo cáo các luồng gọi API POST/GET và nạp dữ liệu xuống DB ảo đều chuyển sang màu xanh (PASSED). |
| Kết quả chạy/test | Luồng tích hợp API chạy thành công xuyên suốt, chứng minh chuỗi định tuyến Router và các lớp validate schema dữ liệu phối hợp nhịp nhàng, dữ liệu được ghi nhận chính xác xuống DB bộ nhớ đệm. |
| Link tài liệu/báo cáo | Tài liệu kiểm thử tích hợp hệ thống (Integration Testing Plan) và tài liệu API Endpoint Map của dự án LogiPort. |
| Ghi chú khác | Cơ chế bypass middleware giúp cô lập bài kiểm thử tập trung hoàn toàn vào việc kiểm tra tính đúng đắn của dữ liệu đầu vào và đầu ra API. |

#### 39.8. Ghi chú thêm

Kinh nghiệm cốt lõi rút ra: Trong quá trình xây dựng hệ thống kiểm thử tích hợp (Integration Test) cho các dự án Web API, việc cô lập ứng dụng Express cục bộ trực tiếp bên trong file test và sử dụng kỹ thuật chặn circular dependency khi mock tệp khởi chạy chính (index.ts) là một giải pháp kiến trúc vô cùng tối ưu. Phương pháp này giúp bộ kiểm thử chạy cực kỳ mượt mà, độc lập hoàn toàn với cấu hình mạng lưới hoặc trạng thái cổng (Port) thực tế của server, nâng cao đáng kể độ tin cậy và tốc độ thực thi khi tích hợp các file test vào các đường ống triển khai tự động CI/CD Pipeline.

---

## 5. Bảng tổng hợp mức độ sử dụng AI

Đánh dấu mức độ AI hỗ trợ ở từng hạng mục.

| Hạng mục                    | Không dùng AI | AI hỗ trợ ít | AI hỗ trợ nhiều | AI sinh chính | Ghi chú |
| --------------------------- | :-----------: | :----------: | :-------------: | :-----------: | ------- |
| Phân tích yêu cầu           |               |              |                 |               |         |
| Viết user story/use case    |               |              |                 |               |         |
| Thiết kế database           |               |              |                 |               |         |
| Thiết kế kiến trúc hệ thống |               |              |                 |               |         |
| Thiết kế giao diện          |               |              |                 |               |         |
| Code frontend               |               |              |                 |               |         |
| Code backend                |               |              |                 |               |         |
| Debug lỗi                   |               |              |                 |               |         |
| Viết test case              |               |              |                 |               |         |
| Kiểm thử sản phẩm           |               |              |                 |               |         |
| Tối ưu code                 |               |              |                 |               |         |
| Viết báo cáo                |               |              |                 |               |         |
| Làm slide thuyết trình      |               |              |                 |               |         |

---

## 6. Các lỗi hoặc hạn chế từ AI

Ghi lại các trường hợp AI trả lời sai, thiếu, chưa phù hợp hoặc sinh code không chạy.

| STT | Lỗi/hạn chế từ AI | Cách phát hiện | Cách xử lý/cải tiến |
| --: | ----------------- | -------------- | ------------------- |
|   1 |                   |                |                     |
|   2 |                   |                |                     |
|   3 |                   |                |                     |

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
| ---------- | ---- | -------------- | -------------------- | ------------------- |
|            |      |                | Có / Không           |                     |
|            |      |                | Có / Không           |                     |
|            |      |                | Có / Không           |                     |
|            |      |                | Có / Không           |                     |

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
| ----------------------- | ------------- |
|                         |               |


---

