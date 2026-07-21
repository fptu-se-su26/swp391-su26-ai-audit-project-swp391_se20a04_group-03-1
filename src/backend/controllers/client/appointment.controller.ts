import { NextFunction, Request, Response } from "express";
import { Appointment } from "../../models/appointment.model";
import { Driver } from "../../models/driver.model";
import { Container } from "../../models/container.model";
import { notify } from "../../services/notification.service";

export const createAppointmentPost = async (req: Request, res: Response) => {
  try {
    const { truckPlate, scheduledDate, timeSlot, containerNo, purpose } = req.body;

    // 0. Kiểm tra Mục đích và Tình trạng container
    const container = await Container.findOne({ number: containerNo, isDeleted: false });
    if (!container) {
      return res.status(400).json({
        code: "error",
        message: "Không tìm thấy thông tin container.",
      });
    }

    if (purpose === "Lấy container" && !["Đã nhập cảng", "Đang lưu bãi"].includes(container.portStatus)) {
      return res.status(400).json({
        code: "error",
        message: "Mục đích lấy container không hợp lệ: Container này hiện không ở Trong cảng.",
      });
    }

    if (purpose === "Trả container" && !["Chưa nhập cảng", "Đã xuất cảng"].includes(container.portStatus)) {
      return res.status(400).json({
        code: "error",
        message: "Mục đích trả container không hợp lệ: Container này hiện đang ở Trong cảng.",
      });
    }

    // 1. Kiểm tra 1 xe chỉ được đặt 1 lần/ngày
    const existAppointmentInDay = await Appointment.findOne({
      truckPlate,
      scheduledDate: new Date(scheduledDate),
      status: { $nin: ["Cancelled", "Completed"] },
      isDeleted: false,
    });

    if (existAppointmentInDay) {
      res.status(400).json({
        code: "error",
        message: "Xe đã có lịch hẹn trong ngày.",
      });
      return;
    }

    // 2. Thuật toán kiểm tra sức chứa (Capacity Slot)
    const MAX_CAPACITY_PER_SLOT = 20;
    const currentSlotCount = await Appointment.countDocuments({
      scheduledDate: new Date(scheduledDate),
      timeSlot: timeSlot,
      status: { $ne: "Cancelled" },
      isDeleted: false,
    });

    if (currentSlotCount >= MAX_CAPACITY_PER_SLOT) {
      res.status(400).json({
        code: "error",
        message: `Khung giờ ${timeSlot} đã đầy (${currentSlotCount}/${MAX_CAPACITY_PER_SLOT} xe). Vui lòng chọn khung giờ khác.`,
      });
      return;
    }

    const newAppointment = new Appointment(req.body);
    await newAppointment.save();

    // Báo cho admin có lịch hẹn mới chờ duyệt (chuông trên header).
    void notify({
      type: "appointment",
      severity: "info",
      title: "Lịch hẹn mới chờ duyệt",
      message: `${newAppointment.truckPlate} — ${newAppointment.purpose} ${newAppointment.containerNo}, khung ${newAppointment.timeSlot}.`,
      link: "/admin/appointments",
      dedupeKey: `appointment-new:${newAppointment._id}`,
    });

    res.status(200).json({
      code: "success",
      message: "Tạo lịch hẹn thành công",
    });
  } catch (error) {
    console.error("Create Appointment Error: ", error);
    res.status(400).json({
      code: "error",
      message: "Lỗi hệ thống khi tạo lịch hẹn",
    });
  }
};

export const appointmentsGet = async (req: Request, res: Response) => {
  try {
    const {
      search,
      status,
      startDate,
      endDate,
      page = "1",
      limit = "10",
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;
    
    const companyId = req.user.id;
    const companyDrivers = await Driver.find({ companyId }).select("_id");
    const driverIds = companyDrivers.map((d) => d._id);

    let query: any = { isDeleted: false, status: { $ne: "Completed" }, driverId: { $in: driverIds } };

    if (status && status !== "ALL") {
      query.status = status;
    }

    if (startDate || endDate) {
      query.scheduledDate = {};
      if (startDate) {
        query.scheduledDate.$gte = new Date(startDate as string);
      }
      if (endDate) {
        const targetEndDate = new Date(endDate as string);
        const nextDay = new Date(targetEndDate);
        nextDay.setDate(targetEndDate.getDate() + 1);
        query.scheduledDate.$lt = nextDay;
      }
    }

    if (search) {
      const searchRegex = new RegExp(search as string, "i");
      const matchedDrivers = await Driver.find({
        companyId,
        $or: [
          { driverName: searchRegex },
          { driverPhone: searchRegex },
          { driverId: searchRegex },
        ],
      }).select("_id");
      const matchedDriverIds = matchedDrivers.map((d) => d._id);

      query.$or = [
        { truckPlate: searchRegex },
        { containerNo: searchRegex },
        { driverId: { $in: matchedDriverIds } },
      ];
    }

    const totalItems = await Appointment.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limitNum);

    const appointmentList = await Appointment.find(query)
      .populate({ path: "driverId", populate: { path: "companyId" } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      code: "success",
      data: appointmentList,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error("Get Appointments Error: ", error);
    res.status(400).json({
      code: "error",
      message: "Lỗi hệ thống khi lấy danh sách lịch hẹn",
    });
  }
};

export const appointmentDetailGet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user.id;
    const companyDrivers = await Driver.find({ companyId }).select("_id");
    const driverIds = companyDrivers.map((d) => d._id);
    
    const appointment = await Appointment.findOne({ _id: id, driverId: { $in: driverIds } }).populate({
      path: "driverId",
      populate: { path: "companyId" },
    });
    if (!appointment) {
      return res.status(400).json({
        code: "error",
        message: "Không tìm thấy lịch hẹn",
      });
    }
    res.status(200).json({
      code: "success",
      data: appointment,
    });
  } catch (error) {
    console.error("Get Appointment Detail Error: ", error);
    res.status(400).json({
      code: "error",
      message: "Lỗi hệ thống khi lấy chi tiết lịch hẹn",
    });
  }
};

export const appointmentEditPatch = async (req: Request, res: Response) => {
  try {
    const { id, truckPlate, scheduledDate, containerNo, purpose } = req.body;

    // 0. Kiểm tra Mục đích và Tình trạng container
    const container = await Container.findOne({ number: containerNo, isDeleted: false });
    if (!container) {
      return res.status(400).json({
        code: "error",
        message: "Không tìm thấy thông tin container.",
      });
    }

    if (purpose === "Lấy container" && !["Đã nhập cảng", "Đang lưu bãi"].includes(container.portStatus)) {
      return res.status(400).json({
        code: "error",
        message: "Mục đích lấy container không hợp lệ: Container này hiện không ở Trong cảng.",
      });
    }

    if (purpose === "Trả container" && !["Chưa nhập cảng", "Đã xuất cảng"].includes(container.portStatus)) {
      return res.status(400).json({
        code: "error",
        message: "Mục đích trả container không hợp lệ: Container này hiện đang ở Trong cảng.",
      });
    }

    // Kiểm tra trùng lịch hẹn của xe trong cùng 1 ngày (không tính chính nó)
    const existAppointmentInDay = await Appointment.findOne({
      _id: { $ne: id },
      truckPlate,
      scheduledDate: new Date(scheduledDate),
      status: { $ne: "Cancelled" },
    });

    if (existAppointmentInDay) {
      return res.status(400).json({
        code: "error",
        message: "Xe đã có lịch hẹn khác trong ngày.",
      });
    }

    const currentAppointment = await Appointment.findById(id);
    if (!currentAppointment) {
      return res.status(400).json({
        code: "error",
        message: "Không tìm thấy lịch hẹn",
      });
    }

    if (req.body.status === "Confirmed" && currentAppointment.status !== "Confirmed") {
      return res.status(400).json({
        code: "error",
        message: "Doanh nghiệp không có quyền duyệt lịch hẹn. Vui lòng chờ Ban Quản Lý phê duyệt.",
      });
    }

    await Appointment.updateOne({ _id: id }, req.body);

    res.status(200).json({
      code: "success",
      message: "Cập nhật lịch hẹn thành công",
    });
  } catch (error) {
    console.error("Edit Appointment Error: ", error);
    res.status(400).json({
      code: "error",
      message: "Lỗi hệ thống khi cập nhật lịch hẹn",
    });
  }
};

export const appointmentStatusPatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // 1. Lấy thông tin lịch hẹn hiện tại
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(400).json({
        code: "error",
        message: "Không tìm thấy lịch hẹn",
      });
    }

    // 2. Xử lý logic đặc biệt cho từng trạng thái
    if (status === "Confirmed") {
      return res.status(400).json({
        code: "error",
        message: "Doanh nghiệp không có quyền duyệt lịch hẹn. Vui lòng chờ Ban Quản Lý phê duyệt.",
      });
    }

    // 3. Cập nhật trạng thái
    await Appointment.updateOne({ _id: id }, { status });

    res.status(200).json({
      code: "success",
      message: "Cập nhật trạng thái lịch hẹn thành công",
    });
  } catch (error) {
    console.error("Update Appointment Status Error: ", error);
    res.status(400).json({
      code: "error",
      message: "Lỗi hệ thống khi cập nhật trạng thái lịch hẹn",
    });
  }
};

export const appointmentDeletePatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(400).json({
        code: "error",
        message: "Không tìm thấy lịch hẹn",
      });
    }
    if (appointment.isDeleted === true) {
      return res.status(400).json({
        code: "error",
        message: "Lịch hẹn đã bị xóa",
      });
    }
    await Appointment.updateOne({ _id: id }, { isDeleted: true });
    res.status(200).json({
      code: "success",
      message: "Xóa lịch hẹn thành công",
    });
  } catch (error) {
    console.error("Delete Appointment Error: ", error);
    res.status(400).json({
      code: "error",
      message: "Lỗi hệ thống khi xóa lịch hẹn",
    });
  }
};

export const appointmentsTrashGet = async (req: Request, res: Response) => {
  try {
    const {
      search,
      status,
      startDate,
      endDate,
      page = "1",
      limit = "10",
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const companyId = req.user.id;
    const companyDrivers = await Driver.find({ companyId }).select("_id");
    const driverIds = companyDrivers.map((d) => d._id);

    let query: any = { isDeleted: true, driverId: { $in: driverIds } };

    if (status && status !== "ALL") {
      query.status = status;
    }

    if (startDate || endDate) {
      query.scheduledDate = {};
      if (startDate) {
        query.scheduledDate.$gte = new Date(startDate as string);
      }
      if (endDate) {
        const targetEndDate = new Date(endDate as string);
        const nextDay = new Date(targetEndDate);
        nextDay.setDate(targetEndDate.getDate() + 1);
        query.scheduledDate.$lt = nextDay;
      }
    }

    if (search) {
      const searchRegex = new RegExp(search as string, "i");
      const matchedDrivers = await Driver.find({
        companyId,
        $or: [
          { driverName: searchRegex },
          { driverPhone: searchRegex },
          { driverId: searchRegex },
        ],
      }).select("_id");
      const matchedDriverIds = matchedDrivers.map((d) => d._id);

      query.$or = [
        { truckPlate: searchRegex },
        { containerNo: searchRegex },
        { driverId: { $in: matchedDriverIds } },
      ];
    }

    const totalItems = await Appointment.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limitNum);

    const appointmentList = await Appointment.find(query)
      .populate({ path: "driverId", populate: { path: "companyId" } })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      code: "success",
      data: appointmentList,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error("Get Trash Appointments Error: ", error);
    res.status(400).json({
      code: "error",
      message: "Lỗi hệ thống khi lấy danh sách thùng rác",
    });
  }
};

export const appointmentRestorePatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    if (!appointment || !appointment.isDeleted) {
      return res.status(400).json({
        code: "error",
        message: "Không tìm thấy lịch hẹn trong thùng rác",
      });
    }

    await Appointment.updateOne({ _id: id }, { isDeleted: false });
    res.status(200).json({
      code: "success",
      message: "Khôi phục lịch hẹn thành công",
    });
  } catch (error) {
    console.error("Restore Appointment Error: ", error);
    res.status(400).json({
      code: "error",
      message: "Lỗi hệ thống khi khôi phục lịch hẹn",
    });
  }
};

export const appointmentHardDelete = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    if (!appointment || !appointment.isDeleted) {
      return res.status(400).json({
        code: "error",
        message: "Không tìm thấy lịch hẹn trong thùng rác",
      });
    }

    await Appointment.deleteOne({ _id: id });
    res.status(200).json({
      code: "success",
      message: "Xóa vĩnh viễn lịch hẹn thành công",
    });
  } catch (error) {
    console.error("Hard Delete Appointment Error: ", error);
    res.status(400).json({
      code: "error",
      message: "Lỗi hệ thống khi xóa vĩnh viễn lịch hẹn",
    });
  }
};
