import express from 'express';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import rootRouter from '../routers/index.route';
import { Appointment } from '../models/appointment.model';
import { Container } from '../models/container.model';
import { Driver } from '../models/driver.model';
import cookieParser from "cookie-parser";

// Ngăn cản circular dependency làm thực thi file index.ts khi import routers
jest.mock('../index', () => ({
  io: { emit: jest.fn() }
}));

// Bypass Authentication Middleware
jest.mock('../middlewares/auth.middleware', () => ({
  requireAuth: (req: any, res: any, next: any) => next(),
  requireAuthCompany: (req: any, res: any, next: any) => next(),
  requireAuthProvider: (req: any, res: any, next: any) => next()
}));

// Khởi tạo app nội bộ chỉ để phục vụ Integration Test bằng Supertest
// (Giữ nguyên cấu trúc code ứng dụng, không sửa index.ts)
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api', rootRouter);

let mongoServer: MongoMemoryServer;

describe('Appointment Integration Tests (Supertest)', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(uri);
  }, 30000);

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    await Appointment.deleteMany({});
    await Container.deleteMany({});
    await Driver.deleteMany({});
  });

  describe('POST /api/appointments', () => {
    it('TC_INT_1: should create appointment successfully', async () => {
      await Container.create({
        number: 'MSGU1234567',
        portStatus: 'Đã nhập cảng',
        isDeleted: false,
        providerId: new mongoose.Types.ObjectId(),
        type: '20ft'
      });

      const payload = {
        truckPlate: '51C12345',
        driverId: new mongoose.Types.ObjectId().toString(),
        scheduledDate: '2026-12-01',
        timeSlot: '08:00-09:00',
        containerNo: 'MSGU1234567',
        purpose: 'Lấy container'
      };

      const response = await request(app)
        .post('/api/appointments/create')
        .send(payload);

      expect(response.status).toBe(201); 
      expect(response.body.code).toBe('success');
      
      const savedApp = await Appointment.findOne({ truckPlate: '51C12345' });
      expect(savedApp).toBeTruthy();
      expect(savedApp?.containerNo).toBe('MSGU1234567');
      expect(savedApp?.status).toBe('Pending');
    });

    it('TC_INT_2: should return Error if validation fails (Missing truckPlate)', async () => {
      const payload = {
        scheduledDate: '2026-12-01',
        driverId: new mongoose.Types.ObjectId().toString(),
        timeSlot: '08:00-09:00',
        containerNo: 'MSGU1234567',
        purpose: 'Lấy container'
      }; // Thiếu truckPlate

      const response = await request(app)
        .post('/api/appointments/create')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('error');
    });

    it('TC_INT_3: should return Error if capacity is full (20 appointments)', async () => {
      await Container.create({
        number: 'MSGU1234567',
        portStatus: 'Đã nhập cảng',
        isDeleted: false,
        providerId: new mongoose.Types.ObjectId(),
        type: '20ft'
      });

      // Tạo 20 slot bị chiếm
      const mockAppointments = [];
      for (let i = 0; i < 20; i++) {
        mockAppointments.push({
          truckPlate: `51C${10000 + i}`,
          driverId: new mongoose.Types.ObjectId(),
          containerNo: `CONT${100000 + i}`,
          scheduledDate: new Date('2026-12-01T00:00:00Z'),
          timeSlot: '08:00-09:00',
          purpose: 'Lấy container',
          status: 'Pending',
          isDeleted: false,
        });
      }
      await Appointment.insertMany(mockAppointments);

      const payload = {
        truckPlate: '51C99999',
        driverId: new mongoose.Types.ObjectId().toString(),
        scheduledDate: '2026-12-01',
        timeSlot: '08:00-09:00',
        containerNo: 'MSGU1234567',
        purpose: 'Lấy container'
      };

      const response = await request(app)
        .post('/api/appointments/create')
        .send(payload);

      expect(response.status).toBe(200); // Controller thực tế trả 200 kèm code error
      expect(response.body.code).toBe('error');
      expect(response.body.message).toContain('đã đầy');
    });

    it('TC_INT_5: Edge case: Thời gian trong quá khứ -> HTTP 400 Bad Request', async () => {
      const payload = {
        truckPlate: '51C12345',
        driverId: new mongoose.Types.ObjectId().toString(),
        scheduledDate: '2000-01-01', // Thời gian trong quá khứ
        timeSlot: '08:00-09:00',
        containerNo: 'MSGU1234567',
        purpose: 'Lấy container'
      };

      const response = await request(app)
        .post('/api/appointments/create')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('error');
      expect(response.body.message).toBe('Ngày hẹn không được trong quá khứ.');
    });

    it('TC_INT_6: Edge case: Thiếu thông tin xe/tài xế (Missing driverId) -> HTTP 400 Bad Request', async () => {
      const payload = {
        truckPlate: '51C12345',
        // Thiếu driverId
        scheduledDate: '2026-12-01',
        timeSlot: '08:00-09:00',
        containerNo: 'MSGU1234567',
        purpose: 'Lấy container'
      };

      const response = await request(app)
        .post('/api/appointments/create')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('error');
    });
  });

  describe('GET /api/appointments', () => {
    it('TC_INT_4: should return list of appointments with pagination', async () => {
      const driverId = new mongoose.Types.ObjectId();
      await Driver.create({
        _id: driverId,
        driverId: 'D12345',
        companyId: new mongoose.Types.ObjectId(),
        driverName: 'Test Driver',
        driverPhone: '0987654321'
      });

      await Appointment.create({
        truckPlate: '43C11111',
        driverId: driverId,
        containerNo: 'CONT1111',
        scheduledDate: new Date('2026-12-01T00:00:00Z'),
        timeSlot: '08:00-09:00',
        purpose: 'Lấy container',
        status: 'Pending',
        isDeleted: false,
      });

      const response = await request(app).get('/api/appointments');

      expect(response.status).toBe(200);
      expect(response.body.code).toBe('success');
      expect(response.body.data.length).toBe(1);
      expect(response.body.pagination.totalItems).toBe(1);
    });
  });
});
