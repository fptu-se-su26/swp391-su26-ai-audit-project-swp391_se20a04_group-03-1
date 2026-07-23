import mongoose, { Schema } from "mongoose";

/**
 * Thông báo vận hành hiển thị ở chuông trên header.
 *
 * Có HAI kiểu người nhận, phân biệt bằng `audience`:
 *   - "admin"   : broadcast — mọi admin đều thấy, `recipientId` bỏ trống.
 *   - "company" : riêng tư — chỉ doanh nghiệp có id = `recipientId` thấy.
 *
 * Trạng thái "đã đọc" là RIÊNG từng người nên lưu trong `readBy` (mảng id
 * người xem) thay vì một cờ boolean dùng chung.
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

export const NOTIFICATION_AUDIENCES = ["admin", "company"] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];
export type NotificationSeverity = (typeof NOTIFICATION_SEVERITIES)[number];
export type NotificationAudience = (typeof NOTIFICATION_AUDIENCES)[number];

export interface INotification {
  type: NotificationType;
  severity: NotificationSeverity;
  /** Ai được xem. Mặc định "admin" để mọi thông báo cũ giữ nguyên hành vi. */
  audience: NotificationAudience;
  /** Chỉ dùng khi audience = "company": id doanh nghiệp được nhận. */
  recipientId?: mongoose.Types.ObjectId | null;
  title: string;
  message: string;
  /** Đường dẫn bấm vào xem chi tiết (vd "/admin/gate/logs/<id>"). */
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
    audience: {
      type: String,
      enum: NOTIFICATION_AUDIENCES,
      required: true,
      default: "admin",
    },
    recipientId: { type: Schema.Types.ObjectId, default: null },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: null },
    readBy: [{ type: Schema.Types.ObjectId, ref: "AccountAdmin" }],
  },
  { timestamps: true },
);

// Danh sách luôn sắp theo thời gian giảm dần → index sẵn.
notificationSchema.index({ createdAt: -1 });
// Truy vấn chuông luôn lọc theo người nhận rồi mới sắp thời gian.
notificationSchema.index({ audience: 1, recipientId: 1, createdAt: -1 });
// Tự xóa sau 30 ngày.
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

export const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema,
  "notifications",
);
