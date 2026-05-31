import { Request, Response } from "express";
import { Appointment } from "../models/appointment.model";
import { GateTransaction } from "../models/gateTransaction.model";
import { io } from "../index";

export const scanPost = async (req: Request, res: Response): Promise<any> => {
  try {
    const { text, type, confidence, status } = req.body;
    // status indicates gate type: "in" or "out"

    if (!text || !type || !status) {
      return res.json({ code: "error", message: "Thiếu thông tin" });
    }

    // 1. Find valid appointment by plate or container
    const query: any = { status: "Confirmed", isDeleted: false };
    if (type === "plate") {
      query.truckPlate = text;
    } else if (type === "container") {
      query.containerNo = text;
    }

    // We can sort by scheduledDate to get the most relevant one if multiple exist
    const appointment = await Appointment.findOne(query).sort({
      scheduledDate: 1,
    });

    if (!appointment) {
      io.emit("gate_scan_error", {
        plate: text,
        message: "Không tìm thấy lịch hẹn đã duyệt cho xe này.",
      });
      return res.json({
        code: "ignored",
        message: "Không tìm thấy lịch hẹn đã duyệt cho xe này.",
      });
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
      return res.json({
        code: "ignored",
        message: `Chưa tới hoặc đã quá khung giờ lịch hẹn (${appointment.timeSlot}).`,
      });
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
        return res.json({
          code: "ignored",
          message: "Xe này đã check-in và đang ở trong bãi.",
        });
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
      }
    } else if (status === "out") {
      if (!transaction) {
        // No check-in found, maybe manual or error. We'll ignore or create a hanging checkout.
        // For strict logic, ignore.
        io.emit("gate_scan_error", {
          plate: text,
          message: "Không tìm thấy dữ liệu check-in cho xe này.",
        });
        return res.json({
          code: "ignored",
          message: "Không tìm thấy dữ liệu check-in cho xe này.",
        });
      } else {
        // Update checkout time
        transaction.checkOutTime = now;
        transaction.status = "out";
        transaction.gateType = "out";
        transaction.ocrConfidence = confidence;
        await transaction.save();

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
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const checkedOutVehicles = await GateTransaction.countDocuments({
      status: "out",
      checkOutTime: { $gte: todayStart },
      isDeleted: false,
    });

    const emitData = {
      plate: transaction!.truckPlate,
      driverName: appointment.driverName,
      containerNo: transaction!.containerNo,
      time:
        status === "in" ? transaction!.checkInTime : transaction!.checkOutTime,
      status: status,
      activeCount: activeVehicles,
      completedCount: checkedOutVehicles,
    };

    io.emit("gate_scan_update", emitData);

    return res.json({ code: "success", message: "Processed successfully" });
  } catch (error) {
    console.error("Scan Error:", error);
    return res.status(500).json({ code: "error", message: "Server error" });
  }
};

export const getLogs = async (req: Request, res: Response): Promise<any> => {
  try {
    const activeVehicles = await GateTransaction.countDocuments({ status: "in", isDeleted: false });
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
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

    return res.json({
      code: "success",
      data: {
        activeCount: activeVehicles,
        completedCount: checkedOutVehicles,
        logs: formattedLogs
      }
    });
  } catch (error) {
    console.error("Get Logs Error:", error);
    return res.status(500).json({ code: "error", message: "Server error" });
  }
};
