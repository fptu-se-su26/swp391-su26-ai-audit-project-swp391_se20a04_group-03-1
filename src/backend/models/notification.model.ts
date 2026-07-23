import mongoose, { Schema } from "mongoose";

/**
 * Thông báo vận hành hiển thị ở chuông trên header admin.
 *
 * Mô hình BROADCAST: mỗi thông báo là một sự kiện của hệ thống, mọi admin đều
 * thấy. Trạng thái "đã đọc" là RIÊNG từng người nên lưu trong `readBy`
 * (mảng id admin) thay vì một cờ boolean dùng chung.
 *
 * Thông báo là dữ liệu nhật ký, không phải dữ liệu nghiệp vụ — nên tự hết hạn
 * sau 30 ngày bằng TTL index để collection không phình vô hạn.
 */

export const NOTIFICATION_TYPES = [
  "gate",
  "yard",
  "appointment",
  "container",
  "system",
] as const;

export const NOTIFICATION_SEVERITIES = [
  "info",
  "success",
  "warning",
  "error",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];
export type NotificationSeverity = (typeof NOTIFICATION_SEVERITIES)[number];

export interface INotification {
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  /** Đường dẫn admin để bấm vào xem chi tiết (vd "/admin/gate/logs/<id>"). */
  link?: string | null;
  readBy: mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    severity: {
      type: String,
      enum: NOTIFICATION_SEVERITIES,
      required: true,
      default: "info",
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: null },
    readBy: [{ type: Schema.Types.ObjectId, ref: "AccountAdmin" }],
  },
  { timestamps: true },
);

// Danh sách luôn sắp theo thời gian giảm dần → index sẵn.
notificationSchema.index({ createdAt: -1 });
// Tự xóa sau 30 ngày.
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

export const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema,
  "notifications",
);
