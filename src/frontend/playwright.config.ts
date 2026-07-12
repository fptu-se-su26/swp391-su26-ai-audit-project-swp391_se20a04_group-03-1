import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

/**
 * Nạp biến môi trường test từ .env.test (nếu có).
 * Copy .env.test.example -> .env.test để tùy chỉnh (ví dụ E2E_BASE_URL).
 */
dotenv.config({ path: path.resolve(__dirname, '.env.test') });

// URL gốc: ưu tiên biến môi trường, mặc định localhost:3000.
const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters
     HTML report được sinh ra trong thư mục playwright-report/. */
  reporter: [['html', { outputFolder: 'playwright-report' }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. Đọc từ .env.test (E2E_BASE_URL). */
    baseURL: BASE_URL,

    /* Chụp màn hình TỰ ĐỘNG khi test fail (đính kèm vào HTML report). */
    screenshot: 'only-on-failure',

    /* Lưu trace log chi tiết khi test fail để mở lại từng bước trong Trace Viewer. */
    trace: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests.
     Playwright tự khởi động app tại localhost:3000 nếu chưa chạy.
     Nếu bạn đã tự chạy `npm run dev` thì nó dùng lại server đang có (reuseExistingServer). */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
