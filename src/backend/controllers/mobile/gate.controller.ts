import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Appointment } from "../../models/appointment.model";
import { Driver } from "../../models/driver.model";

// POST /api/mobile/gate/scan  (requireMobileAuth + role gate_manager)
// Fallback thủ công khi AI quét cổng không xử lý được.
// Body: { qrToken }
export const scanPost = async (req: Request, res: Response) => {
  try {
    const { qrToken } = req.body;

    if (!qrToken || typeof qrToken !== "string") {
      return res.status(400).json({
        code: "error",
        message: "Thiếu mã QR",
        data: { valid: false },
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
    const appt = await Appointment.findOne({
      _id: decoded.apptId,
      isDeleted: false,
    });
    if (!appt) {
      return res.status(200).json({
        code: "error",
        message: "Không tìm thấy lịch hẹn tương ứng",
        data: { valid: false, reason: "NOT_FOUND" },
      });
    }

    // 3. Kiểm tra trạng thái hợp lệ để cho vào cổng.
    if (appt.status === "Cancelled") {
      return res.status(200).json({
        code: "error",
        message: "Lịch hẹn đã bị hủy — không được phép vào",
        data: { valid: false, reason: "CANCELLED" },
      });
    }
    if (appt.status === "Completed") {
      return res.status(200).json({
        code: "error",
        message: "Lịch hẹn đã hoàn tất trước đó",
        data: { valid: false, reason: "COMPLETED" },
      });
    }

    const driver = await Driver.findById(appt.driverId).select(
      "driverId driverName driverPhone",
    );

    // 4. Hợp lệ: chuyển Pending -> Confirmed (đánh dấu đã cho vào cổng).
    const previousStatus = appt.status;
    if (appt.status === "Pending") {
      appt.status = "Confirmed";
      await appt.save();
    }

    return res.status(200).json({
      code: "success",
      message: "Mã QR hợp lệ — Cho phép vào cổng",
      data: {
        valid: true,
        previousStatus,
        appointment: {
          id: appt._id,
          code: String(appt._id).slice(-6).toUpperCase(),
          truckPlate: appt.truckPlate,
          containerNo: appt.containerNo,
          scheduledDate: appt.scheduledDate,
          timeSlot: appt.timeSlot,
          purpose: appt.purpose,
          status: appt.status,
        },
        driver: driver
          ? {
              driverId: driver.driverId,
              fullName: driver.driverName,
              phone: driver.driverPhone,
            }
          : null,
        // Appointment chưa liên kết yard/ô đỗ trong pass này.
        yard: null,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      code: "error",
      message: "Không thể xử lý quét cổng",
      data: { valid: false },
    });
  }
};
