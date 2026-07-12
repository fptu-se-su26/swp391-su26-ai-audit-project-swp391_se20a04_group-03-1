import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitBtn: Locator;
  readonly toastSuccessMessage: Locator;
  readonly toastErrorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    // Using standard selectors instead of data-testid
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.submitBtn = page.locator('button[type="submit"]');
    
    // Locators for react-hot-toast
    this.toastSuccessMessage = page.getByText('Đăng nhập thành công!');
    this.toastErrorMessage = page.getByText('Tài khoản hoặc mật khẩu không chính xác.');
  }

  async goto() {
    await this.page.goto('/admin/login');
  }

  async login(email?: string, password?: string) {
    if (email !== undefined && email !== '') {
      await this.emailInput.fill(email);
    }
    if (password !== undefined && password !== '') {
      await this.passwordInput.fill(password);
    }
    await this.submitBtn.click();
  }

  async getEmailValidationError(): Promise<Locator> {
    return this.page.getByText('Vui lòng nhập email công vụ.');
  }

  async getPasswordValidationError(): Promise<Locator> {
    return this.page.getByText('Vui lòng nhập mật khẩu.');
  }
}
