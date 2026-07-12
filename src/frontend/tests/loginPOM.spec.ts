import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.pom';

test.describe('Flow Đăng nhập UI /admin/login (Issue 1)', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('Happy path: Đăng nhập thành công', async ({ page }) => {
    // Mock API trả về thành công
    await page.route('**/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ code: 'success', message: 'Đăng nhập thành công!', data: { token: 'mock-token' } })
      });
    });
    
    // Giả lập giao diện trang dashboard để không bị lỗi khi chuyển hướng
    await page.route('**/admin/dashboard', async (route) => {
      await route.fulfill({ status: 200, body: '<html><body>ĐĂNG XUẤT</body></html>' });
    });

    // Nhập Email & Password hợp lệ của Admin -> Click Submit
    await loginPage.login('admin@logiport.com', 'password123');
    
    // Hiện thông báo chào mừng trước khi chuyển hướng
    await expect(loginPage.toastSuccessMessage).toBeVisible({ timeout: 15000 });
    
    // Chuyển hướng URL tới /admin/dashboard
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
  });

  test('Đăng nhập thất bại (sai Pass)', async ({ page }) => {
    // Mock API trả về lỗi sai pass
    await page.route('**/auth/login', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ code: 'error', message: 'Tài khoản hoặc mật khẩu không chính xác.' })
      });
    });

    // Nhập Password sai
    await loginPage.login('admin@logiport.com', 'wrongpassword');
    
    // Element lỗi (div[role="alert"] hoặc toast) hiển thị
    await expect(loginPage.toastErrorMessage).toBeVisible({ timeout: 5000 });
  });

  test('Kiểm tra UI Validation', async () => {
    // Bỏ trống trường Email, click submit
    await loginPage.login('', 'password123');
    
    // Trình duyệt hiện báo lỗi
    const emailError = await loginPage.getEmailValidationError();
    await expect(emailError).toBeVisible();
  });
});
