import mongoose from "mongoose";

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

export const Truck = mongoose.model("Truck", truckSchema);
