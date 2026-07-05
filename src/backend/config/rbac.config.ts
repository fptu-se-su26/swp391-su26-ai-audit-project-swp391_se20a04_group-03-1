/**
 * RBAC Catalog — NGUỒN CHÂN LÝ (single source of truth) cho toàn hệ thống phân quyền.
 *
 * Resource = một "trang"/module admin (ánh xạ 1-1 với route thật).
 * Action   = thao tác trên resource đó (CRUD + mở rộng).
 *
 * Vì resource gắn chặt với code (route/page thật) nên khai báo cứng ở đây,
 * KHÔNG lưu DB. Chỉ có Role mới động (super admin tạo trong DB).
 *
 * Lưu ý: file này được copy sang frontend/src/config/rbac.ts để 2 phía dùng chung.
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
];

/** Map nhanh resourceKey -> danh sách action hợp lệ (để validate). */
export const RESOURCE_ACTION_MAP: Record<string, Action[]> = RESOURCES.reduce(
  (acc, r) => {
    acc[r.key] = r.actions;
    return acc;
  },
  {} as Record<string, Action[]>,
);

/** roleCode của Super Admin — role hệ thống, ngầm có mọi quyền. */
export const SUPER_ADMIN_CODE = "SUPER_ADMIN";

export interface PermissionInput {
  resource: string;
  actions: string[];
}

/**
 * Kiểm tra & làm sạch mảng permissions do client gửi lên.
 * - Loại resource không có trong catalog.
 * - Loại action không hợp lệ với resource đó.
 * - Gộp trùng, bỏ resource rỗng action.
 * Trả về { valid, permissions, message }.
 */
export const sanitizePermissions = (
  input: unknown,
): { valid: boolean; permissions: PermissionInput[]; message?: string } => {
  if (!Array.isArray(input)) {
    return { valid: false, permissions: [], message: "Danh sách quyền không hợp lệ" };
  }

  const cleaned: PermissionInput[] = [];

  for (const item of input) {
    if (!item || typeof item.resource !== "string") continue;
    const allowed = RESOURCE_ACTION_MAP[item.resource];
    if (!allowed) {
      return {
        valid: false,
        permissions: [],
        message: `Trang "${item.resource}" không tồn tại trong hệ thống`,
      };
    }
    const rawActions: string[] = Array.isArray(item.actions) ? item.actions : [];
    const actions = [...new Set(rawActions)].filter((a) =>
      (allowed as string[]).includes(a),
    );
    if (actions.length === 0) continue; // resource không có action nào => bỏ
    cleaned.push({ resource: item.resource, actions });
  }

  return { valid: true, permissions: cleaned };
};
