/**
 * Cấu hình Jest RIÊNG cho test AuthController.
 *
 * Vì sao tách khỏi jest.config.js chính:
 *  - jest.config.js chính giới hạn collectCoverageFrom vào các file nghiệp vụ khác
 *    (scan/appointment/repositories) và đang lỗi do thiếu thư mục repositories/ (WIP
 *    của thành viên khác). Config này chỉ đo coverage cho controllers/auth.controller.ts.
 *
 * Dùng qua: npm run test:auth
 */
const dotenv = require('dotenv');
dotenv.config({ path: '.env.test' });

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  maxWorkers: 1,
  clearMocks: true,
  testMatch: ['**/tests/auth.controller.test.ts'],
  collectCoverage: true,
  coverageDirectory: 'coverage/auth',
  collectCoverageFrom: ['controllers/auth.controller.ts'],
  coverageReporters: ['text', 'text-summary', 'html'],
  coverageThreshold: {
    global: {
      lines: 80,
      statements: 80,
    },
  },
};
