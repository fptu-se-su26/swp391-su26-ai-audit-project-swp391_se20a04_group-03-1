/**
 * Seed & migration RBAC.
 * Chạy: npx ts-node scripts/seed-rbac.ts   (từ thư mục backend)
 *
 * Việc script làm:
 *  1. Tạo role hệ thống SUPER_ADMIN (isSystem, ngầm full quyền) nếu chưa có.
 *  2. Tạo role OPERATOR mẫu (chỉ xem cơ bản) nếu chưa có.
 *  3. Di chuyển các AccountAdmin đang lưu role dạng string ("operator",
 *     "SuperAdmin"...) sang ObjectId tương ứng. Account nào không rõ -> OPERATOR.
 *
 * Idempotent: chạy nhiều lần vẫn an toàn.
 */
import "dotenv/config";
import mongoose from "mongoose";
import { AdminRole } from "../models/adminRole.model";
import { AccountAdmin } from "../models/account-admin.model";
import { RESOURCES, SUPER_ADMIN_CODE } from "../config/rbac.config";

async function run() {
  await mongoose.connect(process.env.DATABASE as string);
  console.log("[seed-rbac] Connected DB");

  // 1. SUPER_ADMIN — permissions để trống vì isSystem sẽ bỏ qua mọi check,
  //    nhưng vẫn lưu full catalog cho minh bạch khi hiển thị.
  const fullPermissions = RESOURCES.map((r) => ({
    resource: r.key,
    actions: [...r.actions],
  }));

  let superRole = await AdminRole.findOne({ roleCode: SUPER_ADMIN_CODE });
  if (!superRole) {
    superRole = await AdminRole.create({
      roleCode: SUPER_ADMIN_CODE,
      roleName: "Quản trị cấp cao",
      description: "Vai trò hệ thống — toàn quyền, không thể chỉnh sửa hoặc xóa.",
      permissions: fullPermissions,
      isSystem: true,
      status: "Active",
    });
    console.log("[seed-rbac] Created SUPER_ADMIN");
  } else {
    // Luôn đồng bộ lại full quyền cho super admin phòng khi catalog thay đổi.
    superRole.permissions = fullPermissions as any;
    superRole.isSystem = true;
    await superRole.save();
    console.log("[seed-rbac] Synced SUPER_ADMIN permissions");
  }

  // 2. OPERATOR — chỉ xem dashboard, lịch hẹn, container.
  let operatorRole = await AdminRole.findOne({ roleCode: "OPERATOR" });
  if (!operatorRole) {
    operatorRole = await AdminRole.create({
      roleCode: "OPERATOR",
      roleName: "Nhân viên vận hành",
      description: "Chỉ xem các trang vận hành cơ bản.",
      permissions: [
        { resource: "dashboard", actions: ["view"] },
        { resource: "appointments", actions: ["view"] },
        { resource: "containers", actions: ["view"] },
      ],
      status: "Active",
    });
    console.log("[seed-rbac] Created OPERATOR");
  }

  // 3. Migrate account cũ (role đang là string, chưa phải ObjectId).
  const accounts = await AccountAdmin.find({}).lean();
  let migrated = 0;
  for (const acc of accounts) {
    const rawRole = acc.role as unknown;
    // Nếu đã là ObjectId hợp lệ và trỏ tới role tồn tại thì bỏ qua.
    const isObjectId =
      rawRole instanceof mongoose.Types.ObjectId ||
      (typeof rawRole === "string" && mongoose.isValidObjectId(rawRole) &&
        (await AdminRole.exists({ _id: rawRole })));
    if (isObjectId) continue;

    // Ánh xạ string cũ -> role.
    const asStr = String(rawRole || "").toLowerCase();
    const target =
      asStr.includes("super") || asStr.includes("admin")
        ? superRole
        : operatorRole;

    await AccountAdmin.updateOne({ _id: acc._id }, { role: target._id });
    migrated++;
  }
  console.log(`[seed-rbac] Migrated ${migrated} account(s)`);

  await mongoose.disconnect();
  console.log("[seed-rbac] Done");
  process.exit(0);
}

run().catch((err) => {
  console.error("[seed-rbac] Failed:", err);
  process.exit(1);
});
