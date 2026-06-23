import { Request, Response } from 'express';
import { createRequest, createResponse } from 'node-mocks-http';
import {
  createAppointmentPost, appointmentsGet, appointmentDetailGet,
  appointmentEditPatch, appointmentStatusPatch, appointmentDeletePatch,
  appointmentsTrashGet, appointmentRestorePatch, appointmentHardDelete
} from '../controllers/appointment.controller';
import { Appointment } from '../models/appointment.model';
import { Driver } from '../models/driver.model';
import { Container } from '../models/container.model';

jest.mock('../models/appointment.model');
jest.mock('../models/driver.model');
jest.mock('../models/container.model');

describe('Appointment Controller Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createAppointmentPost', () => {
    it('should return error if container not found', async () => {
      const req = createRequest({ body: { containerNo: 'CONT123', purpose: 'Lấy container' } });
      const res = createResponse();
      (Container.findOne as jest.Mock).mockResolvedValue(null);

      await createAppointmentPost(req, res);
      expect(res._getJSONData()).toEqual({ code: 'error', message: 'Không tìm thấy thông tin container.' });
    });

    it('should return error if purpose is Lấy container but status is invalid', async () => {
      const req = createRequest({ body: { containerNo: 'CONT123', purpose: 'Lấy container' } });
      const res = createResponse();
      (Container.findOne as jest.Mock).mockResolvedValue({ portStatus: 'Chưa nhập cảng' });

      await createAppointmentPost(req, res);
      expect(res._getJSONData()).toEqual({ code: 'error', message: 'Mục đích lấy container không hợp lệ: Container này hiện không ở Trong cảng.' });
    });

    it('should return error if purpose is Trả container but status is invalid', async () => {
      const req = createRequest({ body: { containerNo: 'CONT123', purpose: 'Trả container' } });
      const res = createResponse();
      (Container.findOne as jest.Mock).mockResolvedValue({ portStatus: 'Đã nhập cảng' });

      await createAppointmentPost(req, res);
      expect(res._getJSONData()).toEqual({ code: 'error', message: 'Mục đích trả container không hợp lệ: Container này hiện đang ở Trong cảng.' });
    });

    it('should return error if car already has appointment today', async () => {
      const req = createRequest({ body: { truckPlate: '51C', scheduledDate: '2024-01-01', containerNo: 'CONT123', purpose: 'Lấy container' } });
      const res = createResponse();
      (Container.findOne as jest.Mock).mockResolvedValue({ portStatus: 'Đã nhập cảng' });
      (Appointment.findOne as jest.Mock).mockResolvedValue({ _id: 'app1' });

      await createAppointmentPost(req, res);
      expect(res._getJSONData()).toEqual({ code: 'error', message: 'Xe đã có lịch hẹn trong ngày.' });
    });

    it('should return error if capacity is full', async () => {
      const req = createRequest({ body: { truckPlate: '51C', scheduledDate: '2024-01-01', timeSlot: '08:00', containerNo: 'CONT123', purpose: 'Lấy container' } });
      const res = createResponse();
      (Container.findOne as jest.Mock).mockResolvedValue({ portStatus: 'Đã nhập cảng' });
      (Appointment.findOne as jest.Mock).mockResolvedValue(null);
      (Appointment.countDocuments as jest.Mock).mockResolvedValue(20);

      await createAppointmentPost(req, res);
      expect(res._getJSONData().message).toContain('đã đầy');
    });

    it('should create appointment successfully', async () => {
      const req = createRequest({ body: { truckPlate: '51C', scheduledDate: '2024-01-01', timeSlot: '08:00', containerNo: 'CONT123', purpose: 'Lấy container' } });
      const res = createResponse();
      (Container.findOne as jest.Mock).mockResolvedValue({ portStatus: 'Đã nhập cảng' });
      (Appointment.findOne as jest.Mock).mockResolvedValue(null);
      (Appointment.countDocuments as jest.Mock).mockResolvedValue(10);
      (Appointment.prototype.save as jest.Mock).mockResolvedValue(true);

      await createAppointmentPost(req, res);
      expect(res._getJSONData()).toEqual({ code: 'success', message: 'Tạo lịch hẹn thành công' });
    });

    it('should catch error on exception', async () => {
      const req = createRequest({ body: { containerNo: 'CONT123' } });
      const res = createResponse();
      (Container.findOne as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await createAppointmentPost(req, res);
      expect(res._getJSONData()).toEqual({ code: 'error', message: 'Lỗi hệ thống khi tạo lịch hẹn' });
    });
  });

  describe('appointmentsGet', () => {
    it('should get appointments successfully', async () => {
      const req = createRequest({ query: { page: '1', limit: '10', search: 'name', status: 'Pending', startDate: '2024-01-01', endDate: '2024-01-02' } });
      const res = createResponse();
      (Driver.find as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue([{ _id: 'd1' }]) });
      (Appointment.countDocuments as jest.Mock).mockResolvedValue(1);
      (Appointment.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([{ _id: 'app1' }])
      });

      await appointmentsGet(req, res);
      expect(res._getJSONData().code).toBe('success');
      expect(res._getJSONData().data.length).toBe(1);
    });

    it('should handle error', async () => {
      const req = createRequest({ query: { page: '1', limit: '10' } });
      const res = createResponse();
      (Appointment.countDocuments as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await appointmentsGet(req, res);
      expect(res._getJSONData().code).toBe('error');
    });
  });

  describe('appointmentDetailGet', () => {
    it('should return error if not found', async () => {
      const req = createRequest({ params: { id: 'app1' } });
      const res = createResponse();
      (Appointment.findById as jest.Mock).mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });

      await appointmentDetailGet(req, res);
      expect(res._getJSONData()).toEqual({ code: 'error', message: 'Không tìm thấy lịch hẹn' });
    });

    it('should return success if found', async () => {
      const req = createRequest({ params: { id: 'app1' } });
      const res = createResponse();
      (Appointment.findById as jest.Mock).mockReturnValue({ populate: jest.fn().mockResolvedValue({ _id: 'app1' }) });

      await appointmentDetailGet(req, res);
      expect(res._getJSONData().code).toBe('success');
    });
    
    it('should catch error on exception', async () => {
      const req = createRequest({ params: { id: 'app1' } });
      const res = createResponse();
      (Appointment.findById as jest.Mock).mockReturnValue({ populate: jest.fn().mockRejectedValue(new Error('DB Error')) });

      await appointmentDetailGet(req, res);
      expect(res._getJSONData().code).toBe('error');
    });
  });

  describe('appointmentEditPatch', () => {
    it('should edit appointment successfully', async () => {
      const req = createRequest({ body: { id: 'app1', truckPlate: '51C', scheduledDate: '2024-01-01', containerNo: 'CONT123', purpose: 'Lấy container' } });
      const res = createResponse();
      (Container.findOne as jest.Mock).mockResolvedValue({ portStatus: 'Đã nhập cảng' });
      (Appointment.findOne as jest.Mock).mockResolvedValue(null);
      (Appointment.updateOne as jest.Mock).mockResolvedValue(true);

      await appointmentEditPatch(req, res);
      expect(res._getJSONData().code).toBe('success');
    });

    it('should return error if container not found', async () => {
      const req = createRequest({ body: { containerNo: 'CONT123' } });
      const res = createResponse();
      (Container.findOne as jest.Mock).mockResolvedValue(null);

      await appointmentEditPatch(req, res);
      expect(res._getJSONData().code).toBe('error');
    });

    it('should return error if another appointment exists', async () => {
      const req = createRequest({ body: { id: 'app1', truckPlate: '51C', scheduledDate: '2024-01-01', containerNo: 'CONT123', purpose: 'Lấy container' } });
      const res = createResponse();
      (Container.findOne as jest.Mock).mockResolvedValue({ portStatus: 'Đã nhập cảng' });
      (Appointment.findOne as jest.Mock).mockResolvedValue({ _id: 'app2' });

      await appointmentEditPatch(req, res);
      expect(res._getJSONData().code).toBe('error');
    });

    it('should return error on exception', async () => {
      const req = createRequest({ body: { containerNo: 'CONT123' } });
      const res = createResponse();
      (Container.findOne as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await appointmentEditPatch(req, res);
      expect(res._getJSONData().code).toBe('error');
    });
  });

  describe('appointmentStatusPatch', () => {
    it('should return error if not found', async () => {
      const req = createRequest({ params: { id: 'app1' }, body: { status: 'Confirmed' } });
      const res = createResponse();
      (Appointment.findById as jest.Mock).mockResolvedValue(null);

      await appointmentStatusPatch(req, res);
      expect(res._getJSONData().code).toBe('error');
    });

    it('should return error if another confirmed appointment exists for the day', async () => {
      const req = createRequest({ params: { id: 'app1' }, body: { status: 'Confirmed' } });
      const res = createResponse();
      (Appointment.findById as jest.Mock).mockResolvedValue({ _id: 'app1', truckPlate: '51C' });
      (Appointment.findOne as jest.Mock).mockResolvedValue({ _id: 'app2' });

      await appointmentStatusPatch(req, res);
      expect(res._getJSONData().code).toBe('error');
    });

    it('should update status successfully', async () => {
      const req = createRequest({ params: { id: 'app1' }, body: { status: 'Confirmed' } });
      const res = createResponse();
      (Appointment.findById as jest.Mock).mockResolvedValue({ _id: 'app1', truckPlate: '51C' });
      (Appointment.findOne as jest.Mock).mockResolvedValue(null);
      (Appointment.updateOne as jest.Mock).mockResolvedValue(true);

      await appointmentStatusPatch(req, res);
      expect(res._getJSONData().code).toBe('success');
    });

    it('should return error on exception', async () => {
      const req = createRequest({ params: { id: 'app1' } });
      const res = createResponse();
      (Appointment.findById as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await appointmentStatusPatch(req, res);
      expect(res._getJSONData().code).toBe('error');
    });
  });

  describe('appointmentDeletePatch', () => {
    it('should delete appointment successfully', async () => {
      const req = createRequest({ params: { id: 'app1' } });
      const res = createResponse();
      (Appointment.findById as jest.Mock).mockResolvedValue({ _id: 'app1', isDeleted: false });
      (Appointment.updateOne as jest.Mock).mockResolvedValue(true);

      await appointmentDeletePatch(req, res);
      expect(res._getJSONData().code).toBe('success');
    });

    it('should return error if not found', async () => {
      const req = createRequest({ params: { id: 'app1' } });
      const res = createResponse();
      (Appointment.findById as jest.Mock).mockResolvedValue(null);

      await appointmentDeletePatch(req, res);
      expect(res._getJSONData().code).toBe('error');
    });

    it('should return error if already deleted', async () => {
      const req = createRequest({ params: { id: 'app1' } });
      const res = createResponse();
      (Appointment.findById as jest.Mock).mockResolvedValue({ _id: 'app1', isDeleted: true });

      await appointmentDeletePatch(req, res);
      expect(res._getJSONData().code).toBe('error');
    });

    it('should return error on exception', async () => {
      const req = createRequest({ params: { id: 'app1' } });
      const res = createResponse();
      (Appointment.findById as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await appointmentDeletePatch(req, res);
      expect(res._getJSONData().code).toBe('error');
    });
  });

  describe('appointmentsTrashGet', () => {
    it('should get trash appointments successfully', async () => {
      const req = createRequest({ query: { page: '1', limit: '10' } });
      const res = createResponse();
      (Appointment.countDocuments as jest.Mock).mockResolvedValue(1);
      (Appointment.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([{ _id: 'app1' }])
      });

      await appointmentsTrashGet(req, res);
      expect(res._getJSONData().code).toBe('success');
    });

    it('should handle search with drivers', async () => {
      const req = createRequest({ query: { search: 'John' } });
      const res = createResponse();
      (Driver.find as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue([{ _id: 'd1' }]) });
      (Appointment.countDocuments as jest.Mock).mockResolvedValue(0);
      (Appointment.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([])
      });

      await appointmentsTrashGet(req, res);
      expect(res._getJSONData().code).toBe('success');
    });

    it('should return error on exception', async () => {
      const req = createRequest({ query: { page: '1' } });
      const res = createResponse();
      (Appointment.countDocuments as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await appointmentsTrashGet(req, res);
      expect(res._getJSONData().code).toBe('error');
    });
  });

  describe('appointmentRestorePatch', () => {
    it('should restore appointment successfully', async () => {
      const req = createRequest({ params: { id: 'app1' } });
      const res = createResponse();
      (Appointment.findById as jest.Mock).mockResolvedValue({ _id: 'app1', isDeleted: true });
      (Appointment.updateOne as jest.Mock).mockResolvedValue(true);

      await appointmentRestorePatch(req, res);
      expect(res._getJSONData().code).toBe('success');
    });

    it('should return error if not found or not deleted', async () => {
      const req = createRequest({ params: { id: 'app1' } });
      const res = createResponse();
      (Appointment.findById as jest.Mock).mockResolvedValue({ _id: 'app1', isDeleted: false });

      await appointmentRestorePatch(req, res);
      expect(res._getJSONData().code).toBe('error');
    });

    it('should return error on exception', async () => {
      const req = createRequest({ params: { id: 'app1' } });
      const res = createResponse();
      (Appointment.findById as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await appointmentRestorePatch(req, res);
      expect(res._getJSONData().code).toBe('error');
    });
  });

  describe('appointmentHardDelete', () => {
    it('should hard delete appointment successfully', async () => {
      const req = createRequest({ params: { id: 'app1' } });
      const res = createResponse();
      (Appointment.findById as jest.Mock).mockResolvedValue({ _id: 'app1', isDeleted: true });
      (Appointment.deleteOne as jest.Mock).mockResolvedValue(true);

      await appointmentHardDelete(req, res);
      expect(res._getJSONData().code).toBe('success');
    });

    it('should return error if not found or not deleted', async () => {
      const req = createRequest({ params: { id: 'app1' } });
      const res = createResponse();
      (Appointment.findById as jest.Mock).mockResolvedValue(null);

      await appointmentHardDelete(req, res);
      expect(res._getJSONData().code).toBe('error');
    });

    it('should return error on exception', async () => {
      const req = createRequest({ params: { id: 'app1' } });
      const res = createResponse();
      (Appointment.findById as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await appointmentHardDelete(req, res);
      expect(res._getJSONData().code).toBe('error');
    });
  });
});
