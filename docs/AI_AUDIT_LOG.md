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
| Ngày sử dụng |  |
| Công cụ AI | ChatGPT / Gemini / Claude / GitHub Copilot / Cursor / Antigravity / Khác |
| Mục đích sử dụng |  |
| Phần việc liên quan | Requirement / Design / Database / Frontend / Backend / Testing / Debug / Report / Presentation / Other |
| Mức độ sử dụng | Hỗ trợ ý tưởng / Hỗ trợ một phần / Hỗ trợ nhiều / Sinh chính nội dung |

#### 4.1. Prompt đã sử dụng

```text
Dán nguyên văn prompt đã hỏi AI tại đây.
```

#### 4.2. Kết quả AI gợi ý

```text
Viết tại đây...
```

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

```text
Viết tại đây...
```

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
Viết tại đây...
```

#### 4.5. Minh chứng

| Loại minh chứng | Nội dung |
|---|---|
| Link commit |  |
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
| Ngày sử dụng |  |
| Công cụ AI | ChatGPT / Gemini / Claude / GitHub Copilot / Cursor / Antigravity / Khác |
| Mục đích sử dụng |  |
| Phần việc liên quan | Requirement / Design / Database / Frontend / Backend / Testing / Debug / Report / Presentation / Other |
| Mức độ sử dụng | Hỗ trợ ý tưởng / Hỗ trợ một phần / Hỗ trợ nhiều / Sinh chính nội dung |

#### 4.1. Prompt đã sử dụng

```text
Dán nguyên văn prompt đã hỏi AI tại đây.
```

#### 4.2. Kết quả AI gợi ý

```text
Viết tại đây...
```

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

```text
Viết tại đây...
```

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
Viết tại đây...
```

#### 4.5. Minh chứng

| Loại minh chứng | Nội dung |
|---|---|
| Link commit |  |
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
