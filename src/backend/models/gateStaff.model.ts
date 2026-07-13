import mongoose, { Schema } from "mongoose";

// Tài khoản Nhân viên/Quản lý cổng dùng cho app mobile.
// Khi AI quét cổng không xử lý được, nhân viên mở app quét QR thủ công.
export interface IGateStaff {
  fullName: string;
  email: string;
  password: string;
  gateId?: mongoose.Types.ObjectId;
  status: "Active" | "Inactive";
  isDeleted: boolean;
}

const gateStaffSchema = new Schema<IGateStaff>(
  {
    fullName: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    // Cổng mà nhân viên được phân công (optional).
    gateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gate",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Inactive",
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const GateStaff = mongoose.model<IGateStaff>(
  "GateStaff",
  gateStaffSchema,
  "gate_staffs",
);
