import 'dotenv/config'; // <-- Ép nạp biến môi trường trước khi import bất kì thứ gì khác
import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import appointmentRouter from '../routers/appointments.route';
import { requireAuth } from '../middlewares/auth.middleware';
import { Appointment } from '../models/appointment.model';

// Đường dẫn database dành riêng cho việc chạy Test
const TEST_MONGO_URI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/swp391_test_db';

// Khởi tạo Express app giả lập
const app = express();
app.use(express.json());
// Mô phỏng router
app.use('/api/appointments', requireAuth, appointmentRouter);

describe('Integration Test: Appointment Controller', () => {
  
  // 1. Mở kết nối Database một lần duy nhất trước khi chạy chuỗi test này
  beforeAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(TEST_MONGO_URI);
  });

  // 2. Dọn sạch bảng dữ liệu trước mỗi test case để tránh xung đột dữ liệu rác
  beforeEach(async () => {
    if (mongoose.connection.readyState === 1) {
      await Appointment.deleteMany({});
    }
  });

  // 3. Đóng kết nối Database sạch sẽ ngay sau khi toàn bộ test case hoàn tất (Giải quyết lỗi Open Handles)
  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  describe('GET /api/appointments', () => {
    it('Tra ve danh sach rong khi DB khong co du lieu', async () => {
      const response = await request(app)
        .get('/api/appointments')
        .set('x-internal-secret', 'AI_SERVER_SECRET_KEY'); // Bypass Auth

      expect(response.status).toBe(200);
      expect(response.body.code).toBe('success');
      expect(response.body.data.length).toBe(0);
    }, 15000); // <-- Tăng timeout lên 15s để tránh lag mạng/DB lúc khởi động

    it('Tra ve danh sach hop le', async () => {
      await Appointment.create({
        truckPlate: '51C-INTEGRATION',
        driverId: new mongoose.Types.ObjectId(),
        containerNo: 'CONT123',
        scheduledDate: new Date(),
        timeSlot: '08:00-09:00',
        purpose: 'Lấy container',
        status: 'Pending',
        isDeleted: false
      });

      const response = await request(app)
        .get('/api/appointments?limit=10&page=1')
        .set('x-internal-secret', 'AI_SERVER_SECRET_KEY');

      expect(response.status).toBe(200);
      expect(response.body.code).toBe('success');
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].truckPlate).toBe('51C-INTEGRATION');
    }, 15000);
  });

  describe('GET /api/appointments/detail/:id', () => {
    it('Tra ve error neu id khong ton tai', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/appointments/detail/${fakeId}`)
        .set('x-internal-secret', 'AI_SERVER_SECRET_KEY');

      expect(response.status).toBe(200); 
      expect(response.body.code).toBe('error');
    }, 15000);
  });
});