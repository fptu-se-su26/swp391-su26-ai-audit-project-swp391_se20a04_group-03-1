import mongoose, { Schema } from "mongoose";
import { auditPlugin } from "./audit.plugin";

const accountAdminSchema = new Schema(
  {

    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    // Tham chiếu tới AdminRole (RBAC). Trước đây là string tự do "operator".
    role: {
      type: Schema.Types.ObjectId,
      ref: "AdminRole",
      required: true,
    },
    // Cổng được phân công — chỉ dùng cho tài khoản Quản lý cổng (role GATE_MANAGER)
    // đăng nhập app mobile. Các tài khoản admin khác để trống.
    gateId: {
      type: Schema.Types.ObjectId,
      ref: "Gate",
      default: null,
    },
    password: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Nhật ký sửa đổi: tự đóng dấu ai tạo / ai sửa cho mọi thao tác ghi.
accountAdminSchema.plugin(auditPlugin);

export const AccountAdmin = mongoose.model(
  "AccountAdmin",
  accountAdminSchema,
  "account-admin",
);
