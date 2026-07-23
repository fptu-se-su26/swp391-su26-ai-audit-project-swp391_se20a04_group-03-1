import mongoose from "mongoose";
import { Appointment } from "../models/appointment.model";
import { Driver } from "../models/driver.model";
import { Truck } from "../models/truck.model";
import { Container } from "../models/container.model";
import { GateTransaction } from "../models/gateTransaction.model";
import { Company } from "../models/company.model";

/**
 * Số liệu cho trang /client/company/dashboard.
 *
 * Khác dashboard.service (của admin) ở phạm vi: admin nhìn TOÀN CẢNG, doanh
 * nghiệp chỉ được nhìn phần của MÌNH. Mọi truy vấn vì thế đều bị chặn theo
 * companyId lấy từ token.
 *
 * Cách khoanh vùng dữ liệu:
 *   - Tài xế / xe: có sẵn trường companyId.
 *   - Lịch hẹn: KHÔNG có companyId (xem appointment.model) — phải đi vòng qua
 *     driverId thuộc các tài xế của công ty. Đây là cách toàn bộ controller
 *     client hiện dùng, giữ nguyên cho nhất quán.
 *   - Lượt qua cổng: nối với lịch hẹn qua appointmentId.
 *   - Container: nối với lịch hẹn qua chuỗi Container.number == containerNo.
 */

const TZ = "Asia/Ho_Chi_Minh";
const TREND_DAYS = 7;
const UPCOMING_LIMIT = 5;
const ACTIVITY_LIMIT = 8;
/** Lịch hẹn chờ duyệt lâu hơn ngần này thì nhắc doanh nghiệp liên hệ ban quản lý. */
const PENDING_WARN_HOURS = 24;

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

const endOfDay = (start: Date) => new Date(start.getTime() + 24 * 3600 * 1000 - 1);

/** Danh sách _id tài xế của công ty — chìa khóa để lọc lịch hẹn. */
const getDriverIds = async (companyId: string) => {
  const drivers = await Driver.find({ companyId, isDeleted: false })
    .select("_id")
    .lean();
  return drivers.map((d) => d._id);
};

/** Đếm lịch hẹn theo trạng thái trong một khoảng ngày (hoặc toàn bộ). */
const countByStatus = async (
  driverIds: mongoose.Types.ObjectId[],
  range?: { from: Date; to: Date },
) => {
  const match: any = { isDeleted: false, driverId: { $in: driverIds } };
  if (range) match.scheduledDate = { $gte: range.from, $lte: range.to };

  const rows = await Appointment.aggregate([
    { $match: match },
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

/** Số lịch hẹn mỗi ngày trong 7 ngày gần nhất, tách theo mục đích lấy/trả. */
const getWeeklyTrend = async (
  driverIds: mongoose.Types.ObjectId[],
  todayStart: Date,
) => {
  const from = new Date(
    todayStart.getTime() - (TREND_DAYS - 1) * 24 * 3600 * 1000,
  );

  const rows = await Appointment.aggregate([
    {
      $match: {
        isDeleted: false,
        driverId: { $in: driverIds },
        scheduledDate: { $gte: from, $lte: endOfDay(todayStart) },
      },
    },
    {
      $group: {
        _id: {
          day: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$scheduledDate",
              timezone: TZ,
            },
          },
          purpose: "$purpose",
        },
        count: { $sum: 1 },
      },
    },
  ]);

  const map = new Map<string, { pickup: number; dropoff: number }>();
  for (const r of rows) {
    const entry = map.get(r._id.day) || { pickup: 0, dropoff: 0 };
    if (r._id.purpose === "Lấy container") entry.pickup += r.count;
    else entry.dropoff += r.count;
    map.set(r._id.day, entry);
  }

  // Bù ngày trống: biểu đồ phải có đủ 7 cột, ngày không có lịch hẹn là 0
  // chứ không phải bị khuyết cột.
  const series: {
    date: string;
    label: string;
    pickup: number;
    dropoff: number;
    total: number;
  }[] = [];
  for (let i = 0; i < TREND_DAYS; i++) {
    const d = new Date(from.getTime() + i * 24 * 3600 * 1000);
    const key = d.toLocaleDateString("en-CA", { timeZone: TZ });
    const entry = map.get(key) || { pickup: 0, dropoff: 0 };
    series.push({
      date: key,
      label: d.toLocaleDateString("vi-VN", {
        timeZone: TZ,
        day: "2-digit",
        month: "2-digit",
      }),
      pickup: entry.pickup,
      dropoff: entry.dropoff,
      total: entry.pickup + entry.dropoff,
    });
  }
  return series;
};

/** Phân bố lịch hẹn hôm nay theo khung giờ — để công ty biết giờ nào đang dồn xe. */
const getTodaySlots = async (
  driverIds: mongoose.Types.ObjectId[],
  todayStart: Date,
) => {
  const rows = await Appointment.aggregate([
    {
      $match: {
        isDeleted: false,
        driverId: { $in: driverIds },
        status: { $ne: "Cancelled" },
        scheduledDate: { $gte: todayStart, $lte: endOfDay(todayStart) },
      },
    },
    { $group: { _id: "$timeSlot", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  return rows.map((r) => ({ slot: r._id as string, count: r.count as number }));
};

/** Lịch hẹn sắp tới (từ hôm nay trở đi, chưa hủy/chưa xong). */
const getUpcoming = async (
  driverIds: mongoose.Types.ObjectId[],
  todayStart: Date,
) => {
  const rows = await Appointment.find({
    isDeleted: false,
    driverId: { $in: driverIds },
    status: { $in: ["Pending", "Confirmed"] },
    scheduledDate: { $gte: todayStart },
  })
    .populate("driverId", "driverName driverPhone driverId")
    .sort({ scheduledDate: 1, timeSlot: 1 })
    .limit(UPCOMING_LIMIT)
    .lean();

  return rows.map((a: any) => ({
    _id: a._id,
    containerNo: a.containerNo,
    truckPlate: a.truckPlate,
    purpose: a.purpose,
    status: a.status,
    scheduledDate: a.scheduledDate,
    timeSlot: a.timeSlot,
    driverName: a.driverId?.driverName || null,
    driverPhone: a.driverId?.driverPhone || null,
  }));
};

/**
 * Lượt qua cổng gần nhất của đội xe công ty.
 *
 * Dùng appointmentId để chặn phạm vi thay vì biển số: biển số là chuỗi tự do do
 * camera đọc, trùng biển với công ty khác là lọt dữ liệu sang nhau.
 */
const getRecentGateActivity = async (
  driverIds: mongoose.Types.ObjectId[],
) => {
  const appointments = await Appointment.find({
    isDeleted: false,
    driverId: { $in: driverIds },
  })
    .select("_id containerNo truckPlate purpose")
    .lean();

  if (appointments.length === 0) return [];

  const infoMap = new Map(appointments.map((a: any) => [String(a._id), a]));

  const rows = await GateTransaction.find({
    isDeleted: false,
    appointmentId: { $in: appointments.map((a) => a._id) },
  })
    .populate("gateId", "name gateType")
    .populate("yardId", "name")
    .sort({ updatedAt: -1 })
    .limit(ACTIVITY_LIMIT)
    .lean();

  return rows.map((t: any) => {
    const info = infoMap.get(String(t.appointmentId));
    const isOut = t.status === "out";
    return {
      _id: t._id,
      // status "out" nghĩa là xe đã rời cảng -> mốc thời gian đúng là checkOutTime.
      at: isOut ? t.checkOutTime || t.updatedAt : t.checkInTime || t.createdAt,
      direction: isOut ? "out" : "in",
      containerNo: t.actualContainerNo || info?.containerNo || null,
      truckPlate: t.actualTruckPlate || info?.truckPlate || null,
      purpose: info?.purpose || null,
      gateName: t.gateId?.name || null,
      yardName: t.yardId?.name || null,
      assignedSlot: t.assignedSlot || null,
    };
  });
};

/**
 * Container của công ty hiện đang nằm trong cảng.
 *
 * "Của công ty" ở đây hiểu là container đang được một lịch hẹn của công ty
 * tham chiếu tới — hệ thống không có quan hệ sở hữu container ↔ doanh nghiệp
 * (container thuộc hãng tàu), nên đây là cách gần đúng duy nhất đúng nghiệp vụ.
 */
const getContainersInPort = async (driverIds: mongoose.Types.ObjectId[]) => {
  const numbers = await Appointment.distinct("containerNo", {
    isDeleted: false,
    driverId: { $in: driverIds },
  });
  if (numbers.length === 0) {
    return { inPort: 0, items: [] as any[] };
  }

  const rows = await Container.find({
    isDeleted: false,
    number: { $in: numbers },
    portStatus: { $in: ["Đã nhập cảng", "Đang lưu bãi"] },
  })
    .select("number type status portStatus updatedAt")
    .sort({ updatedAt: -1 })
    .limit(10)
    .lean();

  return { inPort: rows.length, items: rows };
};

/** Cảnh báo cần doanh nghiệp xử lý. */
const getAlerts = async (
  driverIds: mongoose.Types.ObjectId[],
  companyId: string,
  todayStart: Date,
) => {
  const warnBefore = new Date(Date.now() - PENDING_WARN_HOURS * 3600 * 1000);

  const [stalePending, todayPending, driversNoAccount, inactiveDrivers] =
    await Promise.all([
      Appointment.countDocuments({
        isDeleted: false,
        driverId: { $in: driverIds },
        status: "Pending",
        createdAt: { $lte: warnBefore },
      }),
      Appointment.countDocuments({
        isDeleted: false,
        driverId: { $in: driverIds },
        status: "Pending",
        scheduledDate: { $gte: todayStart, $lte: endOfDay(todayStart) },
      }),
      Driver.countDocuments({
        companyId,
        isDeleted: false,
        $or: [{ email: { $exists: false } }, { email: null }],
      }),
      Driver.countDocuments({ companyId, isDeleted: false, status: "Inactive" }),
    ]);

  const alerts: {
    key: string;
    severity: "warning" | "error" | "info";
    title: string;
    message: string;
    link: string;
  }[] = [];

  if (todayPending > 0) {
    alerts.push({
      key: "today-pending",
      severity: "warning",
      title: `${todayPending} lịch hẹn hôm nay chưa được duyệt`,
      message: "Xe có thể bị từ chối tại cổng nếu lịch hẹn chưa được phê duyệt.",
      link: "/client/company/appointments",
    });
  }
  if (stalePending > 0) {
    alerts.push({
      key: "stale-pending",
      severity: "info",
      title: `${stalePending} lịch hẹn chờ duyệt quá ${PENDING_WARN_HOURS} giờ`,
      message: "Liên hệ ban quản lý cảng nếu cần xử lý gấp.",
      link: "/client/company/appointments",
    });
  }
  if (driversNoAccount > 0) {
    alerts.push({
      key: "driver-no-account",
      severity: "info",
      title: `${driversNoAccount} tài xế chưa có tài khoản ứng dụng`,
      message: "Tài xế không có email sẽ không đăng nhập được app để nhận mã QR.",
      link: "/client/company/drivers",
    });
  }
  if (inactiveDrivers > 0) {
    alerts.push({
      key: "driver-inactive",
      severity: "info",
      title: `${inactiveDrivers} tài xế đang ngừng hoạt động`,
      message: "Tài xế ở trạng thái Inactive không thể được gán vào lịch hẹn mới.",
      link: "/client/company/drivers",
    });
  }

  return alerts;
};

/** Gom toàn bộ số liệu cho một lần gọi API. */
export const buildCompanyDashboard = async (companyId: string) => {
  const todayStart = startOfToday();
  const driverIds = await getDriverIds(companyId);

  const monthStart = new Date(todayStart);
  monthStart.setDate(1);

  const [
    company,
    today,
    month,
    allTime,
    trend,
    todaySlots,
    upcoming,
    activity,
    containers,
    alerts,
    driverStats,
    truckCount,
  ] = await Promise.all([
    Company.findById(companyId).select("companyName companyCode").lean(),
    countByStatus(driverIds, { from: todayStart, to: endOfDay(todayStart) }),
    countByStatus(driverIds, { from: monthStart, to: endOfDay(todayStart) }),
    countByStatus(driverIds),
    getWeeklyTrend(driverIds, todayStart),
    getTodaySlots(driverIds, todayStart),
    getUpcoming(driverIds, todayStart),
    getRecentGateActivity(driverIds),
    getContainersInPort(driverIds),
    getAlerts(driverIds, companyId, todayStart),
    Driver.aggregate([
      {
        $match: {
          companyId: new mongoose.Types.ObjectId(companyId),
          isDeleted: false,
        },
      },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Truck.countDocuments({ companyId, isDeleted: false }),
  ]);

  const driverMap: Record<string, number> = {};
  for (const r of driverStats) driverMap[r._id] = r.count;

  return {
    generatedAt: new Date(),
    company: {
      name: (company as any)?.companyName || null,
      code: (company as any)?.companyCode || null,
    },
    kpis: {
      todayTotal: today.total,
      todayPending: today.pending,
      todayConfirmed: today.confirmed,
      pendingAll: allTime.pending,
      confirmedAll: allTime.confirmed,
      completedMonth: month.completed,
      cancelledMonth: month.cancelled,
      containersInPort: containers.inPort,
    },
    fleet: {
      drivers: (driverMap["Active"] || 0) + (driverMap["Inactive"] || 0),
      driversActive: driverMap["Active"] || 0,
      driversInactive: driverMap["Inactive"] || 0,
      trucks: truckCount,
    },
    charts: {
      weeklyTrend: trend,
      todaySlots,
      statusBreakdown: [
        { status: "Pending", label: "Chờ duyệt", count: allTime.pending },
        { status: "Confirmed", label: "Đã duyệt", count: allTime.confirmed },
        { status: "Completed", label: "Hoàn thành", count: allTime.completed },
        { status: "Cancelled", label: "Đã hủy", count: allTime.cancelled },
      ],
    },
    upcomingAppointments: upcoming,
    recentActivity: activity,
    containersInPort: containers.items,
    alerts,
  };
};
