import { test, expect } from '@playwright/test';

/**
 * ⚠️ TEST FAIL CÓ CHỦ ĐÍCH — KHÔNG PHẢI BUG.
 *
 * Mục đích: minh chứng cấu hình "Báo cáo kèm Screenshot khi lỗi" hoạt động
 * (screenshot: 'only-on-failure' + trace: 'retain-on-failure' trong
 * playwright.config.ts). Test này cố tình dùng một selector KHÔNG tồn tại nên
 * sẽ luôn FAIL, khiến Playwright tự sinh:
 *   - test-results/<test>/test-failed-1.png  (ảnh chụp màn hình lúc lỗi)
 *   - test-results/<test>/trace.zip          (trace log để mở Trace Viewer)
 * và HTML report (playwright-report/) sẽ hiển thị 1 test đỏ kèm ảnh.
 *
 * Cách xem bằng chứng:  npm run test:e2e   →   npm run test:e2e:report
 *
 * 👉 Vì test này luôn fail, cả suite sẽ báo "1 failed". Nếu muốn suite xanh
 *    trở lại, xoá file này hoặc chạy loại trừ:  npx playwright test --grep-invert "DEMO fail"
 */
test('DEMO fail - selector cố tình sai để sinh screenshot + trace', async ({ page }) => {
  await page.goto('/');
  // Selector này không tồn tại trên trang -> assertion fail -> chụp màn hình + trace.
  await expect(
    page.getByTestId('selector-khong-ton-tai-de-demo-bao-cao-loi'),
  ).toBeVisible({ timeout: 3000 });
});
