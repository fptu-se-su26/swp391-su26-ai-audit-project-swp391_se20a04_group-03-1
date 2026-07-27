import { Request, Response } from "express";
import { buildCompanyDashboard } from "../../services/company-dashboard.service";

/** GET /client/dashboard/overview — toàn bộ số liệu trang tổng quan doanh nghiệp. */
export const overviewGet = async (req: Request, res: Response) => {
  try {
    const data = await buildCompanyDashboard(String(req.user.id));
    res.status(200).json({ code: "success", data });
  } catch (error) {
    console.error("Company dashboard error:", error);
    res.status(400).json({
      code: "error",
      message: "Không thể tải dữ liệu tổng quan",
    });
  }
};
