import express from 'express';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import rootRouter from '../routers/index.route';
import { Yard } from '../models/yard.model';
import { Gate } from '../models/gate.model';
import cookieParser from 'cookie-parser';
import { Writable } from 'stream';

// Mock Socket.io
jest.mock('../index', () => {
  const mockEmit = jest.fn();
  const mockTo = jest.fn().mockReturnValue({ emit: mockEmit });
  return {
    io: {
      to: mockTo,
      emit: mockEmit,
    },
  };
});

// Mock Cloudinary
jest.mock('../config/cloudinary.config', () => ({
  __esModule: true,
  default: {
    uploader: {
      upload_stream: jest.fn().mockImplementation((options, callback) => {
        return new Writable({
          write(chunk, encoding, next) {
            next();
          },
          writev(chunks, next) {
            next();
          },
          final(next) {
            callback(null, { secure_url: 'https://cloudinary.com/mock-snapshot.jpg' });
            next();
          },
        });
      }),
    },
  },
}));

// Bypass / Mock Authentication & Permissions Middleware dynamically
jest.mock('../middlewares/auth.middleware', () => ({
  requireAuth: (req: any, res: any, next: any) => {
    const testRole = req.headers['x-test-role'];
    if (testRole === 'admin') {
      req.user = {
        id: 'mock-admin-id',
        role: 'mock-admin-role',
        isSuperAdmin: true,
        permissions: [],
      };
      return next();
    } else if (testRole === 'company') {
      req.user = {
        id: 'mock-company-id',
        role: 'mock-company-role',
        isSuperAdmin: false,
        permissions: [],
      };
      return next();
    } else if (testRole === 'unauthorized') {
      req.user = {
        id: 'mock-unauthorized-id',
        role: 'mock-unauthorized-role',
        isSuperAdmin: false,
        permissions: [],
      };
      return next();
    } else if (testRole === 'none') {
      return res.status(401).json({ code: 'error', message: 'Vui lòng đăng nhập' });
    }
    // Mặc định cho qua như admin nếu không truyền header để tránh phá vỡ test khác
    req.user = {
      id: 'mock-admin-id',
      role: 'mock-admin-role',
      isSuperAdmin: true,
      permissions: [],
    };
    next();
  },
  requireAuthCompany: (req: any, res: any, next: any) => next(),
  requireAuthProvider: (req: any, res: any, next: any) => next(),
}));

// Mock rbac.middleware.ts attachPermissions
jest.mock('../middlewares/rbac.middleware', () => {
  const actual = jest.requireActual('../middlewares/rbac.middleware');
  return {
    ...actual,
    attachPermissions: (req: any, res: any, next: any) => {
      // Dùng req.user do requireAuth mock thiết lập, bypass loadRole từ DB
      next();
    },
  };
});

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api', rootRouter);

let mongoServer: MongoMemoryServer;
let fetchSpy: jest.SpyInstance;

describe('Yard Integration Tests (Supertest)', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(uri);

    // Mock global fetch cho AI camera server snapshot
    fetchSpy = jest.spyOn(global, 'fetch');
  }, 30000);

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
    fetchSpy.mockRestore();
  });

  beforeEach(async () => {
    await Yard.deleteMany({});
    await Gate.deleteMany({});
    jest.clearAllMocks();
    fetchSpy.mockReset();
  });

  describe('POST /api/yards/create', () => {
    it('TC_YARD_1: Tạo bãi đỗ thành công (Admin)', async () => {
      const payload = {
        name: 'Bãi đỗ số 1',
        cameraIp: 'rtsp://192.168.1.100:554/stream1',
      };

      const response = await request(app)
        .post('/api/yards/create')
        .set('x-test-role', 'admin')
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe('success');
      expect(response.body.message).toBe('Tạo bãi đỗ thành công');
      expect(response.body.data.name).toBe(payload.name);
      expect(response.body.data.cameraIp).toBe(payload.cameraIp);

      const savedYard = await Yard.findOne({ name: payload.name });
      expect(savedYard).toBeTruthy();
    });

    it('TC_YARD_2: Tạo bãi đỗ thất bại do không có quyền', async () => {
      const payload = {
        name: 'Bãi đỗ số 2',
        cameraIp: 'rtsp://192.168.1.101:554/stream1',
      };

      // 1. Vai trò Client/Company (thiếu quyền yards)
      const response403 = await request(app)
        .post('/api/yards/create')
        .set('x-test-role', 'company')
        .send(payload);

      expect(response403.status).toBe(403);
      expect(response403.body.code).toBe('error');
      expect(response403.body.message).toContain('không có quyền');

      // 2. Không đăng nhập (Không có token/header)
      const response401 = await request(app)
        .post('/api/yards/create')
        .set('x-test-role', 'none')
        .send(payload);

      expect(response401.status).toBe(401);
      expect(response401.body.code).toBe('error');
      expect(response401.body.message).toContain('đăng nhập');
    });

    it('TC_YARD_4: Edge case: Thiếu IP Camera', async () => {
      const payload = {
        name: 'Bãi đỗ số 4',
      }; // Thiếu cameraIp

      const response = await request(app)
        .post('/api/yards/create')
        .set('x-test-role', 'admin')
        .send(payload);

      expect(response.status).toBe(400); // Trả về 400 Bad Request nhờ cập nhật trong yard.validator.ts
      expect(response.body.code).toBe('error');
      expect(response.body.message).toContain('IP Camera');
    });

    it('TC_YARD_5: Tạo bãi đỗ thất bại do trùng cameraIp với Yard khác', async () => {
      const cameraIp = 'rtsp://192.168.1.102:554/stream1';
      await Yard.create({
        name: 'Bãi đỗ cũ',
        cameraIp: cameraIp,
      });

      const payload = {
        name: 'Bãi đỗ mới',
        cameraIp: cameraIp, // Trùng IP
      };

      const response = await request(app)
        .post('/api/yards/create')
        .set('x-test-role', 'admin')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('error');
      expect(response.body.message).toContain('Camera IP đã tồn tại');
    });

    it('TC_YARD_6: Tạo bãi đỗ thất bại do trùng cameraIp với Gate', async () => {
      const cameraIp = 'rtsp://192.168.1.103:554/stream1';
      await Gate.create({
        name: 'Cổng số 1',
        cameraIp: cameraIp,
        type: 'in',
        isDeleted: false,
      });

      const payload = {
        name: 'Bãi đỗ mới',
        cameraIp: cameraIp, // Trùng IP của cổng
      };

      const response = await request(app)
        .post('/api/yards/create')
        .set('x-test-role', 'admin')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('error');
      expect(response.body.message).toContain('Camera IP đã tồn tại ở cổng');
    });

    it('TC_YARD_7: Gây lỗi Exception khi lưu bãi đỗ (Exception testing)', async () => {
      // Mock Yard.prototype.save để quăng lỗi
      const saveSpy = jest.spyOn(Yard.prototype, 'save').mockRejectedValueOnce(new Error('Lỗi database mô phỏng'));

      const payload = {
        name: 'Bãi đỗ lỗi',
        cameraIp: 'rtsp://192.168.1.104:554/stream1',
      };

      const response = await request(app)
        .post('/api/yards/create')
        .set('x-test-role', 'admin')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('error');
      expect(response.body.message).toBe('Lỗi tạo bãi đỗ');

      saveSpy.mockRestore();
    });
  });

  describe('GET /api/yards', () => {
    it('TC_YARD_3: Lấy danh sách bãi đỗ (chỉ lấy isDeleted=false)', async () => {
      // Tạo 1 bãi đỗ active
      await Yard.create({
        name: 'Bãi đỗ Active',
        cameraIp: 'rtsp://192.168.1.110:554/stream1',
        isDeleted: false,
      });

      // Tạo 1 bãi đỗ đã soft-deleted
      await Yard.create({
        name: 'Bãi đỗ Đã Xóa',
        cameraIp: 'rtsp://192.168.1.111:554/stream1',
        isDeleted: true,
      });

      const response = await request(app)
        .get('/api/yards')
        .set('x-test-role', 'admin');

      expect(response.status).toBe(200);
      expect(response.body.code).toBe('success');
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].name).toBe('Bãi đỗ Active');
      expect(response.body.data[0].isDeleted).toBe(false);
    });

    it('TC_YARD_8: Lấy danh sách thất bại do lỗi database (Exception testing)', async () => {
      const findSpy = jest.spyOn(Yard, 'find').mockImplementationOnce(() => {
        throw new Error('Lỗi tìm kiếm database');
      });

      const response = await request(app)
        .get('/api/yards')
        .set('x-test-role', 'admin');

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('error');
      expect(response.body.message).toBe('Lỗi lấy danh sách bãi đỗ');

      findSpy.mockRestore();
    });
  });

  describe('GET /api/yards/:id', () => {
    it('Lấy chi tiết bãi đỗ thành công', async () => {
      const yard = await Yard.create({
        name: 'Bãi đỗ Chi Tiết',
        cameraIp: 'rtsp://192.168.1.120:554/stream1',
      });

      const response = await request(app)
        .get(`/api/yards/${yard._id}`)
        .set('x-test-role', 'admin');

      expect(response.status).toBe(200);
      expect(response.body.code).toBe('success');
      expect(response.body.data.name).toBe(yard.name);
    });

    it('Lấy chi tiết thất bại do ID không tồn tại', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .get(`/api/yards/${fakeId}`)
        .set('x-test-role', 'admin');

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('error');
      expect(response.body.message).toBe('Không tìm thấy bãi đỗ');
    });

    it('Lấy chi tiết thất bại do ID sai định dạng (Exception testing)', async () => {
      const response = await request(app)
        .get('/api/yards/invalid-object-id')
        .set('x-test-role', 'admin');

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('error');
      expect(response.body.message).toBe('Lỗi lấy thông tin bãi đỗ');
    });
  });

  describe('PATCH /api/yards/:id/slots', () => {
    it('Cập nhật slots layout thành công', async () => {
      const yard = await Yard.create({
        name: 'Bãi đỗ Slots',
        cameraIp: 'rtsp://192.168.1.130:554/stream1',
      });

      const payload = {
        slots: [
          { slotName: 'Slot A1', x: 10, y: 20, width: 100, height: 100 },
          { slotName: 'Slot A2', x: 110, y: 20, width: 100, height: 100 },
        ],
      };

      const response = await request(app)
        .patch(`/api/yards/${yard._id}/slots`)
        .set('x-test-role', 'admin')
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe('success');
      expect(response.body.message).toBe('Cập nhật cấu hình bãi đỗ thành công');
      expect(response.body.data.slots.length).toBe(2);
      expect(response.body.data.slots[0].slotName).toBe('Slot A1');
    });

    it('Cập nhật slots thất bại do không tìm thấy bãi đỗ', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .patch(`/api/yards/${fakeId}/slots`)
        .set('x-test-role', 'admin')
        .send({ slots: [] });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('error');
      expect(response.body.message).toBe('Không tìm thấy bãi đỗ');
    });

    it('Cập nhật slots thất bại do lỗi database (Exception testing)', async () => {
      const response = await request(app)
        .patch('/api/yards/invalid-object-id/slots')
        .set('x-test-role', 'admin')
        .send({ slots: [] });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('error');
      expect(response.body.message).toBe('Lỗi cấu hình bãi đỗ');
    });
  });

  describe('PATCH /api/yards/:id/info', () => {
    it('Cập nhật thông tin bãi đỗ thành công', async () => {
      const yard = await Yard.create({
        name: 'Bãi cũ',
        cameraIp: 'rtsp://192.168.1.140:554/stream1',
      });

      const payload = {
        name: 'Bãi mới',
        cameraIp: 'rtsp://192.168.1.141:554/stream1',
      };

      const response = await request(app)
        .patch(`/api/yards/${yard._id}/info`)
        .set('x-test-role', 'admin')
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe('success');
      expect(response.body.message).toBe('Cập nhật thông tin bãi đỗ thành công');
      expect(response.body.data.name).toBe(payload.name);

      const updated = await Yard.findById(yard._id);
      expect(updated?.name).toBe(payload.name);
    });

    it('Cập nhật thông tin thất bại do trùng IP của cổng', async () => {
      const yard = await Yard.create({
        name: 'Bãi đỗ Cũ',
        cameraIp: 'rtsp://192.168.1.145:554/stream1',
      });

      const cameraIp = 'rtsp://192.168.1.146:554/stream1';
      await Gate.create({
        name: 'Cổng A',
        cameraIp: cameraIp,
        type: 'in',
        isDeleted: false,
      });

      const response = await request(app)
        .patch(`/api/yards/${yard._id}/info`)
        .set('x-test-role', 'admin')
        .send({
          name: 'Bãi Cập Nhật',
          cameraIp: cameraIp,
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('error');
      expect(response.body.message).toBe('Camera IP đã tồn tại ở cổng');
    });

    it('Cập nhật thông tin thất bại do ID không tồn tại', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .patch(`/api/yards/${fakeId}/info`)
        .set('x-test-role', 'admin')
        .send({
          name: 'Bãi mới',
          cameraIp: 'rtsp://192.168.1.142:554/stream1',
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('error');
      expect(response.body.message).toBe('Không tìm thấy bãi đỗ');
    });

    it('Cập nhật thông tin thất bại do lỗi exception (Exception testing)', async () => {
      const response = await request(app)
        .patch('/api/yards/invalid-id/info')
        .set('x-test-role', 'admin')
        .send({
          name: 'Bãi mới',
          cameraIp: 'rtsp://192.168.1.143:554/stream1',
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('error');
      expect(response.body.message).toBe('Lỗi cập nhật cấu trúc bãi');
    });
  });

  describe('DELETE /api/yards/:id', () => {
    it('Soft delete bãi đỗ thành công', async () => {
      const yard = await Yard.create({
        name: 'Bãi đỗ Sắp Xóa',
        cameraIp: 'rtsp://192.168.1.150:554/stream1',
      });

      const response = await request(app)
        .delete(`/api/yards/${yard._id}`)
        .set('x-test-role', 'admin');

      expect(response.status).toBe(200);
      expect(response.body.code).toBe('success');
      expect(response.body.message).toBe('Xóa bãi đỗ thành công');

      const deletedYard = await Yard.findById(yard._id);
      expect(deletedYard?.isDeleted).toBe(true);
    });

    it('Soft delete thất bại do không tìm thấy bãi đỗ', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .delete(`/api/yards/${fakeId}`)
        .set('x-test-role', 'admin');

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('error');
      expect(response.body.message).toBe('Không tìm thấy bãi đỗ');
    });

    it('Soft delete thất bại do exception (Exception testing)', async () => {
      const response = await request(app)
        .delete('/api/yards/invalid-id')
        .set('x-test-role', 'admin');

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('error');
      expect(response.body.message).toBe('Lỗi xóa bãi đỗ');
    });
  });

  describe('GET /api/yards/trash/list', () => {
    it('Lấy danh sách bãi đỗ đã soft-deleted thành công', async () => {
      await Yard.create({
        name: 'Bãi Active',
        cameraIp: 'rtsp://192.168.1.160:554/stream1',
        isDeleted: false,
      });

      await Yard.create({
        name: 'Bãi Trash',
        cameraIp: 'rtsp://192.168.1.161:554/stream1',
        isDeleted: true,
      });

      const response = await request(app)
        .get('/api/yards/trash/list')
        .set('x-test-role', 'admin');

      expect(response.status).toBe(200);
      expect(response.body.code).toBe('success');
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].name).toBe('Bãi Trash');
    });

    it('Lấy danh sách trash thất bại do exception (Exception testing)', async () => {
      const findSpy = jest.spyOn(Yard, 'find').mockImplementationOnce(() => {
        throw new Error('Lỗi database');
      });

      const response = await request(app)
        .get('/api/yards/trash/list')
        .set('x-test-role', 'admin');

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('error');
      expect(response.body.message).toBe('Lỗi lấy danh sách bãi đỗ đã xóa');

      findSpy.mockRestore();
    });
  });

  describe('PATCH /api/yards/:id/restore', () => {
    it('Khôi phục bãi đỗ đã soft-deleted thành công', async () => {
      const yard = await Yard.create({
        name: 'Bãi Phục Hồi',
        cameraIp: 'rtsp://192.168.1.170:554/stream1',
        isDeleted: true,
      });

      const response = await request(app)
        .patch(`/api/yards/${yard._id}/restore`)
        .set('x-test-role', 'admin');

      expect(response.status).toBe(200);
      expect(response.body.code).toBe('success');
      expect(response.body.message).toBe('Khôi phục bãi đỗ thành công');

      const restored = await Yard.findById(yard._id);
      expect(restored?.isDeleted).toBe(false);
    });

    it('Khôi phục thất bại do không tìm thấy bãi đỗ', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .patch(`/api/yards/${fakeId}/restore`)
        .set('x-test-role', 'admin');

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('error');
      expect(response.body.message).toBe('Không tìm thấy bãi đỗ');
    });

    it('Khôi phục thất bại do exception (Exception testing)', async () => {
      const response = await request(app)
        .patch('/api/yards/invalid-id/restore')
        .set('x-test-role', 'admin');

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('error');
      expect(response.body.message).toBe('Lỗi khôi phục bãi đỗ');
    });
  });

  describe('DELETE /api/yards/:id/force', () => {
    it('Hard delete bãi đỗ thành công', async () => {
      const yard = await Yard.create({
        name: 'Bãi Xóa Vĩnh Viễn',
        cameraIp: 'rtsp://192.168.1.180:554/stream1',
      });

      const response = await request(app)
        .delete(`/api/yards/${yard._id}/force`)
        .set('x-test-role', 'admin');

      expect(response.status).toBe(200);
      expect(response.body.code).toBe('success');
      expect(response.body.message).toBe('Xóa vĩnh viễn bãi đỗ thành công');

      const check = await Yard.findById(yard._id);
      expect(check).toBeNull();
    });

    it('Hard delete thất bại do không tìm thấy bãi đỗ', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .delete(`/api/yards/${fakeId}/force`)
        .set('x-test-role', 'admin');

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('error');
      expect(response.body.message).toBe('Không tìm thấy bãi đỗ');
    });

    it('Hard delete thất bại do exception (Exception testing)', async () => {
      const response = await request(app)
        .delete('/api/yards/invalid-id/force')
        .set('x-test-role', 'admin');

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('error');
      expect(response.body.message).toBe('Lỗi xóa vĩnh viễn bãi đỗ');
    });
  });

  describe('POST /api/yards/:id/sync-status', () => {
    it('Đồng bộ dữ liệu bãi đỗ thành công qua socket', async () => {
      const { io } = require('../index');
      const yardId = new mongoose.Types.ObjectId().toString();
      const payload = {
        occupied_slots: ['Slot A1', 'Slot A3'],
      };

      const response = await request(app)
        .post(`/api/yards/${yardId}/sync-status`)
        .set('x-test-role', 'admin')
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe('success');
      expect(response.body.message).toBe('Đã gửi dữ liệu bãi đỗ thành công');

      expect(io.to).toHaveBeenCalledWith(yardId);
      expect(io.to().emit).toHaveBeenCalledWith('yard_status_updated', expect.objectContaining({
        yard_id: yardId,
        occupied_slots: payload.occupied_slots,
      }));
    });

    it('Đồng bộ thất bại do truyền sai dữ liệu đầu vào (không phải Array)', async () => {
      const yardId = new mongoose.Types.ObjectId().toString();
      const payload = {
        occupied_slots: 'Slot A1', // Không phải Array
      };

      const response = await request(app)
        .post(`/api/yards/${yardId}/sync-status`)
        .set('x-test-role', 'admin')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('error');
      expect(response.body.message).toBe('Sai dữ liệu đầu vào');
    });

    it('Đồng bộ thất bại do exception (Exception testing)', async () => {
      const { io } = require('../index');
      // Gây lỗi exception bằng cách phá vỡ mock socket.io
      io.to.mockImplementationOnce(() => {
        throw new Error('Lỗi socket');
      });

      const yardId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .post(`/api/yards/${yardId}/sync-status`)
        .set('x-test-role', 'admin')
        .send({ occupied_slots: [] });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('error');
      expect(response.body.message).toBe('Lỗi đồng bộ dữ liệu bãi đỗ');
    });
  });

  describe('POST /api/yards/:id/snapshot', () => {
    it('Chụp và lưu ảnh thành công', async () => {
      const yard = await Yard.create({
        name: 'Bãi Camera',
        cameraIp: 'rtsp://192.168.1.190:554/stream1',
      });

      // Mock AI Server response thành công
      fetchSpy.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(8),
      } as any);

      const response = await request(app)
        .post(`/api/yards/${yard._id}/snapshot`)
        .set('x-test-role', 'admin');

      expect(response.status).toBe(200);
      expect(response.body.code).toBe('success');
      expect(response.body.message).toBe('Chụp và lưu ảnh thành công');
      expect(response.body.data.snapshotUrl).toBe('https://cloudinary.com/mock-snapshot.jpg');

      const updated = await Yard.findById(yard._id);
      expect(updated?.snapshotUrl).toBe('https://cloudinary.com/mock-snapshot.jpg');
    });

    it('Chụp ảnh thất bại do ID bãi đỗ không tồn tại', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .post(`/api/yards/${fakeId}/snapshot`)
        .set('x-test-role', 'admin');

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('error');
      expect(response.body.message).toBe('Không tìm thấy bãi đỗ');
    });

    it('Chụp ảnh thất bại do AI camera server trả về lỗi (400/500)', async () => {
      const yard = await Yard.create({
        name: 'Bãi Camera Lỗi AI',
        cameraIp: 'rtsp://192.168.1.191:554/stream1',
      });

      // Mock AI Server response báo lỗi
      fetchSpy.mockResolvedValue({
        ok: false,
      } as any);

      const response = await request(app)
        .post(`/api/yards/${yard._id}/snapshot`)
        .set('x-test-role', 'admin');

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('error');
      expect(response.body.message).toBe('Không thể lấy ảnh từ luồng Camera');
    });

    it('Chụp ảnh thất bại do exception mạng / lỗi hệ thống (Exception testing)', async () => {
      const yard = await Yard.create({
        name: 'Bãi Camera Exception',
        cameraIp: 'rtsp://192.168.1.192:554/stream1',
      });

      // Mock fetch quăng lỗi kết nối
      fetchSpy.mockRejectedValueOnce(new Error('Connection timed out'));

      const response = await request(app)
        .post(`/api/yards/${yard._id}/snapshot`)
        .set('x-test-role', 'admin');

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('error');
      expect(response.body.message).toBe('Lỗi hệ thống khi chụp ảnh');
    });
  });
});
