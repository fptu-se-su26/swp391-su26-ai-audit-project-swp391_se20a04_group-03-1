# 🧪 Hướng dẫn Kiểm thử E2E — LogiPort Admin

> **Testing Guide** cho dự án SWP391 — nhóm SE20A04 Group 03  
> Công nghệ: **Playwright** · **TypeScript** · **Page Object Model (POM)**

---

## 📋 Mục lục

1. [Yêu cầu môi trường](#1-yêu-cầu-môi-trường)
2. [Cài đặt và chạy app](#2-cài-đặt-và-chạy-app)
3. [Kiến trúc POM (Page Object Model)](#3-kiến-trúc-pom-page-object-model)
4. [Cấu trúc thư mục tests/](#4-cấu-trúc-thư-mục-tests)
5. [Hướng dẫn chạy từng Test Suite](#5-hướng-dẫn-chạy-từng-test-suite)
6. [Mô tả chi tiết từng Test Case](#6-mô-tả-chi-tiết-từng-test-case)
7. [API Mocking là gì và tại sao dùng?](#7-api-mocking-là-gì-và-tại-sao-dùng)
8. [Xem HTML Report & Trace Viewer khi test lỗi](#8-xem-html-report--trace-viewer-khi-test-lỗi)
9. [Template viết Test mới](#9-template-viết-test-mới)

---

## 1. Yêu cầu môi trường

| Công cụ | Phiên bản tối thiểu | Ghi chú |
|---|---|---|
| **Node.js** | v18+ | [nodejs.org](https://nodejs.org) |
| **npm** | v9+ | đi kèm Node.js |
| **Playwright** | v1.40+ | cài qua npm |
| **Trình duyệt** | Chromium (tự cài) | Playwright tự quản lý |

> ✅ **Kiểm tra nhanh:** Mở terminal, chạy `node -v` và `npm -v`. Nếu thấy version → đã sẵn sàng.

---

## 2. Cài đặt và chạy app

### Bước 1: Cài dependencies

```bash
# Đứng tại thư mục frontend
cd src/frontend

# Cài tất cả package (bao gồm Playwright)
npm install

# Cài trình duyệt do Playwright quản lý (Chromium, Firefox, WebKit)
npx playwright install
```

### Bước 2: Chạy ứng dụng (bắt buộc trước khi test)

Playwright cần app đang chạy ở `http://localhost:3000` trước khi chạy test.

```bash
# Terminal 1 — khởi động Next.js app
npm run dev
```

> ⚠️ **Quan trọng:** Giữ Terminal 1 chạy, mở Terminal 2 để chạy lệnh test.

### Bước 3: Chạy test

```bash
# Terminal 2 — chạy toàn bộ test (headless — không hiện cửa sổ)
npx playwright test

# Chạy có hiện cửa sổ trình duyệt (headed mode — dễ quan sát)
npx playwright test --headed
```

---

## 3. Kiến trúc POM (Page Object Model)

### POM là gì?

**Page Object Model** là một design pattern (mẫu thiết kế) trong E2E testing. Thay vì viết thẳng các thao tác (`page.locator(...)`, `page.click(...)`) vào file test, ta đóng gói chúng vào các **"Page Class"** — mỗi class đại diện cho một trang web.

```
❌ Không dùng POM (khó bảo trì):          ✅ Dùng POM (dễ bảo trì):

test('login', async ({ page }) => {        test('login', async ({ page }) => {
  await page.goto('/admin/login');           const loginPage = new LoginPage(page);
  await page.locator('#email')               await loginPage.open();
        .fill('admin@...');                  await loginPage.login('admin@...', 'pass');
  await page.locator('#password')            await expect(...).toBeVisible();
        .fill('pass');                     });
  await page.locator('button[type=submit]')
        .click();
  ...
});
```

### Sơ đồ kiến trúc

```
tests/
├── pages/                     ← Tầng Page Object (POM)
│   ├── BasePage.ts            ← Lớp cha — chứa navigate(), getTitle()
│   ├── LoginPage.ts           ← Trang đăng nhập (v2 — extends BasePage)
│   ├── login.pom.ts           ← Trang đăng nhập (v1 — standalone, có mock)
│   ├── HomePage.ts            ← Trang chủ
│   └── yard.page.ts           ← Trang quản lý bãi đỗ
│
├── smoke.spec.ts              ← Test cơ bản: app có chạy được không?
├── login.spec.ts              ← 12 test cases đăng nhập (dùng LoginPage.ts)
├── loginPOM.spec.ts           ← 3 test cases đăng nhập có API mock (dùng login.pom.ts)
├── home.pom.spec.ts           ← Test mẫu trang chủ (POM)
├── yard-management.spec.ts    ← Test quản lý bãi đỗ (có API mock)
└── demo-failure.spec.ts       ← Test cố tình fail để minh chứng báo lỗi
```

### Quy tắc vàng của POM

| Đặt ở đâu | Nội dung |
|---|---|
| **Page Class** (`pages/*.ts`) | Locator, thao tác (click, fill, navigate) |
| **Spec file** (`*.spec.ts`) | `expect()` — assertion kiểm tra kết quả |

> 🚫 **Không được** đặt `expect()` bên trong Page Class.

### Hai phiên bản LoginPage — Sự khác nhau

Dự án có **2 file LoginPage** vì được viết ở 2 thời điểm khác nhau:

| File | Kế thừa | Đặc điểm | Dùng bởi |
|---|---|---|---|
| `pages/LoginPage.ts` | `extends BasePage` | Chuẩn POM, dùng `input[name="email"]` | `login.spec.ts` (12 test cases) |
| `pages/login.pom.ts` | Standalone (không kế thừa) | Có locators cho toast message, dùng `#email` | `loginPOM.spec.ts` (3 test cases có mock) |

---

## 4. Cấu trúc thư mục tests/

```
tests/
│
├── pages/                        ← Page Objects (tầng abstraction)
│   ├── BasePage.ts               ← Abstract class: navigate(path), getTitle()
│   ├── LoginPage.ts              ← emailInput, passwordInput, submitButton, open(), login()
│   ├── login.pom.ts              ← emailInput, toastSuccessMessage, toastErrorMessage, goto(), login()
│   ├── HomePage.ts               ← body, open()
│   └── yard.page.ts              ← addYardButton, nameInput, cameraIpInput, successToast, createNewYard()
│
├── smoke.spec.ts                 ← Kiểm tra môi trường (1 test)
├── login.spec.ts                 ← Đăng nhập — end-to-end thật (12 tests)
├── loginPOM.spec.ts              ← Đăng nhập — API mocked (3 tests)
├── home.pom.spec.ts              ← Trang chủ POM mẫu (1 test)
├── yard-management.spec.ts       ← Quản lý bãi đỗ — API mocked (1 test)
└── demo-failure.spec.ts          ← Demo báo lỗi có screenshot + trace (luôn FAIL)
```

---

## 5. Hướng dẫn chạy từng Test Suite

Tất cả lệnh bên dưới chạy từ thư mục `src/frontend/`.

### 5.1 Chạy tất cả test

```bash
npx playwright test
```

### 5.2 Chạy theo từng file (suite)

```bash
# Smoke test — kiểm tra môi trường
npx playwright test tests/smoke.spec.ts

# Login — 12 test cases end-to-end
npx playwright test tests/login.spec.ts

# Login POM với API mock — 3 test cases
npx playwright test tests/loginPOM.spec.ts

# Trang chủ (POM mẫu)
npx playwright test tests/home.pom.spec.ts

# Quản lý bãi đỗ (API mock)
npx playwright test tests/yard-management.spec.ts

# Demo fail (cố tình fail)
npx playwright test tests/demo-failure.spec.ts
```

### 5.3 Chạy theo tên test (grep)

```bash
# Chỉ chạy test "Đăng nhập thành công"
npx playwright test --grep "Đăng nhập thành công"

# Chạy tất cả TRỪ demo-failure
npx playwright test --grep-invert "DEMO fail"
```

### 5.4 Chạy có hiện trình duyệt (headed mode)

```bash
npx playwright test --headed
```

### 5.5 Chạy debug từng bước (slow motion)

```bash
# Playwright Inspector — mở cửa sổ debug
npx playwright test --debug

# Slow motion (mỗi thao tác chậm 1 giây)
npx playwright test --headed --slow-mo 1000
```

### 5.6 Xem report sau khi chạy xong

```bash
npx playwright show-report
```

---

## 6. Mô tả chi tiết từng Test Case

### 📁 smoke.spec.ts

**Mục đích:** Kiểm tra môi trường E2E đã sẵn sàng — app có load được không.

| # | Tên test | Đầu vào | Kết quả mong đợi |
|---|---|---|---|
| 1 | `trang chủ tải được (smoke)` | `page.goto('/')` | HTTP status < 400, `<body>` visible |

---

### 📁 login.spec.ts — Admin Login Flow

**Mục đích:** Kiểm tra toàn bộ luồng đăng nhập của Admin, gọi API backend **thật**.  
**Page Object dùng:** `LoginPage.ts` (extends `BasePage`)  
**URL:** `/admin/login`

| # | Tên test case | Đầu vào | Kết quả mong đợi |
|---|---|---|---|
| 1 | ✅ Đăng nhập thành công với tài khoản Admin hợp lệ | email: `admin@logiport.com` · pass: `password123` | Text "ĐĂNG XUẤT" hiện · URL chứa `dashboard` |
| 2 | ❌ Đăng nhập thất bại khi nhập sai mật khẩu | email: `admin@logiport.com` · pass: `wrongpassword` | `errorMessage` locator visible |
| 3 | ❌ Đăng nhập thất bại với email không tồn tại | email: `nonexistent.admin@logiport.com` · pass: `password123` | Toast chứa "không chính xác" visible |
| 4 | ❌ Đăng nhập thất bại với tài khoản chưa kích hoạt | email: `inactive@logiport.com` · pass: `password123` | Toast "Tài khoản của bạn không được kích hoạt" visible |
| 5 | ❌ Đăng nhập thất bại với tài khoản đã bị xóa | email: `deleted@logiport.com` · pass: `password123` | Toast chứa "không chính xác" visible |
| 6 | ⚠️ Hiển thị lỗi validate khi bỏ trống các trường | Không nhập gì, click Submit | Lỗi "Vui lòng nhập email công vụ." và "Vui lòng nhập mật khẩu." visible |
| 7 | ⚠️ Hiển thị lỗi validate khi nhập email sai định dạng | email: `invalid-email-format` · pass: `password123` | Lỗi "Định dạng email không hợp lệ." visible |
| 8 | ⚠️ Hiển thị lỗi validate khi nhập mật khẩu quá ngắn | email: `admin@logiport.com` · pass: `12345` (5 ký tự) | Lỗi "Mật khẩu phải chứa ít nhất 6 ký tự." visible |
| 9 | 👁️ Ẩn/Hiện mật khẩu khi bấm vào biểu tượng con mắt | Nhập pass, click toggle button | `type` của input chuyển: `password` → `text` → `password` |
| 10 | 🔗 Chuyển hướng thành công sang trang Quên mật khẩu | Click link "Quên mật khẩu" | URL chứa `forgot-password` |
| 11 | ⌨️ Cho phép gửi form đăng nhập bằng phím Enter | Nhập email/pass hợp lệ, nhấn Enter | Đăng nhập thành công, URL chứa `dashboard` |
| 12 | 📱 Kiểm tra giao diện responsive trên Mobile | Viewport: 375×812 (iPhone 12 Pro) | Brand panel (left) bị ẩn · Login card (right) vẫn visible |

---

### 📁 loginPOM.spec.ts — Login với API Mock

**Mục đích:** Kiểm tra UI đăng nhập **độc lập với backend** bằng cách mock API responses.  
**Page Object dùng:** `login.pom.ts` (standalone)  
**URL:** `/admin/login`

| # | Tên test case | API Mock | Đầu vào | Kết quả mong đợi |
|---|---|---|---|---|
| 1 | ✅ Happy path: Đăng nhập thành công | `POST /auth/login` → 200 `{code:'success', token:'mock-token'}` | email/pass hợp lệ | Toast "Đăng nhập thành công!" visible · URL chứa `dashboard` |
| 2 | ❌ Đăng nhập thất bại (sai Pass) | `POST /auth/login` → 400 `{code:'error', message:'...không chính xác.'}` | pass sai | Toast error "Tài khoản hoặc mật khẩu không chính xác." visible |
| 3 | ⚠️ Kiểm tra UI Validation | Không mock (test client-side validation) | email bỏ trống | Error message "Vui lòng nhập email công vụ." visible |

---

### 📁 home.pom.spec.ts — Trang chủ (POM mẫu)

**Mục đích:** File **mẫu** minh hoạ cách viết test theo POM. Dùng để team tham khảo khi bắt đầu.

| # | Tên test case | Đầu vào | Kết quả mong đợi |
|---|---|---|---|
| 1 | `mở được trang chủ qua HomePage` | `home.open()` → `page.goto('/')` | `<body>` element visible |

---

### 📁 yard-management.spec.ts — Quản lý Bãi đỗ

**Mục đích:** Kiểm tra luồng thêm mới bãi đỗ xe với **toàn bộ API được mock**.  
**Page Object dùng:** `yard.page.ts` (extends `BasePage`)

**Setup (beforeEach):** Mock các API sau:
- `POST /auth/login` → login thành công + set cookie `tokenAdmin`
- `GET /settings/me/permissions` → trả về role `ADMIN` + `isSuperAdmin: true`
- `GET /yards` → trả về danh sách bãi đỗ ảo (ban đầu rỗng)
- `POST /yards/create` → thêm bãi đỗ vào state ảo, trả về success

| # | Tên test case | Đầu vào | Kết quả mong đợi |
|---|---|---|---|
| 1 | ✅ Nên thêm mới bãi đỗ thành công với thông tin hợp lệ | Tên: `Bãi đỗ xe tự động khu A - {timestamp}` · Camera IP: `192.168.1.50` | Toast "Tạo bãi đỗ thành công" visible · Row mới xuất hiện trong bảng |

---

### 📁 demo-failure.spec.ts — Demo báo lỗi

> ⚠️ **Test này cố tình FAIL — không phải bug!**

**Mục đích:** Minh chứng rằng cấu hình `screenshot: 'only-on-failure'` và `trace: 'retain-on-failure'` trong `playwright.config.ts` hoạt động đúng. Khi test fail, Playwright tự sinh:
- `test-results/<test>/test-failed-1.png` — ảnh chụp màn hình lúc lỗi
- `test-results/<test>/trace.zip` — file trace để mở Trace Viewer

| # | Tên test case | Hành vi |
|---|---|---|
| 1 | `DEMO fail - selector cố tình sai để sinh screenshot + trace` | Dùng `data-testid` không tồn tại → **luôn FAIL** → sinh screenshot & trace |

**Bỏ qua test này khi muốn suite xanh:**
```bash
npx playwright test --grep-invert "DEMO fail"
```

---

## 7. API Mocking là gì và tại sao dùng?

### Định nghĩa

**API Mocking** (giả lập API) là kỹ thuật chặn request HTTP từ trình duyệt và trả về response **giả** thay vì gọi đến server thật.

Playwright cung cấp hàm `page.route(urlPattern, handler)` để thực hiện điều này.

### Ví dụ từ loginPOM.spec.ts

```typescript
// Chặn mọi request đến URL chứa "/auth/login"
await page.route('**/auth/login', async (route) => {
  // Trả về response giả (không gọi server thật)
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      code: 'success',
      message: 'Đăng nhập thành công!',
      data: { token: 'mock-token' }
    })
  });
});
```

### Khi nào dùng Mock vs. Không Mock?

| Tình huống | Dùng Mock? | File ví dụ |
|---|---|---|
| Test logic UI (validation, toast, redirect) | ✅ Có | `loginPOM.spec.ts`, `yard-management.spec.ts` |
| Test end-to-end thật (cần backend chạy) | ❌ Không | `login.spec.ts` |
| Kiểm tra môi trường cơ bản | ❌ Không | `smoke.spec.ts` |
| UI code đang phát triển, backend chưa sẵn sàng | ✅ Có | `yard-management.spec.ts` |

### Lợi ích của Mocking

- 🚀 **Nhanh hơn** — không cần chờ network thật
- 🔒 **Ổn định hơn** — không bị ảnh hưởng bởi server down
- 🎯 **Kiểm soát tốt hơn** — giả lập mọi scenario (lỗi 500, timeout...)
- 🔨 **Phát triển độc lập** — test UI khi backend chưa xong

---

## 8. Xem HTML Report & Trace Viewer khi test lỗi

### 8.1 Xem HTML Report

Sau khi chạy test, Playwright tự sinh report trong thư mục `playwright-report/`.

```bash
# Mở HTML report bằng browser
npx playwright show-report
```

Report hiển thị:
- ✅ Test pass / ❌ Test fail
- Thời gian chạy từng test
- Screenshot đính kèm (nếu có lỗi)
- Link mở Trace Viewer

### 8.2 Xem Trace Viewer

**Trace Viewer** là công cụ mạnh của Playwright giúp xem lại từng bước của test như video replay.

```bash
# Mở trace của một test cụ thể
npx playwright show-trace test-results/<tên-test>/trace.zip
```

Hoặc **mở trực tiếp từ HTML Report** → Click vào test fail → Click "Trace".

Trace Viewer hiển thị:
- 📸 Screenshot từng bước
- 🖱️ Từng thao tác (click, fill, navigate)
- 🌐 Network requests đã thực hiện
- 📝 Console logs

### 8.3 Cấu hình báo lỗi trong playwright.config.ts

```typescript
// playwright.config.ts
use: {
  screenshot: 'only-on-failure',  // Chụp màn hình khi test fail
  trace: 'retain-on-failure',     // Ghi trace khi test fail
  video: 'on-first-retry',        // Quay video khi retry
}
```

---

## 9. Template viết Test mới

### 9.1 Tạo Page Object mới

```typescript
// tests/pages/MyFeaturePage.ts
import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class MyFeaturePage extends BasePage {
  static readonly path = '/admin/my-feature'; // URL của trang

  // Khai báo các locator
  readonly someButton: Locator;
  readonly someInput: Locator;
  readonly successToast: Locator;

  constructor(page: Page) {
    super(page);
    // Gán locator — ưu tiên dùng role/label/testid thay vì CSS selector
    this.someButton = page.getByRole('button', { name: /tên nút/i });
    this.someInput = page.locator('input[name="fieldName"]');
    this.successToast = page.locator('text=Thành công!');
  }

  /** Mở trang. */
  async open(): Promise<void> {
    await this.navigate(MyFeaturePage.path);
  }

  /** Thực hiện một hành động nghiệp vụ. */
  async doSomething(value: string): Promise<void> {
    await this.someButton.click();
    await this.someInput.fill(value);
    await this.someButton.click(); // submit
  }
}
```

### 9.2 Tạo Spec file mới

```typescript
// tests/my-feature.spec.ts
import { test, expect } from '@playwright/test';
import { MyFeaturePage } from './pages/MyFeaturePage';

test.describe('Tên tính năng - Mô tả ngắn', () => {
  let myPage: MyFeaturePage;

  // Chạy trước mỗi test
  test.beforeEach(async ({ page }) => {
    myPage = new MyFeaturePage(page);
    await myPage.open();
  });

  // Happy Path
  test('1. Thực hiện thành công với dữ liệu hợp lệ', async ({ page }) => {
    await myPage.doSomething('dữ liệu hợp lệ');
    await expect(myPage.successToast).toBeVisible();
    expect(page.url()).toContain('expected-url');
  });

  // Error Path
  test('2. Hiển thị lỗi với dữ liệu không hợp lệ', async ({ page }) => {
    await myPage.doSomething('');
    await expect(page.locator('text=Vui lòng nhập...')).toBeVisible();
  });
});
```

### 9.3 Checklist trước khi commit test mới

- [ ] Page Object nằm trong `tests/pages/`
- [ ] File spec nằm trong `tests/` và đặt tên `*.spec.ts`
- [ ] `expect()` chỉ nằm trong spec file, **không** trong Page Object
- [ ] Đã chạy thử test và pass: `npx playwright test tests/my-feature.spec.ts`
- [ ] Tên test rõ ràng, mô tả đúng hành vi
- [ ] Dùng `--grep-invert "DEMO fail"` khi chạy toàn bộ để tránh fail giả

---

## 📚 Tài liệu tham khảo

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Page Object Model Guide](https://playwright.dev/docs/pom)
- [API Mocking (route)](https://playwright.dev/docs/mock)
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [HTML Reporter](https://playwright.dev/docs/test-reporters#html-reporter)

---

*Cập nhật lần cuối: tháng 7/2026 — SWP391 SE20A04 Group 03*
