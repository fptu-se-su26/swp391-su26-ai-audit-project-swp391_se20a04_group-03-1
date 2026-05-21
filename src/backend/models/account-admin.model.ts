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
