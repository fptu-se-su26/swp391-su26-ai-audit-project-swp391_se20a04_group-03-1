import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test.describe('Admin Login Flow - Toàn bộ Test Cases', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.open();
  });

  // 1. Happy Path
  test('1. Đăng nhập thành công với tài khoản Admin hợp lệ', async ({ page }) => {
    await loginPage.login('admin@logiport.com', 'password123');
    await expect(page.locator('text=ĐĂNG XUẤT')).toBeVisible({ timeout: 15000 });
    expect(page.url()).toContain('dashboard');
  });

  // 2. Sai mật khẩu
  test('2. Đăng nhập thất bại khi nhập sai mật khẩu', async () => {
    await loginPage.login('admin@logiport.com', 'wrongpassword');
    await expect(loginPage.errorMessage).toBeVisible();
  });

  // 3. Email không tồn tại
  test('3. Đăng nhập thất bại với email không tồn tại trên hệ thống', async ( { page } ) => {
    await loginPage.login('nonexistent.admin@logiport.com', 'password123');
    const toastError = page.locator('text=không chính xác');
    await expect(toastError).toBeVisible();
  });

  // 4. Tài khoản chưa kích hoạt (isActive = false)
  test('4. Đăng nhập thất bại với tài khoản chưa được kích hoạt', async ( { page } ) => {
    await loginPage.login('inactive@logiport.com', 'password123');
    const toastError = page.locator('text=Tài khoản của bạn không được kích hoạt');
    await expect(toastError).toBeVisible();
  });

  // 5. Tài khoản đã bị xóa (isDeleted = true)
  test('5. Đăng nhập thất bại với tài khoản đã bị xóa', async ( { page } ) => {
    await loginPage.login('deleted@logiport.com', 'password123');
    const toastError = page.locator('text=không chính xác');
    await expect(toastError).toBeVisible();
  });

  // 6. Bỏ trống các trường
  test('6. Hiển thị lỗi validate khi bỏ trống các trường', async ({ page }) => {
    await loginPage.submitButton.click();
    await expect(page.locator('text=Vui lòng nhập email công vụ.')).toBeVisible();
    await expect(page.locator('text=Vui lòng nhập mật khẩu.')).toBeVisible();
  });

  // 7. Định dạng email sai
  test('7. Hiển thị lỗi validate khi nhập email sai định dạng', async ({ page }) => {
    await loginPage.emailInput.fill('invalid-email-format');
    await loginPage.passwordInput.fill('password123');
    await loginPage.submitButton.click();
    await expect(page.locator('text=Định dạng email không hợp lệ.')).toBeVisible();
  });

  // 8. Mật khẩu ngắn
  test('8. Hiển thị lỗi validate khi nhập mật khẩu quá ngắn', async ({ page }) => {
    await loginPage.emailInput.fill('admin@logiport.com');
    await loginPage.passwordInput.fill('12345');
    await loginPage.submitButton.click();
    await expect(page.locator('text=Mật khẩu phải chứa ít nhất 6 ký tự.')).toBeVisible();
  });

  // 9. Con mắt hiển thị mật khẩu
  test('9. Ẩn/Hiện mật khẩu khi bấm vào biểu tượng con mắt', async ({ page }) => {
    await loginPage.passwordInput.fill('password123');
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');

    const toggleButton = page.locator('input[name="password"] ~ button');
    await toggleButton.click();
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'text');

    await toggleButton.click();
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
  });

  // 10. Chuyển hướng "Quên mật khẩu"
  test('10. Chuyển hướng thành công sang trang Quên mật khẩu', async ({ page }) => {
    const forgotPasswordLink = page.locator('text=Quên mật khẩu?');
    await forgotPasswordLink.click();
    await expect(page).toHaveURL(/.*forgot-password/);
  });

  // 11. Gửi form bằng nút Enter
  test('11. Cho phép gửi form đăng nhập bằng cách nhấn nút Enter', async ({ page }) => {
    await loginPage.emailInput.fill('admin@logiport.com');
    await loginPage.passwordInput.fill('password123');
    await loginPage.passwordInput.press('Enter');
    await expect(page.locator('text=ĐĂNG XUẤT')).toBeVisible({ timeout: 15000 });
    expect(page.url()).toContain('dashboard');
  });

  // 12. Giao diện Responsive trên Mobile
  test('12. Kiểm tra giao diện responsive khi mở bằng màn hình điện thoại di động', async ({ page }) => {
    // Thay đổi viewport sang kích thước Mobile
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone 12 Pro size

    // Panel thương hiệu bên trái (chứa class hidden lg:flex) phải bị ẩn đi
    const brandPanel = page.locator('.min-h-screen > div').first();
    await expect(brandPanel).toBeHidden();

    // Card đăng nhập ở bên phải vẫn phải hiển thị
    const loginCard = page.locator('.min-h-screen > div').nth(1);
    await expect(loginCard).toBeVisible();
  });
});
