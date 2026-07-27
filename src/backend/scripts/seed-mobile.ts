/**
 * Seed dữ liệu demo cho app mobile (tài xế + quản lý cổng).
 * Chạy:  npx ts-node scripts/seed-mobile.ts   (từ thư mục backend)
 *
 * Tạo (idempotent):
 *   - 1 Company demo (nếu chưa có công ty nào).
 *   - 1 Driver có tài khoản đăng nhập: driver.demo@logiport.vn / 123456 (Active).
 *   - 1 Quản lý cổng (AccountAdmin role GATE_MANAGER): gate.demo@logiport.vn / 123456 (Active).
 *   - 1 Appointment (Pending) gắn với driver demo để test QR.
 */
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Company } from "../models/company.model";
import { Driver } from "../models/driver.model";
import { AccountAdmin } from "../models/account-admin.model";
import { AdminRole } from "../models/adminRole.model";
import { Appointment } from "../models/appointment.model";

const DRIVER_EMAIL = "driver.demo@logiport.vn";
const GATE_EMAIL = "gate.demo@logiport.vn";
const PASSWORD = "123456";

// Khung giờ (enum của Appointment) chứa giờ hiện tại theo giờ VN. Ngoài
// 05:00–23:59 thì lùi về "09:00-10:00" cho an toàn.
function currentTimeSlot(): string {
  const hourStr = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    hour12: false,
  });
  const h = parseInt(hourStr, 10);
  if (Number.isNaN(h) || h < 5 || h > 23) return "09:00-10:00";
  const pad = (n: number) => String(n).padStart(2, "0");
  const end = h === 23 ? "00" : pad(h + 1);
  return `${pad(h)}:00-${end}:00`;
}

async function run() {
  if (!process.env.DATABASE) {
    console.error("❌ Thiếu biến môi trường DATABASE trong .env");
    process.exit(1);
  }
  await mongoose.connect(process.env.DATABASE as string);
  console.log("[seed-mobile] Đã kết nối DB");

  const hashed = await bcrypt.hash(PASSWORD, await bcrypt.genSalt(10));

  // 1. Company demo
  let company = await Company.findOne({ isDeleted: false });
  if (!company) {
    company = await Company.create({
      companyCode: "DEMO-CO",
      companyName: "Công ty Demo LogiPort",
      contactPerson: "Demo Admin",
      contactPhone: "0901234567",
      email: "company.demo@logiport.vn",
      password: hashed,
      status: "Active",
    });
    console.log("[seed-mobile] Tạo Company demo:", company.companyCode);
  }

  // 2. Driver có tài khoản
  let driver = await Driver.findOne({ email: DRIVER_EMAIL });
  if (!driver) {
    driver = await Driver.create({
      driverId: "DRV-DEMO-001",
      companyId: company._id,
      driverName: "Nguyễn Văn Tài",
      driverPhone: "0912345678",
      email: DRIVER_EMAIL,
      password: hashed,
      status: "Active",
    });
    console.log("[seed-mobile] Tạo Driver:", DRIVER_EMAIL);
  } else {
    driver.password = hashed;
    driver.status = "Active";
    await driver.save();
    console.log("[seed-mobile] Cập nhật Driver demo (reset mật khẩu)");
  }

  // 3. Quản lý cổng = AccountAdmin có role GATE_MANAGER (cần chạy seed-rbac trước).
  const gateManagerRole = await AdminRole.findOne({ roleCode: "GATE_MANAGER" });
  if (!gateManagerRole) {
    console.error(
      "❌ Thiếu role GATE_MANAGER. Hãy chạy `npx ts-node scripts/seed-rbac.ts` trước.",
    );
    process.exit(1);
  }
  let staff = await AccountAdmin.findOne({ email: GATE_EMAIL });
  if (!staff) {
    staff = await AccountAdmin.create({
      fullName: "Trần Quản Cổng",
      email: GATE_EMAIL,
      password: hashed,
      role: gateManagerRole._id,
      isActive: true,
    });
    console.log("[seed-mobile] Tạo Quản lý cổng (AccountAdmin):", GATE_EMAIL);
  } else {
    staff.password = hashed;
    staff.role = gateManagerRole._id;
    staff.isActive = true;
    staff.isDeleted = false;
    await staff.save();
    console.log("[seed-mobile] Cập nhật Quản lý cổng demo (reset mật khẩu)");
  }

  // 4. Appointment cho driver demo — ĐÃ DUYỆT + khung giờ hiện tại để quét QR
  //    ở app quản lý cổng chạy được ngay (QR fallback yêu cầu Confirmed + đúng
  //    khung giờ, đệm ±30 phút, giống camera).
  const timeSlot = currentTimeSlot() as any;
  const existAppt = await Appointment.findOne({
    driverId: driver._id,
    isDeleted: false,
  });
  if (!existAppt) {
    await Appointment.create({
      truckPlate: "51F-123.45",
      driverId: driver._id,
      containerNo: "MSKU1234567",
      scheduledDate: new Date(),
      timeSlot,
      purpose: "Lấy container",
      status: "Confirmed",
    });
    console.log(`[seed-mobile] Tạo Appointment demo (Confirmed, ${timeSlot})`);
  } else if (existAppt.status !== "Completed") {
    // Đưa lịch hẹn demo về trạng thái quét được ngay (nếu chưa hoàn tất).
    existAppt.status = "Confirmed";
    existAppt.scheduledDate = new Date();
    existAppt.timeSlot = timeSlot;
    await existAppt.save();
    console.log(
      `[seed-mobile] Cập nhật Appointment demo (Confirmed, ${timeSlot})`,
    );
  }

  console.log("\n✅ Xong. Tài khoản demo:");
  console.log(`   Tài xế:       ${DRIVER_EMAIL} / ${PASSWORD}`);
  console.log(`   Quản lý cổng: ${GATE_EMAIL} / ${PASSWORD}`);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("[seed-mobile] Lỗi:", err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
