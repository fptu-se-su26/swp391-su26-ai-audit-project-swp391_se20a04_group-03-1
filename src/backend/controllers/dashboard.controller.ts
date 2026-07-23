import { Request, Response } from "express";
import { buildDashboard } from "../services/dashboard.service";

/**
 * GET /dashboard/overview
 * Toàn bộ số liệu trang tổng quan trong 1 lần gọi (tránh frontend gọi 10 API).
 */
export const overviewGet = async (_req: Request, res: Response) => {
  try {
    const data = await buildDashboard();
    res.status(200).json({ code: "success", data });
  } catch (error) {
    console.error("Dashboard overview error:", error);
    res.status(400).json({
      code: "error",
      message: "Không thể tải dữ liệu bảng điều khiển",
    });
  }
};
