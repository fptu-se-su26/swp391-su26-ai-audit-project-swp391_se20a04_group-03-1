import mongoose, { Schema } from "mongoose";

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

export const Company = mongoose.model("Company", companySchema, "companies");
