import { Request, Response } from "express";
import { Appointment } from "../../models/appointment.model";
import { signAppointmentQrToken } from "../../helpers/mobile-token.helper";

// GET /api/mobile/driver/appointments  (requireMobileAuth + role driver)
// Trả lịch hẹn của tài xế hiện tại, mỗi item kèm qrToken để render QR động.
export const appointmentsGet = async (req: Request, res: Response) => {
  try {
    const driverId = req.user.id;

    const appointments = await Appointment.find({
      driverId,
      isDeleted: false,
    }).sort({ scheduledDate: -1 });

    const data = appointments.map((appt) => ({
      id: appt._id,
      code: String(appt._id).slice(-6).toUpperCase(),
      truckPlate: appt.truckPlate,
      containerNo: appt.containerNo,
      scheduledDate: appt.scheduledDate,
      timeSlot: appt.timeSlot,
      purpose: appt.purpose,
      status: appt.status,
      // QR token tự chứa apptId + driverId, hết hạn 12h.
      qrToken: signAppointmentQrToken(String(appt._id), String(driverId)),
    }));

    return res.status(200).json({ code: "success", data });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ code: "error", message: "Không thể lấy danh sách lịch hẹn" });
  }
};
