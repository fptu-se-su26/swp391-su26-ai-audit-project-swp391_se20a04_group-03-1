import { Request, Response, NextFunction } from "express";
import { AdminRole } from "../models/adminRole.model";
import { redisClient } from "../config/redis.config";
import { SUPER_ADMIN_CODE } from "../config/rbac.config";

const ROLE_CACHE_TTL = 300; // 5 phút

interface CachedRole {
  roleCode: string;
  isSystem: boolean;
  status: string;
  isDeleted: boolean;
  permissions: { resource: string; actions: string[] }[];
}

const cacheKeyOf = (roleId: string) => `rbac:role:${roleId}`;

/** Nạp role từ Redis, miss thì query Mongo rồi cache lại. */
const loadRole = async (roleId: string): Promise<CachedRole | null> => {
  const key = cacheKeyOf(roleId);
  const cached = await redisClient.get(key);
  if (cached) return JSON.parse(cached);

  const role = await AdminRole.findById(roleId).lean();
  if (!role) return null;

  const data: CachedRole = {
    roleCode: role.roleCode,
    isSystem: !!role.isSystem,
    status: role.status,
    isDeleted: !!role.isDeleted,
    permissions: (role.permissions || []).map((p: any) => ({
      resource: p.resource,
      actions: p.actions,
    })),
  };
  await redisClient.setEx(key, ROLE_CACHE_TTL, JSON.stringify(data));
  return data;
};

/** Xóa cache 1 role — gọi sau khi cập nhật quyền để áp dụng tức thì. */
export const invalidateRoleCache = async (roleId: string) => {
  await redisClient.del(cacheKeyOf(roleId));
};

/**
 * Đặt SAU requireAuth. Nạp permission của role vào req.user.
 * Dừng ngay nếu role không tồn tại / bị khóa / đã xóa.
 */
export const attachPermissions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Request nội bộ từ AI Server (requireAuth đã bỏ qua) -> không có req.user.
    if (!req.user || !req.user.role) {
      req.user = req.user || {};
      req.user.isSuperAdmin = true; // internal service coi như full quyền
      req.user.permissions = [];
      return next();
    }

    const role = await loadRole(String(req.user.role));
    if (!role || role.isDeleted || role.status !== "Active") {
      return res.status(403).json({
        code: "error",
        message: "Vai trò của bạn không hợp lệ hoặc đã bị vô hiệu hóa",
      });
    }

    req.user.roleCode = role.roleCode;
    req.user.isSuperAdmin = role.isSystem && role.roleCode === SUPER_ADMIN_CODE;
    req.user.permissions = role.permissions;
    next();
  } catch (error) {
    console.error("attachPermissions error:", error);
    return res.status(403).json({
      code: "error",
      message: "Không thể xác thực quyền truy cập",
    });
  }
};

/**
 * Chặn route theo resource + action. Super admin luôn qua.
 * Dùng: router.post("/admins", requirePermission("settings.admins","create"), ...)
 */
export const requirePermission =
  (resource: string, action: string) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.isSuperAdmin) return next();

    const perm = req.user?.permissions?.find(
      (p: any) => p.resource === resource,
    );
    if (perm && perm.actions.includes(action)) return next();

    return res.status(403).json({
      code: "error",
      message: "Bạn không có quyền thực hiện thao tác này",
    });
  };
