import mongoose from "mongoose";
import {
  Notification,
  NotificationAudience,
  NotificationSeverity,
  NotificationType,
} from "../models/notification.model";

/**
 * Nơi DUY NHẤT tạo thông báo. Gọi từ controller khi có sự kiện vận hành đáng chú ý.
 *
 * Hai điểm cần lưu ý:
 * 1. Không bao giờ ném lỗi ra ngoài — thông báo là việc phụ, hỏng thì ghi log chứ
 *    không được làm gãy luồng nghiệp vụ (xe đã qua cổng rồi).
 * 2. Chống spam: camera bắn sự kiện mỗi frame, cùng một câu lặp lại liên tục sẽ
 *    làm ngập chuông. Ta chặn trùng theo (type + title + message) trong 60 giây.
 */

const DEDUPE_MS = 60 * 1000;
const lastSent = new Map<string, number>();

/** Dọn khóa dedupe quá hạn để Map không phình theo thời gian chạy. */
const sweepDedupe = (now: number) => {
  if (lastSent.size < 500) return;
  for (const [key, at] of lastSent) {
    if (now - at > DEDUPE_MS) lastSent.delete(key);
  }
};

export interface NotifyInput {
  type: NotificationType;
  severity?: NotificationSeverity;
  title: string;
  message: string;
  link?: string | null;
  /** Mặc định "admin" (broadcast). Khác "admin" thì bắt buộc kèm recipientId. */
  audience?: NotificationAudience;
  /** Id doanh nghiệp / hãng tàu nhận thông báo. Bỏ qua khi audience = "admin". */
  recipientId?: mongoose.Types.ObjectId | string | null;
  /** Khóa chống trùng tùy chỉnh. Mặc định suy ra từ type + title + message. */
  dedupeKey?: string;
}

export const notify = async (input: NotifyInput) => {
  try {
    const now = Date.now();
    const audience = input.audience || "admin";
    const recipientId =
      audience !== "admin" && input.recipientId
        ? new mongoose.Types.ObjectId(String(input.recipientId))
        : null;

    // Thông báo riêng tư phải có người nhận, nếu không sẽ lọt vào khoảng không:
    // không ai truy vấn được nó mà vẫn chiếm chỗ trong collection.
    if (audience !== "admin" && !recipientId) {
      console.error(
        `[Notification] Thiếu recipientId cho thông báo audience="${audience}".`,
      );
      return null;
    }

    // Khóa dedupe phải tách theo người nhận, nếu không hai doanh nghiệp cùng
    // sự kiện sẽ đè nhau và một bên mất thông báo.
    const key =
      input.dedupeKey ||
      `${audience}:${recipientId || "*"}|${input.type}|${input.title}|${input.message}`;

    const previous = lastSent.get(key);
    if (previous && now - previous < DEDUPE_MS) return null;
    lastSent.set(key, now);
    sweepDedupe(now);

    const doc = await Notification.create({
      type: input.type,
      severity: input.severity || "info",
      audience,
      recipientId,
      title: input.title,
      message: input.message,
      link: input.link || null,
      readBy: [],
    });

    // Đẩy realtime cho chuông trên header ADMIN. Lấy `io` trễ để tránh vòng lặp
    // import (index -> routers -> controllers -> service -> index).
    //
    // Quan trọng: chỉ đọc từ require.cache, KHÔNG require thẳng. Khi chạy server
    // thật thì index.ts luôn đã nạp nên vẫn lấy được io; còn trong test/script thì
    // index chưa nạp, require thẳng sẽ vô tình bật cả HTTP server + kết nối DB thật.
    //
    // CHỈ phát cho audience "admin": io.emit là broadcast tới MỌI socket đang mở,
    // đẩy thông báo riêng của một doanh nghiệp qua đó là lộ sang doanh nghiệp
    // khác. Chuông bên client dùng cách hỏi lại theo chu kỳ nên vẫn cập nhật.
    if (audience === "admin") {
      try {
        const io = require.cache[require.resolve("../index")]?.exports?.io;
        io?.emit("notification", {
          _id: doc._id,
          type: doc.type,
          severity: doc.severity,
          title: doc.title,
          message: doc.message,
          link: doc.link,
          createdAt: doc.createdAt,
        });
      } catch {
        // Socket chưa sẵn sàng (vd khi chạy test) — bỏ qua, bản ghi vẫn đã lưu.
      }
    }

    return doc;
  } catch (error) {
    console.error("[Notification] Không tạo được thông báo:", error);
    return null;
  }
};
