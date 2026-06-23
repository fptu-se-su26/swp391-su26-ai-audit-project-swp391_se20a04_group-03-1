import "dotenv/config";
import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import appointmentRouter from "../routers/appointments.route";
import { requireAuth } from "../middlewares/auth.middleware";
import { Appointment } from "../models/appointment.model";

const TEST_MONGO_URI =
  process.env.DATABASE || "mongodb://localhost:27017/swp391_test_db";

// Khởi tạo Express app giả lập
const app = express();
app.use(express.json());
// Mô phỏng router
app.use("/api/appointments", requireAuth, appointmentRouter);

describe("Integration Test: Appointment Controller", () => {
  // Mở kết nối DB đã được xử lý bởi jest.setup.ts

  // 2. Dọn sạch bảng dữ liệu trước mỗi test case để tránh xung đột dữ liệu rác
  beforeEach(async () => {
    if (mongoose.connection.readyState === 1) {
      await Appointment.deleteMany({});
    }
  });

  // Đóng kết nối DB đã được xử lý bởi jest.setup.ts

  describe("GET /api/appointments", () => {
    it("Tra ve danh sach rong khi DB khong co du lieu", async () => {
      const response = await request(app)
        .get("/api/appointments")
        .set("x-internal-secret", "AI_SERVER_SECRET_KEY"); // Bypass Auth

      expect(response.status).toBe(200);
      expect(response.body.code).toBe("success");
      expect(response.body.data.length).toBe(0);
    }, 15000); // <-- Tăng timeout lên 15s để tránh lag mạng/DB lúc khởi động

    it("Tra ve danh sach hop le", async () => {
      await Appointment.create({
        truckPlate: "51C-INTEGRATION",
        driverId: new mongoose.Types.ObjectId(),
        containerNo: "CONT123",
        scheduledDate: new Date(),
        timeSlot: "08:00-09:00",
        purpose: "Lấy container",
        status: "Pending",
        isDeleted: false,
      });

      const response = await request(app)
        .get("/api/appointments?limit=10&page=1")
        .set("x-internal-secret", "AI_SERVER_SECRET_KEY");

      expect(response.status).toBe(200);
      expect(response.body.code).toBe("success");
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].truckPlate).toBe("51C-INTEGRATION");
    }, 15000);
  });

  describe("GET /api/appointments/detail/:id", () => {
    it("Tra ve error neu id khong ton tai", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/appointments/detail/${fakeId}`)
        .set("x-internal-secret", "AI_SERVER_SECRET_KEY");

      expect(response.status).toBe(200);
      expect(response.body.code).toBe("error");
    }, 15000);
  });
});
