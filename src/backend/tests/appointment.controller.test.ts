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

// Sức chứa mỗi khung giờ giờ do admin cấu hình (SystemSetting) chứ không còn là
// hằng số trong controller. Cố định 20 ở đây để các ca biên 19/20 và 20/20 vẫn
// kiểm đúng thứ cần kiểm: phép so sánh sức chứa, không phải việc đọc cấu hình.
jest.mock('../services/system-setting.service', () => ({
  getMaxCapacityPerSlot: jest.fn().mockResolvedValue(20),
}));

// Helpers to mock chained Mongoose queries
const mockFindChain = (resolvedValue: any) => {
  const chain = {
    populate: jest.fn().mockImplementation(() => chain),
    sort: jest.fn().mockImplementation(() => chain),
    skip: jest.fn().mockImplementation(() => chain),
    limit: jest.fn().mockResolvedValue(resolvedValue),
  };
  return chain;
};

const mockFindByIdChain = (resolvedValue: any) => {
  const chain = {
    populate: jest.fn().mockResolvedValue(resolvedValue),
  };
  return chain;
};

const mockDriverFindChain = (resolvedValue: any) => {
  const chain = {
    select: jest.fn().mockResolvedValue(resolvedValue),
  };
  return chain;
};

describe('Appointment Controller Unit Tests (TC27 - TC60)', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error during tests to avoid log pollution
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    if (consoleSpy) {
      consoleSpy.mockRestore();
    }
  });

  describe('createAppointmentPost', () => {
    // TC27 / TC51: Verify system creates a new appointment successfully with valid, complete data
    it('TC27 / TC51: should create appointment successfully', async () => {
      const req = createRequest({
        body: {
          truckPlate: '51C12345',
          scheduledDate: '2026-12-01',
          timeSlot: '08:00-09:00',
          containerNo: 'MSGU1234567',
          purpose: 'Lấy container'
        }
      });
      const res = createResponse();

      (Container.findOne as jest.Mock).mockResolvedValue({
        number: 'MSGU1234567',
        portStatus: 'Đã nhập cảng',
        isDeleted: false
      });
      (Appointment.findOne as jest.Mock).mockResolvedValue(null);
      (Appointment.countDocuments as jest.Mock).mockResolvedValue(10);
      (Appointment.prototype.save as jest.Mock).mockResolvedValue(true);

      await createAppointmentPost(req, res);

      expect(res._getJSONData()).toEqual({
        code: 'success',
        message: 'Tạo lịch hẹn thành công'
      });
    });

    // TC28 / TC52: Verify system rejects duplicate appointment for the same truck on the same day
    it('TC28 / TC52: should return error if car already has appointment today', async () => {
      const req = createRequest({
        body: {
          truckPlate: '51C12345',
          scheduledDate: '2026-12-01',
          timeSlot: '08:00-09:00',
          containerNo: 'MSGU1234567',
          purpose: 'Lấy container'
        }
      });
      const res = createResponse();

      (Container.findOne as jest.Mock).mockResolvedValue({
        number: 'MSGU1234567',
        portStatus: 'Đã nhập cảng',
        isDeleted: false
      });
      (Appointment.findOne as jest.Mock).mockResolvedValue({ _id: 'existingApp1' });

      await createAppointmentPost(req, res);

      expect(res._getJSONData()).toEqual({
        code: 'error',
        message: 'Xe đã có lịch hẹn trong ngày.'
      });
    });

    // TC29 / TC53: [BVA] Verify system allows creating appointment when timeslot has 19/20 vehicles (lower boundary)
    it('TC29 / TC53: should create successfully when timeslot has 19/20 vehicles', async () => {
      const req = createRequest({
        body: {
          truckPlate: '51C12345',
          scheduledDate: '2026-12-01',
          timeSlot: '08:00-09:00',
          containerNo: 'MSGU1234567',
          purpose: 'Lấy container'
        }
      });
      const res = createResponse();

      (Container.findOne as jest.Mock).mockResolvedValue({
        number: 'MSGU1234567',
        portStatus: 'Đã nhập cảng',
        isDeleted: false
      });
      (Appointment.findOne as jest.Mock).mockResolvedValue(null);
      (Appointment.countDocuments as jest.Mock).mockResolvedValue(19); // 19 existing vehicles
      (Appointment.prototype.save as jest.Mock).mockResolvedValue(true);

      await createAppointmentPost(req, res);

      expect(res._getJSONData()).toEqual({
        code: 'success',
        message: 'Tạo lịch hẹn thành công'
      });
    });

    // TC30 / TC54: [BVA] Verify system rejects appointment when timeslot is at capacity 20/20 (upper boundary)
    it('TC30 / TC54: should return error if capacity is full (20/20)', async () => {
      const req = createRequest({
        body: {
          truckPlate: '51C12345',
          scheduledDate: '2026-12-01',
          timeSlot: '08:00-09:00',
          containerNo: 'MSGU1234567',
          purpose: 'Lấy container'
        }
      });
      const res = createResponse();

      (Container.findOne as jest.Mock).mockResolvedValue({
        number: 'MSGU1234567',
        portStatus: 'Đã nhập cảng',
        isDeleted: false
      });
      (Appointment.findOne as jest.Mock).mockResolvedValue(null);
      (Appointment.countDocuments as jest.Mock).mockResolvedValue(20); // 20 vehicles already in slot

      await createAppointmentPost(req, res);

      expect(res._getJSONData().code).toBe('error');
      expect(res._getJSONData().message).toContain('đã đầy');
    });

    // TC55: Verify container portStatus validation for "Lấy container" purpose
    it('TC55: should return error if purpose is Lấy container but portStatus is not in port', async () => {
      const req = createRequest({
        body: {
          truckPlate: '51C12345',
          scheduledDate: '2026-12-01',
          timeSlot: '08:00-09:00',
          containerNo: 'MSGU1234567',
          purpose: 'Lấy container'
        }
      });
      const res = createResponse();

      // portStatus: 'Chưa nhập cảng' is invalid for "Lấy container"
      (Container.findOne as jest.Mock).mockResolvedValue({
        number: 'MSGU1234567',
        portStatus: 'Chưa nhập cảng',
        isDeleted: false
      });

      await createAppointmentPost(req, res);

      expect(res._getJSONData()).toEqual({
        code: 'error',
        message: 'Mục đích lấy container không hợp lệ: Container này hiện không ở Trong cảng.'
      });
    });

    // TC56: Verify container portStatus validation for "Trả container" purpose
    it('TC56: should return error if purpose is Trả container but portStatus is already in port', async () => {
      const req = createRequest({
        body: {
          truckPlate: '51C12345',
          scheduledDate: '2026-12-01',
          timeSlot: '08:00-09:00',
          containerNo: 'MSGU1234567',
          purpose: 'Trả container'
        }
      });
      const res = createResponse();

      // portStatus: 'Đã nhập cảng' is invalid for "Trả container"
      (Container.findOne as jest.Mock).mockResolvedValue({
        number: 'MSGU1234567',
        portStatus: 'Đã nhập cảng',
        isDeleted: false
      });

      await createAppointmentPost(req, res);

      expect(res._getJSONData()).toEqual({
        code: 'error',
        message: 'Mục đích trả container không hợp lệ: Container này hiện đang ở Trong cảng.'
      });
    });

    // Error handling: Container not found
    it('should return error if container information is not found in database', async () => {
      const req = createRequest({
        body: {
          truckPlate: '51C12345',
          scheduledDate: '2026-12-01',
          timeSlot: '08:00-09:00',
          containerNo: 'MSGU1234567',
          purpose: 'Lấy container'
        }
      });
      const res = createResponse();

      (Container.findOne as jest.Mock).mockResolvedValue(null);

      await createAppointmentPost(req, res);

      expect(res._getJSONData()).toEqual({
        code: 'error',
        message: 'Không tìm thấy thông tin container.'
      });
    });

    // Error handling: System crash
    it('should catch error and return system error on db exception', async () => {
      const req = createRequest({
        body: {
          containerNo: 'MSGU1234567'
        }
      });
      const res = createResponse();

      (Container.findOne as jest.Mock).mockRejectedValue(new Error('Database Connection Lost'));

      await createAppointmentPost(req, res);

      expect(res._getJSONData()).toEqual({
        code: 'error',
        message: 'Lỗi hệ thống khi tạo lịch hẹn'
      });
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('appointmentsGet', () => {
    // TC31 / TC57: Verify system returns paginated list with default values (page=1, limit=10)
    it('TC31 / TC57: should get list with default pagination values', async () => {
      const req = createRequest({ query: {} }); // no page, no limit
      const res = createResponse();

      (Appointment.countDocuments as jest.Mock).mockResolvedValue(2);
      (Appointment.find as jest.Mock).mockReturnValue(mockFindChain([{ _id: 'app1' }, { _id: 'app2' }]));

      await appointmentsGet(req, res);

      const jsonResponse = res._getJSONData();
      expect(jsonResponse.code).toBe('success');
      expect(jsonResponse.data).toHaveLength(2);
      expect(jsonResponse.pagination).toEqual({
        currentPage: 1,
        totalPages: 1,
        totalItems: 2,
        limit: 10
      });
    });

    // TC32: Verify system filters the appointment list by status="Confirmed"
    it('TC32: should filter appointment list by status="Confirmed"', async () => {
      const req = createRequest({ query: { status: 'Confirmed' } });
      const res = createResponse();

      (Appointment.countDocuments as jest.Mock).mockImplementation((query) => {
        expect(query.status).toBe('Confirmed');
        return Promise.resolve(1);
      });
      (Appointment.find as jest.Mock).mockReturnValue(mockFindChain([{ _id: 'app1', status: 'Confirmed' }]));

      await appointmentsGet(req, res);

      expect(res._getJSONData().code).toBe('success');
      expect(res._getJSONData().data[0].status).toBe('Confirmed');
    });

    // TC33: Verify system filters the appointment list by a date range
    it('TC33: should filter appointment list by a date range', async () => {
      const req = createRequest({
        query: {
          startDate: '2026-12-01',
          endDate: '2026-12-02'
        }
      });
      const res = createResponse();

      (Appointment.countDocuments as jest.Mock).mockImplementation((query) => {
        expect(query.scheduledDate.$gte).toBeInstanceOf(Date);
        expect(query.scheduledDate.$lt).toBeInstanceOf(Date);
        return Promise.resolve(1);
      });
      (Appointment.find as jest.Mock).mockReturnValue(mockFindChain([{ _id: 'app1' }]));

      await appointmentsGet(req, res);

      expect(res._getJSONData().code).toBe('success');
    });

    it('should filter appointment list with only startDate', async () => {
      const req = createRequest({ query: { startDate: '2026-12-01' } });
      const res = createResponse();
      (Appointment.countDocuments as jest.Mock).mockImplementation((query) => {
        expect(query.scheduledDate.$gte).toBeInstanceOf(Date);
        expect(query.scheduledDate.$lt).toBeUndefined();
        return Promise.resolve(1);
      });
      (Appointment.find as jest.Mock).mockReturnValue(mockFindChain([{ _id: 'app1' }]));
      await appointmentsGet(req, res);
      expect(res._getJSONData().code).toBe('success');
    });

    it('should filter appointment list with only endDate', async () => {
      const req = createRequest({ query: { endDate: '2026-12-02' } });
      const res = createResponse();
      (Appointment.countDocuments as jest.Mock).mockImplementation((query) => {
        expect(query.scheduledDate.$gte).toBeUndefined();
        expect(query.scheduledDate.$lt).toBeInstanceOf(Date);
        return Promise.resolve(1);
      });
      (Appointment.find as jest.Mock).mockReturnValue(mockFindChain([{ _id: 'app1' }]));
      await appointmentsGet(req, res);
      expect(res._getJSONData().code).toBe('success');
    });

    // TC34 / TC58: Verify search functionality works with truckPlate, containerNo and driver information
    it('TC34 / TC58: should search appointment list by driver name/phone or plates', async () => {
      const req = createRequest({ query: { search: 'John' } });
      const res = createResponse();

      (Driver.find as jest.Mock).mockReturnValue(mockDriverFindChain([{ _id: 'd1' }]));
      (Appointment.countDocuments as jest.Mock).mockImplementation((query) => {
        expect(query.$or).toContainEqual({ driverId: { $in: ['d1'] } });
        return Promise.resolve(1);
      });
      (Appointment.find as jest.Mock).mockReturnValue(mockFindChain([{ _id: 'app1' }]));

      await appointmentsGet(req, res);

      expect(res._getJSONData().code).toBe('success');
    });

    // TC50: [BVA] Verify system returns empty list correctly when totalItems = 0
    it('TC50: should return empty list correctly when totalItems is 0', async () => {
      const req = createRequest({ query: { search: 'NonExistent' } });
      const res = createResponse();

      (Driver.find as jest.Mock).mockReturnValue(mockDriverFindChain([]));
      (Appointment.countDocuments as jest.Mock).mockResolvedValue(0);
      (Appointment.find as jest.Mock).mockReturnValue(mockFindChain([]));

      await appointmentsGet(req, res);

      const jsonResponse = res._getJSONData();
      expect(jsonResponse.code).toBe('success');
      expect(jsonResponse.data).toEqual([]);
      expect(jsonResponse.pagination.totalItems).toBe(0);
    });

    // Error handling: System crash
    it('should catch error on DB exception', async () => {
      const req = createRequest();
      const res = createResponse();

      (Appointment.countDocuments as jest.Mock).mockRejectedValue(new Error('Connection failure'));

      await appointmentsGet(req, res);

      expect(res._getJSONData()).toEqual({
        code: 'error',
        message: 'Lỗi hệ thống khi lấy danh sách lịch hẹn'
      });
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('appointmentDetailGet', () => {
    // TC35: Verify system returns appointment detail for a valid existing ID
    it('TC35: should return success with appointment details if found', async () => {
      const req = createRequest({ params: { id: 'app123' } });
      const res = createResponse();

      (Appointment.findById as jest.Mock).mockReturnValue(mockFindByIdChain({ _id: 'app123', truckPlate: '51C12345' }));

      await appointmentDetailGet(req, res);

      expect(res._getJSONData()).toEqual({
        code: 'success',
        data: { _id: 'app123', truckPlate: '51C12345' }
      });
    });

    // TC36: Verify system returns an error when the appointment ID does not exist
    it('TC36: should return error if appointment ID not found', async () => {
      const req = createRequest({ params: { id: 'app999' } });
      const res = createResponse();

      (Appointment.findById as jest.Mock).mockReturnValue(mockFindByIdChain(null));

      await appointmentDetailGet(req, res);

      expect(res._getJSONData()).toEqual({
        code: 'error',
        message: 'Không tìm thấy lịch hẹn'
      });
    });

    // TC37: [Error Handling] Verify system behavior when the appointment ID is not a valid ObjectId format
    it('TC37: should handle cast error or format exceptions in findById', async () => {
      const req = createRequest({ params: { id: 'invalid-id-format' } });
      const res = createResponse();

      (Appointment.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error('Cast to ObjectId failed'))
      });

      await appointmentDetailGet(req, res);

      expect(res._getJSONData()).toEqual({
        code: 'error',
        message: 'Lỗi hệ thống khi lấy chi tiết lịch hẹn'
      });
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('appointmentEditPatch', () => {
    // TC38: Verify system updates appointment information successfully with valid data
    it('TC38: should update appointment successfully', async () => {
      const req = createRequest({
        body: {
          id: 'app123',
          truckPlate: '51C12345',
          scheduledDate: '2026-12-01',
          containerNo: 'MSGU1234567',
          purpose: 'Lấy container'
        }
      });
      const res = createResponse();

      (Container.findOne as jest.Mock).mockResolvedValue({
        number: 'MSGU1234567',
        portStatus: 'Đã nhập cảng',
        isDeleted: false
      });
      (Appointment.findOne as jest.Mock).mockResolvedValue(null);
      (Appointment.updateOne as jest.Mock).mockResolvedValue({ modifiedCount: 1 });

      await appointmentEditPatch(req, res);

      expect(res._getJSONData()).toEqual({
        code: 'success',
        message: 'Cập nhật lịch hẹn thành công'
      });
    });

    // TC38 (Edit): Reject edit if purpose is "Lấy container" but container status is invalid
    it('TC38: should reject edit if purpose is Lấy container but portStatus is not in port', async () => {
      const req = createRequest({
        body: {
          id: 'app123',
          truckPlate: '51C12345',
          scheduledDate: '2026-12-01',
          containerNo: 'MSGU1234567',
          purpose: 'Lấy container'
        }
      });
      const res = createResponse();

      (Container.findOne as jest.Mock).mockResolvedValue({
        number: 'MSGU1234567',
        portStatus: 'Chưa nhập cảng',
        isDeleted: false
      });

      await appointmentEditPatch(req, res);

      expect(res._getJSONData()).toEqual({
        code: 'error',
        message: 'Mục đích lấy container không hợp lệ: Container này hiện không ở Trong cảng.'
      });
    });

    // TC38 (Edit): Reject edit if purpose is "Trả container" but container status is invalid
    it('TC38: should reject edit if purpose is Trả container but portStatus is already in port', async () => {
      const req = createRequest({
        body: {
          id: 'app123',
          truckPlate: '51C12345',
          scheduledDate: '2026-12-01',
          containerNo: 'MSGU1234567',
          purpose: 'Trả container'
        }
      });
      const res = createResponse();

      (Container.findOne as jest.Mock).mockResolvedValue({
        number: 'MSGU1234567',
        portStatus: 'Đã nhập cảng',
        isDeleted: false
      });

      await appointmentEditPatch(req, res);

      expect(res._getJSONData()).toEqual({
        code: 'error',
        message: 'Mục đích trả container không hợp lệ: Container này hiện đang ở Trong cảng.'
      });
    });

    // TC39: Verify system rejects an edit that creates a duplicate appointment for the same truck on the same day
    it('TC39: should reject update if truck already has another appointment on that day', async () => {
      const req = createRequest({
        body: {
          id: 'app123',
          truckPlate: '51C12345',
          scheduledDate: '2026-12-01',
          containerNo: 'MSGU1234567',
          purpose: 'Lấy container'
        }
      });
      const res = createResponse();

      (Container.findOne as jest.Mock).mockResolvedValue({
        number: 'MSGU1234567',
        portStatus: 'Đã nhập cảng',
        isDeleted: false
      });
      (Appointment.findOne as jest.Mock).mockResolvedValue({ _id: 'otherApp999' }); // another appointment exists

      await appointmentEditPatch(req, res);

      expect(res._getJSONData()).toEqual({
        code: 'error',
        message: 'Xe đã có lịch hẹn khác trong ngày.'
      });
    });

    // Error handling: Container not found
    it('should return error on edit if container is not found', async () => {
      const req = createRequest({
        body: {
          containerNo: 'MSGU1234567'
        }
      });
      const res = createResponse();

      (Container.findOne as jest.Mock).mockResolvedValue(null);

      await appointmentEditPatch(req, res);

      expect(res._getJSONData()).toEqual({
        code: 'error',
        message: 'Không tìm thấy thông tin container.'
      });
    });

    // Error handling: System crash
    it('should handle system errors on exception during edit', async () => {
      const req = createRequest({
        body: {
          containerNo: 'MSGU1234567'
        }
      });
      const res = createResponse();

      (Container.findOne as jest.Mock).mockRejectedValue(new Error('Edit DB Error'));

      await appointmentEditPatch(req, res);

      expect(res._getJSONData()).toEqual({
        code: 'error',
        message: 'Lỗi hệ thống khi cập nhật lịch hẹn'
      });
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('appointmentStatusPatch', () => {
    // TC40 / TC59: Verify system updates appointment status from "Pending" to "Confirmed" successfully
    it('TC40 / TC59: should confirm appointment successfully if capacity is not full and no duplicate', async () => {
      const req = createRequest({
        params: { id: 'app123' },
        body: { status: 'Confirmed' }
      });
      const res = createResponse();

      (Appointment.findById as jest.Mock).mockResolvedValue({
        _id: 'app123',
        truckPlate: '51C12345',
        scheduledDate: new Date('2026-12-01')
      });
      (Appointment.findOne as jest.Mock).mockResolvedValue(null); // No other appointment
      (Appointment.updateOne as jest.Mock).mockResolvedValue({ modifiedCount: 1 });

      await appointmentStatusPatch(req, res);

      expect(res._getJSONData()).toEqual({
        code: 'success',
        message: 'Cập nhật trạng thái lịch hẹn thành công'
      });
    });

    // TC41 / TC60: Verify system rejects status change if truck has another Confirmed appointment
    it('TC41 / TC60: should reject status change to Confirmed if another confirmed appointment exists for that day', async () => {
      const req = createRequest({
        params: { id: 'app123' },
        body: { status: 'Confirmed' }
      });
      const res = createResponse();

      (Appointment.findById as jest.Mock).mockResolvedValue({
        _id: 'app123',
        truckPlate: '51C12345',
        scheduledDate: new Date('2026-12-01')
      });
      (Appointment.findOne as jest.Mock).mockResolvedValue({ _id: 'otherApp999' }); // Another appointment exists

      await appointmentStatusPatch(req, res);

      expect(res._getJSONData()).toEqual({
        code: 'error',
        message: 'Xe đã có lịch hẹn khác trong ngày.'
      });
    });

    // TC42: Verify system updates appointment status to "Cancelled" successfully (skips duplicate truck check)
    it('TC42: should update status to Cancelled successfully without truck duplicate check', async () => {
      const req = createRequest({
        params: { id: 'app123' },
        body: { status: 'Cancelled' }
      });
      const res = createResponse();

      (Appointment.findById as jest.Mock).mockResolvedValue({
        _id: 'app123',
        truckPlate: '51C12345'
      });
      (Appointment.updateOne as jest.Mock).mockResolvedValue({ modifiedCount: 1 });

      await appointmentStatusPatch(req, res);

      expect(res._getJSONData()).toEqual({
        code: 'success',
        message: 'Cập nhật trạng thái lịch hẹn thành công'
      });
      expect(Appointment.findOne).not.toHaveBeenCalled();
    });

    // Error handling: Appointment not found
    it('should return error if appointment not found for status update', async () => {
      const req = createRequest({
        params: { id: 'app123' },
        body: { status: 'Confirmed' }
      });
      const res = createResponse();

      (Appointment.findById as jest.Mock).mockResolvedValue(null);

      await appointmentStatusPatch(req, res);

      expect(res._getJSONData()).toEqual({
        code: 'error',
        message: 'Không tìm thấy lịch hẹn'
      });
    });

    // Error handling: System crash
    it('should return error on exception during status update', async () => {
      const req = createRequest({
        params: { id: 'app123' },
        body: { status: 'Confirmed' }
      });
      const res = createResponse();

      (Appointment.findById as jest.Mock).mockRejectedValue(new Error('Status DB Error'));

      await appointmentStatusPatch(req, res);

      expect(res._getJSONData()).toEqual({
        code: 'error',
        message: 'Lỗi hệ thống khi cập nhật trạng thái lịch hẹn'
      });
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('appointmentDeletePatch', () => {
    // TC43: Verify system soft-deletes an appointment successfully
    it('TC43: should soft-delete appointment successfully', async () => {
      const req = createRequest({ params: { id: 'app123' } });
      const res = createResponse();

      (Appointment.findById as jest.Mock).mockResolvedValue({
        _id: 'app123',
        isDeleted: false
      });
      (Appointment.updateOne as jest.Mock).mockResolvedValue({ modifiedCount: 1 });

      await appointmentDeletePatch(req, res);

      expect(res._getJSONData()).toEqual({
        code: 'success',
        message: 'Xóa lịch hẹn thành công'
      });
    });

    // TC44: Verify system rejects soft-deleting an appointment that is already deleted
    it('TC44: should return error if appointment is already soft-deleted', async () => {
      const req = createRequest({ params: { id: 'app123' } });
      const res = createResponse();

      (Appointment.findById as jest.Mock).mockResolvedValue({
        _id: 'app123',
        isDeleted: true
      });

      await appointmentDeletePatch(req, res);

      expect(res._getJSONData()).toEqual({
        code: 'error',
        message: 'Lịch hẹn đã bị xóa'
      });
    });

    // Error handling: Appointment not found
    it('should return error if appointment not found for soft-delete', async () => {
      const req = createRequest({ params: { id: 'app123' } });
      const res = createResponse();

      (Appointment.findById as jest.Mock).mockResolvedValue(null);

      await appointmentDeletePatch(req, res);

      expect(res._getJSONData()).toEqual({
        code: 'error',
        message: 'Không tìm thấy lịch hẹn'
      });
    });

    // Error handling: System crash
    it('should return error on exception during soft-delete', async () => {
      const req = createRequest({ params: { id: 'app123' } });
      const res = createResponse();

      (Appointment.findById as jest.Mock).mockRejectedValue(new Error('Delete DB Error'));

      await appointmentDeletePatch(req, res);

      expect(res._getJSONData()).toEqual({
        code: 'error',
        message: 'Lỗi hệ thống khi xóa lịch hẹn'
      });
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('appointmentsTrashGet', () => {
    // TC45: Verify system returns in the trash list (soft-deleted appointments)
    it('TC45: should get trash list with status, search, and date filters', async () => {
      const req = createRequest({
        query: {
          search: 'John',
          status: 'Confirmed',
          startDate: '2026-12-01',
          endDate: '2026-12-02',
          page: '1',
          limit: '10'
        }
      });
      const res = createResponse();

      (Driver.find as jest.Mock).mockReturnValue(mockDriverFindChain([{ _id: 'd1' }]));
      (Appointment.countDocuments as jest.Mock).mockResolvedValue(1);
      (Appointment.find as jest.Mock).mockReturnValue(mockFindChain([{ _id: 'app1', isDeleted: true }]));

      await appointmentsTrashGet(req, res);

      expect(res._getJSONData().code).toBe('success');
      expect(res._getJSONData().data).toHaveLength(1);
    });

    it('should get trash list with only startDate or only endDate', async () => {
      const req1 = createRequest({ query: { startDate: '2026-12-01' } });
      const res1 = createResponse();
      (Appointment.countDocuments as jest.Mock).mockResolvedValue(1);
      (Appointment.find as jest.Mock).mockReturnValue(mockFindChain([{ _id: 'app1', isDeleted: true }]));
      await appointmentsTrashGet(req1, res1);
      expect(res1._getJSONData().code).toBe('success');

      const req2 = createRequest({ query: { endDate: '2026-12-02' } });
      const res2 = createResponse();
      await appointmentsTrashGet(req2, res2);
      expect(res2._getJSONData().code).toBe('success');
    });

    // Error handling: System crash
    it('should return error on exception during trash fetch', async () => {
      const req = createRequest();
      const res = createResponse();

      (Appointment.countDocuments as jest.Mock).mockRejectedValue(new Error('Trash DB Error'));

      await appointmentsTrashGet(req, res);

      expect(res._getJSONData()).toEqual({
        code: 'error',
        message: 'Lỗi hệ thống khi lấy danh sách thùng rác'
      });
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('appointmentRestorePatch', () => {
    // TC46: Verify system restores a soft-deleted appointment successfully
    it('TC46: should restore soft-deleted appointment successfully', async () => {
      const req = createRequest({ params: { id: 'app123' } });
      const res = createResponse();

      (Appointment.findById as jest.Mock).mockResolvedValue({
        _id: 'app123',
        isDeleted: true
      });
      (Appointment.updateOne as jest.Mock).mockResolvedValue({ modifiedCount: 1 });

      await appointmentRestorePatch(req, res);

      expect(res._getJSONData()).toEqual({
        code: 'success',
        message: 'Khôi phục lịch hẹn thành công'
      });
    });

    // TC47: Verify system rejects restoring an appointment that is not in the trash
    it('TC47: should return error if appointment is not in the trash (isDeleted is false)', async () => {
      const req = createRequest({ params: { id: 'app123' } });
      const res = createResponse();

      (Appointment.findById as jest.Mock).mockResolvedValue({
        _id: 'app123',
        isDeleted: false
      });

      await appointmentRestorePatch(req, res);

      expect(res._getJSONData()).toEqual({
        code: 'error',
        message: 'Không tìm thấy lịch hẹn trong thùng rác'
      });
    });

    // Error handling: System crash
    it('should return error on exception during restore', async () => {
      const req = createRequest({ params: { id: 'app123' } });
      const res = createResponse();

      (Appointment.findById as jest.Mock).mockRejectedValue(new Error('Restore DB Error'));

      await appointmentRestorePatch(req, res);

      expect(res._getJSONData()).toEqual({
        code: 'error',
        message: 'Lỗi hệ thống khi khôi phục lịch hẹn'
      });
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('appointmentHardDelete', () => {
    // TC48: Verify system permanently deletes an appointment that is in the trash
    it('TC48: should hard delete appointment successfully', async () => {
      const req = createRequest({ params: { id: 'app123' } });
      const res = createResponse();

      (Appointment.findById as jest.Mock).mockResolvedValue({
        _id: 'app123',
        isDeleted: true
      });
      (Appointment.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });

      await appointmentHardDelete(req, res);

      expect(res._getJSONData()).toEqual({
        code: 'success',
        message: 'Xóa vĩnh viễn lịch hẹn thành công'
      });
    });

    // TC49: Verify system rejects permanently deleting an appointment that is NOT in the trash
    it('TC49: should return error if appointment is not in the trash (isDeleted is false)', async () => {
      const req = createRequest({ params: { id: 'app123' } });
      const res = createResponse();

      (Appointment.findById as jest.Mock).mockResolvedValue({
        _id: 'app123',
        isDeleted: false
      });

      await appointmentHardDelete(req, res);

      expect(res._getJSONData()).toEqual({
        code: 'error',
        message: 'Không tìm thấy lịch hẹn trong thùng rác'
      });
    });

    // Error handling: System crash
    it('should return error on exception during hard delete', async () => {
      const req = createRequest({ params: { id: 'app123' } });
      const res = createResponse();

      (Appointment.findById as jest.Mock).mockRejectedValue(new Error('Hard Delete DB Error'));

      await appointmentHardDelete(req, res);

      expect(res._getJSONData()).toEqual({
        code: 'error',
        message: 'Lỗi hệ thống khi xóa vĩnh viễn lịch hẹn'
      });
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
