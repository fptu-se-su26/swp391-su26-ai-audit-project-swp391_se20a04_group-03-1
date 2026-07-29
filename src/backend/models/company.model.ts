import mongoose, { Schema } from "mongoose";
import { auditPlugin } from "./audit.plugin";

const companySchema = new Schema(
  {
    companyCode: {
      type: String,
      required: true,
      unique: true,
    },

    companyName: {
      type: String,
      required: true,
    },

    contactPerson: {
      type: String,
      required: true,
    },

    contactPhone: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    companyRole: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyRole",
    },

    status: {
      type: String,
      enum: ["Active", "Inactive", "Suspended"],
      default: "Active",
      update: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Nhật ký sửa đổi: tự đóng dấu ai tạo / ai sửa cho mọi thao tác ghi.
companySchema.plugin(auditPlugin);

export const Company = mongoose.model("Company", companySchema, "companies");
