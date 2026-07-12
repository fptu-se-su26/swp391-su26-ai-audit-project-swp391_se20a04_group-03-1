import { test, expect } from '@playwright/test';
import { mockAccount } from './config/accounts';

test.describe('Quản lý Lịch hẹn - Xem & Thêm mới (Client/Company)', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Lắng nghe network để debug lỗi Failed to fetch
    page.on('requestfailed', request => {
      console.log(`[NETWORK FAILED] ${request.url()} - ${request.failure()?.errorText}`);
    });
    page.on('console', msg => {
      console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`);
    });

    // Mock login
    await page.route('**/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'Set-Cookie': 'tokenAdmin=mocked-token-for-e2e-test; Path=/;' },
        body: JSON.stringify({ code: 'success' })
      });
    });

    // Mock permissions (cho phép truy cập /admin/appointments)
    await page.route('**/settings/me/permissions', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ code: 'success', data: { roleCode: 'COMPANY', isSuperAdmin: true, permissions: [] } })
      });
    });

    let mockedAppointments: any[] = [];

    // Mock GET appointments
    await page.route('**/appointments/**', async route => {
      // Bỏ qua nếu là request tải trang HTML (để không bị đè trang web thành file JSON)
      if (route.request().resourceType() === 'document') {
        return route.fallback();
      }
      
      // Chú ý: Tránh match nhầm route create/status/delete
      const url = route.request().url();
      if (url.includes('/appointments/create') || url.includes('/appointments/status') || url.includes('/appointments/delete')) {
        return route.fallback();
      }

      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ code: 'success', data: mockedAppointments, pagination: { totalPages: 1 } })
        });
      } else {
        await route.fallback();
      }
    });

    // Mock POST appointment
    await page.route('**/appointments/create', async route => {
      if (route.request().method() === 'POST') {
        const postData = route.request().postDataJSON();
        mockedAppointments.push({
          _id: Date.now().toString(),
          truckPlate: postData.truckPlate,
          containerNo: postData.containerNo,
          purpose: postData.purpose,
          scheduledDate: postData.scheduledDate,
          timeSlot: postData.timeSlot,
          status: 'Pending', // Trạng thái Chờ Duyệt
          driverId: {
            _id: postData.driverId,
            driverName: "Tài xế Test",
            driverPhone: "0909090909"
          }
        });
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 'success' }) });
} else {
        await route.fallback();
      }
    });

    // Mock trucks
    await page.route('**/trucks*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'success',
          data: [{ _id: 't1', truckPlate: '51C-123.45', truckType: 'Container' }]
        })
      });
    });

    // Mock containers
    await page.route('**/containers*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'success',
          data: [{ _id: 'c1', number: 'TEST1234567' }]
        })
      });
    });

    // Mock drivers
    await page.route('**/drivers*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'success',
          data: [{ _id: 'd1', driverName: 'Tài xế Test', driverPhone: '0909090909' }]
        })
      });
    });
  });

  test('Nên tạo lịch hẹn thành công và hiển thị trạng thái Pending', async ({ page }) => {
    // 1. Đăng nhập và điều hướng tới /admin/appointments
    await page.goto('/admin/login');
    await page.waitForTimeout(1000);
    await page.locator('input[type="email"]').fill(mockAccount.email);
    await page.locator('input[type="password"]').fill(mockAccount.password);
    await page.locator('button[type="submit"]').click();
    
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
    await page.goto('/admin/appointments');
    await page.waitForURL('**/admin/appointments', { timeout: 10000 });

    // 2. Mở form "Tạo lịch hẹn"
    await page.getByRole('button', { name: /đăng ký/i }).click();
    
    // 3. Tương tác với form
    
    // Chọn Xe
    await page.locator('text="Tìm kiếm biển số xe..."').click();
    await page.locator('input[placeholder="Gõ biển số xe..."]').fill('51C');
    await page.locator('text="51C-123.45"').click();

    // Chọn Container
    await page.locator('text="Tìm kiếm mã container..."').click();
    await page.locator('input[placeholder="Gõ mã container..."]').fill('TEST');
    await page.locator('text="TEST1234567"').click();

    // Chọn Tài xế
    await page.locator('text="Tìm tên, SĐT, CCCD..."').click();
    await page.locator('input[placeholder="Gõ tên, SĐT, hoặc CCCD..."]').fill('Tài xế');
    await page.locator('text="Tài xế Test"').click();

    // Chọn Ngày 
    const dateInput = page.locator('input[name="scheduledDate"]');
    await dateInput.fill('2027-10-10');

    // Chọn Khung giờ
    await page.locator('label:has-text("Khung giờ") + div').locator('.cursor-pointer').first().click();
    await page.locator('li', { hasText: '08:00-09:00' }).click();

    // Chọn Mục đích
await page.locator('label:has-text("Mục đích") + div').locator('.cursor-pointer').first().click();
    await page.locator('li', { hasText: 'Lấy container' }).click();

    // 4. Submit form
    await page.getByRole('button', { name: /đăng ký/i, exact: true }).last().click();

    // 5. Kiểm tra lịch hẹn mới hiển thị với badge trạng thái "Pending"
    await expect(page.locator('text="Đăng ký lịch hẹn thành công!"')).toBeVisible({ timeout: 5000 });
    
    // Bảng lịch hẹn phải hiển thị xe 51C-123.45 và có trạng thái "Chờ Duyệt"
    await expect(page.locator('text="51C-123.45"')).toBeVisible();
    await expect(page.locator('text="Chờ Duyệt"').first()).toBeVisible();
  });
});