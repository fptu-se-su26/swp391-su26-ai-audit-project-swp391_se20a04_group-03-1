# Hướng dẫn E2E Testing với Playwright

Tài liệu này hướng dẫn cả team cách chạy và viết **Automation E2E Test** cho phần
frontend (`src/frontend`) bằng [Playwright](https://playwright.dev).

> Mọi lệnh dưới đây chạy **bên trong thư mục `src/frontend`**.

---

## 1. Yêu cầu môi trường

- **Node.js** ≥ 20 (khuyến nghị v22, khớp với team).
- Đã `git clone` repo và checkout branch có cấu hình Playwright.

---

## 2. Cài đặt lần đầu (sau khi clone)

```bash
cd src/frontend

# 1. Cài dependencies của project (bao gồm @playwright/test)
npm install

# 2. Tải trình duyệt cho Playwright (chỉ cần chạy 1 lần / máy)
npx playwright install chromium
```

> Dự án hiện chỉ cấu hình **Chromium** cho gọn nhẹ. Nếu sau này cần Firefox/WebKit,
> bỏ comment project tương ứng trong `playwright.config.ts` rồi chạy
> `npx playwright install`.

---

## 3. Chạy test

Playwright đã cấu hình `webServer` nên **bạn không cần tự chạy app trước** — khi
chạy test, Playwright sẽ tự khởi động `npm run dev` tại `http://localhost:3000`.
Nếu app đã chạy sẵn thì nó dùng lại server đang có (`reuseExistingServer`).

| Lệnh | Mô tả |
| --- | --- |
| `npm run test:e2e` | Chạy toàn bộ test (headless — không mở cửa sổ trình duyệt). |
| `npm run test:e2e:headed` | Chạy test có mở cửa sổ trình duyệt để quan sát. |
| `npm run test:e2e:ui` | Mở **UI Mode** — giao diện tương tác để chạy/xem/lọc từng test (khuyến nghị khi phát triển). |
| `npm run test:e2e:report` | Mở lại báo cáo HTML của lần chạy gần nhất. |

Các cách chạy nâng cao (dùng trực tiếp `npx playwright`):

```bash
# Chạy 1 file cụ thể
npx playwright test tests/smoke.spec.ts

# Chạy theo tên test (khớp một phần)
npx playwright test -g "smoke"

# Chạy ở chế độ debug (từng bước, có inspector)
npx playwright test --debug

# Tự sinh test bằng cách thao tác trên trình duyệt (Codegen)
npx playwright codegen http://localhost:3000
```

---

## 4. Xem kết quả & Báo cáo lỗi (Screenshot + Trace)

Dự án đã bật sẵn **tự động chụp màn hình và ghi trace khi test fail** — không cần
viết listener thủ công. Cấu hình trong `playwright.config.ts`:

| Cấu hình | Giá trị | Ý nghĩa |
| --- | --- | --- |
| `use.screenshot` | `'only-on-failure'` | Chỉ chụp màn hình tại bước test **fail**, đính kèm thẳng vào HTML report. |
| `use.trace` | `'retain-on-failure'` | Lưu file `trace.zip` (log chi tiết từng bước, DOM, network) khi test **fail**. |
| `reporter` | `[['html', { outputFolder: 'playwright-report' }]]` | Sinh báo cáo HTML vào thư mục `playwright-report/`. |

### Mở báo cáo HTML

```bash
npm run test:e2e:report      # mở lại report của lần chạy gần nhất
```

Trong report, click vào test bị fail → bạn sẽ thấy:
- 📸 **Ảnh chụp màn hình** ngay tại thời điểm lỗi (mục *Screenshots* / attachment
  `test-failed-1.png`).
- 🧵 **Trace** — click để mở **Trace Viewer**: tua lại từng action, xem DOM
  snapshot, console, network của từng bước.

### Vị trí file khi fail

Khi 1 test fail, Playwright tạo thư mục trong `test-results/<tên-test>/` chứa:
- `test-failed-1.png` — ảnh chụp màn hình.
- `trace.zip` — mở trực tiếp bằng:
  ```bash
  npx playwright show-trace test-results/<tên-test>/trace.zip
  ```
- `error-context.md` — tóm tắt ngữ cảnh lỗi.

> ⚠️ Các thư mục `playwright-report/`, `test-results/`, `playwright/.cache/` đã nằm
> trong `.gitignore` — **KHÔNG commit** chúng lên repo.

### File demo báo cáo lỗi

Repo cố tình giữ 1 test **luôn fail**: `tests/demo-failure.spec.ts`. Đây là **bằng
chứng** cho tính năng screenshot/trace khi lỗi — chạy `npm run test:e2e` rồi
`npm run test:e2e:report` sẽ thấy 1 test đỏ kèm ảnh chụp màn hình.

- Vì file này luôn fail nên `npm run test:e2e` sẽ báo **"1 failed"** — đúng như
  thiết kế, không phải lỗi môi trường.
- Chạy **chỉ các test thật** (bỏ qua demo):
  ```bash
  npx playwright test --grep-invert "DEMO fail"
  ```
- Khi không cần demo nữa, chỉ việc xoá `tests/demo-failure.spec.ts`.

---

## 5. Cấu trúc & cấu hình

```
src/frontend/
├── playwright.config.ts     # Cấu hình: baseURL, webServer, browser, reporter...
├── tests/                   # Nơi chứa toàn bộ file test (*.spec.ts)
│   ├── smoke.spec.ts        # Smoke test kiểm tra môi trường (PASS)
│   └── demo-failure.spec.ts # Test FAIL cố ý — demo báo cáo Screenshot/Trace khi lỗi
└── E2E_TESTING.md           # Tài liệu này
```

Các điểm cấu hình chính trong `playwright.config.ts`:

- `testDir: './tests'` — thư mục chứa test.
- `use.baseURL: 'http://localhost:3000'` — URL gốc, cho phép dùng đường dẫn tương
  đối như `page.goto('/')`.
- `use.screenshot: 'only-on-failure'` — tự chụp màn hình khi fail.
- `use.trace: 'retain-on-failure'` — lưu trace log khi fail.
- `reporter: [['html', { outputFolder: 'playwright-report' }]]` — báo cáo HTML.
- `webServer` — tự chạy `npm run dev` trước khi test.
- `projects` — hiện chỉ có `chromium`.

---

## 6. Viết test mới

Tạo file `*.spec.ts` trong thư mục `tests/`. Ví dụ tối thiểu:

```ts
import { test, expect } from '@playwright/test';

test('mở trang đăng nhập', async ({ page }) => {
  await page.goto('/login');           // baseURL đã có, chỉ cần path
  await expect(page.getByRole('heading', { name: /đăng nhập/i })).toBeVisible();
});
```

Quy ước gợi ý cho team:

- Đặt tên file theo tính năng: `login.spec.ts`, `drivers.spec.ts`, `gate.spec.ts`...
- Ưu tiên selector theo **role / label / text** (`getByRole`, `getByLabel`,
  `getByText`) thay vì CSS class dễ đổi.
- Mỗi `test(...)` độc lập, không phụ thuộc thứ tự chạy.
- Dữ liệu cần backend: đảm bảo backend (`src/backend`, port 4000) đang chạy nếu
  test đụng tới API.

Tham khảo: <https://playwright.dev/docs/writing-tests>

---

## 7. Troubleshooting

| Triệu chứng | Cách xử lý |
| --- | --- |
| `browserType.launch: Executable doesn't exist` | Chưa tải browser → chạy `npx playwright install chromium`. |
| Test timeout khi mở trang | App chưa lên. Kiểm tra `npm run dev` chạy được ở `localhost:3000`; hoặc tăng `timeout` trong `webServer`. |
| Port 3000 đã bị chiếm | Tắt tiến trình đang giữ port, hoặc chạy app sẵn rồi để `reuseExistingServer` dùng lại. |
| Muốn chạy nhanh, không auto-start app | Tự chạy `npm run dev` ở một terminal, rồi `npm run test:e2e` ở terminal khác. |

---

Có gì vướng khi setup, hỏi trong nhóm để bổ sung vào tài liệu này. 🎭
