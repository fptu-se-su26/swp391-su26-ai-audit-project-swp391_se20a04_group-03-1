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
    // Tham chiếu tới AdminRole (RBAC). Trước đây là string tự do "operator".
    role: {
      type: Schema.Types.ObjectId,
      ref: "AdminRole",
      required: true,
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
