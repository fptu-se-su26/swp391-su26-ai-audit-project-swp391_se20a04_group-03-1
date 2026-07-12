import { Page, Locator, expect } from '@playwright/test';

export class AppointmentPage {
  readonly page: Page;
  
  // Nút mở form đăng ký
  readonly openFormBtn: Locator;
  
  // Các thẻ input ẩn dùng để select component
  readonly truckPlateTrigger: Locator;
  readonly containerNoTrigger: Locator;
  readonly driverIdTrigger: Locator;
  
  readonly searchTruckInput: Locator;
  readonly searchContainerInput: Locator;
  readonly searchDriverInput: Locator;

  // Các thẻ select/input cơ bản
  readonly scheduledDateInput: Locator;
  readonly timeSlotTrigger: Locator;
  readonly purposeTrigger: Locator;
  readonly submitBtn: Locator;

  // Lấy danh sách kết quả (Dropdown List)
  readonly dropdownListItems: Locator;

  // Bảng danh sách
  readonly appointmentTableRows: Locator;

  // Validation
  readonly validationErrors: Locator;

  constructor(page: Page) {
    this.page = page;

    // Nút "Đăng ký"
    this.openFormBtn = page.locator('button', { hasText: 'Đăng ký' }).first();

    // Async Selectors (Click vào container kế bên thẻ input hidden)
    this.truckPlateTrigger = page.locator('input#truckPlate ~ div');
    this.containerNoTrigger = page.locator('input#containerNo ~ div');
    this.driverIdTrigger = page.locator('input#driverId ~ div');

    this.searchTruckInput = page.getByPlaceholder('Gõ biển số xe...');
    this.searchContainerInput = page.getByPlaceholder('Gõ mã container...');
    this.searchDriverInput = page.getByPlaceholder('Gõ tên, SĐT, hoặc CCCD...');

    this.dropdownListItems = page.locator('ul > li');

    this.scheduledDateInput = page.locator('input#scheduledDate');
    
    // Custom select components (ID timeSlot/purpose)
    this.timeSlotTrigger = page.locator('select#timeSlot ~ div');
    this.purposeTrigger = page.locator('select#purpose ~ div');

    this.submitBtn = page.locator('button[type="submit"]:has-text("Đăng ký")');

    this.appointmentTableRows = page.locator('tbody tr');
    
    // JustValidate sinh ra thẻ div class 'just-validate-error-label'
    this.validationErrors = page.locator('.just-validate-error-label');
  }

  async goto() {
    await this.page.goto('/admin/appointments');
  }

  async selectTruck(plate: string) {
    await this.truckPlateTrigger.click();
    await this.searchTruckInput.fill(plate);
    await this.dropdownListItems.filter({ hasText: plate }).first().click();
  }

  async selectContainer(containerNo: string) {
    await this.containerNoTrigger.click();
    await this.searchContainerInput.fill(containerNo);
    await this.dropdownListItems.filter({ hasText: containerNo }).first().click();
  }

  async selectDriver(driverInfo: string) {
    await this.driverIdTrigger.click();
    await this.searchDriverInput.fill(driverInfo);
    await this.dropdownListItems.filter({ hasText: driverInfo }).first().click();
  }

  async selectTimeSlot(slot: string) {
    await this.timeSlotTrigger.click();
    await this.dropdownListItems.filter({ hasText: slot }).first().click();
  }

  async selectPurpose(purpose: string) {
    await this.purposeTrigger.click();
    await this.dropdownListItems.filter({ hasText: purpose }).first().click();
  }

  async setScheduledDate(dateISO: string) {
    // Với thẻ input type="date", dùng fill(YYYY-MM-DD)
    await this.scheduledDateInput.fill(dateISO);
  }

  async createAppointment(data: { truckPlate: string, containerNo: string, driverInfo: string, date: string, slot: string, purpose: string }) {
    await this.openFormBtn.click();
    
    await this.selectTruck(data.truckPlate);
    await this.selectContainer(data.containerNo);
    await this.selectDriver(data.driverInfo);
    
    await this.setScheduledDate(data.date);
    await this.selectTimeSlot(data.slot);
    await this.selectPurpose(data.purpose);

    await this.submitBtn.click();
  }

  async getAppointmentStatusBadge(truckPlate: string): Promise<Locator> {
    // Tìm dòng trong bảng chứa biển số xe, sau đó lấy thẻ span trạng thái
    const row = this.appointmentTableRows.filter({ hasText: truckPlate }).first();
    return row.locator('span:has-text("Chờ Duyệt")');
  }

  async getApproveButton(truckPlate: string): Promise<Locator> {
    const row = this.appointmentTableRows.filter({ hasText: truckPlate }).first();
    return row.locator('button:has-text("Duyệt")');
  }
}
