import mongoose, { Schema } from "mongoose";
import { auditPlugin } from "./audit.plugin";

const containerSchema = new Schema(
  {
    number: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },

    type: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      required: true,
      enum: ["Hàng", "Rỗng"],
      default: "Rỗng",
    },

    portStatus: {
      type: String,
      enum: ["Chưa nhập cảng", "Đã nhập cảng", "Đang lưu bãi", "Đã xuất cảng"],
      default: "Chưa nhập cảng",
    },

    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ContainerProvider",
      required: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Nhật ký sửa đổi: tự đóng dấu ai tạo / ai sửa cho mọi thao tác ghi.
containerSchema.plugin(auditPlugin);

export const Container = mongoose.model(
  "Container",
  containerSchema,
  "containers"
);
