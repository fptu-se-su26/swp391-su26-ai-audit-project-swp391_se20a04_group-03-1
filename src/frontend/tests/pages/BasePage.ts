import { type Page } from '@playwright/test';

/**
 * BasePage — lớp cơ sở cho mọi Page Object (Page Object Model).
 *
 * Mọi Page Object khác nên `extends BasePage` để dùng chung `page` và các
 * hành động điều hướng cơ bản. Quy ước POM:
 *  - Page Object CHỨA locator + hành động (click, gõ, điều hướng) của 1 trang.
 *  - Assertion (expect) đặt trong file test (*.spec.ts), KHÔNG đặt trong Page Object.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /** Điều hướng tới một đường dẫn tương đối (baseURL đã cấu hình trong playwright.config.ts). */
  async navigate(path = '/'): Promise<void> {
    await this.page.goto(path);
  }

  /** Lấy tiêu đề trang hiện tại. */
  getTitle(): Promise<string> {
    return this.page.title();
  }
}
