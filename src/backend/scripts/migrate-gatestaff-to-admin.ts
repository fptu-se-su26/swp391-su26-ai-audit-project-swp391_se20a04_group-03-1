/**
 * Migration một lần: chuyển các tài khoản Quản lý cổng cũ từ collection
 * `gate_staffs` (model GateStaff đã bị bỏ) sang `account-admin` (AccountAdmin)
 * với role GATE_MANAGER.
 *
 * Chạy:  npx ts-node scripts/migrate-gatestaff-to-admin.ts   (từ thư mục backend)
 *
 * Yêu cầu: đã chạy seed-rbac.ts để có role GATE_MANAGER.
 * Idempotent: account nào đã tồn tại theo email thì chỉ cập nhật, không nhân bản.
 * Mật khẩu (đã hash) được giữ nguyên nên quản lý cổng đăng nhập như cũ.
 */
import "dotenv/config";
import mongoose from "mongoose";
import { AccountAdmin } from "../models/account-admin.model";
import { AdminRole } from "../models/adminRole.model";

async function run() {
  if (!process.env.DATABASE) {
    console.error("❌ Thiếu biến môi trường DATABASE trong .env");
    process.exit(1);
  }
  await mongoose.connect(process.env.DATABASE as string);
  console.log("[migrate-gatestaff] Đã kết nối DB");

  const gateManagerRole = await AdminRole.findOne({ roleCode: "GATE_MANAGER" });
  if (!gateManagerRole) {
    console.error(
      "❌ Thiếu role GATE_MANAGER. Hãy chạy `npx ts-node scripts/seed-rbac.ts` trước.",
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  // Đọc trực tiếp collection cũ (model đã bị xóa).
  const db = mongoose.connection.db;
  if (!db) {
    console.error("❌ Không truy cập được database.");
    process.exit(1);
  }
  const collections = await db.listCollections({ name: "gate_staffs" }).toArray();
  if (collections.length === 0) {
    console.log("[migrate-gatestaff] Không có collection gate_staffs — bỏ qua.");
    await mongoose.disconnect();
    process.exit(0);
  }

  const oldStaffs = await db.collection("gate_staffs").find({}).toArray();
  console.log(`[migrate-gatestaff] Tìm thấy ${oldStaffs.length} bản ghi cũ.`);

  let created = 0;
  let updated = 0;
  for (const s of oldStaffs) {
    const email = String(s.email || "").toLowerCase().trim();
    if (!email || !s.password) continue;

    const existing = await AccountAdmin.findOne({ email });
    if (existing) {
      existing.role = gateManagerRole._id as any;
      if (s.gateId) (existing as any).gateId = s.gateId;
      existing.isActive = s.status === "Active";
      existing.isDeleted = !!s.isDeleted;
      await existing.save();
      updated++;
      continue;
    }

    await AccountAdmin.create({
      fullName: s.fullName || "Quản lý cổng",
      email,
      password: s.password, // đã hash, giữ nguyên
      role: gateManagerRole._id,
      gateId: s.gateId || null,
      isActive: s.status === "Active",
      isDeleted: !!s.isDeleted,
    });
    created++;
  }

  console.log(
    `[migrate-gatestaff] Xong. Tạo mới ${created}, cập nhật ${updated}.`,
  );
  console.log(
    "   → Kiểm tra AccountAdmin OK rồi có thể tự xóa collection gate_staffs.",
  );

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("[migrate-gatestaff] Lỗi:", err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
