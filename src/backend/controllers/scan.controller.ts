import { Request, Response } from "express";
import { Appointment } from "../models/appointment.model";
import { GateTransaction } from "../models/gateTransaction.model";
import { io } from "../index";
import cloudinary from "../config/cloudinary.config";
import streamifier from "streamifier";

interface ScanCache {
  plate?: { text: string; time: number };
  container?: { text: string; time: number };
}
const cameraScanCache: Record<string, ScanCache> = {};

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
      io.emit("gate_scan_error", {
        plate: text,
        message: "Không tìm thấy lịch hẹn đã duyệt cho xe này.",
      });
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
      io.emit("gate_scan_error", {
        plate: text,
        message: `Chưa tới hoặc đã quá khung giờ lịch hẹn (${appointment.timeSlot}).`,
      });
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
        io.emit("gate_scan_error", {
          plate: text,
          message: "Xe này đã check-in và đang ở trong bãi.",
        });
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
              io.emit("gate_scan_error", {
                plate: appointment.truckPlate,
                message: `[Cổng vào - Trả container] CẢNH BÁO: Quá 1 phút chưa quét được ${missing}!`,
              });
            } else {
              io.emit("gate_scan_error", {
                plate: appointment.truckPlate,
                message: `[Cổng vào - Trả container] Đang chờ quét thêm: ${missing}...`,
              });
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

        // Create new check-in
        transaction = new GateTransaction({
          actualTruckPlate: appointment.truckPlate,
          actualContainerNo: appointment.containerNo,
          appointmentId: appointment._id,
          
          checkInTime: now,
          status: "in",
          ocrConfidence: confidence,
        });
        await transaction.save();
        
        if (cameraIp) {
          captureAndSaveImageAsync(transaction._id.toString(), cameraIp);
        }
      }
    } else if (status === "out") {
      if (!transaction) {
        // No check-in found, maybe manual or error. We'll ignore or create a hanging checkout.
        // For strict logic, ignore.
        io.emit("gate_scan_error", {
          plate: text,
          message: "Không tìm thấy dữ liệu check-in cho xe này.",
        });
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
              io.emit("gate_scan_error", {
                plate: appointment.truckPlate,
                message: `[Cổng ra - Lấy container] CẢNH BÁO: Quá 1 phút chưa quét được ${missing}!`,
              });
            } else {
              io.emit("gate_scan_error", {
                plate: appointment.truckPlate,
                message: `[Cổng ra - Lấy container] Đang chờ quét thêm: ${missing}...`,
              });
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
            io.emit("gate_scan_error", {
              plate: appointment.truckPlate,
              message: `[Cổng ra - Trả container] LỖI: Phát hiện xe đang chở container ra ngoài! Không cho phép mở cổng.`,
            });
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
      activeCount: activeVehicles,
      completedCount: checkedOutVehicles,
    };

    io.emit("gate_scan_update", emitData);
    io.emit("gate_scan_success", {
      plate: text,
      message: status === "in" ? "Check-in thành công" : "Check-out thành công",
    });

    // --- GỬI LỆNH MỞ CỔNG TỚI ESP32 ---
    try {
      const esp32Ip = process.env.ESP32_IP || "http://192.168.1.100";
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // Timeout 3s tránh treo server
      
      const p = appointment.truckPlate || "";
      const c = appointment.containerNo || "";
      fetch(`${esp32Ip}/api/open-gate?plate=${encodeURIComponent(p)}&container=${encodeURIComponent(c)}`, {
        method: "GET",
        signal: controller.signal
      }).then(res => res.text())
        .then(data => console.log(`[ESP32] Lệnh mở cổng thành công:`, data))
        .catch(err => console.error("[ESP32] Không thể kết nối tới ESP32:", err.message));
        
      clearTimeout(timeoutId);
    } catch (err) {
      console.error("[ESP32] Lỗi hệ thống khi gọi ESP32:", err);
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
