import { Request, Response } from "express";
import {
  buildProviderDashboard,
  buildProviderHistory,
} from "../../services/provider-dashboard.service";

/** GET /client/provider/dashboard/overview — số liệu trang tổng quan hãng tàu. */
export const overviewGet = async (req: Request, res: Response) => {
  try {
    const data = await buildProviderDashboard(String(req.user.id));
    res.status(200).json({ code: "success", data });
  } catch (error) {
    console.error("Provider dashboard error:", error);
    res
      .status(400)
      .json({ code: "error", message: "Không thể tải dữ liệu tổng quan" });
  }
};

/** GET /client/provider/dashboard/history — lịch sử giao dịch, có phân trang. */
export const historyGet = async (req: Request, res: Response) => {
  try {
    const result = await buildProviderHistory(String(req.user.id), {
      page: parseInt(String(req.query.page || "1"), 10) || 1,
      limit: parseInt(String(req.query.limit || "10"), 10) || 10,
      search: req.query.search ? String(req.query.search) : undefined,
      direction: req.query.direction ? String(req.query.direction) : undefined,
    });

    res.status(200).json({
      code: "success",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Provider history error:", error);
    res
      .status(400)
      .json({ code: "error", message: "Không thể tải lịch sử giao dịch" });
  }
};
