import { Request, Response } from "express";
import mongoose from "mongoose";
import {
  adminFeedFilter,
  listFeed,
  markAllRead,
  markRead,
} from "../services/notification-feed.service";

/** Id admin đang đăng nhập, null nếu là request nội bộ (AI server). */
const currentAdminId = (req: Request): string | null => {
  const id = req.user?.id;
  return id && mongoose.isValidObjectId(id) ? String(id) : null;
};

/**
 * GET /notifications?limit=20&unreadOnly=true
 * Danh sách thông báo + số chưa đọc của CHÍNH người đang đăng nhập.
 */
export const listGet = async (req: Request, res: Response) => {
  try {
    const { data, unreadCount } = await listFeed({
      filter: adminFeedFilter(),
      viewerId: currentAdminId(req),
      limit: parseInt(String(req.query.limit || "20"), 10) || 20,
      unreadOnly: req.query.unreadOnly === "true",
    });

    res.status(200).json({ code: "success", data, unreadCount });
  } catch (error) {
    console.error("Notification list error:", error);
    res.status(400).json({
      code: "error",
      message: "Không thể lấy danh sách thông báo",
    });
  }
};

/** PATCH /notifications/:id/read — đánh dấu 1 thông báo đã đọc. */
export const markReadPatch = async (req: Request, res: Response) => {
  try {
    const adminId = currentAdminId(req);
    if (!adminId) {
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
      adminFeedFilter(),
      adminId,
      String(req.params.id),
    );
    res.status(200).json({ code: "success", unreadCount });
  } catch (error) {
    console.error("Notification markRead error:", error);
    res
      .status(400)
      .json({ code: "error", message: "Không thể cập nhật thông báo" });
  }
};

/** PATCH /notifications/read-all — đánh dấu tất cả đã đọc. */
export const markAllReadPatch = async (req: Request, res: Response) => {
  try {
    const adminId = currentAdminId(req);
    if (!adminId) {
      return res
        .status(400)
        .json({ code: "error", message: "Không xác định được tài khoản" });
    }

    await markAllRead(adminFeedFilter(), adminId);
    res.status(200).json({ code: "success", unreadCount: 0 });
  } catch (error) {
    console.error("Notification markAllRead error:", error);
    res
      .status(400)
      .json({ code: "error", message: "Không thể cập nhật thông báo" });
  }
};
