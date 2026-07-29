"use client";

/**
 * Ô "Nhật ký sửa đổi" dùng chung cho mọi bảng danh sách (admin + client).
 *
 * Gộp 3 thông tin vào MỘT cột thay vì ba cột riêng (người tạo / người sửa / thời
 * điểm): các bảng vốn đã 6–8 cột, thêm ba cột nữa là tràn ngang và phải cuộn.
 * Hai dòng gọn, chi tiết đầy đủ (email, vai trò, giờ chính xác) nằm ở tooltip.
 */

export interface AuditActor {
  kind?: "admin" | "company" | "provider" | "driver" | "system";
  name?: string;
  email?: string;
}

/**
 * Bốn trường nhật ký mà backend trả kèm mọi bản ghi CRUD.
 * Cho interface của trang `extends AuditFields` là dùng được ngay.
 */
export interface AuditFields {
  createdBy?: AuditActor | null;
  updatedBy?: AuditActor | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

const KIND_LABEL: Record<string, string> = {
  admin: "Quản trị",
  company: "Doanh nghiệp",
  provider: "Hãng tàu",
  driver: "Tài xế",
  system: "Hệ thống",
};

const fmtFull = (value?: string | null): string =>
  value ? new Date(value).toLocaleString("vi-VN") : "—";

/** "3 phút trước", "2 giờ trước"... quá 7 ngày thì hiện ngày cho gọn. */
const fmtRelative = (value?: string | null): string => {
  if (!value) return "—";
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "—";
  const diff = Date.now() - then;
  if (diff < 0) return new Date(value).toLocaleDateString("vi-VN");
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days <= 7) return `${days} ngày trước`;
  return new Date(value).toLocaleDateString("vi-VN");
};

const actorLabel = (actor?: AuditActor | null): string => {
  if (!actor || !actor.name) return "—";
  return actor.name;
};

const actorTitle = (actor?: AuditActor | null): string => {
  if (!actor || !actor.name) return "Không có dữ liệu (bản ghi tạo trước khi bật nhật ký)";
  const parts = [actor.name];
  if (actor.kind && KIND_LABEL[actor.kind]) parts.push(`(${KIND_LABEL[actor.kind]})`);
  if (actor.email) parts.push(`— ${actor.email}`);
  return parts.join(" ");
};

export function AuditCell({
  createdBy,
  updatedBy,
  createdAt,
  updatedAt,
}: {
  createdBy?: AuditActor | null;
  updatedBy?: AuditActor | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}) {
  return (
    <div className="flex flex-col gap-1 min-w-[150px]">
      <span
        className="text-[11px] font-bold text-[#666666] dark:text-[#b3b3b3] leading-tight"
        title={`Người tạo: ${actorTitle(createdBy)}\nLúc: ${fmtFull(createdAt)}`}
      >
        <span className="text-[#999999] dark:text-[#777777]">Tạo: </span>
        {actorLabel(createdBy)}
      </span>
      <span
        className="text-[11px] font-bold text-[#121212] dark:text-[#ffffff] leading-tight"
        title={`Sửa lần cuối: ${actorTitle(updatedBy)}\nLúc: ${fmtFull(updatedAt)}`}
      >
        <span className="text-[#999999] dark:text-[#777777]">Sửa: </span>
        {actorLabel(updatedBy)}
        {updatedAt ? (
          <span className="block text-[10px] font-bold text-[#999999] dark:text-[#777777]">
            {fmtRelative(updatedAt)}
          </span>
        ) : null}
      </span>
    </div>
  );
}

/** Tiêu đề cột, để mọi bảng dùng cùng một chữ. */
export const AUDIT_TH_LABEL = "Nhật ký sửa đổi";
