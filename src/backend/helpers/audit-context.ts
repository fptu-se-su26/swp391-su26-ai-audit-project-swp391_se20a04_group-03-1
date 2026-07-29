import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Ngữ cảnh "ai đang thao tác" theo từng request.
 *
 * Vì sao dùng AsyncLocalStorage thay vì truyền actor xuống từng controller:
 * dự án có ~90 điểm ghi dữ liệu (new/save/updateOne/findOneAndUpdate...) nằm rải
 * khắp controller admin lẫn client. Sửa tay từng chỗ vừa dài vừa chắc chắn sót,
 * và mọi code viết sau này lại phải nhớ tự đóng dấu.
 *
 * Cách này: middleware xác thực đặt actor vào ngữ cảnh một lần, plugin mongoose
 * (models/audit.plugin.ts) tự đọc ra khi ghi. Controller KHÔNG phải biết gì cả,
 * và code mới cũng được đóng dấu tự động.
 */

export type ActorKind =
  | "admin"
  | "company"
  | "provider"
  | "driver"
  | "system";

export interface Actor {
  kind: ActorKind;
  /** null với actor hệ thống (CV server gọi qua x-internal-secret). */
  id: string | null;
  /** Tên hiển thị, chụp lại tại thời điểm thao tác. */
  name: string;
  email?: string;
}

interface Store {
  actor: Actor | null;
}

const storage = new AsyncLocalStorage<Store>();

/** Chạy phần còn lại của request trong ngữ cảnh của actor này. */
export const runWithActor = <T>(actor: Actor | null, fn: () => T): T =>
  storage.run({ actor }, fn);

/** Actor của request hiện tại, hoặc null nếu ngoài ngữ cảnh (script, seed, test). */
export const getCurrentActor = (): Actor | null =>
  storage.getStore()?.actor ?? null;
