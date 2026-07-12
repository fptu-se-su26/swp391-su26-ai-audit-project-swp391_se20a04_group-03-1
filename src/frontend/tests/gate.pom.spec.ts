import { test, expect } from '@playwright/test';
import { GatePage } from './pages/gate.page';
import { LoginPage } from './pages/LoginPage';
import { mockAccount } from './config/accounts';

test.describe('Quản lý Cổng (Gate) - Thêm mới camera', () => {
  let gatePage: GatePage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    gatePage = new GatePage(page);
    loginPage = new LoginPage(page);

    // --- SETUP MOCK API ---
    await page.route('**/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'Set-Cookie': 'tokenAdmin=mocked-token-for-e2e-test; Path=/;' },
        body: JSON.stringify({ code: 'success' })
      });
    });

    await page.route('**/settings/me/permissions', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ code: 'success', data: { roleCode: 'ADMIN', isSuperAdmin: true, permissions: [] } })
      });
    });

    let mockedGates: any[] = [];
    await page.route('**/gates', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ code: 'success', data: mockedGates })
        });
      } else {
        await route.fallback();
      }
    });

    // Mock API logs để không bị lỗi màn hình
    await page.route('**/scan/logs/paginated*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ code: 'success', data: [], stats: { activeCount: 0, completedCount: 0 } })
      });
    });

    await page.route('**/gates/create', async route => {
      if (route.request().method() === 'POST') {
        const postData = route.request().postDataJSON();
        mockedGates.push({
          _id: Date.now().toString(),
          name: postData.name,
          cameraIp: postData.cameraIp,
          type: postData.type
        });
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 'success' }) });
      } else {
        await route.fallback();
      }
    });

    await loginPage.open();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await loginPage.login(mockAccount.email, mockAccount.password);
    
    // Chờ Next.js chuyển hướng sang dashboard xong xuôi rồi mới đi tiếp
    await expect(loginPage.toastSuccessMessage).toBeVisible({ timeout: 5000 });
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
    
    // Điều hướng tới trang Gate
    await gatePage.navigateToGateManagement();
    await page.waitForLoadState('networkidle');
  });

  test('Nên thêm mới camera cổng thành công với thông tin hợp lệ', async ({ page }) => {
    const testGateName = `Camera Cổng Demo - ${Date.now()}`;
    const testCameraIp = 'rtsp://192.168.1.100/stream';

    // 1. Kiểm tra URL đã vào đúng trang
    await expect(page).toHaveURL(/\/admin\/gate/);

    // 2. Sử dụng Page Object để tạo mới
    await gatePage.createNewGate(testGateName, testCameraIp);

    // 3. Kiểm tra thông báo tạo thành công
    await expect(gatePage.successToast).toBeVisible({ timeout: 5000 });

    // 4. Kiểm tra xem thẻ camera mới có xuất hiện trên màn hình không
    await expect(gatePage.getGateCard(testGateName)).toBeVisible();
  });
});
