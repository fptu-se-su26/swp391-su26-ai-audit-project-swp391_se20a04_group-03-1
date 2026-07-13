import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  static readonly path = '/admin/login';

  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly eyeIconBtn: Locator;
  readonly forgotPasswordLink: Locator;
  readonly toastSuccessMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('text=không chính xác');
    this.eyeIconBtn = page.locator('input[name="password"] ~ button');
    this.forgotPasswordLink = page.getByRole('link', { name: /Quên mật khẩu/i });
    this.toastSuccessMessage = page.getByText('Đăng nhập thành công!');
  }

  /**
   * Mở trang đăng nhập admin.
   */
  async open(): Promise<void> {
    await this.navigate(LoginPage.path);
  }

  /**
   * Thực hiện điền email, mật khẩu và click đăng nhập.
   */
  async login(email?: string, password?: string): Promise<void> {
    if (email !== undefined && email !== '') {
      await this.emailInput.fill(email);
    }
    if (password !== undefined && password !== '') {
      await this.passwordInput.fill(password);
    }
    await this.submitButton.click();
  }

  async getPasswordLengthValidationError(): Promise<Locator> {
    return this.page.getByText('Mật khẩu phải chứa ít nhất 6 ký tự.');
  }
}
