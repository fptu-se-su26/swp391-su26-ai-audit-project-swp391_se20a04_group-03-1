import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';

/**
 * Sample test theo kiến trúc Page Object Model (POM).
 *
 * Thao tác với trang qua đối tượng HomePage (không thao tác `page` trực tiếp),
 * assertion đặt tại đây. Đây là mẫu để các thành viên viết test theo POM.
 */
test.describe('Trang chủ (POM)', () => {
  test('mở được trang chủ qua HomePage', async ({ page }) => {
    const home = new HomePage(page);

    await home.open();

    // Assertion nằm trong test, dùng locator do Page Object cung cấp.
    await expect(home.body).toBeVisible();
  });
});
