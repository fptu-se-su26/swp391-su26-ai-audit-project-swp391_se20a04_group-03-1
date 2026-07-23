import { Request, Response } from "express";
import { Appointment } from "../models/appointment.model";
import {
  MAX_CAPACITY_RANGE,
  SYSTEM_SETTING_DEFAULTS,
} from "../models/system-setting.model";
import {
  getSystemSetting,
  updateSystemSetting,
} from "../services/system-setting.service";
import { AccountAdmin } from "../models/account-admin.model";

/**
 * GET /settings/system — cấu hình hiện tại + số liệu để admin biết đặt bao nhiêu
 * là hợp lý (khung giờ đông nhất đang có bao nhiêu xe).
 */
export const systemSettingGet = async (req: Request, res: Response) => {
  try {
    const setting = await getSystemSetting();

    // Khung giờ đông nhất trong 30 ngày gần đây: hạ hạn mức xuống dưới con số
    // này sẽ chặn những lịch hẹn mà thực tế cảng vẫn đang phục vụ được.
    const since = new Date(Date.now() - 30 * 24 * 3600 * 1000);
    const busiest = await Appointment.aggregate([
      {
        $match: {
          isDeleted: false,
          status: { $ne: "Cancelled" },
          scheduledDate: { $gte: since },
        },
      },
      {
        $group: {
          _id: { date: "$scheduledDate", slot: "$timeSlot" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    let updatedByName: string | null = null;
    if (setting.updatedBy) {
      const admin = await AccountAdmin.findById(setting.updatedBy)
        .select("fullName")
        .lean();
      updatedByName = (admin as any)?.fullName || null;
    }

    res.status(200).json({
      code: "success",
      data: {
        maxCapacityPerSlot: setting.maxCapacityPerSlot,
        updatedAt: setting.updatedAt,
        updatedByName,
        limits: MAX_CAPACITY_RANGE,
        defaults: SYSTEM_SETTING_DEFAULTS,
        busiestSlot: busiest[0]
          ? {
              date: busiest[0]._id.date,
              timeSlot: busiest[0]._id.slot,
              count: busiest[0].count,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("System setting get error:", error);
    res
      .status(400)
      .json({ code: "error", message: "Không thể lấy cấu hình hệ thống" });
  }
};

/** PATCH /settings/system — cập nhật tham số vận hành. */
export const systemSettingPatch = async (req: Request, res: Response) => {
  try {
    const result = await updateSystemSetting(req.body, req.user?.id);
    if (!result.ok) {
      return res.status(400).json({ code: "error", message: result.message });
    }

    res.status(200).json({
      code: "success",
      message: "Cập nhật cấu hình thành công",
      data: { maxCapacityPerSlot: result.data?.maxCapacityPerSlot },
    });
  } catch (error) {
    console.error("System setting update error:", error);
    res
      .status(400)
      .json({ code: "error", message: "Không thể cập nhật cấu hình hệ thống" });
  }
};
