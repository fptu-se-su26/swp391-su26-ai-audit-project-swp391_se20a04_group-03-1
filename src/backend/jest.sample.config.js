/**
 * Cấu hình Jest RIÊNG cho dummy/sample test.
 *
 * Vì sao tách riêng khỏi jest.config.js:
 *  - jest.config.js (của phần test nghiệp vụ) bật collectCoverage + coverageThreshold 80%
 *    trên một số file cụ thể => chạy lẻ 1 dummy test sẽ đỏ vì không đạt ngưỡng coverage.
 *  - Config này chỉ chạy tests/sample.dummy.test.ts, KHÔNG thu coverage, và nạp .env.test
 *    để minh hoạ biến môi trường test.
 *
 * Dùng qua: npm run test:sample
 */
const dotenv = require('dotenv');
// Nạp biến môi trường test từ .env.test (thay vì .env mặc định).
dotenv.config({ path: '.env.test' });

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/sample.dummy.test.ts'],
  collectCoverage: false,
};
