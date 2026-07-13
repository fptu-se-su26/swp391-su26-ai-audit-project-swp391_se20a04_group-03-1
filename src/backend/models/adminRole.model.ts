import mongoose, { Schema } from "mongoose";

/** Một quyền = resource + tập action. Không cần _id riêng. */
const permissionSchema = new Schema(
  {
    resource: { type: String, required: true }, // khớp RESOURCES[].key trong rbac.config
    actions: { type: [String], default: [] }, // tập con của ACTIONS
  },
  { _id: false },
);

const adminRoleSchema = new Schema(
  {
    roleCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    roleName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    permissions: {
      type: [permissionSchema],
      default: [],
    },
    // Role hệ thống (SUPER_ADMIN): không cho sửa/xóa, ngầm full quyền.
    isSystem: {
      type: Boolean,
      default: false,
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
  },
);

export const AdminRole = mongoose.model(
  "AdminRole",
  adminRoleSchema,
  "admin_roles",
);
