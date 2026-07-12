/**
 * Dummy sample test — xác minh môi trường Jest hoạt động.
 *
 * Không đụng DB / HTTP thật. Chạy qua: npm run test:sample
 * (dùng jest.sample.config.js — nạp .env.test, tắt coverage).
 *
 * Đây là file mẫu để các thành viên tham khảo cách viết unit test.
 * Test nghiệp vụ (dùng Supertest + mongodb-memory-server) xem các file
 * *.controller.test.ts / *.api.test.ts trong cùng thư mục.
 */
describe('Sample dummy test (môi trường Jest)', () => {
  it('phép cộng cơ bản: 1 + 1 = 2', () => {
    expect(1 + 1).toBe(2);
  });

  it('async/await hoạt động', async () => {
    const value = await Promise.resolve('logiport');
    expect(value).toBe('logiport');
  });

  // Chỉ chạy khi đã có .env.test cục bộ (copy từ .env.test.example).
  // Fresh clone chưa có file -> skip, giúp `npm run test:sample` luôn xanh.
  const hasEnvTest = process.env.TEST_ENV_NAME !== undefined;
  (hasEnvTest ? it : it.skip)('.env.test đã được nạp đúng', () => {
    expect(process.env.TEST_ENV_NAME).toBe('logiport-test');
    expect(process.env.NODE_ENV).toBe('test');
  });
});
