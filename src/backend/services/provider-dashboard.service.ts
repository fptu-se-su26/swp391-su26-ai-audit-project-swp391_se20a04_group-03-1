import mongoose from "mongoose";
import { Container } from "../models/container.model";
import { ContainerProvider } from "../models/container-provider.model";
import { GateTransaction } from "../models/gateTransaction.model";
import { Appointment } from "../models/appointment.model";

/**
 * Số liệu cho trang /client/provider/dashboard và /client/provider/history.
 *
 * Phạm vi: hãng tàu chỉ được nhìn container của MÌNH (`Container.providerId`).
 *
 * Cách nối sang lượt qua cổng — điểm cần biết trước khi sửa file này:
 * `GateTransaction` CÓ trường `providerId` nhưng không controller nào ghi vào
 * (kiểm tra lại bằng cách tìm "providerId" trong thư mục controllers), nên
 * trường đó luôn rỗng và KHÔNG dùng để lọc được. Ta phải nối qua chuỗi:
 * `Container.number` ↔ `GateTransaction.actualContainerNo`. Đây cũng là cách
 * scan.controller đang dùng để cập nhật trạng thái cảng.
 */

const TZ = "Asia/Ho_Chi_Minh";
const TREND_DAYS = 7;
const ACTIVITY_LIMIT = 8;
/** Container còn nằm trong bãi quá số giờ này thì nhắc hãng tàu điều chuyển. */
const OVERSTAY_HOURS = 48;
/** Mã BIC theo chuẩn ISO 6346 là 4 chữ cái đầu của số container. */
const BIC_LENGTH = 4;

export const PORT_STATUS_ORDER = [
  "Chưa nhập cảng",
  "Đã nhập cảng",
  "Đang lưu bãi",
  "Đã xuất cảng",
] as const;

/** Mốc 00:00 hôm nay theo giờ Việt Nam. */
const startOfToday = (): Date => {
  const vn = new Date().toLocaleString("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [m, d, y] = vn.split("/");
  return new Date(`${y}-${m}-${d}T00:00:00.000+07:00`);
};

const endOfDay = (start: Date) => new Date(start.getTime() + 24 * 3600 * 1000 - 1);

/**
 * Danh sách số container của hãng tàu — chìa khóa để lọc lượt qua cổng.
 *
 * Trả cả mảng vì phải dùng cho `$in`. Với quy mô cảng trong đề tài (vài nghìn
 * container mỗi hãng) thì chấp nhận được; nếu sau này phình to thì nên bổ sung
 * ghi `providerId` vào GateTransaction lúc check-in rồi lọc thẳng theo id.
 */
const getContainerNumbers = async (providerId: string) =>
  Container.distinct("number", {
    providerId: new mongoose.Types.ObjectId(providerId),
    isDeleted: false,
  });

/** Đếm container theo tình trạng hàng, trạng thái cảng và loại. */
const getInventory = async (providerId: string) => {
  const match = {
    providerId: new mongoose.Types.ObjectId(providerId),
    isDeleted: false,
  };

  const [byStatus, byPortStatus, byType, total, trashed] = await Promise.all([
    Container.aggregate([
      { $match: match },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Container.aggregate([
      { $match: match },
      { $group: { _id: "$portStatus", count: { $sum: 1 } } },
    ]),
    Container.aggregate([
      { $match: match },
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]),
    Container.countDocuments(match),
    Container.countDocuments({ ...match, isDeleted: true }),
  ]);

  const statusMap: Record<string, number> = {};
  for (const r of byStatus) statusMap[r._id] = r.count;

  const portMap: Record<string, number> = {};
  for (const r of byPortStatus) portMap[r._id] = r.count;

  return {
    total,
    trashed,
    laden: statusMap["Hàng"] || 0,
    empty: statusMap["Rỗng"] || 0,
    // Giữ đúng thứ tự vòng đời container thay vì thứ tự Mongo trả về, để cột
    // trên biểu đồ không nhảy chỗ giữa các lần tải.
    byPortStatus: PORT_STATUS_ORDER.map((s) => ({
      portStatus: s,
      count: portMap[s] || 0,
    })),
    byType: byType.map((r) => ({ type: r._id || "Không rõ", count: r.count })),
    inPort: (portMap["Đã nhập cảng"] || 0) + (portMap["Đang lưu bãi"] || 0),
    inYard: portMap["Đang lưu bãi"] || 0,
  };
};

/** Lượt vào và lượt ra trong ngày hôm nay. */
const getTodayTraffic = async (numbers: string[], todayStart: Date) => {
  if (numbers.length === 0) return { gateIn: 0, gateOut: 0 };
  const range = { $gte: todayStart, $lte: endOfDay(todayStart) };
  const [gateIn, gateOut] = await Promise.all([
    GateTransaction.countDocuments({
      isDeleted: false,
      actualContainerNo: { $in: numbers },
      checkInTime: range,
    }),
    GateTransaction.countDocuments({
      isDeleted: false,
      actualContainerNo: { $in: numbers },
      checkOutTime: range,
    }),
  ]);
  return { gateIn, gateOut };
};

/** Lượt vào/ra mỗi ngày trong 7 ngày gần nhất. */
const getWeeklyTrend = async (numbers: string[], todayStart: Date) => {
  const from = new Date(
    todayStart.getTime() - (TREND_DAYS - 1) * 24 * 3600 * 1000,
  );
  const to = endOfDay(todayStart);

  const bucket = (field: "checkInTime" | "checkOutTime") =>
    numbers.length === 0
      ? Promise.resolve([] as any[])
      : GateTransaction.aggregate([
          {
            $match: {
              isDeleted: false,
              actualContainerNo: { $in: numbers },
              [field]: { $gte: from, $lte: to },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: `$${field}`,
                  timezone: TZ,
                },
              },
              count: { $sum: 1 },
            },
          },
        ]);

  const [ins, outs] = await Promise.all([
    bucket("checkInTime"),
    bucket("checkOutTime"),
  ]);

  const inMap = new Map(ins.map((r) => [r._id, r.count]));
  const outMap = new Map(outs.map((r) => [r._id, r.count]));

  // Bù ngày trống để biểu đồ luôn đủ 7 cột.
  const series = [];
  for (let i = 0; i < TREND_DAYS; i++) {
    const d = new Date(from.getTime() + i * 24 * 3600 * 1000);
    const key = d.toLocaleDateString("en-CA", { timeZone: TZ });
    const gateIn = inMap.get(key) || 0;
    const gateOut = outMap.get(key) || 0;
    series.push({
      date: key,
      label: d.toLocaleDateString("vi-VN", {
        timeZone: TZ,
        day: "2-digit",
        month: "2-digit",
      }),
      gateIn,
      gateOut,
      total: gateIn + gateOut,
    });
  }
  return series;
};

/**
 * Lượt qua cổng của container thuộc hãng tàu.
 *
 * Dùng chung cho khối "hoạt động gần nhất" trên dashboard và cho trang lịch sử
 * giao dịch (có phân trang) — cùng một định nghĩa dữ liệu, tránh hai nơi hiểu
 * khác nhau về "giao dịch của hãng tàu".
 */
export const listProviderTransactions = async (
  numbers: string[],
  options: { skip?: number; limit?: number; search?: string; direction?: string } = {},
) => {
  if (numbers.length === 0) return { rows: [], total: 0 };

  const { skip = 0, limit = ACTIVITY_LIMIT, search, direction } = options;

  const query: any = { isDeleted: false, actualContainerNo: { $in: numbers } };

  if (search) {
    const regex = new RegExp(String(search).trim(), "i");
    // Vẫn giữ ràng buộc $in ở trên: $or chỉ thu hẹp thêm trong phạm vi container
    // của hãng tàu, không được phép mở rộng ra ngoài.
    query.$or = [{ actualContainerNo: regex }, { actualTruckPlate: regex }];
  }
  if (direction === "in") query.status = "in";
  if (direction === "out") query.status = "out";

  const [rows, total] = await Promise.all([
    GateTransaction.find(query)
      .populate("gateId", "name type")
      .populate("yardId", "name")
      .populate({
        path: "appointmentId",
        select: "purpose containerNo driverId",
        populate: { path: "driverId", select: "driverName companyId", populate: { path: "companyId", select: "companyName" } },
      })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    GateTransaction.countDocuments(query),
  ]);

  const mapped = rows.map((t: any) => {
    const isOut = t.status === "out";
    return {
      _id: t._id,
      // status "out" nghĩa là xe đã rời cảng -> mốc đúng là checkOutTime.
      at: isOut ? t.checkOutTime || t.updatedAt : t.checkInTime || t.createdAt,
      direction: isOut ? "out" : "in",
      containerNo: t.actualContainerNo || null,
      truckPlate: t.actualTruckPlate || null,
      purpose: t.appointmentId?.purpose || null,
      driverName: t.appointmentId?.driverId?.driverName || null,
      companyName: t.appointmentId?.driverId?.companyId?.companyName || null,
      gateName: t.gateId?.name || null,
      yardName: t.yardId?.name || null,
      assignedSlot: t.assignedSlot || null,
      ocrConfidence: t.ocrConfidence ?? null,
    };
  });

  return { rows: mapped, total };
};

/**
 * Container mang mã BIC chưa khai báo trong cài đặt.
 *
 * Có ý nghĩa thật: mã BIC là phần hãng tàu tự cấu hình ở trang Cài đặt, nếu
 * khai thiếu thì container của chính họ sẽ không được nhận diện đúng chủ sở hữu.
 */
const getBicCoverage = async (providerId: string, bicCodes: string[]) => {
  const rows = await Container.aggregate([
    {
      $match: {
        providerId: new mongoose.Types.ObjectId(providerId),
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: { $substrCP: ["$number", 0, BIC_LENGTH] },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  const declared = new Set(bicCodes.map((c) => c.toUpperCase()));
  const used = rows.map((r) => ({
    code: String(r._id || "").toUpperCase(),
    count: r.count as number,
    declared: declared.has(String(r._id || "").toUpperCase()),
  }));

  return {
    used,
    undeclared: used.filter((u) => !u.declared),
    // Mã đã khai nhưng chưa có container nào dùng — không phải lỗi, chỉ để hãng
    // tàu tự soát lại xem có khai nhầm không.
    unusedDeclared: bicCodes
      .map((c) => c.toUpperCase())
      .filter((c) => !used.some((u) => u.code === c)),
  };
};

/** Container còn nằm trong bãi quá lâu. */
const getOverstay = async (numbers: string[]) => {
  if (numbers.length === 0) return { count: 0, items: [] as any[] };
  const limitTime = new Date(Date.now() - OVERSTAY_HOURS * 3600 * 1000);

  const rows = await GateTransaction.find({
    isDeleted: false,
    status: "in",
    actualContainerNo: { $in: numbers },
    checkInTime: { $lte: limitTime },
  })
    .populate("yardId", "name")
    .sort({ checkInTime: 1 })
    .limit(10)
    .lean();

  return {
    count: rows.length,
    items: rows.map((t: any) => ({
      _id: t._id,
      containerNo: t.actualContainerNo,
      checkInTime: t.checkInTime,
      hours: t.checkInTime
        ? Math.floor((Date.now() - new Date(t.checkInTime).getTime()) / 3600000)
        : null,
      yardName: t.yardId?.name || null,
      assignedSlot: t.assignedSlot || null,
    })),
  };
};

/** Lịch hẹn sắp tới có liên quan tới container của hãng tàu. */
const getUpcomingAppointments = async (numbers: string[], todayStart: Date) => {
  if (numbers.length === 0) return [];
  const rows = await Appointment.find({
    isDeleted: false,
    containerNo: { $in: numbers },
    status: { $in: ["Pending", "Confirmed"] },
    scheduledDate: { $gte: todayStart },
  })
    .populate({
      path: "driverId",
      select: "driverName companyId",
      populate: { path: "companyId", select: "companyName" },
    })
    .sort({ scheduledDate: 1, timeSlot: 1 })
    .limit(5)
    .lean();

  return rows.map((a: any) => ({
    _id: a._id,
    containerNo: a.containerNo,
    truckPlate: a.truckPlate,
    purpose: a.purpose,
    status: a.status,
    scheduledDate: a.scheduledDate,
    timeSlot: a.timeSlot,
    companyName: a.driverId?.companyId?.companyName || null,
  }));
};

const buildAlerts = (
  bic: Awaited<ReturnType<typeof getBicCoverage>>,
  bicCodes: string[],
  overstayCount: number,
  trashed: number,
) => {
  const alerts: {
    key: string;
    severity: "warning" | "error" | "info";
    title: string;
    message: string;
    link: string;
  }[] = [];

  if (bicCodes.length === 0) {
    alerts.push({
      key: "no-bic",
      severity: "warning",
      title: "Chưa khai báo mã BIC nào",
      message:
        "Không có mã BIC thì hệ thống không xác định được container nào thuộc hãng tàu của bạn.",
      link: "/client/provider/settings",
    });
  }
  if (bic.undeclared.length > 0) {
    const total = bic.undeclared.reduce((s, u) => s + u.count, 0);
    alerts.push({
      key: "undeclared-bic",
      severity: "warning",
      title: `${total} container mang mã BIC chưa khai báo`,
      message: `Các tiền tố chưa có trong cài đặt: ${bic.undeclared
        .map((u) => u.code)
        .join(", ")}.`,
      link: "/client/provider/settings",
    });
  }
  if (overstayCount > 0) {
    alerts.push({
      key: "overstay",
      severity: "info",
      title: `${overstayCount} container lưu bãi quá ${OVERSTAY_HOURS} giờ`,
      message: "Cân nhắc điều chuyển để tránh phát sinh phí lưu bãi.",
      link: "/client/provider/history",
    });
  }
  if (trashed > 0) {
    alerts.push({
      key: "trashed",
      severity: "info",
      title: `${trashed} container đang trong thùng rác`,
      message: "Khôi phục nếu xóa nhầm, hoặc xóa vĩnh viễn để dọn danh sách.",
      link: "/client/provider/containers/trash",
    });
  }

  return alerts;
};

/** Gom toàn bộ số liệu cho một lần gọi API. */
export const buildProviderDashboard = async (providerId: string) => {
  const todayStart = startOfToday();

  const [provider, numbers] = await Promise.all([
    ContainerProvider.findById(providerId).select("name code bic_codes").lean(),
    getContainerNumbers(providerId),
  ]);

  const bicCodes: string[] = ((provider as any)?.bic_codes || []) as string[];

  const [inventory, todayTraffic, trend, activity, bic, overstay, upcoming] =
    await Promise.all([
      getInventory(providerId),
      getTodayTraffic(numbers, todayStart),
      getWeeklyTrend(numbers, todayStart),
      listProviderTransactions(numbers, { limit: ACTIVITY_LIMIT }),
      getBicCoverage(providerId, bicCodes),
      getOverstay(numbers),
      getUpcomingAppointments(numbers, todayStart),
    ]);

  return {
    generatedAt: new Date(),
    provider: {
      name: (provider as any)?.name || null,
      code: (provider as any)?.code || null,
      bicCodes,
    },
    kpis: {
      totalContainers: inventory.total,
      empty: inventory.empty,
      laden: inventory.laden,
      inPort: inventory.inPort,
      inYard: inventory.inYard,
      gateInToday: todayTraffic.gateIn,
      gateOutToday: todayTraffic.gateOut,
      overstay: overstay.count,
    },
    charts: {
      weeklyTrend: trend,
      byPortStatus: inventory.byPortStatus,
      byType: inventory.byType,
    },
    bic,
    recentActivity: activity.rows,
    overstayItems: overstay.items,
    upcomingAppointments: upcoming,
    alerts: buildAlerts(bic, bicCodes, overstay.count, inventory.trashed),
  };
};

/** Lịch sử giao dịch có phân trang cho trang /client/provider/history. */
export const buildProviderHistory = async (
  providerId: string,
  options: { page: number; limit: number; search?: string; direction?: string },
) => {
  const numbers = await getContainerNumbers(providerId);
  const limit = Math.min(Math.max(options.limit, 1), 100);
  const page = Math.max(options.page, 1);

  const { rows, total } = await listProviderTransactions(numbers, {
    skip: (page - 1) * limit,
    limit,
    search: options.search,
    direction: options.direction,
  });

  return {
    data: rows,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit) || 1,
      totalItems: total,
      limit,
    },
  };
};
