import mongoose, { Schema } from "mongoose";
import { auditPlugin } from "./audit.plugin";

const companyRoleSchema = new Schema(
  {
    roleCode: {
      type: String,
      required: true,
      unique: true,
    },
    roleName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
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
  }
);

// Nhật ký sửa đổi: tự đóng dấu ai tạo / ai sửa cho mọi thao tác ghi.
companyRoleSchema.plugin(auditPlugin);

export const CompanyRole = mongoose.model("CompanyRole", companyRoleSchema, "company_roles");
