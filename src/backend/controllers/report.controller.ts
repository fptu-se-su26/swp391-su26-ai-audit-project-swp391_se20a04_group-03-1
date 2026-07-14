import { Request, Response } from "express";
import {
  resolveDateRange,
  buildOverview,
  buildReportPdf,
  REPORT_TYPES,
  ReportType,
} from "../services/report.service";

/**
 * GET /reports/overview?from=&to=
 * Trả toàn bộ số liệu cho trang /admin/reports (KPIs, biểu đồ, cảnh báo).
 */
export const overviewGet = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query as { from?: string; to?: string };
    const range = resolveDateRange(from, to);
    const data = await buildOverview(range);

    res.status(200).json({ code: "success", data });
  } catch (error) {
    console.error("Report overview error:", error);
    res.status(400).json({
      code: "error",
      message: "Không thể tổng hợp dữ liệu báo cáo",
    });
  }
};

/**
 * GET /reports/export?type=&from=&to=
 * Xuất báo cáo PDF theo loại (all | traffic | yard | container | performance | alerts).
 */
export const exportGet = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query as { from?: string; to?: string };
    const rawType = String(req.query.type || "all");
    const type: ReportType = (REPORT_TYPES as readonly string[]).includes(
      rawType,
    )
      ? (rawType as ReportType)
      : "all";

    const range = resolveDateRange(from, to);
    const data = await buildOverview(range);
    const doc = buildReportPdf(type, range, data);

    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="bao-cao-${type}-${stamp}.pdf"`,
    );
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error("Report export error:", error);
    res.status(400).json({
      code: "error",
      message: "Không thể xuất báo cáo",
    });
  }
};
