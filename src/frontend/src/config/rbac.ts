/**
 * Bản sao catalog RBAC phía client (đồng bộ với backend/config/rbac.config.ts).
 * Dùng để render nhãn trang. Danh sách "chân lý" resource/action vẫn do backend
 * trả về qua /settings/roles/catalog khi dựng ma trận phân quyền.
 */

export const ACTIONS = [
  "view",
  "create",
  "update",
  "delete",
  "restore",
  "export",
] as const;

export type Action = (typeof ACTIONS)[number];

export const ACTION_LABELS: Record<Action, string> = {
  view: "Xem",
  create: "Thêm",
  update: "Sửa",
  delete: "Xóa",
  restore: "Khôi phục",
  export: "Xuất",
};

export interface ResourceDef {
  key: string;
  label: string;
  actions: Action[];
}

export const RESOURCES: ResourceDef[] = [
  { key: "dashboard", label: "Bảng điều khiển", actions: ["view"] },
  {
    key: "appointments",
    label: "Lịch hẹn",
    actions: ["view", "create", "update", "delete", "export"],
  },
  {
    key: "companies",
    label: "Công ty",
    actions: ["view", "create", "update", "delete"],
  },
  {
    key: "container-providers",
    label: "Nhà cung cấp",
    actions: ["view", "create", "update", "delete"],
  },
  {
    key: "drivers",
    label: "Tài xế",
    actions: ["view", "create", "update", "delete"],
  },
  {
    key: "gates",
    label: "Cổng",
    actions: ["view", "create", "update", "delete"],
  },
  {
    key: "yards",
    label: "Bãi",
    actions: ["view", "create", "update", "delete"],
  },
  {
    key: "containers",
    label: "Container",
    actions: ["view", "create", "update", "delete", "export"],
  },
  { key: "reports", label: "Báo cáo", actions: ["view", "export"] },
  {
    key: "settings.admins",
    label: "Tài khoản admin",
    actions: ["view", "create", "update", "delete", "restore"],
  },
  {
    key: "settings.roles",
    label: "Vai trò & Phân quyền",
    actions: ["view", "create", "update", "delete"],
  },
  {
    key: "settings.client-roles",
    label: "Loại hình doanh nghiệp",
    actions: ["view", "create", "update", "delete", "restore"],
  },
  {
    // Tham số vận hành (sức chứa khung giờ...). Không có create/delete: đây là
    // một bản ghi cấu hình duy nhất, chỉ xem và sửa.
    key: "settings.system",
    label: "Cấu hình vận hành",
    actions: ["view", "update"],
  },
];
