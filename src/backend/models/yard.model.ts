import mongoose, { Schema } from "mongoose";

export interface IYardSlot {
  slotName: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  points?: { x: number; y: number }[];
}

export interface IYard {
  name: string;
  cameraIp: string;
  snapshotUrl: string;
  slots: IYardSlot[];
  isDeleted: boolean;
}

const yardSchema = new Schema<IYard>(
  {
    name: { type: String, required: true },
    cameraIp: { type: String, required: true },
    snapshotUrl: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=1920&auto=format&fit=crop",
    },
    slots: [
      {
        slotName: { type: String, required: true },
        x: { type: Number, required: false },
        y: { type: Number, required: false },
        width: { type: Number, required: false },
        height: { type: Number, required: false },
        points: [
          {
            x: { type: Number, required: true },
            y: { type: Number, required: true },
          },
        ],
      },
    ],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Yard = mongoose.model<IYard>("Yard", yardSchema, "yards");
