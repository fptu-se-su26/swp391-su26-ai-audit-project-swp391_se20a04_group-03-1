import { Request, Response } from "express";
import mongoose from "mongoose";
import {
  companyFeedFilter,
  listFeed,
  markAllRead,
  markRead,
} from "../../services/notification-feed.service";

/**
 * Chuông thông báo của doanh nghiệp.
 *
 * Khác chuông admin ở đúng một điểm: doanh nghiệp CHỈ thấy thông báo có
 * recipientId là chính mình. Id luôn lấy từ token (requireAuthCompany), không
 * bao giờ từ query/params — nếu không sẽ xem được thông báo của công ty khác.
 */

const currentCompanyId = (req: Request): string | null => {
  const id = req.user?.id;
  return id && mongoose.isValidObjectId(id) ? String(id) : null;
};

export const listGet = async (req: Request, res: Response) => {
  try {
    const companyId = currentCompanyId(req);
    if (!companyId) {
      return res
        .status(400)
        .json({ code: "error", message: "Không xác định được tài khoản" });
    }

    const { data, unreadCount } = await listFeed({
      filter: companyFeedFilter(companyId),
      viewerId: companyId,
      limit: parseInt(String(req.query.limit || "20"), 10) || 20,
      unreadOnly: req.query.unreadOnly === "true",
    });

    res.status(200).json({ code: "success", data, unreadCount });
  } catch (error) {
    console.error("Company notification list error:", error);
    res
      .status(400)
      .json({ code: "error", message: "Không thể lấy danh sách thông báo" });
  }
};

export const markReadPatch = async (req: Request, res: Response) => {
  try {
    const companyId = currentCompanyId(req);
    if (!companyId) {
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
      companyFeedFilter(companyId),
      companyId,
      String(req.params.id),
    );
    res.status(200).json({ code: "success", unreadCount });
  } catch (error) {
    console.error("Company notification markRead error:", error);
    res
      .status(400)
      .json({ code: "error", message: "Không thể cập nhật thông báo" });
  }
};

export const markAllReadPatch = async (req: Request, res: Response) => {
  try {
    const companyId = currentCompanyId(req);
    if (!companyId) {
      return res
        .status(400)
        .json({ code: "error", message: "Không xác định được tài khoản" });
    }

    await markAllRead(companyFeedFilter(companyId), companyId);
    res.status(200).json({ code: "success", unreadCount: 0 });
  } catch (error) {
    console.error("Company notification markAllRead error:", error);
    res
      .status(400)
      .json({ code: "error", message: "Không thể cập nhật thông báo" });
  }
};
