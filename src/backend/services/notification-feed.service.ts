import mongoose from "mongoose";
import { Notification } from "../models/notification.model";

/**
 * Phần dùng chung cho chuông thông báo của admin và của doanh nghiệp.
 *
 * Hai bên chỉ khác nhau ở BỘ LỌC người nhận; toàn bộ phần đọc danh sách, đếm
 * chưa đọc và đánh dấu đã đọc là như nhau nên gom về đây thay vì chép đôi.
 */

export type FeedFilter = Record<string, any>;

/** Bộ lọc thông báo dành cho admin (broadcast). */
export const adminFeedFilter = (): FeedFilter => ({
  // $in kèm null cũng khớp document THIẾU hẳn trường `audience` — tức các thông
  // báo tạo trước khi có tính năng cho doanh nghiệp. Không có nó thì chuông
  // admin đột nhiên trống rỗng sau khi nâng cấp.
  audience: { $in: ["admin", null] },
});

/** Bộ lọc thông báo riêng của một doanh nghiệp. */
export const companyFeedFilter = (companyId: string): FeedFilter => ({
  audience: "company",
  recipientId: new mongoose.Types.ObjectId(companyId),
});

/** Bộ lọc thông báo riêng của một hãng tàu. */
export const providerFeedFilter = (providerId: string): FeedFilter => ({
  audience: "provider",
  recipientId: new mongoose.Types.ObjectId(providerId),
});

interface ListOptions {
  filter: FeedFilter;
  /** Id người đang xem — dùng để tính cờ đã đọc. Null nếu không xác định được. */
  viewerId: string | null;
  limit?: number;
  unreadOnly?: boolean;
}

export const listFeed = async ({
  filter,
  viewerId,
  limit = 20,
  unreadOnly = false,
}: ListOptions) => {
  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const query: FeedFilter = { ...filter };
  if (unreadOnly && viewerId) query.readBy = { $ne: viewerId };

  const [rows, unreadCount] = await Promise.all([
    Notification.find(query).sort({ createdAt: -1 }).limit(safeLimit).lean(),
    viewerId
      ? Notification.countDocuments({ ...filter, readBy: { $ne: viewerId } })
      : Promise.resolve(0),
  ]);

  // Không trả cả mảng readBy về client (thừa và lộ id người khác) — quy về 1 cờ.
  const data = rows.map((n: any) => ({
    _id: n._id,
    type: n.type,
    severity: n.severity,
    title: n.title,
    message: n.message,
    link: n.link,
    createdAt: n.createdAt,
    isRead: viewerId
      ? (n.readBy || []).some((id: any) => String(id) === viewerId)
      : false,
  }));

  return { data, unreadCount };
};

/**
 * Đánh dấu một thông báo đã đọc.
 *
 * Điều kiện update GHÉP CẢ `filter`: nếu chỉ tìm theo _id thì một doanh nghiệp
 * biết id thông báo của doanh nghiệp khác vẫn ghi được vào readBy của họ.
 */
export const markRead = async (
  filter: FeedFilter,
  viewerId: string,
  notificationId: string,
) => {
  // $addToSet: đọc lại lần nữa không tạo bản ghi trùng.
  await Notification.updateOne(
    { ...filter, _id: notificationId },
    { $addToSet: { readBy: viewerId } },
  );
  return Notification.countDocuments({ ...filter, readBy: { $ne: viewerId } });
};

export const markAllRead = async (filter: FeedFilter, viewerId: string) => {
  await Notification.updateMany(
    { ...filter, readBy: { $ne: viewerId } },
    { $addToSet: { readBy: viewerId } },
  );
};
