import { test, expect, type Page } from '@playwright/test';
import { DriversPage } from './pages/DriversPage';
import { API_URL, adminAccount } from './config/accounts';

/**
 * Đăng nhập admin qua API và nạp cookie `tokenAdmin` vào browser context.
 * Dùng API (thay vì bấm form) cho ổn định — trang Drivers mới là đối tượng test.
 * `page.request` dùng chung cookie jar với page, nên sau bước này mọi điều hướng
 * tới /admin/* đều đã có cookie hợp lệ.
 */
async function loginAsAdmin(page: Page): Promise<void> {
  const res = await page.request.post(`${API_URL}/auth/login`, {
    data: { email: adminAccount.email, password: adminAccount.password },
  });
  expect(res.ok(), 'Đăng nhập admin qua API phải thành công (kiểm tra .env.test và backend đang chạy)').toBeTruthy();
}

// Chạy tuần tự: tài khoản dùng cơ chế single-session (Redis token version),
// đăng nhập song song nhiều lần sẽ đẩy phiên cũ ra và gây lỗi 401.
test.describe.configure({ mode: 'serial' });

test.describe('Trang Quản lý Tài Xế /admin/drivers (POM + backend thật)', () => {
  let driversPage: DriversPage;

  test.beforeEach(async ({ page }) => {
    test.skip(!adminAccount.email || !adminAccount.password, 'Thiếu E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD trong .env.test');
    await loginAsAdmin(page);
    driversPage = new DriversPage(page);
    await driversPage.open();
  });

  test('Tải trang: hiển thị tiêu đề và các control chính', async () => {
    await expect(driversPage.heading).toBeVisible();
    await expect(driversPage.subtitle).toBeVisible();
    await expect(driversPage.trashLink).toBeVisible();
    await expect(driversPage.searchInput).toBeVisible();
    // Tài khoản demo là SUPER_ADMIN nên nút thêm (bọc trong <Can>) phải render.
    await expect(driversPage.addDriverButton).toBeVisible();
  });

  test('Bảng danh sách: render tiêu đề cột và dữ liệu tài xế từ backend', async () => {
    await driversPage.waitForListLoaded();

    await expect(driversPage.listCardTitle).toBeVisible();
    await expect(driversPage.columnHeader('Họ Tên')).toBeVisible();
    await expect(driversPage.columnHeader('Công Ty')).toBeVisible();

    // DB demo có sẵn tài xế -> phải có ít nhất 1 dòng (hoặc empty-state nếu DB trống).
    const rowCount = await driversPage.tableRows.count();
    if (rowCount === 0) {
      await expect(driversPage.emptyState).toBeVisible();
    } else {
      expect(rowCount).toBeGreaterThan(0);
    }
  });

  test('Tìm kiếm: gõ từ khóa bật nút "Xóa lọc", bấm xóa thì làm rỗng ô tìm', async () => {
    await driversPage.waitForListLoaded();

    // Ban đầu nút "Xóa lọc" bị disabled (chưa nhập gì).
    await expect(driversPage.clearFilterButton).toBeDisabled();

    await driversPage.search('Nguyen');
    await expect(driversPage.searchInput).toHaveValue('Nguyen');
    await expect(driversPage.clearFilterButton).toBeEnabled();

    await driversPage.clearFilterButton.click();
    await expect(driversPage.searchInput).toHaveValue('');
  });

  test('Tìm kiếm từ khóa không tồn tại: hiển thị empty-state', async () => {
    await driversPage.waitForListLoaded();

    await driversPage.search('zzz-khong-ton-tai-9999');
    // Chờ debounce (500ms) + refetch rồi kiểm tra empty-state.
    await expect(driversPage.emptyState).toBeVisible({ timeout: 10_000 });
  });

  test('Form thêm tài xế: mở form hiện các field và validate khi bỏ trống', async () => {
    await driversPage.openAddForm();

    await expect(driversPage.driverIdInput).toBeVisible();
    await expect(driversPage.driverNameInput).toBeVisible();
    await expect(driversPage.driverPhoneInput).toBeVisible();
    await expect(driversPage.companySelectTrigger).toBeVisible();

    // Submit khi chưa nhập gì -> JustValidate sinh lỗi "Bắt buộc".
    await driversPage.submitAddForm();
    await expect(driversPage.validationErrors.first()).toBeVisible();
    const errorCount = await driversPage.validationErrors.count();
    expect(errorCount).toBeGreaterThanOrEqual(1);
  });
});
