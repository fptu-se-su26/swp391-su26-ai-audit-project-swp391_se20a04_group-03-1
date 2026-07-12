require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const SUPER_ADMIN_CODE = "SUPER_ADMIN";

async function run() {
  if (!process.env.DATABASE) {
    console.error("❌ Missing DATABASE in environment");
    process.exit(1);
  }
  await mongoose.connect(process.env.DATABASE);
  console.log("[seed-all] Connected to DB");

  const db = mongoose.connection.db;

  // 1. Seed Roles
  let superRole = await db.collection("admin-roles").findOne({ roleCode: SUPER_ADMIN_CODE });
  if (!superRole) {
    const res = await db.collection("admin-roles").insertOne({
      roleCode: SUPER_ADMIN_CODE,
      roleName: "Quản trị cấp cao",
      description: "Vai trò hệ thống — toàn quyền, không thể chỉnh sửa hoặc xóa.",
      permissions: [],
      isSystem: true,
      status: "Active",
      createdAt: new Date(),
      updatedAt: new Date()
    });
    superRole = { _id: res.insertedId, roleCode: SUPER_ADMIN_CODE };
    console.log("[seed-all] Created SUPER_ADMIN role");
  } else {
    console.log("[seed-all] SUPER_ADMIN role already exists");
  }

  let operatorRole = await db.collection("admin-roles").findOne({ roleCode: "OPERATOR" });
  if (!operatorRole) {
    await db.collection("admin-roles").insertOne({
      roleCode: "OPERATOR",
      roleName: "Nhân viên vận hành",
      description: "Chỉ xem các trang vận hành cơ bản.",
      permissions: [
        { resource: "dashboard", actions: ["view"] },
        { resource: "appointments", actions: ["view"] },
        { resource: "containers", actions: ["view"] },
      ],
      status: "Active",
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log("[seed-all] Created OPERATOR role");
  } else {
    console.log("[seed-all] OPERATOR role already exists");
  }

  // Helper function to seed an admin user
  async function seedAdmin(email, plainPassword, fullName, isActive = true, isDeleted = false) {
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    let adminUser = await db.collection("account-admin").findOne({ email });
    if (!adminUser) {
      await db.collection("account-admin").insertOne({
        fullName,
        email,
        role: superRole._id,
        password: hashedPassword,
        isActive,
        isDeleted,
        deletedAt: isDeleted ? new Date() : null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`[seed-all] Created admin user: ${email} / ${plainPassword} (Active=${isActive}, Deleted=${isDeleted})`);
    } else {
      await db.collection("account-admin").updateOne(
        { _id: adminUser._id },
        {
          $set: {
            password: hashedPassword,
            role: superRole._id,
            isActive,
            isDeleted,
            deletedAt: isDeleted ? new Date() : null,
            updatedAt: new Date()
          }
        }
      );
      console.log(`[seed-all] Updated admin user: ${email} / ${plainPassword} (Active=${isActive}, Deleted=${isDeleted})`);
    }
  }

  // Seed all admin accounts needed for E2E tests
  await seedAdmin("admin@logiport.vn", "correct-password", "Admin Demo VN", true, false);
  await seedAdmin("admin@logiport.com", "password123", "Admin Demo COM", true, false);
  await seedAdmin("inactive@logiport.com", "password123", "Inactive Admin", false, false);
  await seedAdmin("deleted@logiport.com", "password123", "Deleted Admin", true, true);

  await mongoose.disconnect();
  console.log("[seed-all] Done seeding");
  process.exit(0);
}

run().catch(console.error);
