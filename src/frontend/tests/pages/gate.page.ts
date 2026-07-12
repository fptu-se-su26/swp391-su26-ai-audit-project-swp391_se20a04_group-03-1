import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class GatePage extends BasePage {
  readonly addGateButton: Locator;
  readonly nameInput: Locator;
  readonly cameraIpInput: Locator;
  readonly submitButton: Locator;
  readonly successToast: Locator;

  constructor(page: Page) {
    super(page);
    this.addGateButton = page.getByRole('button', { name: /thêm camera/i });
    this.nameInput = page.locator('input[name="name"]');
    this.cameraIpInput = page.locator('input[name="cameraIp"]');
    this.submitButton = page.getByRole('button', { name: /lưu hệ thống/i });
    this.successToast = page.locator('text=Tạo camera cổng thành công!');
  }

  async navigateToGateManagement() {
    await this.navigate('/admin/gate');
  }

  async createNewGate(name: string, cameraIp: string) {
    await this.addGateButton.click();
    await this.nameInput.fill(name);
    await this.cameraIpInput.fill(cameraIp);
    // Bỏ qua chọn type vì đã có giá trị mặc định là 'in' (Cổng vào)
    await this.submitButton.click();
  }

  getGateCard(name: string): Locator {
    // Thêm .first() để tránh lỗi strict mode khi cả thẻ CardTitle (h2) và VideoStream title (h3) đều chứa tên camera
    return this.page.locator(`text=${name}`).first();
  }
}
