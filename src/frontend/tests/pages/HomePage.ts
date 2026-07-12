import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * HomePage — Page Object cho trang chủ ("/").
 *
 * File mẫu minh hoạ cách viết Page Object: khai báo locator ở constructor,
 * cung cấp các hành động (open, ...). Assertion để ở file test.
 */
export class HomePage extends BasePage {
  /** Đường dẫn của trang. */
  static readonly path = '/';

  /** Thân trang — dùng để kiểm tra trang đã render. */
  readonly body: Locator;

  constructor(page: Page) {
    super(page);
    this.body = page.locator('body');
  }

  /** Mở trang chủ. */
  async open(): Promise<void> {
    await this.navigate(HomePage.path);
  }
}
