import { GateTransaction } from "../models/gateTransaction.model";
import { io } from "../index";
import { assignRandomFreeSlot } from "./yard-slot.service";
import { syncContainerPortStatus } from "./container-port-status.service";
import { notify } from "./notification.service";
import { publishGateOpen, publishAnnounce } from "./mqtt.service";
import { sendCompletionReceipt } from "./receipt.service";

/**
 * Xử lý một lượt qua cổng bằng QR (fallback khi camera AI hỏng), tái hiện đúng
 * nghiệp vụ của camera nhưng bỏ qua bước OCR — bản thân mã QR đã là chứng thực
 * đáng tin của lịch hẹn.
 *
 * Chiều qua cổng được suy ra từ trạng thái thực tế, KHÔNG do người quét chọn:
 *   - Chưa có transaction đang "in" cho lịch hẹn  -> CHECK-IN.
 *   - Đã có transaction đang "in"                 -> CHECK-OUT.
 * Nhờ vậy quy tắc "phải check-in xong mới được check-out" được đảm bảo tự nhiên:
 * quét lần đầu = vào, quét lần hai = ra, quét lần ba thì lịch hẹn đã Completed
 * nên controller đã chặn từ trước.
 *
 * Cùng dùng chung các dịch vụ với camera (cấp ô, đồng bộ trạng thái cảng, thông
 * báo, MQTT mở cổng/loa, gửi phiếu hoàn thành) để hai đường đi cho kết quả
 * giống hệt nhau.
 */

export interface GatePassageResult {
  ok: boolean;
  direction: "in" | "out";
  code: "success" | "ignored";
  message: string;
  assignedSlot?: string | null;
  yardName?: string | null;
  transactionId?: string;
}

// Mốc đầu ngày theo giờ VN — để đếm "xe đã ra hôm nay" giống scan.controller.
const startOfTodayVN = (): Date => {
  const vn = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [month, day, year] = vn.split("/");
  return new Date(`${year}-${month}-${day}T00:00:00.000+07:00`);
};

// Phát cùng bộ sự kiện socket + chuông + MQTT mà camera phát, để dashboard admin
// cập nhật realtime dù lượt này đến từ app quản lý cổng.
const broadcastPassage = async (
  appointment: any,
  transaction: any,
  direction: "in" | "out",
) => {
  const todayStart = startOfTodayVN();
  const [activeVehicles, checkedOutVehicles] = await Promise.all([
    GateTransaction.countDocuments({ status: "in", isDeleted: false }),
    GateTransaction.countDocuments({
      status: "out",
      checkOutTime: { $gte: todayStart },
      isDeleted: false,
    }),
  ]);

  io.emit("gate_scan_update", {
    _id: transaction._id,
    actualTruckPlate: transaction.actualTruckPlate,
    appointmentId: {
      driverId: { driverName: (appointment.driverId as any)?.driverName },
    },
    actualContainerNo: transaction.actualContainerNo,
    checkInTime: transaction.checkInTime,
    checkOutTime: transaction.checkOutTime,
    status: direction,
    assignedSlot: transaction.assignedSlot,
    activeCount: activeVehicles,
    completedCount: checkedOutVehicles,
  });

  io.emit("gate_scan_success", {
    plate: transaction.actualTruckPlate,
    assignedSlot: transaction.assignedSlot,
    message:
      direction === "in"
        ? transaction.assignedSlot
          ? `Check-in (QR) thành công. Xe vào ô ${transaction.assignedSlot}.`
          : "Check-in (QR) thành công"
        : "Check-out (QR) thành công",
  });

  void notify({
    type: "gate",
    severity: "success",
    title: direction === "in" ? "Xe vào cảng (QR)" : "Xe rời cảng (QR)",
    message:
      direction === "in"
        ? `${transaction.actualTruckPlate} đã check-in bằng QR${
            transaction.assignedSlot ? `, vào ô ${transaction.assignedSlot}` : ""
          }.`
        : `${transaction.actualTruckPlate} đã check-out bằng QR.`,
    link: `/admin/gate/logs/${transaction._id}`,
    dedupeKey: `gate-qr:${transaction._id}:${direction}`,
  });

  try {
    const p = appointment.truckPlate || "";
    const c = appointment.containerNo || "";
    publishGateOpen(direction, p, c);
    publishAnnounce(direction, p, direction === "in" ? transaction.assignedSlot : null);
  } catch (err) {
    console.error("[MQTT] Lỗi khi publish lệnh cổng/loa (QR):", err);
  }
};

export const processGateQrScan = async (
  appointment: any,
): Promise<GatePassageResult> => {
  // Transaction đang mở của CHÍNH lịch hẹn này (khớp theo appointmentId cho
  // chính xác, thay vì theo biển số như camera).
  const activeTx = await GateTransaction.findOne({
    appointmentId: appointment._id,
    status: "in",
    isDeleted: false,
  });

  // ─── CHECK-OUT ───────────────────────────────────────────────────────────
  if (activeTx) {
    activeTx.checkOutTime = new Date();
    activeTx.status = "out";
    await activeTx.save();

    await syncContainerPortStatus(
      appointment.containerNo,
      appointment.purpose,
      "out",
    );

    appointment.status = "Completed";
    await appointment.save();

    // Phiếu hoàn thành gửi doanh nghiệp (bắn rồi quên).
    void sendCompletionReceipt({
      appointmentId: String(appointment._id),
      transactionId: String(activeTx._id),
      method: "qr",
    });

    await broadcastPassage(appointment, activeTx, "out");

    return {
      ok: true,
      direction: "out",
      code: "success",
      message: "Check-out thành công — xe được phép rời cảng.",
      assignedSlot: activeTx.assignedSlot,
      transactionId: String(activeTx._id),
    };
  }

  // ─── CHECK-IN ────────────────────────────────────────────────────────────
  const slot = await assignRandomFreeSlot();
  if (!slot) {
    // Bãi đầy: không cho vào, không tạo transaction.
    return {
      ok: false,
      direction: "in",
      code: "ignored",
      message: "Bãi đỗ đã đầy, không thể cho xe vào. Vui lòng chờ có ô trống.",
    };
  }

  const transaction = new GateTransaction({
    actualTruckPlate: appointment.truckPlate,
    actualContainerNo: appointment.containerNo,
    appointmentId: appointment._id,
    yardId: slot.yardId,
    assignedSlot: slot.slotName,
    checkInTime: new Date(),
    status: "in",
  });
  await transaction.save();

  await syncContainerPortStatus(
    appointment.containerNo,
    appointment.purpose,
    "in",
  );

  await broadcastPassage(appointment, transaction, "in");

  return {
    ok: true,
    direction: "in",
    code: "success",
    message: `Check-in thành công — xe vào ô ${slot.slotName}, bãi ${slot.yardName}.`,
    assignedSlot: slot.slotName,
    yardName: slot.yardName,
    transactionId: String(transaction._id),
  };
};
