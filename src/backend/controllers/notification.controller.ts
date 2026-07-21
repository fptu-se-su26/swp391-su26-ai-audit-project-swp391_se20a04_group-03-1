import { Request, Response } from "express";
import mongoose from "mongoose";
import { Notification } from "../models/notification.model";

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
    const adminId = currentAdminId(req);
    const limit = Math.min(parseInt(String(req.query.limit || "20"), 10) || 20, 50);
    const unreadOnly = req.query.unreadOnly === "true";

    const query: any = {};
    if (unreadOnly && adminId) query.readBy = { $ne: adminId };

    const [rows, unreadCount] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).limit(limit).lean(),
      adminId
        ? Notification.countDocuments({ readBy: { $ne: adminId } })
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
      isRead: adminId
        ? (n.readBy || []).some((id: any) => String(id) === adminId)
        : false,
    }));

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

    // $addToSet: đọc lại lần nữa không tạo bản ghi trùng.
    await Notification.updateOne(
      { _id: req.params.id },
      { $addToSet: { readBy: adminId } },
    );

    const unreadCount = await Notification.countDocuments({
      readBy: { $ne: adminId },
    });
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

    await Notification.updateMany(
      { readBy: { $ne: adminId } },
      { $addToSet: { readBy: adminId } },
    );

    res.status(200).json({ code: "success", unreadCount: 0 });
  } catch (error) {
    console.error("Notification markAllRead error:", error);
    res
      .status(400)
      .json({ code: "error", message: "Không thể cập nhật thông báo" });
  }
};
