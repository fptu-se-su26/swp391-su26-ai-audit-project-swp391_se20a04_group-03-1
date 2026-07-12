import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.pom';

test.describe('Login Flow', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('Happy path: Đăng nhập thành công', async ({ page }) => {
    // Mocking the successful response to ensure test passes without real backend dependencies
    await page.route('**/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'success',
          message: 'Login successful',
          data: { token: 'mock-token' }
        })
      });
    });

    // Intercept the dashboard page so it doesn't try to load it and immediately redirect 
    // back to login due to missing authentication cookies
    await page.route('**/admin/dashboard', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body>Dashboard Mock</body></html>'
      });
    });

    await loginPage.login('admin@port.com', 'password123');
    
    // Assert toast message
    await expect(loginPage.toastSuccessMessage).toBeVisible({ timeout: 5000 });
    
    // Assert redirect to dashboard
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 5000 });
  });

  test('Đăng nhập thất bại (sai Pass)', async ({ page }) => {
    // Mock the failed response
    await page.route('**/auth/login', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'error',
          message: 'Tài khoản hoặc mật khẩu không chính xác.'
        })
      });
    });

    await loginPage.login('admin@port.com', 'wrongpassword');
    
    // Assert error message element shows
    await expect(loginPage.toastErrorMessage).toBeVisible({ timeout: 5000 });
  });

  test('Kiểm tra UI Validation', async () => {
    // Bỏ trống trường Email, click submit
    await loginPage.login('', 'password123');
    
    // Kiểm tra element text lỗi của trường Email hiển thị (từ JustValidate)
    const emailError = await loginPage.getEmailValidationError();
    await expect(emailError).toBeVisible();
    
    // Check that button is NOT disabled but we see the error message.
    await expect(loginPage.submitBtn).toBeEnabled();
  });

  test('Hiển thị lỗi validate khi nhập mật khẩu quá ngắn', async () => {
    // Nhập email đúng, mật khẩu < 6 ký tự
    await loginPage.login('admin@port.com', '12345');
    
    const lengthError = await loginPage.getPasswordLengthValidationError();
    await expect(lengthError).toBeVisible();
  });

  test('Ẩn/Hiện mật khẩu khi bấm vào biểu tượng con mắt', async ({ page }) => {
    await loginPage.passwordInput.fill('secret_password');
    
    // Mặc định type là password
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
    
    // Click nút con mắt
    await loginPage.eyeIconBtn.click();
    // Chuyển type thành text
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'text');
    
    // Click lần nữa
    await loginPage.eyeIconBtn.click();
    // Chuyển lại type thành password
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
  });

  test('Chuyển hướng thành công sang trang Quên mật khẩu', async ({ page }) => {
    await loginPage.forgotPasswordLink.click();
    
    // Đảm bảo URL chuyển đúng (có thể timeout nhanh do page này có sẵn)
    await expect(page).toHaveURL(/\/admin\/forgot-password/);
  });

  test('Cho phép gửi form đăng nhập bằng cách nhấn nút Enter', async ({ page }) => {
    // Mock the response for a successful login
    await page.route('**/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'success',
          message: 'Login successful',
          data: { token: 'mock-token' }
        })
      });
    });

    await page.route('**/admin/dashboard', async (route) => {
      await route.fulfill({ status: 200, body: '<html><body>Dashboard Mock</body></html>' });
    });

    // Fill form without clicking submit
    await loginPage.emailInput.fill('admin@port.com');
    await loginPage.passwordInput.fill('password123');
    
    // Press Enter on password input
    await loginPage.passwordInput.press('Enter');
    
    // Toast success should be visible
    await expect(loginPage.toastSuccessMessage).toBeVisible({ timeout: 5000 });
  });
});
