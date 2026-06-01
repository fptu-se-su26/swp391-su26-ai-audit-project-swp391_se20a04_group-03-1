import { Request, Response } from "express";
import { Appointment } from "../models/appointment.model";
import { GateTransaction } from "../models/gateTransaction.model";
import { io } from "../index";
import cloudinary from "../config/cloudinary.config";
import streamifier from "streamifier";

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
      res.json({ code: "error", message: "Thiếu thông tin" });
      return;
      return;
    }

    // 1. Find valid appointment by plate or container
    const query: any = { status: "Confirmed", isDeleted: false };
    if (type === "plate") {
      query.truckPlate = text;
    } else if (type === "container") {
      query.containerNo = text;
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
      res.json({
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
      res.json({
        code: "ignored",
        message: `Chưa tới hoặc đã quá khung giờ lịch hẹn (${appointment.timeSlot}).`,
      });
      return;
    }

    // 3. Process Transaction
    // Find if there's an ongoing transaction for this plate
    let transaction = await GateTransaction.findOne({
      truckPlate: appointment.truckPlate,
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
        res.json({
          code: "ignored",
          message: "Xe này đã check-in và đang ở trong bãi.",
        });
        return;
      } else {
        // Create new check-in
        transaction = new GateTransaction({
          truckPlate: appointment.truckPlate,
          containerNo: appointment.containerNo,
          appointmentId: appointment._id,
          gateType: "in",
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
        res.json({
          code: "ignored",
          message: "Không tìm thấy dữ liệu check-in cho xe này.",
        });
        return;
      } else {
        // Update checkout time
        transaction.checkOutTime = now;
        transaction.status = "out";
        transaction.gateType = "out";
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
    const activeVehicles = await GateTransaction.countDocuments({
      status: "in",
      isDeleted: false,
    });
    const nowTime = new Date();
    const vnDateString = nowTime.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh", year: 'numeric', month: '2-digit', day: '2-digit' });
    const [month, day, year] = vnDateString.split('/');
    const todayStart = new Date(`${year}-${month}-${day}T00:00:00.000+07:00`);
    const checkedOutVehicles = await GateTransaction.countDocuments({
      status: "out",
      checkOutTime: { $gte: todayStart },
      isDeleted: false,
    });

    const emitData = {
      _id: transaction!._id,
      truckPlate: transaction!.truckPlate,
      appointmentId: { driverName: (appointment.driverId as any)?.driverName },
      containerNo: transaction!.containerNo,
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

    res.json({ code: "success", message: "Processed successfully" });
    return;
  } catch (error) {
    console.error("Scan Error: ", error);
    res.json({ code: "error", message: "Server error" });
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
      .populate("appointmentId", "driverName");

    const formattedLogs = recentLogs.map((log: any) => ({
      id: log._id.toString(),
      plate: log.truckPlate,
      driverName: log.appointmentId?.driverName || "-",
      containerNo: log.containerNo || "-",
      time: log.status === "in" ? log.checkInTime : log.checkOutTime,
      status: log.status
    }));

    res.json({
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
    res.json({ code: "error", message: "Server error" });
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
      query.truckPlate = { $regex: search, $options: "i" };
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
      .populate("appointmentId", "driverName driverPhone containerNo");

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

    res.json({
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
    res.json({ code: "error", message: "Lỗi hệ thống khi lấy danh sách nhật ký" });
      return;
  }
};

export const getLogDetail = async (req: Request, res: Response) => {
  try {
    const log = await GateTransaction.findById(req.params.id).populate(
      "appointmentId",
    );
    if (!log) {
      res.json({ code: "error", message: "Không tìm thấy nhật ký" });
      return;
    }
    res.json({ code: "success", data: log });
    return;
  } catch (error) {
    console.error("Get Log Detail Error: ", error);
    res.json({ code: "error", message: "Lỗi hệ thống khi lấy chi tiết nhật ký" });
      return;
  }
};

export const manualCheckoutPatch = async (req: Request, res: Response) => {
  try {
    const log = await GateTransaction.findById(req.params.id);
    if (!log) {
      res.json({ code: "error", message: "Không tìm thấy nhật ký" });
      return;
    }
    if (log.status === "out") {
      res.json({ code: "error", message: "Nhật ký này đã check-out" });
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

    res.json({ code: "success", message: "Check-out thủ công thành công" });
    return;
  } catch (error) {
    console.error("Manual Checkout Error: ", error);
    res.json({ code: "error", message: "Lỗi hệ thống khi check-out thủ công" });
      return;
  }
};

export const softDeleteLogDelete = async (req: Request, res: Response) => {
  try {
    const log = await GateTransaction.findById(req.params.id);
    if (!log) {
      res.json({ code: "error", message: "Không tìm thấy nhật ký" });
      return;
    }
    log.isDeleted = true;
    await log.save();
    res.json({ code: "success", message: "Đã chuyển nhật ký vào thùng rác" });
    return;
  } catch (error) {
    console.error("Soft Delete Log Error: ", error);
    res.json({ code: "error", message: "Lỗi hệ thống khi xóa nhật ký" });
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
      query.truckPlate = { $regex: search, $options: "i" };
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
      .populate("appointmentId", "driverName");

    res.json({
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
    res.json({ code: "error", message: "Lỗi hệ thống khi lấy danh sách thùng rác" });
      return;
  }
};

export const restoreLogPatch = async (req: Request, res: Response) => {
  try {
    const log = await GateTransaction.findById(req.params.id);
    if (!log) {
      res.json({ code: "error", message: "Không tìm thấy nhật ký" });
      return;
    }
    log.isDeleted = false;
    await log.save();
    res.json({ code: "success", message: "Khôi phục nhật ký thành công" });
    return;
  } catch (error) {
    console.error("Restore Log Error: ", error);
    res.json({ code: "error", message: "Lỗi hệ thống khi khôi phục nhật ký" });
      return;
  }
};

export const hardDeleteLogDelete = async (req: Request, res: Response) => {
  try {
    const result = await GateTransaction.findByIdAndDelete(req.params.id);
    if (!result) {
      res.json({ code: "error", message: "Không tìm thấy nhật ký" });
      return;
    }
    res.json({ code: "success", message: "Xóa vĩnh viễn nhật ký thành công" });
    return;
  } catch (error) {
    console.error("Hard Delete Log Error: ", error);
    res.json({ code: "error", message: "Lỗi hệ thống khi xóa vĩnh viễn nhật ký" });
      return;
  }
};
