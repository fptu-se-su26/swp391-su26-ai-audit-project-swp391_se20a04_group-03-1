import "dotenv/config";
import mongoose from "mongoose";
import { GateTransaction } from "../models/gateTransaction.model";
import { Appointment } from "../models/appointment.model";

const TEST_MONGO_URI =
  process.env.DATABASE || "mongodb://localhost:27017/swp391_test_db";

describe("GateTransaction Repository / Database Tests", () => {
  // 1. Kết nối database test trước khi chạy các test case trong file này
  beforeAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(TEST_MONGO_URI);
  }, 30000);

  // 2. Dọn sạch cả 2 bảng dữ liệu liên quan trước mỗi bài test để đảm bảo môi trường độc lập
  beforeEach(async () => {
    if (mongoose.connection.readyState === 1) {
      await GateTransaction.deleteMany({});
      await Appointment.deleteMany({});
    }
  });

  // 3. Tăng timeout lên 15000ms đề phòng tác vụ populate/insert dữ liệu tốn thời gian hơn dự kiến
  it("Test filter và phân trang GateTransaction", async () => {
    // Arrange: Thêm Appointment giả để test populate
    const mockAppointment = await Appointment.create({
      truckPlate: `51C-12345`,
      driverId: new mongoose.Types.ObjectId(),
      containerNo: `CONT12345`,
      scheduledDate: new Date("2024-12-01T00:00:00Z"),
      timeSlot: "08:00-09:00",
      purpose: "Lấy container",
      status: "Pending",
      isDeleted: false,
    });

    // Insert nhiều GateTransactions
    const transactions = [
      {
        actualTruckPlate: "51C-12345",
        checkInTime: new Date("2024-12-01T08:15:00Z"),
        isDeleted: false,
        appointmentId: mockAppointment._id, // Có reference để populate
      },
      {
        actualTruckPlate: "51C-12346",
        checkInTime: new Date("2024-12-01T09:30:00Z"),
        isDeleted: false,
      },
      {
        actualTruckPlate: "29A-99999", // Biển số khác
        checkInTime: new Date("2024-12-01T10:00:00Z"),
        isDeleted: false,
      },
      {
        actualTruckPlate: "51C-12347",
        checkInTime: new Date("2024-12-02T08:00:00Z"), // Khác ngày
        isDeleted: false,
      },
      {
        actualTruckPlate: "51C-12348",
        checkInTime: new Date("2024-12-01T11:00:00Z"),
        isDeleted: true, // Bị xóa
      },
    ];

    await GateTransaction.insertMany(transactions);

    // Act: Xây dựng query giống hệt controller (tìm biển số chứa '51C', ngày 2024-12-01)
    const searchRegex = new RegExp("51C", "i"); // Search string
    const startDate = new Date("2024-12-01T00:00:00Z");
    const endDate = new Date("2024-12-01T23:59:59Z");

    let query: any = { isDeleted: false };

    // Apply time filter
    query.checkInTime = {
      $gte: startDate,
      $lte: endDate,
    };

    // Apply regex filter for plate
    query.actualTruckPlate = searchRegex;

    // Phân trang
    const pageNum = 1;
    const limitNum = 1; // Chỉ lấy 1 record mỗi page để test pagination
    const skip = (pageNum - 1) * limitNum;

    // Chạy câu lệnh find + populate + pagination
    const results = await GateTransaction.find(query)
      .populate("appointmentId")
      .sort({ checkInTime: 1 }) // sort tăng dần theo tgian
      .skip(skip)
      .limit(limitNum);

    const totalCount = await GateTransaction.countDocuments(query);

    // Assert
    // Tổng số records khớp đk là 2: (51C-12345, 51C-12346)
    expect(totalCount).toBe(2);

    // Nhưng do limit = 1 nên array trả về chỉ có 1 phần tử
    expect(results.length).toBe(1);

    // Phần tử đầu tiên (sort checkInTime: 1) phải là 51C-12345
    expect(results[0].actualTruckPlate).toBe("51C-12345");

    // Kiểm tra populate đã hoạt động (appointmentId không còn là ObjectId mà là object có truckPlate)
    expect(results[0].appointmentId).toBeDefined();
    expect((results[0].appointmentId as any).containerNo).toBe("CONT12345");
  }, 15000); // <-- Gán timeout 15s trực tiếp tại đây

  // 4. Đóng kết nối Mongoose sạch sẽ hoàn toàn sau khi tất cả test case chạy xong (Giải quyết dứt điểm Open Handles)
  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });
});
