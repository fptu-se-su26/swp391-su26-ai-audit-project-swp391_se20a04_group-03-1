import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ContainersPage extends BasePage {
  static readonly listPath = '/admin/containers';
  static readonly createPath = '/admin/containers/create';

  // --- List Page Locators ---
  readonly listHeading: Locator;
  readonly searchInput: Locator;
  readonly addContainerBtn: Locator;
  readonly tableRows: Locator;
  readonly emptyStateText: Locator;

  // --- Create Page Locators ---
  readonly createHeading: Locator;
  readonly providerSelectTrigger: Locator;
  readonly numberInput: Locator;
  readonly submitBtn: Locator;
  readonly validationError: Locator;

  constructor(page: Page) {
    super(page);

    // List Page
    this.listHeading = page.getByRole('heading', { name: 'Quản lý container' });
    this.searchInput = page.getByPlaceholder('Tìm mã container...');
    this.addContainerBtn = page.getByRole('button', { name: /Tạo container/i });
    this.tableRows = page.locator('tbody tr');
    this.emptyStateText = page.getByText('Không tìm thấy container nào');

    // Create Page
    this.createHeading = page.getByRole('heading', { name: 'Tạo Container' });
    this.providerSelectTrigger = page.getByText('Chọn hãng tàu...');
    this.numberInput = page.locator('#number');
    this.submitBtn = page.locator('button[type="submit"]:has-text("Hoàn Tất")');
    this.validationError = page.locator('.just-validate-error-label');
  }

  async openList(): Promise<void> {
    await this.navigate(ContainersPage.listPath);
  }

  async openCreate(): Promise<void> {
    await this.addContainerBtn.click();
  }

  async search(keyword: string): Promise<void> {
    await this.searchInput.fill(keyword);
  }

  async submitCreateForm(): Promise<void> {
    await this.submitBtn.click();
  }
}