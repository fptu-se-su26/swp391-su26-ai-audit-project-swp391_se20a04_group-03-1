import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import appointmentRouter from '../routers/appointments.route';
import { requireAuth } from '../middlewares/auth.middleware';
import { Appointment } from '../models/appointment.model';

// Khởi tạo Express app giả lập
const app = express();
app.use(express.json());
// Mô phỏng router
app.use('/api/appointments', requireAuth, appointmentRouter);

describe('Integration Test: Appointment Controller', () => {
  beforeEach(async () => {
    await Appointment.deleteMany({});
  });

  describe('GET /api/appointments', () => {
    it('Tra ve danh sach rong khi DB khong co du lieu', async () => {
      const response = await request(app)
        .get('/api/appointments')
        .set('x-internal-secret', 'AI_SERVER_SECRET_KEY'); // Bypass Auth

      expect(response.status).toBe(200);
      expect(response.body.code).toBe('success');
      expect(response.body.data.length).toBe(0);
    });

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
    });
  });

  describe('GET /api/appointments/detail/:id', () => {
    it('Tra ve error neu id khong ton tai', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/appointments/detail/${fakeId}`)
        .set('x-internal-secret', 'AI_SERVER_SECRET_KEY');

      expect(response.status).toBe(200); 
      expect(response.body.code).toBe('error');
    });
  });
});
