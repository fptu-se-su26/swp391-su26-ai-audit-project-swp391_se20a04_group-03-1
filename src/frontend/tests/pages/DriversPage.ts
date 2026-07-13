import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * DriversPage — Page Object cho trang Quản lý Tài Xế (/admin/drivers).
 *
 * Theo quy ước POM của dự án:
 *  - Page Object CHỨA locator + hành động (mở trang, gõ tìm kiếm, mở form...).
 *  - Assertion (expect) đặt trong file test (*.spec.ts), KHÔNG đặt ở đây.
 */
export class DriversPage extends BasePage {
  static readonly path = '/admin/drivers';

  // --- Header / control chính ---
  readonly heading: Locator;
  readonly subtitle: Locator;
  readonly trashLink: Locator;
  readonly addDriverButton: Locator;

  // --- Thanh tìm kiếm ---
  readonly searchInput: Locator;
  readonly clearFilterButton: Locator;

  // --- Bảng danh sách ---
  readonly listCardTitle: Locator;
  readonly loadingText: Locator;
  readonly emptyState: Locator;
  readonly tableRows: Locator;

  // --- Form "Thêm tài xế mới" ---
  readonly driverIdInput: Locator;
  readonly driverNameInput: Locator;
  readonly driverPhoneInput: Locator;
  readonly companySelectTrigger: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly validationErrors: Locator;

  constructor(page: Page) {
    super(page);

    this.heading = page.getByRole('heading', { name: 'Quản lý Tài Xế' });
    this.subtitle = page.getByText('Danh sách tất cả tài xế và công ty trực thuộc');
    this.trashLink = page.getByRole('link', { name: /Thùng rác/i });
    this.addDriverButton = page.getByRole('button', { name: /Thêm tài xế/i });

    this.searchInput = page.getByPlaceholder('Tìm tên, mã CCCD...');
    this.clearFilterButton = page.getByRole('button', { name: 'Xóa lọc' });

    this.listCardTitle = page.getByText('Danh sách Tài Xế');
    this.loadingText = page.getByText('Đang tải dữ liệu...');
    this.emptyState = page.getByText('Không tìm thấy tài xế nào.');
    this.tableRows = page.locator('tbody tr');

    this.driverIdInput = page.locator('#driverId');
    this.driverNameInput = page.locator('#driverName');
    this.driverPhoneInput = page.locator('#driverPhone');
    this.companySelectTrigger = page.getByText('-- Chọn công ty --');
    this.submitButton = page.locator('button[type="submit"]:has-text("Đăng ký")');
    this.cancelButton = page.getByRole('button', { name: 'Hủy' });
    // JustValidate sinh thẻ có class 'just-validate-error-label'
    this.validationErrors = page.locator('.just-validate-error-label');
  }

  /** Mở trang danh sách tài xế. */
  async open(): Promise<void> {
    await this.navigate(DriversPage.path);
  }

  /** Chờ danh sách tải xong (spinner "Đang tải dữ liệu..." biến mất). */
  async waitForListLoaded(): Promise<void> {
    await this.loadingText.waitFor({ state: 'hidden' }).catch(() => { /* đã tải xong trước đó */ });
  }

  /** Lấy tiêu đề cột trong bảng theo tên (vd: "Họ Tên", "Công Ty"). */
  columnHeader(name: string): Locator {
    return this.page.getByRole('columnheader', { name });
  }

  /** Gõ từ khóa vào ô tìm kiếm (debounce 500ms trong app). */
  async search(keyword: string): Promise<void> {
    await this.searchInput.fill(keyword);
  }

  /** Mở form "Thêm tài xế mới". */
  async openAddForm(): Promise<void> {
    await this.addDriverButton.click();
  }

  /** Bấm nút "Đăng ký" (submit form thêm tài xế). */
  async submitAddForm(): Promise<void> {
    await this.submitButton.click();
  }
}
