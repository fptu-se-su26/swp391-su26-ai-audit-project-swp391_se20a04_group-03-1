import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class YardPage extends BasePage {
  readonly addYardButton: Locator;
  readonly nameInput: Locator;
  readonly cameraIpInput: Locator;
  readonly submitButton: Locator;
  readonly successToast: Locator;

  constructor(page: Page) {
    super(page);
    // Định nghĩa các locator theo đúng yêu cầu issue
    this.addYardButton = page.getByRole('button', { name: /thêm bãi đỗ/i });
    this.nameInput = page.locator('input[name="name"]');
    this.cameraIpInput = page.locator('input[name="cameraIp"]');
    // Giả định nút lưu/submit trong form, bạn có thể đổi text tương ứng nếu cần
    this.submitButton = page.locator('button[type="submit"]'); 
    this.successToast = page.locator('text=Tạo bãi đỗ thành công');
  }

  async navigateToYardManagement() {
    await this.navigate('/admin/yard');
  }

  async createNewYard(name: string, cameraIp: string) {
    await this.addYardButton.click();
    await this.nameInput.fill(name);
    await this.cameraIpInput.fill(cameraIp);
    await this.submitButton.click();
  }

  getYardRow(name: string): Locator {
    return this.page.locator(`text=${name}`);
  }
}