import mongoose, { Schema } from "mongoose";

export interface IGateTransaction {
  truckPlate: string;
  driverId?: string;
  containerNo?: string;
  appointmentId?: string;
  gateType: "in" | "out";
  checkInTime?: Date;
  checkOutTime?: Date;
  status: "in" | "out";
  ocrConfidence?: number;
  imageUrl?: string;
  isDeleted: boolean;
}

const gateTransactionSchema = new Schema<IGateTransaction>(
  {
    truckPlate: { type: String, required: true },
    driverId: { type: String }, // Bổ sung sau
    containerNo: { type: String },
    appointmentId: { type: String },
    gateType: { type: String, enum: ["in", "out"], required: true },
    checkInTime: { type: Date },
    checkOutTime: { type: Date },
    status: { type: String, enum: ["in", "out"], required: true },
    ocrConfidence: { type: Number },
    imageUrl: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const GateTransaction = mongoose.model<IGateTransaction>(
  "GateTransaction",
  gateTransactionSchema,
  "gateTransactions",
);
