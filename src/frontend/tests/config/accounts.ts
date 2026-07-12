/**
 * Tài khoản & cấu hình dùng cho test E2E — ĐỌC TỪ `.env.test`.
 *
 * Mục tiêu: KHÔNG hardcode email/mật khẩu trong file *.spec.ts.
 * Mọi tài khoản test khai báo ở `.env.test` (gitignored) và lấy qua module này.
 * Xem `.env.test.example` để biết danh sách biến.
 */
import dotenv from 'dotenv';
import path from 'path';

// .env.test nằm ở gốc frontend (../../ so với tests/config/).
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env.test') });

/** Lấy biến môi trường, thiếu thì dùng fallback (tránh vỡ test khi máy chưa cấu hình). */
const env = (name: string, fallback: string): string => process.env[name] ?? fallback;

/** URL backend API (đăng nhập lấy cookie cho các test chạy backend thật). */
export const API_URL = env('E2E_API_URL', 'http://localhost:4000/api');

/** Tài khoản admin HỢP LỆ (đăng nhập thành công) — dùng cho test backend thật. */
export const adminAccount = {
  email: env('E2E_ADMIN_EMAIL', 'admin@logiport.com'),
  password: env('E2E_ADMIN_PASSWORD', 'password123'),
};

/** Mật khẩu sai — test đăng nhập thất bại với tài khoản hợp lệ. */
export const wrongPassword = env('E2E_WRONG_PASSWORD', 'wrongpassword');

/** Email không tồn tại trên hệ thống. */
export const nonexistentEmail = env('E2E_NONEXISTENT_EMAIL', 'nonexistent.admin@logiport.com');

/** Mật khẩu chung cho các tài khoản fixture (inactive/deleted) trong DB. */
export const seedPassword = env('E2E_SEED_PASSWORD', 'password123');

/** Tài khoản CHƯA KÍCH HOẠT (isActive=false) — cần tồn tại sẵn trong DB. */
export const inactiveEmail = env('E2E_INACTIVE_EMAIL', 'inactive@logiport.com');

/** Tài khoản ĐÃ BỊ XÓA (isDeleted=true) — cần tồn tại sẵn trong DB. */
export const deletedEmail = env('E2E_DELETED_EMAIL', 'deleted@logiport.com');

/**
 * Tài khoản dùng cho các test CÓ MOCK backend (route giả).
 * Giá trị bất kỳ vì login được mock trả success — không gọi backend thật.
 */
export const mockAccount = {
  email: env('E2E_MOCK_EMAIL', 'admin@example.com'),
  password: env('E2E_MOCK_PASSWORD', '123456'),
};
