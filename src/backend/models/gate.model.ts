import mongoose, { Schema } from "mongoose";
import { auditPlugin } from "./audit.plugin";

export interface IGate {
  name: string;
  cameraIp: string;
  type: string;
  isDeleted: boolean;
}

const gateSchema = new Schema<IGate>(
  {
    name: { type: String, required: true },
    cameraIp: { type: String, required: true },
    type: { type: String, enum: ["in", "out"], required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Nhật ký sửa đổi: tự đóng dấu ai tạo / ai sửa cho mọi thao tác ghi.
gateSchema.plugin(auditPlugin);

export const Gate = mongoose.model<IGate>("Gate", gateSchema, "gates");
