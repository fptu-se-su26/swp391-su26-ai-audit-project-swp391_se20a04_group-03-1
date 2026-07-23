import { Request, Response } from "express";
import mongoose from "mongoose";
import {
  FeedFilter,
  listFeed,
  markAllRead,
  markRead,
} from "../../services/notification-feed.service";

/**
 * Bộ xử lý chuông thông báo cho tài khoản client (doanh nghiệp / hãng tàu).
 *
 * Hai cổng chỉ khác nhau ở bộ lọc người nhận nên dựng bằng nhà máy thay vì chép
 * đôi ba handler y hệt — sửa một chỗ là cả hai cùng đúng.
 *
 * Nguyên tắc chung: id người xem LUÔN lấy từ token (requireAuthCompany /
 * requireAuthProvider), không bao giờ từ query hay params. Bộ lọc cũng được
 * ghép vào điều kiện update để biết id thông báo của người khác cũng không
 * ghi vào được.
 */
export const makeClientNotificationHandlers = (
  filterFor: (viewerId: string) => FeedFilter,
) => {
  const viewerIdOf = (req: Request): string | null => {
    const id = req.user?.id;
    return id && mongoose.isValidObjectId(id) ? String(id) : null;
  };

  const listGet = async (req: Request, res: Response) => {
    try {
      const viewerId = viewerIdOf(req);
      if (!viewerId) {
        return res
          .status(400)
          .json({ code: "error", message: "Không xác định được tài khoản" });
      }

      const { data, unreadCount } = await listFeed({
        filter: filterFor(viewerId),
        viewerId,
        limit: parseInt(String(req.query.limit || "20"), 10) || 20,
        unreadOnly: req.query.unreadOnly === "true",
      });

      res.status(200).json({ code: "success", data, unreadCount });
    } catch (error) {
      console.error("Client notification list error:", error);
      res
        .status(400)
        .json({ code: "error", message: "Không thể lấy danh sách thông báo" });
    }
  };

  const markReadPatch = async (req: Request, res: Response) => {
    try {
      const viewerId = viewerIdOf(req);
      if (!viewerId) {
        return res
          .status(400)
          .json({ code: "error", message: "Không xác định được tài khoản" });
      }
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res
          .status(400)
          .json({ code: "error", message: "Thông báo không hợp lệ" });
      }

      const unreadCount = await markRead(
        filterFor(viewerId),
        viewerId,
        String(req.params.id),
      );
      res.status(200).json({ code: "success", unreadCount });
    } catch (error) {
      console.error("Client notification markRead error:", error);
      res
        .status(400)
        .json({ code: "error", message: "Không thể cập nhật thông báo" });
    }
  };

  const markAllReadPatch = async (req: Request, res: Response) => {
    try {
      const viewerId = viewerIdOf(req);
      if (!viewerId) {
        return res
          .status(400)
          .json({ code: "error", message: "Không xác định được tài khoản" });
      }

      await markAllRead(filterFor(viewerId), viewerId);
      res.status(200).json({ code: "success", unreadCount: 0 });
    } catch (error) {
      console.error("Client notification markAllRead error:", error);
      res
        .status(400)
        .json({ code: "error", message: "Không thể cập nhật thông báo" });
    }
  };

  return { listGet, markReadPatch, markAllReadPatch };
};
