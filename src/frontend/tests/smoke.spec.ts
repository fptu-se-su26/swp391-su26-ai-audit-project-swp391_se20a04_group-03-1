import { test, expect } from '@playwright/test';

/**
 * Smoke test — kiểm tra môi trường E2E đã sẵn sàng.
 *
 * Mục đích: chứng minh Playwright chạy được, kết nối tới app ở baseURL
 * (http://localhost:3000) và tải được trang chủ. Đây KHÔNG phải test nghiệp vụ,
 * chỉ là "đèn xanh" để cả team biết môi trường test đã hoạt động.
 *
 * Khi bắt đầu viết test thật, tạo file mới trong thư mục tests/ (ví dụ:
 * login.spec.ts, drivers.spec.ts...) và có thể xóa/giữ file smoke này tùy nhóm.
 */
test('trang chủ tải được (smoke)', async ({ page }) => {
  // baseURL đã cấu hình trong playwright.config.ts nên dùng đường dẫn tương đối.
  const response = await page.goto('/');

  // App phản hồi HTTP thành công (2xx/3xx), không phải lỗi server.
  expect(response, 'page.goto phải trả về response').not.toBeNull();
  expect(response!.status(), 'trang chủ không được trả lỗi 4xx/5xx').toBeLessThan(400);

  // Trang có render nội dung: thẻ <body> tồn tại và hiển thị.
  await expect(page.locator('body')).toBeVisible();
});
