import mongoose from 'mongoose';
import { Appointment } from '../models/appointment.model';

describe('Appointment Repository / Database Tests', () => {
  it('Test đếm số lượng Lịch hẹn (Sức chứa) - countDocuments', async () => {
    // Arrange
    const targetDate = new Date('2024-12-01T00:00:00Z');
    const targetSlot = '08:00-09:00';
    
    // Tạo 20 record trùng timeslot và ngày (Hợp lệ)
    const mockAppointments = [];
    for (let i = 0; i < 20; i++) {
      mockAppointments.push({
        truckPlate: `51C-${10000 + i}`,
        driverId: new mongoose.Types.ObjectId(),
        containerNo: `CONT${100000 + i}`,
        scheduledDate: targetDate,
        timeSlot: targetSlot,
        purpose: 'Lấy container',
        status: 'Pending',
        isDeleted: false
      });
    }

    // Thêm 1 record ở khung giờ khác (để test nhiễu)
    mockAppointments.push({
      truckPlate: `51C-99999`,
      driverId: new mongoose.Types.ObjectId(),
      containerNo: `CONT999999`,
      scheduledDate: targetDate,
      timeSlot: '09:00-10:00', // Khác khung giờ
      purpose: 'Lấy container',
      status: 'Pending',
      isDeleted: false
    });

    // Thêm 1 record trạng thái Cancelled (để test lọc Cancelled)
    mockAppointments.push({
      truckPlate: `51C-88888`,
      driverId: new mongoose.Types.ObjectId(),
      containerNo: `CONT888888`,
      scheduledDate: targetDate,
      timeSlot: targetSlot,
      purpose: 'Lấy container',
      status: 'Cancelled', // Trạng thái hủy
      isDeleted: false
    });

    // Bulk insert dữ liệu thật vào in-memory DB
    await Appointment.insertMany(mockAppointments);

    // Act: Thực thi câu lệnh truy vấn thực tế y hệt trong Controller
    const currentSlotCount = await Appointment.countDocuments({
      scheduledDate: targetDate,
      timeSlot: targetSlot,
      status: { $ne: "Cancelled" },
      isDeleted: false,
    });

    // Assert: Kết quả đếm phải bằng đúng 20 (bỏ qua bản ghi Cancelled và bản ghi khác slot)
    expect(currentSlotCount).toBe(20);
  });
});
