import { Request, Response } from "express";
import { Appointment } from "../models/appointment.model";
import { Container } from "../models/container.model";
import { GateTransaction } from "../models/gateTransaction.model";
import { io } from "../index";
import cloudinary from "../config/cloudinary.config";
import streamifier from "streamifier";
import { assignRandomFreeSlot } from "../services/yard-slot.service";
import { buildCheckInTicketPdf, CheckInTicketData } from "../services/ticket.service";
import { publishGateOpen, publishAnnounce } from "../services/mqtt.service";
import { speakGateAlert } from "../services/gate-announce.service";

interface ScanCache {
  plate?: { text: string; time: number };
  container?: { text: string; time: number };
}
const cameraScanCache: Record<string, ScanCache> = {};

// Cửa chung: MỌI thông báo lỗi/cảnh báo ở cổng đi qua đây — vừa phát socket cho dashboard,
// vừa đọc CHÍNH câu đó ra loa (làm sạch + debounce nằm trong gate-announce.service).
// Debounce theo (cổng + biển + câu): câu y hệt lặp mỗi frame chỉ đọc lại sau 30s, nhưng câu
// KHÁC cho cùng xe (vd "đang chờ" -> "từ chối") vẫn đọc ngay.
const emitGateError = (gate: "in" | "out", plate: string, message: string) => {
  io.emit("gate_scan_error", { plate, message });
  speakGateAlert(gate, `scan:${gate}:${plate}:${message}`, message);
};

// Trạng thái cảng kế tiếp của container, suy ra từ mục đích lịch hẹn và chiều qua cổng:
//   Trả container — xe chở container vào rồi hạ xuống bãi, ra tay không.
//   Lấy container — xe vào tay không, móc container ở bãi rồi chở ra.
// Trả về null nghĩa là lượt qua cổng này không làm đổi trạng thái container.
const nextPortStatus = (
  purpose: string | undefined,
  direction: "in" | "out",
): string | null => {
  if (purpose === "Trả container") {
    return direction === "in" ? "Đã nhập cảng" : "Đang lưu bãi";
  }
  if (purpose === "Lấy container" && direction === "out") {
    return "Đã xuất cảng";
  }
  return null;
};

// Container nối với lịch hẹn qua mã (chuỗi), không phải khóa ngoại — nên khớp theo number.
// Không chặn luồng cổng nếu cập nhật lỗi: xe đã qua rồi, chỉ ghi log để soát lại.
const syncContainerPortStatus = async (
  containerNo: string | undefined,
  purpose: string | undefined,
  direction: "in" | "out",
) => {
  const portStatus = nextPortStatus(purpose, direction);
  if (!portStatus || !containerNo) return;

  try {
    const result = await Container.updateOne(
      { number: containerNo.toUpperCase(), isDeleted: false },
      { portStatus },
      { runValidators: true },
    );
    if (result.matchedCount === 0) {
      console.warn(
        `[Container] Không tìm thấy container ${containerNo} để cập nhật "${portStatus}"`,
      );
    }
  } catch (err) {
    console.error("Lỗi cập nhật trạng thái cảng của container:", err);
  }
};

const captureAndSaveImageAsync = async (transactionId: string, cameraIp: string) => {
  try {
    const pythonApiUrl = process.env.PYTHON_API_URL || "http://127.0.0.1:5001";
    const aiResponse = await fetch(`${pythonApiUrl}/snapshot?rtsp_url=${encodeURIComponent(cameraIp)}`);
    if (!aiResponse.ok) return;

    const arrayBuffer = await aiResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadToCloudinary = (): Promise<any> => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "ai_audit_snapshots" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          },
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });
    };

    const cloudinaryResult = await uploadToCloudinary();
    await GateTransaction.findByIdAndUpdate(transactionId, { imageUrl: cloudinaryResult.secure_url });
  } catch (err) {
    console.error("Lỗi chụp ảnh cổng async:", err);
  }
};

export const scanPost = async (req: Request, res: Response) => {
  try {
    const { text, type, confidence, status, cameraIp } = req.body;
    // status indicates gate type: "in" or "out"

    if (!text || !type || !status) {
      res.status(400).json({ code: "error", message: "Thiếu thông tin" });
      return;
    }

    if (!cameraScanCache[cameraIp]) {
      cameraScanCache[cameraIp] = {};
    }
    if (type === "plate") cameraScanCache[cameraIp].plate = { text, time: Date.now() };
    if (type === "container") cameraScanCache[cameraIp].container = { text, time: Date.now() };

    // Clear stale cache (older than 2 minutes)
    const twoMinsAgo = Date.now() - 2 * 60 * 1000;
    if (cameraScanCache[cameraIp].plate && cameraScanCache[cameraIp].plate!.time < twoMinsAgo) {
      delete cameraScanCache[cameraIp].plate;
    }
    if (cameraScanCache[cameraIp].container && cameraScanCache[cameraIp].container!.time < twoMinsAgo) {
      delete cameraScanCache[cameraIp].container;
    }

    // 1. Find valid appointment by plate or container
    const query: any = { status: "Confirmed", isDeleted: false };
    if (type === "plate") {
      query.truckPlate = text;
    } else if (type === "container") {
      // DB stores 11 chars, Python AI returns 10 chars (omitting check digit). Use prefix match.
      query.containerNo = { $regex: new RegExp("^" + text, "i") };
    }

    // We can sort by scheduledDate to get the most relevant one if multiple exist
    const appointment = await Appointment.findOne(query).populate("driverId").sort({
      scheduledDate: 1,
    });

    if (!appointment) {
      emitGateError(status as "in" | "out", text, "Không tìm thấy lịch hẹn đã duyệt cho xe này.");
      res.status(200).json({
        code: "ignored",
        message: "Không tìm thấy lịch hẹn đã duyệt cho xe này.",
      });
      return;
    }

    // 2. Check Time validity
    const now = new Date();
    const appointmentDate = new Date(appointment.scheduledDate);

    const [start, end] = appointment.timeSlot.split("-");
    const startTime = new Date(appointmentDate);
    const [startH, startM] = start.split(":");
    startTime.setHours(parseInt(startH), parseInt(startM), 0, 0);

    const endTime = new Date(appointmentDate);
    const [endH, endM] = end.split(":");
    endTime.setHours(parseInt(endH), parseInt(endM), 0, 0);

    // If time slot crosses midnight (e.g. 23:00 - 00:00), endTime is on the next day
    if (endTime <= startTime) {
      endTime.setDate(endTime.getDate() + 1);
    }

    // Buffer of 30 minutes before and after
    const validStart = new Date(startTime.getTime() - 30 * 60000);
    const validEnd = new Date(endTime.getTime() + 30 * 60000);

    if (now < validStart || now > validEnd) {
      emitGateError(status as "in" | "out", text, `Chưa tới hoặc đã quá khung giờ lịch hẹn (${appointment.timeSlot}).`);
      res.status(200).json({
        code: "ignored",
        message: `Chưa tới hoặc đã quá khung giờ lịch hẹn (${appointment.timeSlot}).`,
      });
      return;
    }

    // 3. Process Transaction
    // Find if there's an ongoing transaction for this plate
    let transaction = await GateTransaction.findOne({
      actualTruckPlate: appointment.truckPlate,
      status: "in",
      isDeleted: false,
    });

    if (status === "in") {
      if (transaction) {
        // Already checked in, ignore duplicate
        emitGateError("in", text, "Xe này đã check-in và đang ở trong bãi.");
        res.status(200).json({
          code: "ignored",
          message: "Xe này đã check-in và đang ở trong bãi.",
        });
        return;
      } else {
        // --- BEGIN NEW REQUIREMENT LOGIC ---
        if (appointment.purpose === "Lấy container") {
          // Chỉ yêu cầu biển số
          if (!cameraScanCache[cameraIp]?.plate || cameraScanCache[cameraIp].plate!.text !== appointment.truckPlate) {
            res.status(200).json({ code: "ignored", message: "Đang chờ quét biển số xe (Mục đích: Lấy container)" });
            return;
          }
        } else if (appointment.purpose === "Trả container") {
          // Bắt buộc yêu cầu cả biển số và container
          const hasValidPlate = cameraScanCache[cameraIp]?.plate?.text === appointment.truckPlate;
          const cachedContainerText = cameraScanCache[cameraIp]?.container?.text || "";
          const hasValidContainer = cachedContainerText && appointment.containerNo.toUpperCase().startsWith(cachedContainerText.toUpperCase());

          if (!hasValidPlate || !hasValidContainer) {
            // Timeout logic
            const missing = !hasValidPlate ? "Biển số xe" : "Mã container";
            const pTime = cameraScanCache[cameraIp]?.plate?.time;
            const cTime = cameraScanCache[cameraIp]?.container?.time;
            const refTime = pTime || cTime;

            if (refTime && (Date.now() - refTime > 60000)) {
              emitGateError("in", appointment.truckPlate, `[Cổng vào - Trả container] CẢNH BÁO: Quá 1 phút chưa quét được ${missing}!`);
            } else {
              emitGateError("in", appointment.truckPlate, `[Cổng vào - Trả container] Đang chờ quét thêm: ${missing}...`);
            }
            res.status(200).json({
              code: "ignored",
              message: `Yêu cầu quét đủ biển số và mã container. Thiếu: ${missing}`,
            });
            return;
          }
          
          // Clear so we don't double trigger
          delete cameraScanCache[cameraIp].plate;
          delete cameraScanCache[cameraIp].container;
        }
        // --- END NEW REQUIREMENT LOGIC ---

        // --- CẤP PHÁT Ô ĐỖ NGẪU NHIÊN KHI CHECK-IN ---
        // Tính ngay sát thời điểm tạo transaction để trạng thái trống/đầy mới nhất.
        const slot = await assignRandomFreeSlot();
        if (!slot) {
          // Bãi đã đầy: không tạo check-in, không mở cổng, giữ xe ở cổng.
          emitGateError("in", appointment.truckPlate, "Bãi đỗ đã đầy, không thể cho xe vào. Vui lòng chờ có ô trống.");
          res.status(200).json({
            code: "ignored",
            message: "Bãi đỗ đã đầy, không thể cho xe vào.",
          });
          return;
        }

        // Create new check-in
        transaction = new GateTransaction({
          actualTruckPlate: appointment.truckPlate,
          actualContainerNo: appointment.containerNo,
          appointmentId: appointment._id,
          yardId: slot.yardId,
          assignedSlot: slot.slotName,
          checkInTime: now,
          status: "in",
          ocrConfidence: confidence,
        });
        await transaction.save();

        await syncContainerPortStatus(
          appointment.containerNo,
          appointment.purpose,
          "in",
        );

        if (cameraIp) {
          captureAndSaveImageAsync(transaction._id.toString(), cameraIp);
        }
      }
    } else if (status === "out") {
      if (!transaction) {
        // No check-in found, maybe manual or error. We'll ignore or create a hanging checkout.
        // For strict logic, ignore.
        emitGateError("out", text, "Không tìm thấy dữ liệu check-in cho xe này.");
        res.status(200).json({
          code: "ignored",
          message: "Không tìm thấy dữ liệu check-in cho xe này.",
        });
        return;
      } else {
        // --- BEGIN NEW LOGIC FOR CHECK OUT ---
        if (appointment.purpose === "Lấy container") {
          // Bắt buộc quét được container
          const hasValidPlate = cameraScanCache[cameraIp]?.plate?.text === appointment.truckPlate;
          const cachedContainerText = cameraScanCache[cameraIp]?.container?.text || "";
          const hasValidContainer = cachedContainerText && appointment.containerNo.toUpperCase().startsWith(cachedContainerText.toUpperCase());

          if (!hasValidPlate || !hasValidContainer) {
            const missing = !hasValidPlate ? "Biển số xe" : "Mã container";
            const pTime = cameraScanCache[cameraIp]?.plate?.time;
            const cTime = cameraScanCache[cameraIp]?.container?.time;
            const refTime = pTime || cTime;

            if (refTime && (Date.now() - refTime > 60000)) {
              emitGateError("out", appointment.truckPlate, `[Cổng ra - Lấy container] CẢNH BÁO: Quá 1 phút chưa quét được ${missing}!`);
            } else {
              emitGateError("out", appointment.truckPlate, `[Cổng ra - Lấy container] Đang chờ quét thêm: ${missing}...`);
            }
            res.status(200).json({
              code: "ignored",
              message: `Yêu cầu quét đủ biển số và mã container. Thiếu: ${missing}`,
            });
            return;
          }
          delete cameraScanCache[cameraIp].plate;
          delete cameraScanCache[cameraIp].container;
        } else if (appointment.purpose === "Trả container") {
          // Bắt buộc KHÔNG CÓ container
          if (cameraScanCache[cameraIp]?.container) {
            emitGateError("out", appointment.truckPlate, `[Cổng ra - Trả container] LỖI: Phát hiện xe đang chở container ra ngoài! Không cho phép mở cổng.`);
            res.status(400).json({
              code: "error",
              message: "Phát hiện xe chở container ra ngoài (không hợp lệ)",
            });
            return;
          }

          if (!cameraScanCache[cameraIp]?.plate || cameraScanCache[cameraIp].plate!.text !== appointment.truckPlate) {
            res.status(200).json({ code: "ignored", message: "Đang chờ quét biển số xe" });
            return;
          }
          delete cameraScanCache[cameraIp].plate;
        }
        // --- END NEW LOGIC FOR CHECK OUT ---

        // Update checkout time
        transaction.checkOutTime = now;
        transaction.status = "out";
        transaction.ocrConfidence = confidence;
        await transaction.save();

        await syncContainerPortStatus(
          appointment.containerNo,
          appointment.purpose,
          "out",
        );

        if (cameraIp) {
          captureAndSaveImageAsync(transaction._id.toString(), cameraIp);
        }

        // Mark appointment as Completed
        appointment.status = "Completed";
        await appointment.save();
      }
    }

    // 4. Calculate Stats and Emit
    // Hai count độc lập → chạy song song để giảm latency response (client CV timeout 3s).
    const nowTime = new Date();
    const vnDateString = nowTime.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh", year: 'numeric', month: '2-digit', day: '2-digit' });
    const [month, day, year] = vnDateString.split('/');
    const todayStart = new Date(`${year}-${month}-${day}T00:00:00.000+07:00`);
    const [activeVehicles, checkedOutVehicles] = await Promise.all([
      GateTransaction.countDocuments({
        status: "in",
        isDeleted: false,
      }),
      GateTransaction.countDocuments({
        status: "out",
        checkOutTime: { $gte: todayStart },
        isDeleted: false,
      }),
    ]);

    const emitData = {
      _id: transaction!._id,
      actualTruckPlate: transaction!.actualTruckPlate,
      appointmentId: { driverId: { driverName: (appointment.driverId as any)?.driverName } },
      actualContainerNo: transaction!.actualContainerNo,
      checkInTime: transaction!.checkInTime,
      checkOutTime: transaction!.checkOutTime,
      status: status,
      assignedSlot: transaction!.assignedSlot,
      activeCount: activeVehicles,
      completedCount: checkedOutVehicles,
    };

    io.emit("gate_scan_update", emitData);
    io.emit("gate_scan_success", {
      plate: text,
      assignedSlot: transaction!.assignedSlot,
      message:
        status === "in"
          ? transaction!.assignedSlot
            ? `Check-in thành công. Xe vào ô ${transaction!.assignedSlot}.`
            : "Check-in thành công"
          : "Check-out thành công",
    });

    // --- ĐIỀU KHIỂN CỔNG + LOA QUA MQTT ---
    // status ("in"/"out") chính là cổng cần thao tác.
    // - Mở cổng: publish tới ESP32 tại cổng đó.
    // - Loa: check-in gửi kèm số ô (câu VÀO); check-out không có ô (câu RA).
    try {
      const gate = status as "in" | "out";
      const p = appointment.truckPlate || "";
      const c = appointment.containerNo || "";
      publishGateOpen(gate, p, c);
      publishAnnounce(gate, p, status === "in" ? transaction!.assignedSlot : null);
    } catch (err) {
      console.error("[MQTT] Lỗi khi publish lệnh cổng/loa:", err);
    }
    // -----------------------------------

    res.status(200).json({ code: "success", message: "Processed successfully" });
    return;
  } catch (error) {
    console.error("Scan Error: ", error);
    res.status(400).json({ code: "error", message: "Server error" });
      return;
  }
};

export const getLogs = async (req: Request, res: Response) => {
  try {
    const activeVehicles = await GateTransaction.countDocuments({ status: "in", isDeleted: false });
    const nowTime = new Date();
    const vnDateString = nowTime.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh", year: 'numeric', month: '2-digit', day: '2-digit' });
    const [month, day, year] = vnDateString.split('/');
    const todayStart = new Date(`${year}-${month}-${day}T00:00:00.000+07:00`);
    const checkedOutVehicles = await GateTransaction.countDocuments({ 
      status: "out", 
      checkOutTime: { $gte: todayStart },
      isDeleted: false 
    });

    const recentLogs = await GateTransaction.find({ isDeleted: false })
      .sort({ updatedAt: -1 })
      .limit(50)
      .populate({ path: "appointmentId", populate: { path: "driverId", select: "driverName" } });

    const formattedLogs = recentLogs.map((log: any) => ({
      id: log._id.toString(),
      plate: log.actualTruckPlate,
      driverName: log.appointmentId?.driverId?.driverName || "-",
      containerNo: log.actualContainerNo || "-",
      time: log.status === "in" ? log.checkInTime : log.checkOutTime,
      status: log.status
    }));

    res.status(200).json({
      code: "success",
      data: {
        activeCount: activeVehicles,
        completedCount: checkedOutVehicles,
        logs: formattedLogs
      }
    });
    return;
  } catch (error) {
    console.error("Get Logs Error: ", error);
    res.status(400).json({ code: "error", message: "Server error" });
      return;
  }
};

export const getLogsPaginated = async (req: Request, res: Response) => {
  try {
    const pageNum = parseInt(req.query.page as string, 10) || 1;
    const limitNum = parseInt(req.query.limit as string, 10) || 10;
    const search = (req.query.search as string) || "";
    const status = req.query.status as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const query: any = { isDeleted: false };
    if (search) {
      query.actualTruckPlate = { $regex: search, $options: "i" };
    }
    if (status && status !== "ALL") {
      query.status = status;
    }
    if (startDate && endDate) {
      query.checkInTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const totalItems = await GateTransaction.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limitNum);
    const logs = await GateTransaction.find(query)
      .sort({ updatedAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate({ path: "appointmentId", populate: { path: "driverId", select: "driverName driverPhone" } });

    const activeVehicles = await GateTransaction.countDocuments({ status: "in", isDeleted: false });
    const nowTime = new Date();
    const vnDateString = nowTime.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh", year: 'numeric', month: '2-digit', day: '2-digit' });
    const [month, day, year] = vnDateString.split('/');
    const todayStart = new Date(`${year}-${month}-${day}T00:00:00.000+07:00`);
    const checkedOutVehicles = await GateTransaction.countDocuments({ 
      status: "out", 
      checkOutTime: { $gte: todayStart },
      isDeleted: false 
    });

    res.status(200).json({
      code: "success",
      data: logs,
      stats: {
        activeCount: activeVehicles,
        completedCount: checkedOutVehicles,
      },
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        limit: limitNum,
      },
    });
    return;
  } catch (error) {
    console.error("Get Logs Paginated Error: ", error);
    res.status(400).json({ code: "error", message: "Lỗi hệ thống khi lấy danh sách nhật ký" });
      return;
  }
};

export const getLogDetail = async (req: Request, res: Response) => {
  try {
    const log = await GateTransaction.findById(req.params.id).populate(
      "appointmentId",
    );
    if (!log) {
      res.status(400).json({ code: "error", message: "Không tìm thấy nhật ký" });
      return;
    }
    res.status(200).json({ code: "success", data: log });
    return;
  } catch (error) {
    console.error("Get Log Detail Error: ", error);
    res.status(400).json({ code: "error", message: "Lỗi hệ thống khi lấy chi tiết nhật ký" });
      return;
  }
};

export const manualCheckoutPatch = async (req: Request, res: Response) => {
  try {
    const log = await GateTransaction.findById(req.params.id);
    if (!log) {
      res.status(400).json({ code: "error", message: "Không tìm thấy nhật ký" });
      return;
    }
    if (log.status === "out") {
      res.status(400).json({ code: "error", message: "Nhật ký này đã check-out" });
      return;
    }

    log.checkOutTime = new Date();
    log.status = "out";
    await log.save();

    if (log.appointmentId) {
      const appointment = await Appointment.findById(log.appointmentId);
      if (appointment) {
        appointment.status = "Completed";
        await appointment.save();

        await syncContainerPortStatus(
          log.actualContainerNo || appointment.containerNo,
          appointment.purpose,
          "out",
        );
      }
    }

    res.status(200).json({ code: "success", message: "Check-out thủ công thành công" });
    return;
  } catch (error) {
    console.error("Manual Checkout Error: ", error);
    res.status(400).json({ code: "error", message: "Lỗi hệ thống khi check-out thủ công" });
      return;
  }
};

export const softDeleteLogDelete = async (req: Request, res: Response) => {
  try {
    const log = await GateTransaction.findById(req.params.id);
    if (!log) {
      res.status(400).json({ code: "error", message: "Không tìm thấy nhật ký" });
      return;
    }
    log.isDeleted = true;
    await log.save();
    res.status(200).json({ code: "success", message: "Đã chuyển nhật ký vào thùng rác" });
    return;
  } catch (error) {
    console.error("Soft Delete Log Error: ", error);
    res.status(400).json({ code: "error", message: "Lỗi hệ thống khi xóa nhật ký" });
      return;
  }
};

export const logsTrashGet = async (req: Request, res: Response) => {
  try {
    const pageNum = parseInt(req.query.page as string, 10) || 1;
    const limitNum = parseInt(req.query.limit as string, 10) || 10;
    const search = (req.query.search as string) || "";
    const status = req.query.status as string;

    const query: any = { isDeleted: true };
    if (search) {
      query.actualTruckPlate = { $regex: search, $options: "i" };
    }
    if (status && status !== "ALL") {
      query.status = status;
    }

    const totalItems = await GateTransaction.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limitNum);
    const logs = await GateTransaction.find(query)
      .sort({ updatedAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate({ path: "appointmentId", populate: { path: "driverId", select: "driverName" } });

    res.status(200).json({
      code: "success",
      data: logs,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        limit: limitNum,
      },
    });
    return;
  } catch (error) {
    console.error("Get Logs Trash Error: ", error);
    res.status(400).json({ code: "error", message: "Lỗi hệ thống khi lấy danh sách thùng rác" });
      return;
  }
};

export const restoreLogPatch = async (req: Request, res: Response) => {
  try {
    const log = await GateTransaction.findById(req.params.id);
    if (!log) {
      res.status(400).json({ code: "error", message: "Không tìm thấy nhật ký" });
      return;
    }
    log.isDeleted = false;
    await log.save();
    res.status(200).json({ code: "success", message: "Khôi phục nhật ký thành công" });
    return;
  } catch (error) {
    console.error("Restore Log Error: ", error);
    res.status(400).json({ code: "error", message: "Lỗi hệ thống khi khôi phục nhật ký" });
      return;
  }
};

export const getCheckInTicket = async (req: Request, res: Response) => {
  try {
    const tx: any = await GateTransaction.findById(req.params.id)
      .populate({
        path: "appointmentId",
        populate: { path: "driverId", select: "driverName driverPhone" },
      })
      .populate({ path: "yardId", select: "name" });

    if (!tx) {
      res.status(400).json({ code: "error", message: "Không tìm thấy nhật ký" });
      return;
    }

    const appt = tx.appointmentId || {};
    const ticketData: CheckInTicketData = {
      ticketCode: tx._id.toString().slice(-8).toUpperCase(),
      truckPlate: tx.actualTruckPlate || appt.truckPlate || "—",
      containerNo: tx.actualContainerNo || appt.containerNo || "—",
      driverName: appt.driverId?.driverName || "—",
      driverPhone: appt.driverId?.driverPhone || "—",
      purpose: appt.purpose || "—",
      scheduledDate: appt.scheduledDate,
      timeSlot: appt.timeSlot || "—",
      checkInTime: tx.checkInTime || tx.createdAt,
      yardName: tx.yardId?.name,
      slotName: tx.assignedSlot,
    };

    const doc = buildCheckInTicketPdf(ticketData);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="phieu-vao-bai-${ticketData.ticketCode}.pdf"`,
    );
    doc.pipe(res);
    doc.end();
    return;
  } catch (error) {
    console.error("Get Check-in Ticket Error: ", error);
    res.status(400).json({ code: "error", message: "Lỗi hệ thống khi tạo phiếu" });
    return;
  }
};

export const hardDeleteLogDelete = async (req: Request, res: Response) => {
  try {
    const result = await GateTransaction.findByIdAndDelete(req.params.id);
    if (!result) {
      res.status(400).json({ code: "error", message: "Không tìm thấy nhật ký" });
      return;
    }
    res.status(200).json({ code: "success", message: "Xóa vĩnh viễn nhật ký thành công" });
    return;
  } catch (error) {
    console.error("Hard Delete Log Error: ", error);
    res.status(400).json({ code: "error", message: "Lỗi hệ thống khi xóa vĩnh viễn nhật ký" });
      return;
  }
};
