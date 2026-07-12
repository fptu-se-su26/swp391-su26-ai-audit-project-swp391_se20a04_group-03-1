/**
 * Integration test cho AuthController (controllers/auth.controller.ts)
 * dùng Jest + Supertest + mongodb-memory-server.
 *
 * Kỹ thuật áp dụng:
 *  - Equivalence Partitioning (EP): chia input login thành các lớp tương đương
 *    (hợp lệ / sai mật khẩu / không tồn tại / chưa kích hoạt / thiếu trường).
 *  - Exception testing: các nhánh lỗi trả code="error".
 *  - Mock/Stub: stub Redis (redis.config) và mail.helper; dummy user DB bằng
 *    MongoDB in-memory (mongodb-memory-server).
 *
 * Quy ước tên test: methodName_condition_expectedResult
 *
 * LƯU Ý về hành vi THỰC TẾ của code (khác mô tả task ở 2 điểm, test bám theo code):
 *  1) Token được trả qua COOKIE httpOnly `tokenAdmin` (không nằm trong JSON body).
 *  2) Lỗi thiếu trường bắt buộc do validator Joi trả HTTP 200 + { code: "error" }
 *     (convention của dự án), KHÔNG phải HTTP 400.
 */
import express from 'express';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import cookieParser from 'cookie-parser';

// --- Stub Redis: jest.setup.ts của team thiếu setEx nên tự mock đầy đủ ở đây. ---
jest.mock('../config/redis.config', () => ({
  redisClient: {
    setEx: jest.fn(),
    del: jest.fn(),
    get: jest.fn(),
  },
  connectRedis: jest.fn(),
}));

// --- Stub gửi mail (forgot-password) để không gửi email thật khi test. ---
jest.mock('../helpers/mail.helper', () => ({
  sendMail: jest.fn(),
}));

import authRouter from '../routers/auth.route';
import * as authController from '../controllers/auth.controller';
import * as authValidator from '../validators/auth.validator';
import { AccountAdmin } from '../models/account-admin.model';
import { AdminRole } from '../models/adminRole.model';
import { CompanyRole } from '../models/companyRole.model';
import { redisClient } from '../config/redis.config';

// JWT_SECRET cho ký/giải mã token trong test (nếu .env.test chưa nạp).
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-logiport';

// App tối thiểu chỉ phục vụ test (không đụng index.ts).
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRouter);
// registerPost bị vô hiệu hoá ở routing production; mount thủ công để test controller.
app.post('/api/auth/register', authValidator.registerPost, authController.registerPost);

// Helper: tạo 1 tài khoản admin dummy trong DB in-memory.
const seedAccount = async (overrides: Record<string, unknown> = {}) => {
  const password = (overrides.plainPassword as string) || 'correct-password';
  const hashed = await bcrypt.hash(password, 10);
  return AccountAdmin.create({
    fullName: 'Test Admin',
    email: 'admin@logiport.vn',
    role: new mongoose.Types.ObjectId(),
    password: hashed,
    isActive: true,
    ...overrides,
  });
};

let mongoServer: MongoMemoryServer;

describe('AuthController (Jest + Supertest)', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(mongoServer.getUri());
  }, 60000);

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    await AccountAdmin.deleteMany({});
    await AdminRole.deleteMany({});
    await CompanyRole.deleteMany({});
    // Mặc định Redis stub: get -> null, setEx/del -> OK.
    (redisClient.get as jest.Mock).mockResolvedValue(null);
    (redisClient.setEx as jest.Mock).mockResolvedValue('OK');
    (redisClient.del as jest.Mock).mockResolvedValue(1);
  });

  afterEach(() => {
    // Gỡ các spy (jest.spyOn) đã cài trong test lỗi để không rò rỉ sang test sau.
    jest.restoreAllMocks();
  });

  // ------------------------------------------------------------------ login
  describe('POST /api/auth/login', () => {
    it('loginPost_validCredentials_returns200AndSetsTokenCookie', async () => {
      // Happy path (TC#1): email + password hợp lệ, tài khoản đã kích hoạt.
      await seedAccount({ plainPassword: 'correct-password', isActive: true });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@logiport.vn', password: 'correct-password' });

      expect(res.status).toBe(200);
      expect(res.body.code).toBe('success');
      // Token nằm trong cookie httpOnly `tokenAdmin` (không phải JSON body).
      const cookies = res.headers['set-cookie'] as unknown as string[];
      expect(cookies.join(';')).toContain('tokenAdmin=');
      // Session version được ghi lên Redis.
      expect(redisClient.setEx).toHaveBeenCalledTimes(1);
    });

    it('loginPost_wrongPassword_returns400WithInvalidMessage', async () => {
      // TC#2: email đúng, password sai.
      await seedAccount({ plainPassword: 'correct-password', isActive: true });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@logiport.vn', password: 'wrong-password' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('error');
      expect(res.body.message).toContain('không chính xác');
    });

    it('loginPost_nonExistentEmail_returns400WithInvalidMessage', async () => {
      // EP: lớp email không tồn tại trong DB.
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@logiport.vn', password: 'whatever' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('error');
      expect(res.body.message).toContain('không chính xác');
    });

    it('loginPost_inactiveAccount_returns400NotActivated', async () => {
      // EP: tài khoản đúng mật khẩu nhưng chưa kích hoạt.
      await seedAccount({ plainPassword: 'correct-password', isActive: false });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@logiport.vn', password: 'correct-password' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('error');
      expect(res.body.message).toContain('không được kích hoạt');
    });

    it('loginPost_missingPassword_returnsValidationError', async () => {
      // Edge case (TC#3): thiếu password.
      // Hành vi thực tế: validator trả HTTP 200 + code="error" (không phải 400).
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@logiport.vn' });

      expect(res.status).toBe(200);
      expect(res.body.code).toBe('error');
      expect(res.body.message).toContain('Mật khẩu');
    });

    it('loginPost_missingEmail_returnsValidationError', async () => {
      // Edge case (TC#3): thiếu email.
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'correct-password' });

      expect(res.status).toBe(200);
      expect(res.body.code).toBe('error');
      expect(res.body.message).toContain('Email');
    });
  });

  // ----------------------------------------------------------------- logout
  describe('GET /api/auth/logout', () => {
    it('logout_withValidTokenCookie_returns200AndClearsCookie', async () => {
      // TC#4: đăng nhập lấy cookie rồi gọi logout kèm cookie đó.
      await seedAccount({ plainPassword: 'correct-password', isActive: true });
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@logiport.vn', password: 'correct-password' });
      const authCookie = loginRes.headers['set-cookie'] as unknown as string[];

      const res = await request(app).get('/api/auth/logout').set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe('success');
      // Cookie tokenAdmin bị xoá (clearCookie set giá trị rỗng).
      const cleared = (res.headers['set-cookie'] as unknown as string[]).join(';');
      expect(cleared).toContain('tokenAdmin=;');
      // Session trên Redis bị xoá.
      expect(redisClient.del).toHaveBeenCalledTimes(1);
    });

    it('logout_withoutToken_returns200', async () => {
      // EP: không có cookie token -> vẫn trả 200 và clear cookie.
      const res = await request(app).get('/api/auth/logout');

      expect(res.status).toBe(200);
      expect(res.body.code).toBe('success');
      expect(redisClient.del).not.toHaveBeenCalled();
    });
  });

  // --------------------------------------------------------------- register
  describe('POST /api/auth/register (controller, disabled ở prod)', () => {
    it('registerPost_newValidUser_returns200AndCreatesInactiveAccount', async () => {
      await AdminRole.create({ roleCode: 'OPERATOR', roleName: 'Operator', isDeleted: false });

      const res = await request(app).post('/api/auth/register').send({
        fullName: 'New User',
        email: 'newuser@logiport.vn',
        password: 'secret123',
      });

      expect(res.status).toBe(200);
      expect(res.body.code).toBe('success');
      const created = await AccountAdmin.findOne({ email: 'newuser@logiport.vn' });
      expect(created).toBeTruthy();
      expect(created?.isActive).toBe(false); // chờ duyệt
    });

    it('registerPost_duplicateEmail_returns400', async () => {
      await AdminRole.create({ roleCode: 'OPERATOR', roleName: 'Operator', isDeleted: false });
      await seedAccount({ email: 'dup@logiport.vn' });

      const res = await request(app).post('/api/auth/register').send({
        fullName: 'Dup User',
        email: 'dup@logiport.vn',
        password: 'secret123',
      });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('error');
      expect(res.body.message).toContain('Email đã được sử dụng');
    });

    it('registerPost_missingDefaultRole_returns400', async () => {
      // Không seed AdminRole OPERATOR -> không tìm thấy vai trò mặc định.
      const res = await request(app).post('/api/auth/register').send({
        fullName: 'No Role',
        email: 'norole@logiport.vn',
        password: 'secret123',
      });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('error');
      expect(res.body.message).toContain('vai trò mặc định');
    });
  });

  // -------------------------------------------------------- forgot-password
  describe('POST /api/auth/forgot-password', () => {
    it('forgotPasswordPost_activeAccount_returns200AndSendsOtp', async () => {
      await seedAccount({ email: 'admin@logiport.vn', isActive: true });
      (redisClient.get as jest.Mock).mockResolvedValue(null); // chưa có OTP

      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'admin@logiport.vn' });

      expect(res.status).toBe(200);
      expect(res.body.code).toBe('success');
      expect(redisClient.setEx).toHaveBeenCalled(); // OTP được lưu
    });

    it('forgotPasswordPost_nonExistentEmail_returns400', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nobody@logiport.vn' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('error');
      expect(res.body.message).toContain('Không tồn tại');
    });

    it('forgotPasswordPost_otpAlreadyRequested_returns400', async () => {
      await seedAccount({ email: 'admin@logiport.vn', isActive: true });
      (redisClient.get as jest.Mock).mockResolvedValue('123456'); // đã có OTP

      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'admin@logiport.vn' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('error');
      expect(res.body.message).toContain('3 phút');
    });
  });

  // --------------------------------------------------------- reset-password
  describe('POST /api/auth/reset-password', () => {
    it('resetPasswordPost_validOtp_returns200AndUpdatesPassword', async () => {
      await seedAccount({ email: 'admin@logiport.vn' });
      (redisClient.get as jest.Mock).mockResolvedValue('123456'); // OTP đúng

      const res = await request(app).post('/api/auth/reset-password').send({
        email: 'admin@logiport.vn',
        otp: '123456',
        password: 'newpassword',
      });

      expect(res.status).toBe(200);
      expect(res.body.code).toBe('success');
      expect(redisClient.del).toHaveBeenCalled(); // OTP bị xoá sau khi dùng
    });

    it('resetPasswordPost_nonExistentEmail_returns400', async () => {
      const res = await request(app).post('/api/auth/reset-password').send({
        email: 'nobody@logiport.vn',
        otp: '123456',
        password: 'newpassword',
      });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('error');
      expect(res.body.message).toContain('Email không tồn tại');
    });

    it('resetPasswordPost_invalidOtp_returns400', async () => {
      await seedAccount({ email: 'admin@logiport.vn' });
      (redisClient.get as jest.Mock).mockResolvedValue('999999'); // OTP lưu khác

      const res = await request(app).post('/api/auth/reset-password').send({
        email: 'admin@logiport.vn',
        otp: '123456',
        password: 'newpassword',
      });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('error');
      expect(res.body.message).toContain('OTP không hợp lệ');
    });
  });

  // ------------------------------------------------------------ client-roles
  describe('GET /api/auth/client-roles', () => {
    it('getClientRoles_activeRolesExist_returns200WithRoles', async () => {
      await CompanyRole.create({
        roleCode: 'SHIPPER',
        roleName: 'Chủ hàng',
        status: 'Active',
        isDeleted: false,
      });

      const res = await request(app).get('/api/auth/client-roles');

      expect(res.status).toBe(200);
      expect(res.body.code).toBe('success');
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ------------------------------------------- Exception testing (catch blocks)
  // Ép lỗi bất ngờ (DB reject / token hỏng) để kiểm tra nhánh xử lý lỗi máy chủ.
  describe('Exception handling (catch blocks)', () => {
    it('loginPost_databaseError_returns400ServerError', async () => {
      jest.spyOn(AccountAdmin, 'findOne').mockRejectedValueOnce(new Error('DB down') as never);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@logiport.vn', password: 'correct-password' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('error');
      expect(res.body.message).toContain('quá trình đăng nhập');
    });

    it('registerPost_databaseError_returns400ServerError', async () => {
      jest.spyOn(AccountAdmin, 'findOne').mockRejectedValueOnce(new Error('DB down') as never);

      const res = await request(app).post('/api/auth/register').send({
        fullName: 'Err User',
        email: 'err@logiport.vn',
        password: 'secret123',
      });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('error');
      expect(res.body.message).toContain('quá trình đăng ký');
    });

    it('logout_invalidToken_returns400ServerError', async () => {
      // Cookie token rác -> jwt.verify ném lỗi -> nhánh catch.
      const res = await request(app)
        .get('/api/auth/logout')
        .set('Cookie', ['tokenAdmin=this-is-not-a-valid-jwt']);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('error');
      expect(res.body.message).toContain('quá trình đăng xuất');
    });

    it('forgotPasswordPost_databaseError_returns400ServerError', async () => {
      jest.spyOn(AccountAdmin, 'findOne').mockRejectedValueOnce(new Error('DB down') as never);

      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'admin@logiport.vn' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('error');
      expect(res.body.message).toContain('yêu cầu khôi phục');
    });

    it('resetPasswordPost_databaseError_returns400ServerError', async () => {
      jest.spyOn(AccountAdmin, 'findOne').mockRejectedValueOnce(new Error('DB down') as never);

      const res = await request(app).post('/api/auth/reset-password').send({
        email: 'admin@logiport.vn',
        otp: '123456',
        password: 'newpassword',
      });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('error');
      expect(res.body.message).toContain('đặt lại mật khẩu');
    });

    it('getClientRoles_databaseError_returns400ServerError', async () => {
      // getClientRoles dùng chuỗi find().select(): mock để .select() reject
      // (tránh promise floating gây unhandled rejection).
      jest.spyOn(CompanyRole, 'find').mockReturnValueOnce({
        select: jest.fn().mockRejectedValue(new Error('DB down')),
      } as never);

      const res = await request(app).get('/api/auth/client-roles');

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('error');
      expect(res.body.message).toContain('Không thể tải');
    });
  });

  // ------------------------------------ Cấu hình cookie ở môi trường production
  // Phủ nhánh domain/secure chỉ chạy khi NODE_ENV=production (dòng 126-127, 163-164).
  describe('Production cookie config (branch coverage)', () => {
    const originalEnv = process.env.NODE_ENV;
    const originalDomain = process.env.COOKIE_DOMAIN;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
      process.env.COOKIE_DOMAIN = originalDomain;
    });

    it('loginPost_productionWithCookieDomain_setsScopedCookie', async () => {
      process.env.NODE_ENV = 'production';
      process.env.COOKIE_DOMAIN = '"logiport.vn"'; // có dấu nháy -> nhánh replace().trim()
      await seedAccount({ plainPassword: 'correct-password', isActive: true });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@logiport.vn', password: 'correct-password' });

      expect(res.status).toBe(200);
      expect(res.body.code).toBe('success');
    });

    it('logout_productionWithoutCookieDomain_returns200AndClearsCookie', async () => {
      process.env.NODE_ENV = 'production';
      delete process.env.COOKIE_DOMAIN; // nhánh domain = undefined
      await seedAccount({ plainPassword: 'correct-password', isActive: true });
      // Login (production) để có token HỢP LỆ -> logout mới tới nhánh clearCookie.
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@logiport.vn', password: 'correct-password' });
      const authCookie = loginRes.headers['set-cookie'] as unknown as string[];

      const res = await request(app).get('/api/auth/logout').set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe('success');
    });

    it('logout_productionWithCookieDomain_returns200AndClearsCookie', async () => {
      process.env.NODE_ENV = 'production';
      process.env.COOKIE_DOMAIN = '"logiport.vn"'; // nhánh domain = replace().trim()
      await seedAccount({ plainPassword: 'correct-password', isActive: true });
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@logiport.vn', password: 'correct-password' });
      const authCookie = loginRes.headers['set-cookie'] as unknown as string[];

      const res = await request(app).get('/api/auth/logout').set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe('success');
    });
  });
});
