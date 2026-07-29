import mongoose, { Schema } from "mongoose";
import { auditPlugin } from "./audit.plugin";

const containerProviderSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
    },

    bic_codes: {
      type: [String],
      default: [],
    },

    contact_email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
      default: "INACTIVE",
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
containerProviderSchema.plugin(auditPlugin);

export const ContainerProvider = mongoose.model(
  "ContainerProvider",
  containerProviderSchema,
  "container-providers"
);
