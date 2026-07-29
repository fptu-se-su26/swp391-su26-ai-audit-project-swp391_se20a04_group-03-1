import mongoose, { Schema } from "mongoose";
import { auditPlugin } from "./audit.plugin";

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
  // Trạng thái chiếm ô do camera bãi (CV) phát hiện gần nhất, được LƯU LẠI để
  // khi tải lại trang không mất dữ liệu. CV chỉ gửi khi tập ô đổi (event-driven)
  // nên đây luôn là ảnh chụp mới nhất, không phải giá trị theo lịch.
  liveOccupiedSlots: string[];
  liveOccupancyAt: Date | null;
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
    liveOccupiedSlots: { type: [String], default: [] },
    liveOccupancyAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Nhật ký sửa đổi: tự đóng dấu ai tạo / ai sửa cho mọi thao tác ghi.
yardSchema.plugin(auditPlugin);

export const Yard = mongoose.model<IYard>("Yard", yardSchema, "yards");
