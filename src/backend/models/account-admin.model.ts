import mongoose, { Schema } from "mongoose";

const accountAdminSchema = new Schema(
  {

    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      required: true,
      default: "operator",
    },
    password: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: false,
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

export const AccountAdmin = mongoose.model(
  "AccountAdmin",
  accountAdminSchema,
  "account-admin",
);
