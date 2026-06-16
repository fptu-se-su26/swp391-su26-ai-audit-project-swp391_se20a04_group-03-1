import mongoose, { Schema } from "mongoose";

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

export const CompanyRole = mongoose.model("CompanyRole", companyRoleSchema, "company_roles");
