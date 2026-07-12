import { test, expect } from '@playwright/test';
import { ContainersPage } from './pages/ContainersPage';
import { LoginPage } from './pages/LoginPage';
import { mockAccount } from './config/accounts';

test.describe('Quản lý Container /admin/containers (POM + Mock API)', () => {
  let containersPage: ContainersPage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    containersPage = new ContainersPage(page);
    loginPage = new LoginPage(page);

    // --- MOCK API SETUP ---
    await page.route('**/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'Set-Cookie': 'tokenAdmin=mocked-token-for-e2e-test; Path=/;' },
        body: JSON.stringify({ code: 'success', data: { token: 'mock' } })
      });
    });

    await page.route('**/settings/me/permissions', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ code: 'success', data: { roleCode: 'ADMIN', isSuperAdmin: true, permissions: [] } })
      });
    });

    // Mock data containers
    const mockedContainers = [
      { _id: 'c1', number: 'SUDU1234567', type: '20ft', status: 'Hàng', portStatus: 'Đang lưu bãi', providerId: { code: 'SUDU' } },
      { _id: 'c2', number: 'MSCU7654321', type: '40ft HC', status: 'Rỗng', portStatus: 'Đã xuất cảng', providerId: { code: 'MSCU' } }
    ];

    await page.route('**/containers/?*', async route => {
      const url = new URL(route.request().url());
      const search = url.searchParams.get('search');
      let filtered = mockedContainers;
      if (search && search.includes('zzz')) {
        filtered = [];
      } else if (search) {
        filtered = mockedContainers.filter(c => c.number.includes(search));
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ code: 'success', data: filtered, pagination: { totalItems: filtered.length, totalPages: 1 } })
      });
    });

    // Login logic
    await loginPage.open();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await loginPage.login(mockAccount.email, mockAccount.password);
    
    // Đợi chuyển hướng sang dashboard
    await expect(loginPage.toastSuccessMessage).toBeVisible({ timeout: 5000 });
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });

    // Vào trang Containers
    await containersPage.openList();
    await page.waitForLoadState('networkidle');
  });

  test('Hiển thị danh sách container và thông tin cột chính xác', async ({ page }) => {
    // Kiểm tra title hiển thị
    await expect(containersPage.listHeading).toBeVisible();
    
    // Chờ fetch và hiển thị (có 2 items mock)
    await expect(containersPage.tableRows).toHaveCount(2);
    
    // Kiểm tra render đúng mã
await expect(page.locator('text=SUDU1234567')).toBeVisible();
    await expect(page.locator('text=MSCU7654321')).toBeVisible();
  });

  test('Tìm kiếm container có kết quả và không có kết quả', async ({ page }) => {
    // Lọc có kết quả
    await containersPage.search('SUDU');
    await page.waitForTimeout(600); // debounce timeout 500ms
    await expect(containersPage.tableRows).toHaveCount(1);
    await expect(page.locator('text=SUDU1234567')).toBeVisible();

    // Lọc không có kết quả
    await containersPage.search('zzz999');
    await page.waitForTimeout(600); // debounce timeout 500ms
    await expect(containersPage.emptyStateText).toBeVisible();
  });

  test('Validate form Tạo container khi bỏ trống thông tin', async ({ page }) => {
    // Mock get providers (để form load bình thường)
    await page.route('**/container-providers*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ code: 'success', data: [{ _id: 'p1', name: 'Maersk', code: 'MAEU', bic_codes: ['MAEU'] }] })
      });
    });

    // Mở trang tạo
    await containersPage.openCreate();
    await expect(containersPage.createHeading).toBeVisible();

    // Bấm lưu luôn để kích hoạt validate
    await containersPage.submitCreateForm();
    
    // Kiểm tra lỗi validate (yêu cầu 7 chữ số)
    await expect(containersPage.validationError.first()).toBeVisible();
    await expect(containersPage.validationError.first()).toHaveText(/Bắt buộc nhập 7 chữ số/i);
  });
});