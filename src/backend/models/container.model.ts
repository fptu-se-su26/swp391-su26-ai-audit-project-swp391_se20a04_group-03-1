import mongoose, { Schema } from "mongoose";

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

export const Container = mongoose.model(
  "Container",
  containerSchema,
  "containers"
);
