import mongoose from "mongoose";
import {
  ISystemSetting,
  MAX_CAPACITY_RANGE,
  SYSTEM_SETTING_DEFAULTS,
  SYSTEM_SETTING_KEY,
  SystemSetting,
} from "../models/system-setting.model";

/**
 * Đọc/ghi tham số vận hành. Mọi nơi cần tham số phải đi qua đây, KHÔNG truy vấn
 * model trực tiếp — để chỉ có một chỗ lo chuyện tạo bản ghi mặc định và fallback.
 *
 * Cố tình KHÔNG cache: hàm này chỉ được gọi lúc tạo lịch hẹn (vài lần một phút),
 * và là một findOne trên collection có đúng một document nên chi phí không đáng
 * kể. Thêm cache sẽ phải lo chuyện đồng bộ giữa nhiều tiến trình — đắt hơn thứ
 * nó tiết kiệm được.
 */

/**
 * Lấy bản ghi cấu hình, tự tạo với giá trị mặc định nếu chưa có.
 *
 * upsert + setOnInsert: hai request đầu tiên chạy song song vẫn chỉ tạo ra một
 * document nhờ unique index trên `key`, không cần khóa.
 */
export const getSystemSetting = async (): Promise<ISystemSetting> => {
  const doc = await SystemSetting.findOneAndUpdate(
    { key: SYSTEM_SETTING_KEY },
    { $setOnInsert: { ...SYSTEM_SETTING_DEFAULTS, key: SYSTEM_SETTING_KEY } },
    // returnDocument thay cho `new: true` — bản Mongoose này đã bỏ `new`.
    { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
  ).lean();

  return doc as ISystemSetting;
};

/**
 * Sức chứa tối đa mỗi khung giờ.
 *
 * Có fallback về mặc định: nếu DB trục trặc thì đặt lịch hẹn vẫn chạy với hạn
 * mức cũ, thay vì chặn toàn bộ việc đặt lịch của cả cảng.
 */
export const getMaxCapacityPerSlot = async (): Promise<number> => {
  try {
    const setting = await getSystemSetting();
    const value = Number(setting?.maxCapacityPerSlot);
    return Number.isFinite(value) && value > 0
      ? value
      : SYSTEM_SETTING_DEFAULTS.maxCapacityPerSlot;
  } catch (error) {
    console.error("[SystemSetting] Không đọc được cấu hình, dùng mặc định:", error);
    return SYSTEM_SETTING_DEFAULTS.maxCapacityPerSlot;
  }
};

export interface UpdateResult {
  ok: boolean;
  message?: string;
  data?: ISystemSetting;
}

/** Cập nhật tham số. Trả lỗi dạng dữ liệu để controller quyết định mã HTTP. */
export const updateSystemSetting = async (
  input: { maxCapacityPerSlot?: unknown },
  updatedBy?: string,
): Promise<UpdateResult> => {
  const raw = input.maxCapacityPerSlot;
  const value = Number(raw);

  if (raw === undefined || raw === null || raw === "" || !Number.isFinite(value)) {
    return { ok: false, message: "Sức chứa mỗi khung giờ phải là một số" };
  }
  // Chặn số thập phân: "20.5 xe" không có nghĩa, và để lọt vào DB thì thông báo
  // "đã đầy (20/20.5 xe)" hiện ra rất khó hiểu.
  if (!Number.isInteger(value)) {
    return { ok: false, message: "Sức chứa mỗi khung giờ phải là số nguyên" };
  }
  if (value < MAX_CAPACITY_RANGE.min || value > MAX_CAPACITY_RANGE.max) {
    return {
      ok: false,
      message: `Sức chứa mỗi khung giờ phải từ ${MAX_CAPACITY_RANGE.min} đến ${MAX_CAPACITY_RANGE.max}`,
    };
  }

  const doc = await SystemSetting.findOneAndUpdate(
    { key: SYSTEM_SETTING_KEY },
    {
      $set: {
        maxCapacityPerSlot: value,
        updatedBy:
          updatedBy && mongoose.isValidObjectId(updatedBy)
            ? new mongoose.Types.ObjectId(updatedBy)
            : null,
      },
      $setOnInsert: { key: SYSTEM_SETTING_KEY },
    },
    {
      returnDocument: "after",
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    },
  ).lean();

  return { ok: true, data: doc as ISystemSetting };
};
