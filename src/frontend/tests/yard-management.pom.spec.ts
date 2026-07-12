import { test, expect } from '@playwright/test';
import { YardPage } from './pages/yard.page';
import { LoginPage } from './pages/LoginPage';
import { mockAccount } from './config/accounts';

test.describe('Quản lý Bãi đỗ (POM) - Thêm mới dữ liệu', () => {
  let yardPage: YardPage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    yardPage = new YardPage(page);
    loginPage = new LoginPage(page);

    // --- SETUP MOCK API --- 
    // Giữ nguyên logic mock API của bản cũ để đảm bảo test chạy độc lập không cần backend
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
    // --- KẾT THÚC SETUP MOCK API ---

    // [THAY ĐỔI LỚN NHẤT: SỬ DỤNG LOGIN PAGE OBJECT]
    // Thay vì tự viết locator để tìm ô email/password, ta gọi hàm có sẵn của LoginPage
    await loginPage.open();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); 

    await loginPage.login(mockAccount.email, mockAccount.password);
    
    // Dùng property của page object để check toast
    await expect(loginPage.toastSuccessMessage).toBeVisible({ timeout: 5000 });

    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
    
    // Điều hướng sang trang Yard
    await yardPage.navigateToYardManagement();
  });

  test('Nên thêm mới bãi đỗ thành công với thông tin hợp lệ', async ({ page }) => {
    const testYardName = `Bãi đỗ xe POM - ${Date.now()}`;
    const testCameraIp = '192.168.1.99';

    // 1. Kiểm tra URL đã vào đúng trang Yard chưa
    await expect(page).toHaveURL(/\/admin\/yard/);

    // 2. [SỬ DỤNG YARD PAGE OBJECT] Điền form và submit
    await yardPage.createNewYard(testYardName, testCameraIp);

    // 3. Kiểm tra thông báo tạo thành công
    await expect(yardPage.successToast).toBeVisible();
    
    // 4. Kiểm tra dòng dữ liệu mới có xuất hiện trong bảng không
    await expect(yardPage.getYardRow(testYardName)).toBeVisible();
  });
});
