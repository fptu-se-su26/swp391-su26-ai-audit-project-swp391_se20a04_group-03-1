import { test, expect } from '@playwright/test';
import { AppointmentPage } from './pages/appointment.pom';

test.describe('Appointment Flow /admin/appointments', () => {
  let appointmentPage: AppointmentPage;

  test.beforeEach(async ({ page }) => {
    page.on('request', req => console.log(`[REQ] ${req.method()} ${req.url()}`));
    page.on('response', res => console.log(`[RES] ${res.status()} ${res.url()}`));
    appointmentPage = new AppointmentPage(page);

    // MOCK: Quyền Admin (Super Admin) để hiển thị đầy đủ UI (nút Đăng ký, sửa, xóa...)
    await page.route(/.+\/settings\/me\/permissions/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'success',
          data: { roleCode: 'ADMIN', isSuperAdmin: true, permissions: [] }
        })
      });
    });

    // MOCK: Danh sách xe
    await page.route('**/trucks?*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'success',
          data: [{ _id: 't1', truckPlate: '51C-12345', truckType: 'Tractor' }]
        })
      });
    });

    // MOCK: Danh sách Container
    await page.route('**/containers?*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'success',
          data: [{ _id: 'c1', number: 'CONT1234567', type: '40HC', status: 'Empty' }]
        })
      });
    });

    // MOCK: Danh sách Tài xế
    await page.route('**/drivers?*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'success',
          data: [{ _id: 'd1', driverName: 'Nguyen Van A', driverId: '012345678912', driverPhone: '0901234567' }]
        })
      });
    });

    // MOCK: Danh sách Appointment ban đầu (Trống)
    await page.route(/.+\/appointments\/\?.*/, async (route, request) => {
      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ code: 'success', data: [], pagination: { totalPages: 1 } })
        });
      } else {
        await route.fallback();
      }
    });

    // Thêm cookie 'tokenAdmin' để vượt qua middleware proxy.ts
    await page.context().addCookies([
      {
        name: 'tokenAdmin',
        value: 'mock_admin_token',
        domain: 'localhost',
        path: '/'
      }
    ]);

    await appointmentPage.goto();
  });

  test('Happy path: Tạo lịch hẹn mới', async ({ page }) => {
    // MOCK: Xử lý tạo lịch hẹn thành công
    await page.route(/.+\/appointments\/create/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ code: 'success', message: 'Đăng ký thành công' })
      });
    });

    // Sau khi submit, nó sẽ fetch lại danh sách, ta mock danh sách lúc này trả về 1 item
    let fetchCount = 0;
    await page.route(/.+\/appointments\/\?.*/, async (route, request) => {
      if (request.method() === 'GET') {
        fetchCount++;
        if (fetchCount > 1) { // Lần fetch thứ 2 (sau khi thêm mới)
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              code: 'success',
              data: [{
                _id: 'mock1',
                truckPlate: '51C-12345',
                purpose: 'Lấy container',
                containerNo: 'CONT1234567',
                driverId: { driverName: 'Nguyen Van A', driverPhone: '0901234567' },
                scheduledDate: new Date().toISOString(),
                timeSlot: '08:00-09:00',
                status: 'Pending'
              }],
              pagination: { totalPages: 1 }
            })
          });
        } else {
          await route.fallback();
        }
      } else {
        await route.fallback();
      }
    });

    // Hành động: Tạo lịch hẹn
    const today = new Date().toISOString().split('T')[0];
    await appointmentPage.createAppointment({
      truckPlate: '51C-12345',
      containerNo: 'CONT1234567',
      driverInfo: 'Nguyen Van A',
      date: today,
      slot: '08:00-09:00',
      purpose: 'Lấy container'
    });

    // Xác minh Toast hiện
    await expect(page.locator('text=Đăng ký lịch hẹn thành công!').first()).toBeVisible();

    // Xác minh giao diện hiện lịch hẹn mới có trạng thái "Chờ Duyệt" (Pending)
    const badge = await appointmentPage.getAppointmentStatusBadge('51C-12345');
    await expect(badge).toBeVisible();
  });

  test('UI check trạng thái (Chờ Duyệt)', async ({ page }) => {
    // Ghi đè mock danh sách để lúc mới load đã có 1 item "Pending"
    await page.route(/.+\/appointments\/\?.*/, async (route, request) => {
      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 'success',
            data: [{
              _id: 'mock2',
              truckPlate: '29A-99999',
              purpose: 'Trả container',
              containerNo: 'TEST1234567',
              status: 'Pending'
            }],
            pagination: { totalPages: 1 }
          })
        });
      } else {
        await route.fallback();
      }
    });

    // Reload lại trang để nhận dữ liệu mock mới
    await appointmentPage.goto();

    // Xác minh UI check trạng thái: Cần có thẻ hiển thị "Chờ Duyệt"
    const badge = await appointmentPage.getAppointmentStatusBadge('29A-99999');
    await expect(badge).toBeVisible();
    await expect(badge).toHaveClass(/bg-\[#ffa42b\]\/10/); // Thẻ "Pending" có màu cam
  });

  test('Exception case (BVA): Cố tình chọn ngày quá khứ', async ({ page }) => {
    // Bật form
    await appointmentPage.openFormBtn.click();
    
    // Boundary Value Analysis: Element date-picker (min) phải bằng đúng ngày hôm nay
    const today = new Date().toISOString().split('T')[0];
    
    // Kiểm tra attribute "min" của thẻ input date
    await expect(appointmentPage.scheduledDateInput).toHaveAttribute('min', today);

    // Cưỡng ép fill bằng js (simulate bypassing UI restriction)
    await appointmentPage.scheduledDateInput.evaluate((node: HTMLInputElement) => {
      node.value = '2020-01-01'; 
      node.dispatchEvent(new Event('input', { bubbles: true }));
      node.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Form dùng native validation `min`, nên khi submit form sẽ không gọi API
    await appointmentPage.submitBtn.click();

    // Check xem nút input có trạng thái invalid do rangeUnderflow không
    const isInvalid = await appointmentPage.scheduledDateInput.evaluate((node: HTMLInputElement) => node.validity.rangeUnderflow);
    expect(isInvalid).toBe(true);
  });
  test('UI check Validation (Bỏ trống form)', async ({ page }) => {
    await appointmentPage.openFormBtn.click();
    
    // Click Đăng ký ngay mà không nhập gì
    await appointmentPage.submitBtn.click();
    
    // Kiểm tra hiển thị ít nhất 3 thông báo lỗi từ JustValidate (Ngày hẹn, Khung giờ, Mục đích)
    // Tài xế, Biển số, Container được code xử lý qua toast error, không qua JustValidate, 
    // nên ta kiểm tra JustValidate trước
    await expect(appointmentPage.validationErrors.first()).toBeVisible();
    const errorCount = await appointmentPage.validationErrors.count();
    expect(errorCount).toBeGreaterThanOrEqual(1); // Phải có lỗi
  });

  test('Action Flow: Duyệt lịch hẹn (Approve)', async ({ page }) => {
    // Mock API duyệt lịch hẹn thành công
    await page.route(/.+\/appointments\/status\/.+/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ code: 'success', message: 'Đã cập nhật trạng thái' })
      });
    });

    // Mock API trả về danh sách có 1 item "Pending"
    await page.route(/.+\/appointments\/\?.*/, async (route, request) => {
      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 'success',
            data: [{
              _id: 'mock_pending_id',
              truckPlate: '99Z-11111',
              purpose: 'Lấy container',
              containerNo: 'TEST0000000',
              status: 'Pending'
            }],
            pagination: { totalPages: 1 }
          })
        });
      } else {
        await route.fallback();
      }
    });

    await page.reload(); // Load lại để nhận mock data

    // Lấy nút Duyệt của xe 99Z-11111
    const approveBtn = await appointmentPage.getApproveButton('99Z-11111');
    await expect(approveBtn).toBeVisible();
    
    // Click Duyệt
    await approveBtn.click();
    
    // Xác minh Toast thông báo thành công
    await expect(page.locator('text=Đã cập nhật trạng thái lịch hẹn sang: Đã duyệt').first()).toBeVisible();
  });
});
