import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Appointment } from "../../models/appointment.model";
import { Driver } from "../../models/driver.model";
import { GateTransaction } from "../../models/gateTransaction.model";
import { processGateQrScan } from "../../services/gate-passage.service";

// POST /api/mobile/gate/scan  (requireMobileAuth + role gate_manager)
// Fallback khi AI quét cổng không xử lý được: quét mã QR của tài xế để xác thực
// rồi xử lý ĐẦY ĐỦ như camera — tự suy ra check-in/check-out theo trạng thái.
// Body: { qrToken }
export const scanPost = async (req: Request, res: Response) => {
  try {
    const { qrToken } = req.body;

    if (!qrToken || typeof qrToken !== "string") {
      return res.status(400).json({
        code: "error",
        message: "Thiếu mã QR",
        data: { valid: false, reason: "INVALID_TOKEN" },
      });
    }

    // 1. Xác thực chữ ký + hạn của token.
    let decoded: any;
    try {
      decoded = jwt.verify(qrToken, process.env.JWT_SECRET as string);
    } catch {
      return res.status(200).json({
        code: "error",
        message: "Mã QR không hợp lệ hoặc đã hết hạn",
        data: { valid: false, reason: "INVALID_TOKEN" },
      });
    }

    if (decoded?.typ !== "appt-qr" || !decoded?.apptId) {
      return res.status(200).json({
        code: "error",
        message: "Mã QR không đúng định dạng",
        data: { valid: false, reason: "WRONG_TYPE" },
      });
    }

    // 2. Load lịch hẹn + tài xế.
    const appointment: any = await Appointment.findOne({
      _id: decoded.apptId,
      isDeleted: false,
    }).populate("driverId", "driverId driverName driverPhone");
    if (!appointment) {
      return res.status(200).json({
        code: "error",
        message: "Không tìm thấy lịch hẹn tương ứng",
        data: { valid: false, reason: "NOT_FOUND" },
      });
    }

    // 3. Chặn theo trạng thái lịch hẹn.
    if (appointment.status === "Cancelled") {
      return res.status(200).json({
        code: "error",
        message: "Lịch hẹn đã bị hủy — không được phép vào",
        data: { valid: false, reason: "CANCELLED" },
      });
    }
    if (appointment.status === "Completed") {
      return res.status(200).json({
        code: "error",
        message: "Lịch hẹn đã hoàn tất trước đó",
        data: { valid: false, reason: "COMPLETED" },
      });
    }
    // Chỉ lịch hẹn ĐÃ DUYỆT mới được qua cổng — giống camera (chỉ xét Confirmed).
    if (appointment.status !== "Confirmed") {
      return res.status(200).json({
        code: "error",
        message: "Lịch hẹn chưa được duyệt — không thể qua cổng",
        data: { valid: false, reason: "NOT_CONFIRMED" },
      });
    }

    // 4. Kiểm tra khung giờ (đệm ±30 phút, y như camera).
    if (!isWithinTimeWindow(appointment)) {
      return res.status(200).json({
        code: "error",
        message: `Chưa tới hoặc đã quá khung giờ lịch hẹn (${appointment.timeSlot})`,
        data: { valid: false, reason: "OUT_OF_WINDOW" },
      });
    }

    // 5. Xử lý qua cổng (tự suy ra check-in/check-out).
    const result = await processGateQrScan(appointment);

    // Bãi đầy khi check-in: hợp lệ về mặt QR nhưng không cho vào.
    if (!result.ok) {
      return res.status(200).json({
        code: "error",
        message: result.message,
        data: {
          valid: false,
          reason: "YARD_FULL",
          direction: result.direction,
        },
      });
    }

    const driver = appointment.driverId as any;
    return res.status(200).json({
      code: "success",
      message: result.message,
      data: {
        valid: true,
        direction: result.direction,
        message: result.message,
        assignedSlot: result.assignedSlot ?? null,
        yardName: result.yardName ?? null,
        appointment: {
          id: appointment._id,
          code: String(appointment._id).slice(-6).toUpperCase(),
          truckPlate: appointment.truckPlate,
          containerNo: appointment.containerNo,
          scheduledDate: appointment.scheduledDate,
          timeSlot: appointment.timeSlot,
          purpose: appointment.purpose,
          status: appointment.status,
        },
        driver: driver
          ? {
              driverId: driver.driverId,
              fullName: driver.driverName,
              phone: driver.driverPhone,
            }
          : null,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      code: "error",
      message: "Không thể xử lý quét cổng",
      data: { valid: false, reason: "UNKNOWN" },
    });
  }
};

// GET /api/mobile/gate/history  (requireMobileAuth + role gate_manager)
// Lịch sử các lượt do CHÍNH tài khoản này quét, kèm thống kê.
//
// Truy được là nhờ nhật ký sửa đổi (models/audit.plugin.ts): mỗi lượt quét ghi
// lại người thao tác vào createdBy (lúc check-in) và updatedBy (lúc check-out).
export const historyGet = async (req: Request, res: Response) => {
  try {
    const staffId = String(req.user.id);
    const mine = {
      isDeleted: false,
      $or: [{ "createdBy.id": staffId }, { "updatedBy.id": staffId }],
    };

    const transactions: any[] = await GateTransaction.find(mine)
      .sort({ updatedAt: -1 })
      .limit(100)
      .populate({
        path: "appointmentId",
        populate: { path: "driverId", select: "driverName driverPhone" },
      })
      .populate({ path: "yardId", select: "name" })
      .lean();

    // Mốc đầu ngày theo giờ VN để đếm "hôm nay".
    const vn = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const [month, day, year] = vn.split("/");
    const todayStart = new Date(`${year}-${month}-${day}T00:00:00.000+07:00`);
    const isToday = (d?: Date | string | null) =>
      !!d && new Date(d).getTime() >= todayStart.getTime();

    const items = transactions.map((tx) => {
      const appt = tx.appointmentId || {};
      return {
        id: String(tx._id),
        truckPlate: tx.actualTruckPlate || appt.truckPlate || "—",
        containerNo: tx.actualContainerNo || appt.containerNo || "—",
        driverName: appt.driverId?.driverName || "—",
        purpose: appt.purpose || "—",
        timeSlot: appt.timeSlot || "—",
        appointmentStatus: appt.status || "—",
        assignedSlot: tx.assignedSlot || null,
        yardName: tx.yardId?.name || null,
        checkInTime: tx.checkInTime || null,
        checkOutTime: tx.checkOutTime || null,
        // "in" = còn trong bãi, "out" = đã rời cảng.
        status: tx.status || "in",
      };
    });

    const stats = {
      total: items.length,
      checkInToday: items.filter((i) => isToday(i.checkInTime)).length,
      checkOutToday: items.filter((i) => isToday(i.checkOutTime)).length,
      stillInside: items.filter((i) => i.status === "in").length,
    };

    return res.status(200).json({ code: "success", data: { stats, items } });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ code: "error", message: "Không thể lấy lịch sử quét" });
  }
};

// Lịch hẹn có nằm trong khung giờ cho phép (đệm 30 phút hai đầu) không.
const isWithinTimeWindow = (appointment: any): boolean => {
  try {
    const appointmentDate = new Date(appointment.scheduledDate);
    const [start, end] = String(appointment.timeSlot).split("-");

    const startTime = new Date(appointmentDate);
    const [startH, startM] = start.split(":");
    startTime.setHours(parseInt(startH), parseInt(startM), 0, 0);

    const endTime = new Date(appointmentDate);
    const [endH, endM] = end.split(":");
    endTime.setHours(parseInt(endH), parseInt(endM), 0, 0);

    // Khung giờ vắt qua nửa đêm (vd 23:00-00:00): giờ kết thúc sang ngày hôm sau.
    if (endTime <= startTime) {
      endTime.setDate(endTime.getDate() + 1);
    }

    const validStart = new Date(startTime.getTime() - 30 * 60000);
    const validEnd = new Date(endTime.getTime() + 30 * 60000);
    const now = new Date();
    return now >= validStart && now <= validEnd;
  } catch {
    // Không phân tích được khung giờ thì không chặn — để nghiệp vụ chạy tiếp.
    return true;
  }
};
