import mongoose, { Schema } from "mongoose";

export interface IDriver {
  driverId: string;
  companyId: mongoose.Types.ObjectId;
  driverName: string;
  driverPhone: string;
  // Thông tin đăng nhập cho app mobile (do company/admin cấp).
  // Optional: tài xế cũ chưa được cấp tài khoản vẫn hợp lệ.
  email?: string;
  password?: string;
  status: "Active" | "Inactive";
  isDeleted: boolean;
}

const driverSchema = new Schema<IDriver>(
  {
    driverId: { type: String, required: true, unique: true },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    driverName: { type: String, required: true },
    driverPhone: { type: String },
    // sparse: nhiều tài xế chưa có email vẫn không đụng ràng buộc unique.
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Inactive",
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Driver = mongoose.model<IDriver>(
  "Driver",
  driverSchema,
  "drivers",
);
