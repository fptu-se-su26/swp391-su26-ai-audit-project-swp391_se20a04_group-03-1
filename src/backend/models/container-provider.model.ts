import mongoose, { Schema } from "mongoose";

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

export const ContainerProvider = mongoose.model(
  "ContainerProvider",
  containerProviderSchema,
  "container-providers"
);
