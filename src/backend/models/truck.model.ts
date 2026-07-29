import mongoose from "mongoose";
import { auditPlugin } from "./audit.plugin";

const truckSchema = new mongoose.Schema(
  {
    truckPlate: {
      type: String,
      required: true,
      unique: true,
    },
    truckType: {
      type: String,
      default: "Xe đầu kéo",
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Nhật ký sửa đổi: tự đóng dấu ai tạo / ai sửa cho mọi thao tác ghi.
truckSchema.plugin(auditPlugin);

export const Truck = mongoose.model("Truck", truckSchema);
