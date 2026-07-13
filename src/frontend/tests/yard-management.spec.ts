import { test, expect } from '@playwright/test';
// Sửa đường dẫn import từ './Pages/yard.page' thành './pages/yard.page'
import { YardPage } from './pages/yard.page';
import { mockAccount } from './config/accounts';

test.describe('Quản lý Bãi đỗ - Thêm mới dữ liệu', () => {
  
  test.beforeEach(async ({ page }) => {
    // [CỰC QUAN TRỌNG] Mock các API Backend để có thể chạy test giao diện độc lập 
    // mà không cần phải chạy Backend thực sự (rất hữu ích khi code UI trước).
    await page.route('**/auth/login', async route => {
      await route.fulfill({ 
        status: 200, 
        contentType: 'application/json', 
        // PHẢI CÓ COOKIE để qua mặt file middleware (như proxy.ts), nếu không Next.js sẽ đá văng về login!
        headers: { 'Set-Cookie': 'tokenAdmin=mocked-token-for-e2e-test; Path=/;' },
        body: JSON.stringify({ code: 'success' }) 
      });
    });
    // Mock API phân quyền để nút "Thêm bãi đỗ" được hiện ra (isSuperAdmin = true)
    await page.route('**/settings/me/permissions', async route => {
      await route.fulfill({
        status: 200, 
        contentType: 'application/json', 
        body: JSON.stringify({ code: 'success', data: { roleCode: 'ADMIN', isSuperAdmin: true, permissions: [] } })
      });
    });
    // Khởi tạo state ảo cho mock API
    let mockedYards: any[] = [];

    await page.route('**/yards', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 'success', data: mockedYards }) });
      } else {
        await route.fallback();
      }
    });
    await page.route('**/yards/create', async route => {
      if (route.request().method() === 'POST') {
        const postData = route.request().postDataJSON();
        mockedYards.push({
          _id: Date.now().toString(),
          name: postData.name,
          cameraIp: postData.cameraIp,
          snapshotUrl: '',
          slots: []
        });
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 'success' }) });
      } else {
        await route.fallback();
      }
    });

    // Đã sửa lại đường dẫn và locator chuẩn xác theo file app/admin/(auth)/login/page.tsx
    await page.goto('/admin/login');

    // Chờ mạng thật tĩnh lặng để chắc chắn Next.js đã compile xong và JustValidate đã sẵn sàng
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Thêm 2 giây cho an toàn tuyệt đối với máy yếu

    await page.locator('#email').fill(mockAccount.email);
    await page.locator('#password').fill(mockAccount.password);
    await page.getByRole('button', { name: /đăng nhập ngay/i }).click();

    // Xác nhận đã có toast báo thành công (tránh lỗi submit form native reload lại trang)
    await expect(page.locator('text=Đăng nhập thành công!')).toBeVisible({ timeout: 5000 });

    // Đợi chuyển hướng sang dashboard
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });

    const yardPage = new YardPage(page);
    await yardPage.navigateToYardManagement();
  });

  test('Nên thêm mới bãi đỗ thành công với thông tin hợp lệ', async ({ page }) => {
    const yardPage = new YardPage(page);
    
    const testYardName = `Bãi đỗ xe tự động khu A - ${Date.now()}`;
    const testCameraIp = '192.168.1.50';

    // Dùng expect(...) ở spec file theo chuẩn POM để kiểm tra URL sau khi điều hướng
    await expect(page).toHaveURL(/\/admin\/yard/);

    await yardPage.createNewYard(testYardName, testCameraIp);

    // Dùng expect(...) kiểm tra thông báo "Tạo bãi đỗ thành công"
    await expect(yardPage.successToast).toBeVisible();
    
    // Xác minh bãi đỗ mới xuất hiện trên UI
    await expect(yardPage.getYardRow(testYardName)).toBeVisible();
  });

});