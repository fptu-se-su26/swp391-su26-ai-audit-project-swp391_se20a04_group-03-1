import mongoose, { Schema } from "mongoose";

export interface IGateTransaction {
  appointmentId?: mongoose.Types.ObjectId;
  checkInTime?: Date;
  checkOutTime?: Date;
  actualContainerNo?: string;
  gateId?: mongoose.Types.ObjectId;
  imageUrl?: string;
  isDeleted: boolean;
  ocrConfidence?: number;
  status?: string;
  actualTruckPlate?: string;
  yardId?: mongoose.Types.ObjectId;
  // Ô đỗ được hệ thống cấp phát khi xe check-in thành công (vd: "A-01").
  // Slot được coi là đang bận nếu còn transaction status "in" giữ nó.
  assignedSlot?: string;
  providerId?: mongoose.Types.ObjectId;
}

const gateTransactionSchema = new Schema<IGateTransaction>(
  {
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment" },
    checkInTime: { type: Date },
    checkOutTime: { type: Date },
    actualContainerNo: { type: String },
    gateId: { type: Schema.Types.ObjectId, ref: "Gate" },
    imageUrl: { type: String },
    isDeleted: { type: Boolean, default: false },
    ocrConfidence: { type: Number },
    status: { type: String },
    actualTruckPlate: { type: String },
    yardId: { type: Schema.Types.ObjectId, ref: "Yard" },
    assignedSlot: { type: String },
    providerId: { type: Schema.Types.ObjectId, ref: "ContainerProvider" },
  },
  { timestamps: true },
);

export const GateTransaction = mongoose.model<IGateTransaction>(
  "GateTransaction",
  gateTransactionSchema,
  "gateTransactions",
);
