import mongoose, { Schema } from "mongoose";

/**
 * Tham số vận hành do admin cấu hình, thay cho các hằng số gõ cứng trong code.
 *
 * Là một DOCUMENT DUY NHẤT (singleton): `key` luôn bằng SYSTEM_SETTING_KEY và
 * có unique index. Làm vậy thay vì bảng khóa-giá trị vì các tham số này ít, có
 * kiểu rõ ràng, và cần validate từng cái — để dạng Mixed thì mất cả hai.
 *
 * Muốn thêm tham số mới: khai thêm một trường ở đây kèm default, bổ sung
 * validate trong system-setting.service, rồi thêm ô nhập ở trang
 * /admin/settings/system. Bản ghi cũ tự có giá trị mặc định nên không cần
 * migration.
 */

export const SYSTEM_SETTING_KEY = "global";

/** Giá trị mặc định — cũng chính là hằng số đang gõ cứng trước đây. */
export const SYSTEM_SETTING_DEFAULTS = {
  maxCapacityPerSlot: 20,
};

export const MAX_CAPACITY_RANGE = { min: 1, max: 500 };

export interface ISystemSetting {
  key: string;
  /** Số lịch hẹn tối đa cho một khung giờ trong một ngày. */
  maxCapacityPerSlot: number;
  /** Admin sửa lần gần nhất — để soát lại khi số liệu đột nhiên đổi. */
  updatedBy?: mongoose.Types.ObjectId | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const systemSettingSchema = new Schema<ISystemSetting>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: SYSTEM_SETTING_KEY,
    },
    maxCapacityPerSlot: {
      type: Number,
      required: true,
      default: SYSTEM_SETTING_DEFAULTS.maxCapacityPerSlot,
      min: MAX_CAPACITY_RANGE.min,
      max: MAX_CAPACITY_RANGE.max,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "AccountAdmin",
      default: null,
    },
  },
  { timestamps: true },
);

export const SystemSetting = mongoose.model<ISystemSetting>(
  "SystemSetting",
  systemSettingSchema,
  "system_settings",
);
