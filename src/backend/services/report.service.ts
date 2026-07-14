import PDFDocument from "pdfkit";
import path from "path";
import { GateTransaction } from "../models/gateTransaction.model";
import { Container } from "../models/container.model";
import { Yard } from "../models/yard.model";
import { Appointment } from "../models/appointment.model";

/**
 * Service tổng hợp số liệu cho trang Báo cáo (/admin/reports).
 *
 * Nguyên tắc: CHỈ tính trên dữ liệu có thật trong hệ thống
 * (GateTransaction, Container, Yard, Appointment). Không có khái niệm
 * doanh thu/phí trong DB nên báo cáo doanh thu được đánh dấu `available:false`.
 */

const TZ = "Asia/Ho_Chi_Minh";
const LOW_OCR_THRESHOLD = 0.6; // dưới ngưỡng này coi là nhận dạng kém
const OVERSTAY_HOURS = 48; // xe còn "in" quá số giờ này => nghi lưu bãi quá hạn
const YARD_FULL_PCT = 90; // tỷ lệ sử dụng bãi coi là "gần đầy"

export interface DateRange {
  start: Date;
  end: Date;
}

/** Chuẩn hóa khoảng ngày từ query. Mặc định: 30 ngày gần nhất. */
export const resolveDateRange = (from?: string, to?: string): DateRange => {
  const end = to ? new Date(to) : new Date();
  // Bao trọn ngày "đến": đẩy tới cuối ngày.
  end.setHours(23, 59, 59, 999);

  let start: Date;
  if (from) {
    start = new Date(from);
  } else {
    start = new Date(end);
    start.setDate(start.getDate() - 29);
  }
  start.setHours(0, 0, 0, 0);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    const now = new Date();
    const s = new Date(now);
    s.setDate(s.getDate() - 29);
    s.setHours(0, 0, 0, 0);
    now.setHours(23, 59, 59, 999);
    return { start: s, end: now };
  }
  return { start, end };
};

/** Tính % thay đổi giữa kỳ hiện tại và kỳ trước, làm tròn 1 chữ số. */
const pctDelta = (current: number, previous: number): number | null => {
  if (previous === 0) return current === 0 ? 0 : null; // null = kỳ trước không có dữ liệu để so
  return Math.round(((current - previous) / previous) * 1000) / 10;
};

/** Khoảng kỳ trước cùng độ dài, liền kề trước `range`. */
const previousRange = (range: DateRange): DateRange => {
  const len = range.end.getTime() - range.start.getTime();
  const prevEnd = new Date(range.start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - len);
  return { start: prevStart, end: prevEnd };
};

/** Đếm check-in (transaction có checkInTime trong khoảng). */
const countCheckIns = (range: DateRange) =>
  GateTransaction.countDocuments({
    isDeleted: false,
    checkInTime: { $gte: range.start, $lte: range.end },
  });

/** Đếm check-out (transaction có checkOutTime trong khoảng). */
const countCheckOuts = (range: DateRange) =>
  GateTransaction.countDocuments({
    isDeleted: false,
    checkOutTime: { $gte: range.start, $lte: range.end },
  });

/** Thời gian lưu bãi trung bình (phút) của các lượt đã check-out trong khoảng. */
const avgDwellMinutes = async (range: DateRange): Promise<number> => {
  const rows = await GateTransaction.aggregate([
    {
      $match: {
        isDeleted: false,
        checkInTime: { $ne: null },
        checkOutTime: { $gte: range.start, $lte: range.end, $ne: null },
      },
    },
    {
      $project: {
        durationMs: { $subtract: ["$checkOutTime", "$checkInTime"] },
      },
    },
    { $match: { durationMs: { $gt: 0 } } },
    { $group: { _id: null, avgMs: { $avg: "$durationMs" } } },
  ]);
  if (!rows.length || !rows[0].avgMs) return 0;
  return Math.round(rows[0].avgMs / 60000);
};

/** Đếm số lượt lấy/trả (lịch hẹn) đã hoàn thành trong khoảng, tách theo mục đích. */
const countCompletedAppointments = async (range: DateRange) => {
  const rows = await Appointment.aggregate([
    {
      $match: {
        isDeleted: false,
        status: "Completed",
        updatedAt: { $gte: range.start, $lte: range.end },
      },
    },
    { $group: { _id: "$purpose", count: { $sum: 1 } } },
  ]);
  const map: Record<string, number> = {};
  let total = 0;
  for (const r of rows) {
    map[r._id] = r.count;
    total += r.count;
  }
  return {
    total,
    pickup: map["Lấy container"] || 0,
    dropoff: map["Trả container"] || 0,
  };
};

/** Snapshot sức chứa bãi hiện tại: slot đang bận / tổng slot. */
const getYardUtilization = async () => {
  const yards = await Yard.find({ isDeleted: false }).select("slots").lean();
  const totalSlots = yards.reduce(
    (sum, y: any) => sum + (Array.isArray(y.slots) ? y.slots.length : 0),
    0,
  );
  // Mỗi transaction "in" giữ đúng 1 slot.
  const occupied = await GateTransaction.countDocuments({
    isDeleted: false,
    status: "in",
  });
  const pct =
    totalSlots > 0 ? Math.round((occupied / totalSlots) * 1000) / 10 : 0;
  return { totalSlots, occupied, free: Math.max(totalSlots - occupied, 0), pct };
};

/** Lưu lượng check-in theo 24 giờ trong ngày (gộp toàn khoảng). */
const getTrafficByHour = async (range: DateRange): Promise<number[]> => {
  const rows = await GateTransaction.aggregate([
    {
      $match: {
        isDeleted: false,
        checkInTime: { $gte: range.start, $lte: range.end },
      },
    },
    {
      $group: {
        _id: { $hour: { date: "$checkInTime", timezone: TZ } },
        count: { $sum: 1 },
      },
    },
  ]);
  const buckets = new Array(24).fill(0);
  for (const r of rows) {
    if (typeof r._id === "number" && r._id >= 0 && r._id < 24) {
      buckets[r._id] = r.count;
    }
  }
  return buckets;
};

/** Phân bố container hiện có theo (type + status). */
const getContainerDistribution = async () => {
  const rows = await Container.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: { type: "$type", status: "$status" },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);
  const total = rows.reduce((s, r) => s + r.count, 0);
  return {
    total,
    items: rows.map((r) => ({
      type: r._id.type,
      status: r._id.status,
      label: `${r._id.type} ${r._id.status}`,
      count: r.count,
      pct: total > 0 ? Math.round((r.count / total) * 1000) / 10 : 0,
    })),
  };
};

/** Cảnh báo suy ra từ dữ liệu vận hành. */
const getAlerts = async (range: DateRange, utilizationPct: number) => {
  const overstayThreshold = new Date(Date.now() - OVERSTAY_HOURS * 3600 * 1000);

  const [lowOcrCount, overstayCount] = await Promise.all([
    GateTransaction.countDocuments({
      isDeleted: false,
      ocrConfidence: { $ne: null, $lt: LOW_OCR_THRESHOLD },
      checkInTime: { $gte: range.start, $lte: range.end },
    }),
    GateTransaction.countDocuments({
      isDeleted: false,
      status: "in",
      checkInTime: { $lt: overstayThreshold },
    }),
  ]);

  const alerts: {
    key: string;
    severity: "high" | "medium" | "low";
    message: string;
    count: number;
  }[] = [];

  if (overstayCount > 0) {
    alerts.push({
      key: "overstay",
      severity: "high",
      message: `${overstayCount} xe còn lưu bãi quá ${OVERSTAY_HOURS} giờ`,
      count: overstayCount,
    });
  }
  if (utilizationPct >= YARD_FULL_PCT) {
    alerts.push({
      key: "yard-full",
      severity: "high",
      message: `Bãi gần đầy (${utilizationPct}% sức chứa)`,
      count: 1,
    });
  }
  if (lowOcrCount > 0) {
    alerts.push({
      key: "low-ocr",
      severity: "medium",
      message: `${lowOcrCount} lượt nhận dạng OCR có độ tin cậy thấp`,
      count: lowOcrCount,
    });
  }

  return alerts;
};

export interface ReportOverview {
  range: { from: string; to: string };
  kpis: {
    totalCheckIns: { value: number; delta: number | null };
    avgDwellMinutes: { value: number; delta: number | null };
    yardUtilizationPct: { value: number; occupied: number; totalSlots: number };
    completedAppointments: {
      value: number;
      delta: number | null;
      pickup: number;
      dropoff: number;
    };
  };
  charts: {
    trafficByHour: number[];
    containerDistribution: Awaited<ReturnType<typeof getContainerDistribution>>;
  };
  cards: {
    traffic: { totalCheckIns: number; totalCheckOuts: number };
    yard: { occupied: number; totalSlots: number; free: number; pct: number };
    container: { total: number };
    performance: { peakHour: number; peakCount: number };
    revenue: { available: false; reason: string };
    alerts: { count: number };
  };
  alerts: Awaited<ReturnType<typeof getAlerts>>;
}

/** Tổng hợp toàn bộ dữ liệu cho trang báo cáo trong 1 lần gọi. */
export const buildOverview = async (
  range: DateRange,
): Promise<ReportOverview> => {
  const prev = previousRange(range);

  const [
    checkIns,
    checkOuts,
    prevCheckIns,
    dwell,
    prevDwell,
    appts,
    prevAppts,
    utilization,
    trafficByHour,
    containerDistribution,
  ] = await Promise.all([
    countCheckIns(range),
    countCheckOuts(range),
    countCheckIns(prev),
    avgDwellMinutes(range),
    avgDwellMinutes(prev),
    countCompletedAppointments(range),
    countCompletedAppointments(prev),
    getYardUtilization(),
    getTrafficByHour(range),
    getContainerDistribution(),
  ]);

  const alerts = await getAlerts(range, utilization.pct);

  // Giờ cao điểm suy ra từ trafficByHour.
  let peakHour = 0;
  let peakCount = 0;
  trafficByHour.forEach((c, h) => {
    if (c > peakCount) {
      peakCount = c;
      peakHour = h;
    }
  });

  return {
    range: { from: range.start.toISOString(), to: range.end.toISOString() },
    kpis: {
      totalCheckIns: {
        value: checkIns,
        delta: pctDelta(checkIns, prevCheckIns),
      },
      avgDwellMinutes: {
        value: dwell,
        delta: pctDelta(dwell, prevDwell),
      },
      yardUtilizationPct: {
        value: utilization.pct,
        occupied: utilization.occupied,
        totalSlots: utilization.totalSlots,
      },
      completedAppointments: {
        value: appts.total,
        delta: pctDelta(appts.total, prevAppts.total),
        pickup: appts.pickup,
        dropoff: appts.dropoff,
      },
    },
    charts: {
      trafficByHour,
      containerDistribution,
    },
    cards: {
      traffic: { totalCheckIns: checkIns, totalCheckOuts: checkOuts },
      yard: utilization,
      container: { total: containerDistribution.total },
      performance: { peakHour, peakCount },
      revenue: {
        available: false,
        reason: "Hệ thống chưa có dữ liệu phí lưu bãi / doanh thu",
      },
      alerts: { count: alerts.reduce((s, a) => s + a.count, 0) },
    },
    alerts,
  };
};

// ============ XUẤT BÁO CÁO PDF ============

const FONT_DIR = path.join(__dirname, "..", "assets", "fonts");
const FONT_REGULAR = path.join(FONT_DIR, "DejaVuSans.ttf");
const FONT_BOLD = path.join(FONT_DIR, "DejaVuSans-Bold.ttf");

const GREEN = "#1ed760";
const DARK = "#121212";
const GRAY = "#666666";

const fmtDate = (d: Date) =>
  d.toLocaleDateString("vi-VN", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export const REPORT_TYPES = [
  "all",
  "traffic",
  "yard",
  "container",
  "performance",
  "alerts",
] as const;
export type ReportType = (typeof REPORT_TYPES)[number];

const REPORT_TITLES: Record<ReportType, string> = {
  all: "BÁO CÁO TỔNG HỢP",
  traffic: "BÁO CÁO XE VÀO / RA",
  yard: "BÁO CÁO SỬ DỤNG BÃI",
  container: "BÁO CÁO CONTAINER",
  performance: "BÁO CÁO HIỆU SUẤT",
  alerts: "BÁO CÁO CẢNH BÁO",
};

/**
 * Dựng PDF báo cáo theo `type`. Caller chịu trách nhiệm pipe + end.
 */
export const buildReportPdf = (
  type: ReportType,
  range: DateRange,
  data: ReportOverview,
): PDFKit.PDFDocument => {
  const doc = new PDFDocument({ size: "A4", margin: 48 });
  doc.registerFont("body", FONT_REGULAR);
  doc.registerFont("bold", FONT_BOLD);

  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const contentW = right - left;

  // ---- Header ----
  doc.font("bold").fontSize(22).fillColor(DARK).text("LOGIPORT", left, doc.y);
  doc
    .font("body")
    .fontSize(9)
    .fillColor(GRAY)
    .text("CẢNG CONTAINER THÔNG MINH");
  doc.moveDown(0.5);
  doc
    .moveTo(left, doc.y)
    .lineTo(right, doc.y)
    .lineWidth(2)
    .strokeColor(GREEN)
    .stroke();
  doc.moveDown(0.8);

  doc
    .font("bold")
    .fontSize(16)
    .fillColor(DARK)
    .text(REPORT_TITLES[type], { align: "center" });
  doc
    .font("body")
    .fontSize(9)
    .fillColor(GRAY)
    .text(`Kỳ báo cáo: ${fmtDate(range.start)} — ${fmtDate(range.end)}`, {
      align: "center",
    });
  doc.text(`Xuất lúc: ${new Date().toLocaleString("vi-VN", { timeZone: TZ })}`, {
    align: "center",
  });
  doc.moveDown(1.2);

  const sectionTitle = (t: string) => {
    doc.moveDown(0.6);
    doc.font("bold").fontSize(12).fillColor(DARK).text(t);
    doc.moveDown(0.3);
  };

  const kvRow = (label: string, value: string) => {
    const y = doc.y;
    doc.font("body").fontSize(10).fillColor(GRAY).text(label, left, y, {
      width: contentW * 0.6,
    });
    doc
      .font("bold")
      .fontSize(10)
      .fillColor(DARK)
      .text(value, left + contentW * 0.6, y, {
        width: contentW * 0.4,
        align: "right",
      });
    doc.moveDown(0.4);
  };

  const showKpis = type === "all";
  if (showKpis) {
    sectionTitle("Chỉ số chính (KPIs)");
    kvRow("Tổng xe check-in", String(data.kpis.totalCheckIns.value));
    kvRow(
      "Thời gian lưu bãi trung bình",
      `${data.kpis.avgDwellMinutes.value} phút`,
    );
    kvRow(
      "Tỷ lệ sử dụng bãi",
      `${data.kpis.yardUtilizationPct.value}% (${data.kpis.yardUtilizationPct.occupied}/${data.kpis.yardUtilizationPct.totalSlots})`,
    );
    kvRow(
      "Lượt lấy/trả hoàn thành",
      `${data.kpis.completedAppointments.value} (lấy ${data.kpis.completedAppointments.pickup} · trả ${data.kpis.completedAppointments.dropoff})`,
    );
  }

  if (type === "all" || type === "traffic") {
    sectionTitle("Xe vào / ra");
    kvRow("Tổng lượt check-in", String(data.cards.traffic.totalCheckIns));
    kvRow("Tổng lượt check-out", String(data.cards.traffic.totalCheckOuts));
    kvRow(
      "Giờ cao điểm",
      `${data.cards.performance.peakHour}h (${data.cards.performance.peakCount} xe)`,
    );
  }

  if (type === "all" || type === "yard") {
    sectionTitle("Sử dụng bãi");
    kvRow("Tổng số ô đỗ", String(data.cards.yard.totalSlots));
    kvRow("Đang sử dụng", String(data.cards.yard.occupied));
    kvRow("Còn trống", String(data.cards.yard.free));
    kvRow("Tỷ lệ sử dụng", `${data.cards.yard.pct}%`);
  }

  if (type === "all" || type === "container") {
    sectionTitle(`Phân bố container (tổng ${data.charts.containerDistribution.total})`);
    if (data.charts.containerDistribution.items.length === 0) {
      doc.font("body").fontSize(10).fillColor(GRAY).text("Không có dữ liệu.");
    } else {
      for (const it of data.charts.containerDistribution.items) {
        kvRow(it.label, `${it.count} (${it.pct}%)`);
      }
    }
  }

  if (type === "all" || type === "performance") {
    sectionTitle("Hiệu suất theo giờ (lượt check-in)");
    data.charts.trafficByHour.forEach((c, h) => {
      if (c > 0) kvRow(`${String(h).padStart(2, "0")}h`, `${c} xe`);
    });
  }

  if (type === "all" || type === "alerts") {
    sectionTitle("Cảnh báo");
    if (data.alerts.length === 0) {
      doc
        .font("body")
        .fontSize(10)
        .fillColor(GRAY)
        .text("Không có cảnh báo trong kỳ.");
    } else {
      for (const a of data.alerts) {
        kvRow(`[${a.severity.toUpperCase()}] ${a.message}`, "");
      }
    }
  }

  doc.moveDown(2);
  doc
    .font("body")
    .fontSize(8)
    .fillColor(GRAY)
    .text(
      "Báo cáo được sinh tự động bởi hệ thống LogiPort.",
      left,
      doc.y,
      { align: "center", width: contentW },
    );

  return doc;
};
