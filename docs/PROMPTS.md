# Prompt Log

## 1. Thông tin chung

| Thông tin | Nội dung |
|---|---|
| Môn học | Software Development Project |
| Mã môn học | SWP391 |
| Lớp | SE20A04 |
| Học kỳ | Ky 5 |
| Tên bài tập / Project | LogiPort |
| Tên sinh viên / Nhóm | Trần Đức Việt- Trần Thanh Tiến Đạt - Lê Tự Minh Quang - Trần Huy Hoàng - Lê Văn Phúc - Nhóm 3|
| MSSV / Danh sách MSSV | DePrompt Log

## 1. Thông tin chung

| Thông tin | Nội dung |
|---|---|
| Môn học | Software Development Project |
| Mã môn học | SWP391 |
| Lớp | SE20A04 |
| Học kỳ | Ky 5 |
| Tên bài tập / Project | LogiPort |
| Tên sinh viên / Nhóm | Trần Đức Việt- Trần Thanh Tiến Đạt - Lê Tự Minh Quang - Trần Huy Hoàng - Lê Văn Phúc - Nhóm 3|
| MSSV / Danh sách MSSV |DE190953 - DE191024 - DE190478 - DE190972 - DE190658 |
| Giảng viên hướng dẫn | Lê Thiện Nhật Quang |
| Ngày bắt đầu | 12/05/2026 |
| Ngày cập nhật gần nhất | 18/05/2026 |

---

## 2. Mục đích của file Prompt Log

File này dùng để ghi lại các prompt quan trọng đã sử dụng trong quá trình thực hiện bài tập, lab, assignment hoặc project.

Sinh viên/nhóm cần ghi lại:

- Đã hỏi AI điều gì.
- Mục đích sử dụng prompt.
- Công cụ AI đã sử dụng.
- AI đã trả lời hoặc gợi ý gì.
- Kết quả đó có được áp dụng vào bài hay không.
- Sinh viên/nhóm đã kiểm tra, chỉnh sửa hoặc cải tiến gì sau khi nhận kết quả từ AI.

---

## 3. Công cụ AI đã sử dụng

Đánh dấu các công cụ AI đã sử dụng.

- [ ] ChatGPT
- [x] Gemini
- [x] Claude
- [x] GitHub Copilot
- [x] Cursor
- [x] Antigravity
- [ ] Microsoft Copilot
- [ ] Perplexity
- [ ] Công cụ khác: ....................................

---

## 4. Bảng tổng hợp prompt đã sử dụng

| STT | Ngày | Công cụ AI | Mục đích | Prompt tóm tắt | Kết quả chính | Có sử dụng vào bài không? | Minh chứng |
|---:|---|---|---|---|---|---|---|
| 1 | 19/05/2026 | Claude | Tạo giao diện | Là senior về nextJs, tạo ra các trang cần thiết cho dự án |  | Có | https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a04_group-03-1/commit/2d7a0b7406063f917bc74946d71ecd1eac60c27f |
| 2 |  |  |  |  |  | Có / Không |  |
| 3 |  |  |  |  |  | Có / Không |  |
| 4 |  |  |  |  |  | Có / Không |  |
| 5 |  |  |  |  |  | Có / Không |  |
| 6 |  |  |  |  |  | Có / Không |  |
| 7 |  |  |  |  |  | Có / Không |  |
| 8 |  |  |  |  |  | Có / Không |  |
| 9 |  |  |  |  |  | Có / Không |  |
| 10 |  |  |  |  |  | Có / Không |  |

---

## 5. Prompt chi tiết

> Sinh viên/nhóm có thể nhân bản mẫu “Prompt số...” nhiều lần tùy số lượng prompt thực tế đã sử dụng.

---

### Prompt số 1

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 19/05/2026 |
| Công cụ AI | Claude |
| Mục đích |  |
| Phần việc liên quan | Front end |
| Mức độ sử dụng | Hỏi sinh code  |

#### 5.1. Prompt nguyên văn

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

#### 5.2. Bối cảnh khi viết prompt

Mô tả ngắn gọn vì sao sinh viên/nhóm cần dùng prompt này.

```text
Cần render ra giao diện nhanh, gọn, và đẹp để tiết kiệm thời gian. Phần lớn thời gian sẽ dành cho kết nối api tới backend.
```

#### 5.3. Kết quả AI trả về

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

#### 5.4. Kết quả đã áp dụng vào bài

Mô tả phần nào từ kết quả AI đã được sử dụng vào bài tập/project.

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

#### 5.5. Phần sinh viên/nhóm đã chỉnh sửa hoặc cải tiến

Mô tả sinh viên/nhóm đã thay đổi, kiểm tra, sửa lỗi hoặc cải tiến gì so với kết quả AI trả về.

```text
Trong trang Gate và Yard mà AI đã gen bị thiếu khung video streaming từ camera lên. Em đã thêm vào khung video streaming.
Một vài tiêu đề hoặc tên dự án chưa đồng bị hoặc hợp lí, em đã sửa lại nó
```

#### 5.6. Đánh giá chất lượng prompt

Đánh dấu các nhận xét phù hợp.

- [x] Prompt rõ ràng
- [x] Prompt có đủ bối cảnh
- [ ] Prompt còn thiếu thông tin
- [x] Prompt tạo ra kết quả tốt
- [ ] Prompt tạo ra kết quả chưa phù hợp
- [ ] Cần hỏi lại AI nhiều lần
- [ ] Cần tự kiểm tra và chỉnh sửa nhiều
- [x] Kết quả AI có lỗi hoặc chưa chính xác

#### 5.7. Minh chứng liên quan

| Loại minh chứng | Nội dung |
|---|---|
| Link commit | https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a04_group-03-1/commit/2d7a0b7406063f917bc74946d71ecd1eac60c27f |
| File liên quan |  |
| Screenshot |  |
| Kết quả chạy/test |  |
| Link tài liệu/báo cáo |  |
| Ghi chú khác |  |

#### 5.8. Ghi chú thêm

```text
Viết tại đây...
```

---

### Prompt số 2

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng |  |
| Công cụ AI | ChatGPT / Gemini / Claude / GitHub Copilot / Cursor / Antigravity / Khác |
| Mục đích |  |
| Phần việc liên quan | Requirement / Design / Database / Coding / Testing / Debug / Report / Presentation / Other |
| Mức độ sử dụng | Hỏi ý tưởng / Hỏi giải thích / Hỏi review / Hỏi debug / Hỏi sinh code / Hỏi tối ưu |

#### 5.1. Prompt nguyên văn

```text
Dán nguyên văn prompt đã hỏi AI tại đây.
```

#### 5.2. Bối cảnh khi viết prompt

```text
Viết tại đây...
```

#### 5.3. Kết quả AI trả về

```text
Viết tại đây...
```

#### 5.4. Kết quả đã áp dụng vào bài

```text
Viết tại đây...
```

#### 5.5. Phần sinh viên/nhóm đã chỉnh sửa hoặc cải tiến

```text
Viết tại đây...
```

#### 5.6. Đánh giá chất lượng prompt

- [ ] Prompt rõ ràng
- [ ] Prompt có đủ bối cảnh
- [ ] Prompt còn thiếu thông tin
- [ ] Prompt tạo ra kết quả tốt
- [ ] Prompt tạo ra kết quả chưa phù hợp
- [ ] Cần hỏi lại AI nhiều lần
- [ ] Cần tự kiểm tra và chỉnh sửa nhiều
- [ ] Kết quả AI có lỗi hoặc chưa chính xác

#### 5.7. Minh chứng liên quan

| Loại minh chứng | Nội dung |
|---|---|
| Link commit |  |
| File liên quan |  |
| Screenshot |  |
| Kết quả chạy/test |  |
| Link tài liệu/báo cáo |  |
| Ghi chú khác |  |

#### 5.8. Ghi chú thêm

```text
Viết tại đây...
```

---

### Prompt số 3

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng |  |
| Công cụ AI | ChatGPT / Gemini / Claude / GitHub Copilot / Cursor / Antigravity / Khác |
| Mục đích |  |
| Phần việc liên quan | Requirement / Design / Database / Coding / Testing / Debug / Report / Presentation / Other |
| Mức độ sử dụng | Hỏi ý tưởng / Hỏi giải thích / Hỏi review / Hỏi debug / Hỏi sinh code / Hỏi tối ưu |

#### 5.1. Prompt nguyên văn

```text
Dán nguyên văn prompt đã hỏi AI tại đây.
```

#### 5.2. Bối cảnh khi viết prompt

```text
Viết tại đây...
```

#### 5.3. Kết quả AI trả về

```text
Viết tại đây...
```

#### 5.4. Kết quả đã áp dụng vào bài

```text
Viết tại đây...
```

#### 5.5. Phần sinh viên/nhóm đã chỉnh sửa hoặc cải tiến

```text
Viết tại đây...
```

#### 5.6. Đánh giá chất lượng prompt

- [ ] Prompt rõ ràng
- [ ] Prompt có đủ bối cảnh
- [ ] Prompt còn thiếu thông tin
- [ ] Prompt tạo ra kết quả tốt
- [ ] Prompt tạo ra kết quả chưa phù hợp
- [ ] Cần hỏi lại AI nhiều lần
- [ ] Cần tự kiểm tra và chỉnh sửa nhiều
- [ ] Kết quả AI có lỗi hoặc chưa chính xác

#### 5.7. Minh chứng liên quan

| Loại minh chứng | Nội dung |
|---|---|
| Link commit |  |
| File liên quan |  |
| Screenshot |  |
| Kết quả chạy/test |  |
| Link tài liệu/báo cáo |  |
| Ghi chú khác |  |

#### 5.8. Ghi chú thêm

```text
Viết tại đây...
```

---

## 6. Prompt quan trọng nhất

Chọn một prompt có ảnh hưởng lớn nhất đến bài tập/project.

### 6.1. Prompt được chọn

```text
Dán prompt quan trọng nhất tại đây.
```

### 6.2. Vì sao prompt này quan trọng?

```text
Viết tại đây...
```

### 6.3. Kết quả prompt này mang lại

```text
Viết tại đây...
```

### 6.4. Sinh viên/nhóm đã kiểm tra kết quả như thế nào?

```text
Viết tại đây...
```

### 6.5. Sinh viên/nhóm đã cải tiến gì từ kết quả AI?

```text
Viết tại đây...
```

---

## 7. Prompt chưa hiệu quả

Ghi lại ít nhất một prompt chưa tạo ra kết quả tốt hoặc chưa phù hợp.

### 7.1. Prompt chưa hiệu quả

```text
Dán prompt chưa hiệu quả tại đây.
```

### 7.2. Vì sao prompt này chưa hiệu quả?

```text
Viết tại đây...
```

Gợi ý nguyên nhân:

- Prompt quá ngắn.
- Thiếu bối cảnh bài toán.
- Không nêu rõ yêu cầu đầu ra.
- Không cung cấp ngôn ngữ lập trình/công nghệ đang dùng.
- Không đưa lỗi cụ thể.
- Không đưa ví dụ input/output.
- Không yêu cầu AI giải thích.
- Hỏi AI làm toàn bộ thay vì hỏi từng phần.

### 7.3. Cách cải thiện prompt

```text
Viết tại đây...
```

### 7.4. Prompt sau khi cải tiến

```text
Dán prompt đã được cải tiến tại đây.
```

### 7.5. Kết quả sau khi cải tiến prompt

```text
Viết tại đây...
```

---

## 8. Bài học về cách viết prompt

### 8.1. Khi viết prompt, em/nhóm cần cung cấp thông tin gì để AI trả lời tốt hơn?

```text
Viết tại đây...
```

Gợi ý:

- Mục tiêu cần đạt.
- Bối cảnh bài toán.
- Công nghệ/ngôn ngữ lập trình đang dùng.
- Input/output mong muốn.
- Ràng buộc của đề bài.
- Lỗi đang gặp.
- Format kết quả mong muốn.
- Yêu cầu AI giải thích từng bước.

### 8.2. Em/nhóm đã học được gì về cách đặt câu hỏi cho AI?

```text
Viết tại đây...
```

### 8.3. Lần sau em/nhóm sẽ cải thiện prompt như thế nào?

```text
Viết tại đây...
```

---

## 9. Phân loại prompt đã sử dụng

Đánh dấu số lượng prompt theo từng nhóm.

| Loại prompt | Số lượng | Ví dụ prompt tiêu biểu |
|---|---:|---|
| Prompt phân tích yêu cầu |  |  |
| Prompt giải thích kiến thức |  |  |
| Prompt thiết kế giải pháp |  |  |
| Prompt thiết kế database |  |  |
| Prompt sinh code mẫu |  |  |
| Prompt debug lỗi |  |  |
| Prompt viết test case |  |  |
| Prompt review code |  |  |
| Prompt tối ưu code |  |  |
| Prompt viết báo cáo |  |  |
| Prompt chuẩn bị thuyết trình |  |  |
| Prompt khác |  |  |

---

## 10. Checklist chất lượng prompt

Sinh viên/nhóm tự kiểm tra chất lượng prompt đã dùng.

| Tiêu chí | Đã đạt? | Ghi chú |
|---|:---:|---|
| Prompt có mục tiêu rõ ràng |  |  |
| Prompt có đủ bối cảnh |  |  |
| Prompt có nêu công nghệ/ngôn ngữ sử dụng |  |  |
| Prompt có nêu yêu cầu đầu ra |  |  |
| Prompt không yêu cầu AI làm toàn bộ bài một cách máy móc |  |  |
| Prompt có yêu cầu AI giải thích hoặc phân tích |  |  |
| Kết quả AI được kiểm tra lại |  |  |
| Kết quả AI được chỉnh sửa trước khi sử dụng |  |  |
| Prompt quan trọng được ghi lại đầy đủ |  |  |
| Prompt sai/chưa hiệu quả được rút kinh nghiệm |  |  |

---

## 11. Cam kết sử dụng prompt minh bạch

Sinh viên/nhóm cam kết rằng:

- Các prompt quan trọng đã được ghi lại trung thực.
- Không che giấu việc sử dụng AI trong các phần quan trọng của bài.
- Không nộp nguyên văn kết quả AI nếu chưa kiểm tra và chỉnh sửa.
- Có khả năng giải thích các phần đã sử dụng từ AI.
- Chịu trách nhiệm với sản phẩm cuối cùng.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
|  |  |
