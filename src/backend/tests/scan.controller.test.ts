import { Request, Response } from 'express';
import { createRequest, createResponse } from 'node-mocks-http';
import { 
  scanPost, getLogs, getLogsPaginated, getLogDetail, 
  manualCheckoutPatch, softDeleteLogDelete, logsTrashGet, 
  restoreLogPatch, hardDeleteLogDelete 
} from '../controllers/scan.controller';
import { Appointment } from '../models/appointment.model';
import { GateTransaction } from '../models/gateTransaction.model';
import { io } from '../index';
import cloudinary from '../config/cloudinary.config';
import streamifier from 'streamifier';
import mockData from './mockData.json';

jest.mock('../models/appointment.model');
jest.mock('../models/gateTransaction.model');
jest.mock('../index', () => ({
  io: { emit: jest.fn() }
}));
jest.mock('../config/cloudinary.config', () => ({
  uploader: {
    upload_stream: jest.fn((options, callback) => {
      if (callback) callback(null, { secure_url: 'mock_url' });
      return { pipe: jest.fn() };
    })
  }
}));
jest.mock('streamifier', () => ({
  createReadStream: jest.fn().mockReturnValue({ pipe: jest.fn() })
}));

global.fetch = jest.fn();

describe('scan.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date(mockData.systemTime));
    (GateTransaction.countDocuments as jest.Mock).mockResolvedValue(0);
    (GateTransaction as unknown as jest.Mock).mockImplementation(function(this: any) {
      this._id = mockData.tx.mockId;
      this.actualTruckPlate = mockData.baseAppointment.truckPlate;
      this.actualContainerNo = mockData.baseAppointment.containerNo;
      this.checkInTime = new Date();
      this.status = 'in';
      this.save = jest.fn().mockResolvedValue(true);
      return this;
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const baseAppointment = {
    ...mockData.baseAppointment,
    scheduledDate: new Date(mockData.baseAppointment.scheduledDate),
    save: jest.fn()
  };

  const mockAppointmentQuery = (data: any) => ({
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockResolvedValue(data)
  });

  describe('scanPost - Group 1: Basic validation', () => {
    it('should return error if missing required fields', async () => {
      const req = createRequest({ body: { text: mockData.baseAppointment.truckPlate, type: 'plate' } }); // missing status
      const res = createResponse();
      await scanPost(req, res);
      expect(res._getJSONData()).toEqual({ code: 'error', message: 'Thiếu thông tin' });
    });

    it('should return ignored if no valid appointment found', async () => {
      const req = createRequest({ body: { text: mockData.baseAppointment.truckPlate, type: 'plate', status: 'in', cameraIp: 'ip1' } });
      const res = createResponse();
      (Appointment.findOne as jest.Mock).mockReturnValue(mockAppointmentQuery(null));
      
      await scanPost(req, res);
      expect(res._getJSONData()).toEqual({ code: 'ignored', message: 'Không tìm thấy lịch hẹn đã duyệt cho xe này.' });
    });

    it('should return ignored if time is invalid (>30 mins late)', async () => {
      const req = createRequest({ body: { text: mockData.baseAppointment.truckPlate, type: 'plate', status: 'in', cameraIp: 'ip2' } });
      const res = createResponse();
      
      (Appointment.findOne as jest.Mock).mockReturnValue(mockAppointmentQuery(baseAppointment));
      jest.setSystemTime(new Date(mockData.invalidSystemTime));
      
      await scanPost(req, res);
      expect(res._getJSONData()).toEqual({ 
        code: 'ignored', 
        message: 'Chưa tới hoặc đã quá khung giờ lịch hẹn (09:00-11:00).' 
      });
    });
  });

  describe('scanPost - Group 2: IN gate, Pick-up (Lấy container)', () => {
    it('TC01: should success if plate matches', async () => {
      const req = createRequest({ body: { text: mockData.baseAppointment.truckPlate, type: 'plate', status: 'in', cameraIp: 'ip3' } });
      const res = createResponse();
      
      (Appointment.findOne as jest.Mock).mockReturnValue(mockAppointmentQuery({ ...baseAppointment, purpose: 'Lấy container' }));
      (GateTransaction.findOne as jest.Mock).mockResolvedValue(null);
      (GateTransaction.prototype.save as jest.Mock).mockResolvedValue(true);
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true, arrayBuffer: async () => new ArrayBuffer(8), text: async () => 'ok' });

      await scanPost(req, res);
      expect(res._getJSONData()).toEqual({ code: 'success', message: 'Processed successfully' });
    });

    it('TC02/TC03: should return "Đang chờ quét biển" if plate is unmatched', async () => {
      (Appointment.findOne as jest.Mock).mockReturnValue(mockAppointmentQuery({ ...baseAppointment, purpose: 'Lấy container' }));
      (GateTransaction.findOne as jest.Mock).mockResolvedValue(null);

      const req1 = createRequest({ body: { text: mockData.invalid.truckPlate, type: 'container', status: 'in', cameraIp: 'ip4' } });
      const res1 = createResponse();
      await scanPost(req1, res1);

      expect(res1._getJSONData()).toEqual({ code: 'ignored', message: 'Đang chờ quét biển số xe (Mục đích: Lấy container)' });
    });
  });

  describe('scanPost - Group 3: IN gate, Drop-off (Trả container)', () => {
    it('TC06: should success if both plate and container match', async () => {
      const appt = { ...baseAppointment, purpose: 'Trả container' };
      (Appointment.findOne as jest.Mock).mockReturnValue(mockAppointmentQuery(appt));
      (GateTransaction.findOne as jest.Mock).mockResolvedValue(null);

      await scanPost(createRequest({ body: { text: mockData.baseAppointment.truckPlate, type: 'plate', status: 'in', cameraIp: 'ip5' } }), createResponse());
      const req = createRequest({ body: { text: mockData.baseAppointment.containerNo, type: 'container', status: 'in', cameraIp: 'ip5' } });
      const res = createResponse();
      
      await scanPost(req, res);
      expect(res._getJSONData()).toEqual({ code: 'success', message: 'Processed successfully' });
    });

    it('TC07: should return missing container if container invalid', async () => {
      const appt = { ...baseAppointment, purpose: 'Trả container' };
      (Appointment.findOne as jest.Mock).mockReturnValue(mockAppointmentQuery(appt));
      (GateTransaction.findOne as jest.Mock).mockResolvedValue(null);

      await scanPost(createRequest({ body: { text: mockData.baseAppointment.truckPlate, type: 'plate', status: 'in', cameraIp: 'ip6' } }), createResponse());
      const req = createRequest({ body: { text: mockData.invalid.containerNo, type: 'container', status: 'in', cameraIp: 'ip6' } });
      const res = createResponse();
      
      await scanPost(req, res);
      expect(res._getJSONData()).toEqual({ code: 'ignored', message: 'Yêu cầu quét đủ biển số và mã container. Thiếu: Mã container' });
    });

    it('TC09: should warn timeout if container not scanned > 60s', async () => {
      const appt = { ...baseAppointment, purpose: 'Trả container' };
      (Appointment.findOne as jest.Mock).mockReturnValue(mockAppointmentQuery(appt));
      (GateTransaction.findOne as jest.Mock).mockResolvedValue(null);

      await scanPost(createRequest({ body: { text: mockData.baseAppointment.truckPlate, type: 'plate', status: 'in', cameraIp: 'ip7' } }), createResponse());
      
      jest.advanceTimersByTime(65000);

      const req = createRequest({ body: { text: mockData.invalid.containerNo, type: 'container', status: 'in', cameraIp: 'ip7' } });
      const res = createResponse();
      
      await scanPost(req, res);
      expect(res._getJSONData()).toEqual({ code: 'ignored', message: 'Yêu cầu quét đủ biển số và mã container. Thiếu: Mã container' });
      expect(io.emit).toHaveBeenCalledWith('gate_scan_error', expect.objectContaining({ message: expect.stringContaining('Quá 1 phút chưa quét được Mã container') }));
    });
  });

  describe('scanPost - Group 4: OUT gate, Pick-up (Lấy container)', () => {
    it('TC12: should success if both match and transaction exists', async () => {
      const appt = { ...baseAppointment, purpose: 'Lấy container' };
      (Appointment.findOne as jest.Mock).mockReturnValue(mockAppointmentQuery(appt));
      (GateTransaction.findOne as jest.Mock).mockResolvedValue({ _id: mockData.tx.tx1, status: 'in', save: jest.fn() });

      await scanPost(createRequest({ body: { text: mockData.baseAppointment.truckPlate, type: 'plate', status: 'out', cameraIp: 'ip8' } }), createResponse());
      const req = createRequest({ body: { text: mockData.baseAppointment.containerNo, type: 'container', status: 'out', cameraIp: 'ip8' } });
      const res = createResponse();
      
      await scanPost(req, res);
      expect(res._getJSONData()).toEqual({ code: 'success', message: 'Processed successfully' });
    });

    it('TC13: missing container on out gate pick-up', async () => {
      const appt = { ...baseAppointment, purpose: 'Lấy container' };
      (Appointment.findOne as jest.Mock).mockReturnValue(mockAppointmentQuery(appt));
      (GateTransaction.findOne as jest.Mock).mockResolvedValue({ _id: mockData.tx.tx1, status: 'in', save: jest.fn() });

      const req = createRequest({ body: { text: mockData.baseAppointment.truckPlate, type: 'plate', status: 'out', cameraIp: 'ip9' } });
      const res = createResponse();
      await scanPost(req, res);
      expect(res._getJSONData()).toEqual({ code: 'ignored', message: 'Yêu cầu quét đủ biển số và mã container. Thiếu: Mã container' });
    });
  });

  describe('scanPost - Group 5: OUT gate, Drop-off (Trả container)', () => {
    it('TC18: should success if plate matches and NO container', async () => {
      const appt = { ...baseAppointment, purpose: 'Trả container' };
      (Appointment.findOne as jest.Mock).mockReturnValue(mockAppointmentQuery(appt));
      (GateTransaction.findOne as jest.Mock).mockResolvedValue({ _id: mockData.tx.tx2, status: 'in', save: jest.fn() });

      const req = createRequest({ body: { text: mockData.baseAppointment.truckPlate, type: 'plate', status: 'out', cameraIp: 'ip10' } });
      const res = createResponse();
      await scanPost(req, res);
      expect(res._getJSONData()).toEqual({ code: 'success', message: 'Processed successfully' });
    });

    it('TC19: should error if container detected for Drop-off at out gate', async () => {
      const appt = { ...baseAppointment, purpose: 'Trả container' };
      (Appointment.findOne as jest.Mock).mockReturnValue(mockAppointmentQuery(appt));
      (GateTransaction.findOne as jest.Mock).mockResolvedValue({ _id: mockData.tx.tx2, status: 'in', save: jest.fn() });

      await scanPost(createRequest({ body: { text: mockData.baseAppointment.containerNo, type: 'container', status: 'out', cameraIp: 'ip11' } }), createResponse());
      const req = createRequest({ body: { text: mockData.baseAppointment.truckPlate, type: 'plate', status: 'out', cameraIp: 'ip11' } });
      const res = createResponse();
      await scanPost(req, res);
      expect(res._getJSONData()).toEqual({ code: 'error', message: 'Phát hiện xe chở container ra ngoài (không hợp lệ)' });
    });
  });

  describe('scanPost - Group 6: Edge Cases', () => {
    it('TC24: IN gate but already checked in', async () => {
      const req = createRequest({ body: { text: mockData.baseAppointment.truckPlate, type: 'plate', status: 'in', cameraIp: 'ip12' } });
      const res = createResponse();
      (Appointment.findOne as jest.Mock).mockReturnValue(mockAppointmentQuery(baseAppointment));
      (GateTransaction.findOne as jest.Mock).mockResolvedValue({ _id: mockData.tx.tx3 }); 
      
      await scanPost(req, res);
      expect(res._getJSONData()).toEqual({ code: 'ignored', message: 'Xe này đã check-in và đang ở trong bãi.' });
    });

    it('TC25: OUT gate but no check-in record', async () => {
      const req = createRequest({ body: { text: mockData.baseAppointment.truckPlate, type: 'plate', status: 'out', cameraIp: 'ip13' } });
      const res = createResponse();
      (Appointment.findOne as jest.Mock).mockReturnValue(mockAppointmentQuery(baseAppointment));
      (GateTransaction.findOne as jest.Mock).mockResolvedValue(null); 
      
      await scanPost(req, res);
      expect(res._getJSONData()).toEqual({ code: 'ignored', message: 'Không tìm thấy dữ liệu check-in cho xe này.' });
    });
  });

  describe('Helper & CRUD Methods', () => {
    it('getLogs - success', async () => {
      const req = createRequest();
      const res = createResponse();
      (GateTransaction.countDocuments as jest.Mock).mockResolvedValue(5);
      const mockFind = { sort: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(), populate: jest.fn().mockResolvedValue([{ _id: mockData.tx.tx1, status: 'in' }]) };
      (GateTransaction.find as jest.Mock).mockReturnValue(mockFind);

      await getLogs(req, res);
      expect(res._getJSONData().code).toBe('success');
    });

    it('getLogs - error', async () => {
      (GateTransaction.countDocuments as jest.Mock).mockRejectedValue(new Error('DB Error'));
      const res = createResponse();
      await getLogs(createRequest(), res);
      expect(res._getJSONData().code).toBe('error');
    });

    it('getLogsPaginated - success', async () => {
      const req = createRequest({ query: { page: '1', limit: '10', search: '29A', status: 'in', startDate: '2023-01-01', endDate: '2023-12-31' } });
      const res = createResponse();
      (GateTransaction.countDocuments as jest.Mock).mockResolvedValue(1);
      const mockFind = { sort: jest.fn().mockReturnThis(), skip: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(), populate: jest.fn().mockResolvedValue([]) };
      (GateTransaction.find as jest.Mock).mockReturnValue(mockFind);
      
      await getLogsPaginated(req, res);
      expect(res._getJSONData().code).toBe('success');
    });

    it('getLogDetail - found', async () => {
      const req = createRequest({ params: { id: mockData.tx.tx1 } });
      const res = createResponse();
      (GateTransaction.findById as jest.Mock).mockReturnValue({ populate: jest.fn().mockResolvedValue({ _id: mockData.tx.tx1 }) });
      await getLogDetail(req, res);
      expect(res._getJSONData().code).toBe('success');
    });

    it('getLogDetail - not found', async () => {
      const req = createRequest({ params: { id: mockData.tx.tx2 } });
      const res = createResponse();
      (GateTransaction.findById as jest.Mock).mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });
      await getLogDetail(req, res);
      expect(res._getJSONData().code).toBe('error');
    });

    it('manualCheckoutPatch - success', async () => {
      const tx = { _id: mockData.tx.tx1, status: 'in', save: jest.fn(), appointmentId: 'app1' };
      (GateTransaction.findById as jest.Mock).mockResolvedValue(tx);
      (Appointment.findById as jest.Mock).mockResolvedValue({ status: 'Confirmed', save: jest.fn() });
      const res = createResponse();
      await manualCheckoutPatch(createRequest({ params: { id: mockData.tx.tx1 } }), res);
      expect(res._getJSONData().code).toBe('success');
    });

    it('manualCheckoutPatch - error (already out)', async () => {
      const tx = { _id: mockData.tx.tx1, status: 'out', save: jest.fn(), appointmentId: 'app1' };
      (GateTransaction.findById as jest.Mock).mockResolvedValue(tx);
      const res = createResponse();
      await manualCheckoutPatch(createRequest({ params: { id: mockData.tx.tx1 } }), res);
      expect(res._getJSONData().code).toBe('error');
    });

    it('softDeleteLogDelete', async () => {
      const tx = { _id: mockData.tx.tx1, save: jest.fn() };
      (GateTransaction.findById as jest.Mock).mockResolvedValue(tx);
      const res = createResponse();
      await softDeleteLogDelete(createRequest({ params: { id: mockData.tx.tx1 } }), res);
      expect(res._getJSONData().code).toBe('success');
    });

    it('logsTrashGet', async () => {
      (GateTransaction.countDocuments as jest.Mock).mockResolvedValue(1);
      const mockFind = { sort: jest.fn().mockReturnThis(), skip: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(), populate: jest.fn().mockResolvedValue([]) };
      (GateTransaction.find as jest.Mock).mockReturnValue(mockFind);
      const res = createResponse();
      await logsTrashGet(createRequest(), res);
      expect(res._getJSONData().code).toBe('success');
    });

    it('restoreLogPatch', async () => {
      const tx = { _id: mockData.tx.tx1, save: jest.fn() };
      (GateTransaction.findById as jest.Mock).mockResolvedValue(tx);
      const res = createResponse();
      await restoreLogPatch(createRequest({ params: { id: mockData.tx.tx1 } }), res);
      expect(res._getJSONData().code).toBe('success');
    });

    it('hardDeleteLogDelete', async () => {
      (GateTransaction.findByIdAndDelete as jest.Mock).mockResolvedValue(true);
      const res = createResponse();
      await hardDeleteLogDelete(createRequest({ params: { id: mockData.tx.tx1 } }), res);
      expect(res._getJSONData().code).toBe('success');
    });
  });
});
