import mongoose, { Schema } from "mongoose";

export interface IDriver {
  driverId: string;
  companyId: string;
  driverName: string;
  driverPhone: string;
  isDeleted: boolean;
}

const driverSchema = new Schema<IDriver>(
  {
    driverId: { type: String, required: true, unique: true },
    companyId: { type: String, ref: "Company", required: true },
    driverName: { type: String, required: true },
    driverPhone: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Driver = mongoose.model<IDriver>("Driver", driverSchema, "drivers");
