import { Appointment } from "../models/appointment.model";
import { GateTransaction } from "../models/gateTransaction.model";
import {
  buildCompletionReceiptPdf,
  pdfToBuffer,
  CompletionReceiptData,
} from "./ticket.service";
import {
  sendMailWithAttachments,
  buildCompletionReceiptEmail,
} from "../helpers/mail.helper";

/**
 * Gửi phiếu hoàn thành giao nhận (PDF) về email doanh nghiệp khi một lịch hẹn
 * chuyển sang Completed — xảy ra ở MỌI phương pháp check-out:
 *   - Camera AI quét ở cổng ra (scan.controller).
 *   - Quét QR bằng app quản lý cổng (mobile/gate.controller).
 *   - Check-out thủ công từ nhật ký (scan.controller.manualCheckoutPatch).
 *
 * Thiết kế để gọi kiểu "bắn rồi quên": mọi lỗi được nuốt + log, không bao giờ
 * làm hỏng luồng cổng. Vì vậy caller nên `void sendCompletionReceipt(...)`.
 */

// Nhãn hình thức hoàn thành, in trong phiếu.
export type CompletionMethod = "camera" | "qr" | "manual";
const METHOD_LABEL: Record<CompletionMethod, string> = {
  camera: "Camera AI",
  qr: "Quét QR (app quản lý cổng)",
  manual: "Check-out thủ công",
};

const fmtDateTime = (d?: Date | null): string =>
  d
    ? new Date(d).toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

export const sendCompletionReceipt = async (input: {
  appointmentId: string;
  transactionId?: string;
  method: CompletionMethod;
}): Promise<void> => {
  try {
    const appointment: any = await Appointment.findById(input.appointmentId)
      .populate({
        path: "driverId",
        select: "driverName driverPhone companyId",
        populate: { path: "companyId", select: "companyName email" },
      })
      .lean();

    if (!appointment) {
      console.warn(
        `[Receipt] Không tìm thấy lịch hẹn ${input.appointmentId} để gửi phiếu`,
      );
      return;
    }

    const driver = appointment.driverId || {};
    const company = driver.companyId || {};
    const email: string | undefined = company.email;
    if (!email) {
      // Không có email doanh nghiệp thì không có nơi gửi — bỏ qua trong im lặng.
      console.warn(
        `[Receipt] Lịch hẹn ${input.appointmentId} không có email doanh nghiệp, bỏ qua gửi phiếu`,
      );
      return;
    }

    // Lấy transaction để có giờ vào/ra + ô đỗ. Ưu tiên id truyền vào, nếu không
    // thì tra transaction gần nhất theo lịch hẹn.
    let tx: any = null;
    if (input.transactionId) {
      tx = await GateTransaction.findById(input.transactionId)
        .populate({ path: "yardId", select: "name" })
        .lean();
    }
    if (!tx) {
      tx = await GateTransaction.findOne({ appointmentId: appointment._id })
        .sort({ updatedAt: -1 })
        .populate({ path: "yardId", select: "name" })
        .lean();
    }

    const receiptCode = String(appointment._id).slice(-8).toUpperCase();
    const checkOutTime: Date | undefined = tx?.checkOutTime || new Date();

    const data: CompletionReceiptData = {
      receiptCode,
      companyName: company.companyName,
      truckPlate: appointment.truckPlate,
      containerNo: tx?.actualContainerNo || appointment.containerNo,
      driverName: driver.driverName || "—",
      driverPhone: driver.driverPhone || "—",
      purpose: appointment.purpose,
      scheduledDate: appointment.scheduledDate,
      timeSlot: appointment.timeSlot,
      checkInTime: tx?.checkInTime,
      checkOutTime,
      yardName: tx?.yardId?.name,
      slotName: tx?.assignedSlot,
      method: METHOD_LABEL[input.method],
    };

    const pdfBuffer = await pdfToBuffer(buildCompletionReceiptPdf(data));

    const html = buildCompletionReceiptEmail({
      companyName: company.companyName,
      truckPlate: data.truckPlate,
      containerNo: data.containerNo,
      purpose: data.purpose,
      timeSlot: data.timeSlot,
      checkOutTimeText: fmtDateTime(checkOutTime),
      receiptCode,
    });

    await sendMailWithAttachments(
      email,
      `LogiPort — Phiếu hoàn thành giao nhận (${receiptCode})`,
      html,
      [
        {
          filename: `phieu-hoan-thanh-${receiptCode}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    );

    console.log(
      `[Receipt] Đã gửi phiếu hoàn thành ${receiptCode} tới ${email}`,
    );
  } catch (err) {
    console.error("[Receipt] Gửi phiếu hoàn thành thất bại:", err);
  }
};
