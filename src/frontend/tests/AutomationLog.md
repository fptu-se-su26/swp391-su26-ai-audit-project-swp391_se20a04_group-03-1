# 📖 Nhật ký Tự động hóa (Automation Log)

> Tài liệu này ghi chép lại các khó khăn kỹ thuật, những UI Component khó nhằn và các sự cố cấu hình mà nhóm đã gặp phải trong quá trình thực hiện kiểm thử tự động (E2E Testing) bằng Playwright.
> Mục đích là để các thành viên hoặc người maintain sau này có thể nhanh chóng tra cứu và áp dụng cách giải quyết.

---

## 1. Các khó khăn với React UI Components (Radix UI / Shadcn)

### 1.1 Select / Dropdown / Combobox
- **Vấn đề gặp phải**: Các component này của Radix UI/Shadcn thường sử dụng **React Portal** để render giao diện danh sách lựa chọn (listbox) ra thẳng vị trí cuối thẻ `<body>`, thoát ra ngoài cây DOM (DOM hierarchy) hiện tại của component cha. Điều này khiến cho các bộ chọn (selector) kiểu chuỗi (như `.parent-class .select-item`) bị vô hiệu hoặc báo lỗi không tìm thấy (element not found).
- **Cách khắc phục / Bài học**:
  - Hạn chế dùng bộ chọn XPath hay bộ chọn CSS quá chặt chẽ (strict child selector).
  - Ưu tiên sử dụng `page.getByRole('option', { name: 'Tên mục' })` vì nó tìm kiếm toàn cục trên màn hình, bỏ qua cấu trúc phân cấp DOM phức tạp.

### 1.2 Dialog / Modal
- **Vấn đề gặp phải**: Sự xuất hiện của các lớp phủ (overlay) / màn hình tối (backdrop) có chỉ số `z-index` cao đôi khi che mất các element phía dưới. Khi Playwright thực hiện action (click, fill) vào element bên dưới, nó sẽ văng lỗi `element intercepted` (element bị chặn bởi một thẻ khác).
- **Cách khắc phục / Bài học**:
  - Đảm bảo Playwright đợi Dialog/Modal biến mất hoàn toàn (hoặc ẩn đi) trước khi thao tác các phần tử khác bằng `await expect(dialogLocator).toBeHidden()`.
  - Nếu gặp trường hợp animation của Modal chưa đóng xong, có thể tạm dùng `{ force: true }` (như `click({ force: true })`) để bypass qua lỗi chặn layer, tuy nhiên không khuyến khích lạm dụng vì sẽ làm sai lệch trải nghiệm người dùng thực.

### 1.3 Toast Notifications
- **Vấn đề gặp phải**: Toast Notification báo hiệu "Thành công" hay "Thất bại" chỉ xuất hiện trong vài giây rồi biến mất bằng `setTimeout`. Nếu luồng test chạy hơi chậm một chút so với UI, Playwright sẽ văng lỗi `element not attached to DOM` do thẻ Toast đã bị xóa khỏi cây DOM trước khi Playwright kịp assert (kiểm chứng) nó.
- **Cách khắc phục / Bài học**:
  - Bắt locator trực tiếp vào text thông báo và đợi nó visible: `await expect(page.locator('text=Đăng nhập thành công')).toBeVisible({ timeout: 5000 })`.
  - Hạn chế lưu (assign) Toast Locator vào một biến từ quá sớm nếu bạn định kiểm tra nó nhiều lần, vì nó sẽ văng lỗi mất kết nối khi DOM bị tái tạo.

---

## 2. Sự cố cấu hình và Môi trường

### 2.1 Lỗi Timeout (do Cold Start)
- **Vấn đề gặp phải**: Khi chạy bài test lần đầu tiên trên máy local (hoặc đôi khi trên CI/CD), cả frontend (Next.js dev server) và backend (Node.js/Database connection) đều rơi vào trạng thái "Cold Start" (cần thời gian compile code và khởi động dịch vụ). Hậu quả là trang web load rất lâu hoặc gọi API trả về kết quả cực kỳ chậm, khiến cho Playwright (vốn có timeout mặc định rất gắt gao - ví dụ 30 giây) văng lỗi Timeout và làm hỏng bài test giả (false fail).
- **Cách khắc phục / Bài học**:
  - Cấu hình lại `timeout` cục bộ cho các hàm chờ: sử dụng `.waitForResponse()` thay vì chỉ chờ load xong UI.
  - Tăng thời gian timeout chung của cấu hình Playwright (trong `playwright.config.ts`) ở những luồng hoặc môi trường dễ bị cold start.
  - Sử dụng cơ chế `retries` trên CI (ví dụ: `retries: 2`) để Playwright tự động chạy lại. Thường thì lần thứ hai, server đã "warm-up" xong và test sẽ xanh trở lại.

---
