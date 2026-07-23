import { GateTransaction } from "../models/gateTransaction.model";
import { Appointment } from "../models/appointment.model";
import { Container } from "../models/container.model";
import { Yard } from "../models/yard.model";
import { Gate } from "../models/gate.model";
import { Company } from "../models/company.model";
import { Driver } from "../models/driver.model";

/**
 * Số liệu cho trang /admin/dashboard.
 *
 * Khác biệt với report.service: báo cáo nhìn theo KHOẢNG NGÀY do người dùng chọn
 * và để xuất PDF; dashboard là ảnh chụp TRẠNG THÁI HIỆN TẠI + trong ngày hôm nay,
 * dùng để trực ca. Vì vậy tách riêng, không tái sử dụng buildOverview.
 *
 * Mọi con số đều tính từ dữ liệu thật (GateTransaction, Appointment, Container,
 * Yard). Không có số liệu giả/hard-code.
 */

const TZ = "Asia/Ho_Chi_Minh";
const OVERSTAY_HOURS = 48; // xe còn "in" quá số giờ này => nghi lưu bãi quá hạn
const YARD_FULL_PCT = 90; // ngưỡng coi là bãi gần đầy

/** Mốc 00:00 hôm nay theo giờ Việt Nam. */
const startOfToday = (): Date => {
  const now = new Date();
  const vn = now.toLocaleString("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [month, day, year] = vn.split("/");
  return new Date(`${year}-${month}-${day}T00:00:00.000+07:00`);
};

/** Đếm lịch hẹn hôm nay, tách theo trạng thái. */
const getTodayAppointments = async (todayStart: Date) => {
  const todayEnd = new Date(todayStart.getTime() + 24 * 3600 * 1000 - 1);
  const rows = await Appointment.aggregate([
    {
      $match: {
        isDeleted: false,
        scheduledDate: { $gte: todayStart, $lte: todayEnd },
      },
    },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  const map: Record<string, number> = {};
  let total = 0;
  for (const r of rows) {
    map[r._id] = r.count;
    total += r.count;
  }
  return {
    total,
    pending: map["Pending"] || 0,
    confirmed: map["Confirmed"] || 0,
    completed: map["Completed"] || 0,
    cancelled: map["Cancelled"] || 0,
  };
};

/** Sức chứa từng bãi: bao nhiêu ô đang bị xe "in" giữ trên tổng số ô. */
const getYardBreakdown = async () => {
  const [yards, occupancy] = await Promise.all([
    Yard.find({ isDeleted: false }).select("name slots").lean(),
    GateTransaction.aggregate([
      { $match: { isDeleted: false, status: "in", yardId: { $ne: null } } },
      { $group: { _id: "$yardId", count: { $sum: 1 } } },
    ]),
  ]);

  const occupiedMap = new Map(occupancy.map((o) => [String(o._id), o.count]));

  const items = yards.map((y: any) => {
    const total = Array.isArray(y.slots) ? y.slots.length : 0;
    const occupied = occupiedMap.get(String(y._id)) || 0;
    return {
      _id: y._id,
      name: y.name,
      totalSlots: total,
      occupied,
      free: Math.max(total - occupied, 0),
      pct: total > 0 ? Math.round((occupied / total) * 1000) / 10 : 0,
    };
  });

  const totalSlots = items.reduce((s, y) => s + y.totalSlots, 0);
  const totalOccupied = items.reduce((s, y) => s + y.occupied, 0);

  return {
    items,
    totalSlots,
    occupied: totalOccupied,
    free: Math.max(totalSlots - totalOccupied, 0),
    pct: totalSlots > 0 ? Math.round((totalOccupied / totalSlots) * 1000) / 10 : 0,
  };
};

/** Lưu lượng check-in / check-out theo từng giờ trong hôm nay. */
const getTodayTraffic = async (todayStart: Date) => {
  const todayEnd = new Date(todayStart.getTime() + 24 * 3600 * 1000 - 1);

  const bucketBy = async (field: "checkInTime" | "checkOutTime") => {
    const rows = await GateTransaction.aggregate([
      {
        $match: {
          isDeleted: false,
          [field]: { $gte: todayStart, $lte: todayEnd },
        },
      },
      {
        $group: {
          _id: { $hour: { date: `$${field}`, timezone: TZ } },
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

  const [checkIn, checkOut] = await Promise.all([
    bucketBy("checkInTime"),
    bucketBy("checkOutTime"),
  ]);
  return { checkIn, checkOut };
};

/** Số lượt check-in mỗi ngày trong 7 ngày gần nhất (kể cả hôm nay). */
const getWeeklyTrend = async (todayStart: Date) => {
  const from = new Date(todayStart.getTime() - 6 * 24 * 3600 * 1000);
  const rows = await GateTransaction.aggregate([
    { $match: { isDeleted: false, checkInTime: { $gte: from } } },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$checkInTime", timezone: TZ },
        },
        count: { $sum: 1 },
      },
    },
  ]);
  const map = new Map(rows.map((r) => [r._id, r.count]));

  const days: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayStart.getTime() - i * 24 * 3600 * 1000);
    const key = d.toLocaleDateString("en-CA", { timeZone: TZ }); // YYYY-MM-DD
    days.push({ date: key, count: map.get(key) || 0 });
  }
  return days;
};

/** Phân bố container theo trạng thái cảng (đồng bộ từ lịch hẹn khi qua cổng). */
const getContainerByPortStatus = async () => {
  const rows = await Container.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: "$portStatus", count: { $sum: 1 } } },
  ]);
  const map: Record<string, number> = {};
  let total = 0;
  for (const r of rows) {
    map[r._id || "Chưa nhập cảng"] = r.count;
    total += r.count;
  }
  const ORDER = [
    "Chưa nhập cảng",
    "Đã nhập cảng",
    "Đang lưu bãi",
    "Đã xuất cảng",
  ];
  return {
    total,
    items: ORDER.map((label) => ({
      label,
      count: map[label] || 0,
      pct: total > 0 ? Math.round(((map[label] || 0) / total) * 1000) / 10 : 0,
    })),
  };
};

/** 10 lượt qua cổng gần nhất — dòng "Hoạt động mới nhất". */
const getRecentActivity = async () => {
  const rows = await GateTransaction.find({ isDeleted: false })
    .sort({ updatedAt: -1 })
    .limit(10)
    .populate({ path: "gateId", select: "name type" })
    .populate({ path: "appointmentId", select: "purpose" })
    .lean();

  return rows.map((t: any) => ({
    _id: t._id,
    plate: t.actualTruckPlate || null,
    containerNo: t.actualContainerNo || null,
    status: t.status || null, // "in" | "out"
    gateName: t.gateId?.name || null,
    purpose: t.appointmentId?.purpose || null,
    assignedSlot: t.assignedSlot || null,
    ocrConfidence: typeof t.ocrConfidence === "number" ? t.ocrConfidence : null,
    // Mốc thời gian đúng với chiều xe: ra thì lấy giờ ra, còn lại lấy giờ vào.
    at: t.status === "out" ? t.checkOutTime || t.updatedAt : t.checkInTime || t.updatedAt,
  }));
};

/** Lịch hẹn sắp tới trong hôm nay (chưa hoàn thành / chưa hủy). */
const getUpcomingAppointments = async (todayStart: Date) => {
  const todayEnd = new Date(todayStart.getTime() + 24 * 3600 * 1000 - 1);
  const rows = await Appointment.find({
    isDeleted: false,
    status: { $in: ["Pending", "Confirmed"] },
    scheduledDate: { $gte: todayStart, $lte: todayEnd },
  })
    .sort({ timeSlot: 1 })
    .limit(8)
    .populate({ path: "driverId", select: "driverName" })
    .lean();

  return rows.map((a: any) => ({
    _id: a._id,
    truckPlate: a.truckPlate,
    containerNo: a.containerNo,
    timeSlot: a.timeSlot,
    purpose: a.purpose,
    status: a.status,
    driverName: a.driverId?.driverName || null,
  }));
};

/** Cảnh báo suy ra từ trạng thái vận hành hiện tại. */
const getAlerts = async (yardPct: number, todayStart: Date) => {
  const overstayThreshold = new Date(Date.now() - OVERSTAY_HOURS * 3600 * 1000);

  const [overstay, pendingToday] = await Promise.all([
    GateTransaction.countDocuments({
      isDeleted: false,
      status: "in",
      checkInTime: { $lt: overstayThreshold },
    }),
    Appointment.countDocuments({
      isDeleted: false,
      status: "Pending",
      scheduledDate: {
        $gte: todayStart,
        $lte: new Date(todayStart.getTime() + 24 * 3600 * 1000 - 1),
      },
    }),
  ]);

  const alerts: {
    key: string;
    severity: "high" | "medium" | "low";
    message: string;
    count: number;
    link?: string;
  }[] = [];

  if (yardPct >= YARD_FULL_PCT) {
    alerts.push({
      key: "yard-full",
      severity: "high",
      message: `Bãi gần đầy — đã dùng ${yardPct}% sức chứa`,
      count: 1,
      link: "/admin/yard",
    });
  }
  if (overstay > 0) {
    alerts.push({
      key: "overstay",
      severity: "high",
      message: `${overstay} xe còn trong cảng quá ${OVERSTAY_HOURS} giờ`,
      count: overstay,
      // /admin/gate/logs không tồn tại (chỉ có /logs/[id] và /logs/trash);
      // bảng nhật ký nằm ngay trong trang /admin/gate.
      link: "/admin/gate",
    });
  }
  if (pendingToday > 0) {
    alerts.push({
      key: "pending-appointments",
      severity: "medium",
      message: `${pendingToday} lịch hẹn hôm nay chưa được duyệt`,
      count: pendingToday,
      link: "/admin/appointments",
    });
  }

  return alerts;
};

export const buildDashboard = async () => {
  const todayStart = startOfToday();
  const todayEnd = new Date(todayStart.getTime() + 24 * 3600 * 1000 - 1);
  const yesterdayStart = new Date(todayStart.getTime() - 24 * 3600 * 1000);

  const [
    activeVehicles,
    checkInsToday,
    checkOutsToday,
    checkInsYesterday,
    appointmentsToday,
    yard,
    traffic,
    weekly,
    containers,
    recentActivity,
    upcoming,
    totals,
  ] = await Promise.all([
    GateTransaction.countDocuments({ isDeleted: false, status: "in" }),
    GateTransaction.countDocuments({
      isDeleted: false,
      checkInTime: { $gte: todayStart, $lte: todayEnd },
    }),
    GateTransaction.countDocuments({
      isDeleted: false,
      checkOutTime: { $gte: todayStart, $lte: todayEnd },
    }),
    GateTransaction.countDocuments({
      isDeleted: false,
      checkInTime: { $gte: yesterdayStart, $lt: todayStart },
    }),
    getTodayAppointments(todayStart),
    getYardBreakdown(),
    getTodayTraffic(todayStart),
    getWeeklyTrend(todayStart),
    getContainerByPortStatus(),
    getRecentActivity(),
    getUpcomingAppointments(todayStart),
    Promise.all([
      Company.countDocuments({ isDeleted: false }),
      Driver.countDocuments({ isDeleted: false }),
      Gate.countDocuments({ isDeleted: false }),
      Container.countDocuments({ isDeleted: false }),
    ]),
  ]);

  const alerts = await getAlerts(yard.pct, todayStart);

  // % thay đổi check-in so với hôm qua. null = hôm qua không có dữ liệu để so.
  const checkInDelta =
    checkInsYesterday === 0
      ? checkInsToday === 0
        ? 0
        : null
      : Math.round(((checkInsToday - checkInsYesterday) / checkInsYesterday) * 1000) / 10;

  const [companies, drivers, gates, containersTotal] = totals;

  return {
    generatedAt: new Date().toISOString(),
    kpis: {
      activeVehicles,
      checkInsToday: { value: checkInsToday, delta: checkInDelta },
      checkOutsToday,
      appointmentsToday,
      yardUtilization: {
        pct: yard.pct,
        occupied: yard.occupied,
        totalSlots: yard.totalSlots,
        free: yard.free,
      },
      alertCount: alerts.reduce((s, a) => s + a.count, 0),
    },
    charts: {
      trafficByHour: traffic,
      weeklyCheckIns: weekly,
      containerByPortStatus: containers,
    },
    yards: yard.items,
    recentActivity,
    upcomingAppointments: upcoming,
    alerts,
    totals: {
      companies,
      drivers,
      gates,
      containers: containersTotal,
    },
  };
};
