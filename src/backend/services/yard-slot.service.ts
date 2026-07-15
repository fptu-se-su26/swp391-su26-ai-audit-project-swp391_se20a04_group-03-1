import mongoose from "mongoose";
import { Yard } from "../models/yard.model";
import { GateTransaction } from "../models/gateTransaction.model";

/**
 * Cấp phát ô đỗ theo nghiệp vụ (logical assignment).
 *
 * Nguồn chân lý:
 *  - "Có những ô đỗ nào"  -> Yard.slots (danh mục ô đỗ, không đụng schema).
 *  - "Ô nào đang bận"     -> suy ra từ GateTransaction đang status "in"
 *                            (mỗi transaction check-in giữ 1 ô qua yardId + assignedSlot).
 *    => Khi xe check-out (status "out"), ô tự động được giải phóng, không sinh trạng thái rác.
 */

export interface SlotAssignment {
  yardId: mongoose.Types.ObjectId;
  yardName: string;
  slotName: string;
}

export interface YardCapacity {
  totalSlots: number;
  occupiedSlots: number;
  freeSlots: number;
}

/** Khóa định danh 1 ô đỗ trong toàn hệ thống (yard có thể trùng tên ô với nhau). */
const slotKey = (yardId: string, slotName: string) => `${yardId}::${slotName}`;

/** Gom tập ô đang bị giữ bởi các xe còn trong bãi (status "in"). */
async function getOccupiedKeys(): Promise<Set<string>> {
  const actives = await GateTransaction.find({
    status: "in",
    isDeleted: false,
    assignedSlot: { $ne: null },
  }).select("yardId assignedSlot");

  const occupied = new Set<string>();
  for (const tx of actives) {
    if (tx.yardId && tx.assignedSlot) {
      occupied.add(slotKey(tx.yardId.toString(), tx.assignedSlot));
    }
  }
  return occupied;
}

/** Liệt kê toàn bộ ô đỗ còn trống trong tất cả yard đang hoạt động. */
async function listFreeSlots(): Promise<SlotAssignment[]> {
  const [yards, occupied] = await Promise.all([
    Yard.find({ isDeleted: false }).select("name slots"),
    getOccupiedKeys(),
  ]);

  const free: SlotAssignment[] = [];
  for (const yard of yards) {
    const yardId = (yard._id as mongoose.Types.ObjectId).toString();
    for (const slot of yard.slots || []) {
      if (!slot.slotName) continue;
      if (!occupied.has(slotKey(yardId, slot.slotName))) {
        free.push({
          yardId: yard._id as mongoose.Types.ObjectId,
          yardName: yard.name,
          slotName: slot.slotName,
        });
      }
    }
  }
  return free;
}

/**
 * Chọn ngẫu nhiên 1 ô trống trong hệ thống.
 * @returns SlotAssignment nếu còn chỗ, hoặc null khi bãi đã đầy.
 *
 * Lưu ý: hàm chỉ ĐỌC trạng thái rồi trả về; việc "giữ chỗ" xảy ra khi caller
 * lưu transaction check-in với yardId + assignedSlot. Với 1 làn cổng thì gần
 * như không có tranh chấp; nếu sau này chạy nhiều làn song song, cần khóa/atomic.
 */
export async function assignRandomFreeSlot(): Promise<SlotAssignment | null> {
  const free = await listFreeSlots();
  if (free.length === 0) return null;
  return free[Math.floor(Math.random() * free.length)];
}

/** Thống kê sức chứa toàn hệ thống (phục vụ dashboard / cảnh báo sắp đầy). */
export async function getYardCapacity(): Promise<YardCapacity> {
  const [yards, occupied] = await Promise.all([
    Yard.find({ isDeleted: false }).select("slots"),
    getOccupiedKeys(),
  ]);

  let totalSlots = 0;
  for (const yard of yards) {
    totalSlots += (yard.slots || []).filter((s) => !!s.slotName).length;
  }
  return {
    totalSlots,
    occupiedSlots: occupied.size,
    freeSlots: Math.max(0, totalSlots - occupied.size),
  };
}
