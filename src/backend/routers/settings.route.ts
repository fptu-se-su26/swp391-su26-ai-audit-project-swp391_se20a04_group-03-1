import { Router } from "express";
import * as adminController from "../controllers/admin.controller";
import * as adminValidator from "../validators/admin.validator";
import * as companyRoleController from "../controllers/companyRole.controller";
import * as companyRoleValidator from "../validators/companyRole.validator";
import * as adminRoleController from "../controllers/adminRole.controller";
import * as adminRoleValidator from "../validators/adminRole.validator";
import * as profileController from "../controllers/profile.controller";
import * as systemSettingController from "../controllers/system-setting.controller";
import { requirePermission } from "../middlewares/rbac.middleware";

const router = Router();

// ===== Hồ sơ của chính mình (chỉ cần đăng nhập, KHÔNG cần quyền settings.admins) =====
// Đặt TRƯỚC các route "/admins/:id" để "/me" không bị nuốt bởi param route.
router.get("/me/permissions", adminRoleController.myPermissionsGet);
router.get("/me", profileController.meGet);
router.patch("/me", profileController.meUpdatePatch);
router.patch("/me/password", profileController.changePasswordPatch);
router.patch("/me/logout-all", profileController.logoutAllPatch);
router.get(
  "/roles/catalog",
  requirePermission("settings.roles", "view"),
  adminRoleController.catalogGet,
);

// ===== Cấu hình vận hành (tham số hệ thống) =====
router.get(
  "/system",
  requirePermission("settings.system", "view"),
  systemSettingController.systemSettingGet,
);
router.patch(
  "/system",
  requirePermission("settings.system", "update"),
  systemSettingController.systemSettingPatch,
);

// ===== Admin Accounts =====
router.get(
  "/admins",
  requirePermission("settings.admins", "view"),
  adminController.adminsGet,
);
router.post(
  "/admins",
  requirePermission("settings.admins", "create"),
  adminValidator.createAdminPost,
  adminController.adminCreatePost,
);
router.patch(
  "/admins/:id",
  requirePermission("settings.admins", "update"),
  adminValidator.editAdminPatch,
  adminController.adminEditPatch,
);
router.patch(
  "/admins/:id/status",
  requirePermission("settings.admins", "update"),
  adminController.adminChangeStatusPatch,
);
router.patch(
  "/admins/:id/delete",
  requirePermission("settings.admins", "delete"),
  adminController.adminDelete,
);
router.get(
  "/admins/trash",
  requirePermission("settings.admins", "view"),
  adminController.adminsTrashGet,
);
router.patch(
  "/admins/:id/restore",
  requirePermission("settings.admins", "restore"),
  adminController.adminRestorePatch,
);
router.delete(
  "/admins/:id/force",
  requirePermission("settings.admins", "delete"),
  adminController.adminForceDelete,
);

// ===== Admin Roles (RBAC) =====
router.get(
  "/roles",
  requirePermission("settings.roles", "view"),
  adminRoleController.rolesGet,
);
router.get(
  "/roles/trash",
  requirePermission("settings.roles", "view"),
  adminRoleController.trashRolesGet,
);
router.get(
  "/roles/:id",
  requirePermission("settings.roles", "view"),
  adminRoleController.roleDetailGet,
);
router.post(
  "/roles",
  requirePermission("settings.roles", "create"),
  adminRoleValidator.adminRolePost,
  adminRoleController.createRolePost,
);
router.patch(
  "/roles/:id",
  requirePermission("settings.roles", "update"),
  adminRoleValidator.adminRolePatch,
  adminRoleController.updateRolePatch,
);
router.patch(
  "/roles/:id/status",
  requirePermission("settings.roles", "update"),
  adminRoleController.updateStatusPatch,
);
router.patch(
  "/roles/:id/delete",
  requirePermission("settings.roles", "delete"),
  adminRoleController.softDeleteRolePatch,
);
router.patch(
  "/roles/:id/restore",
  requirePermission("settings.roles", "delete"),
  adminRoleController.restoreRolePatch,
);
router.delete(
  "/roles/:id/hard-delete",
  requirePermission("settings.roles", "delete"),
  adminRoleController.hardDeleteRoleDelete,
);

// ===== Client Roles (loại hình doanh nghiệp — KHÔNG phải RBAC admin) =====
router.get(
  "/client-roles",
  requirePermission("settings.client-roles", "view"),
  companyRoleController.rolesGet,
);
router.post(
  "/client-roles",
  requirePermission("settings.client-roles", "create"),
  companyRoleValidator.companyRolePost,
  companyRoleController.createRolePost,
);
router.patch(
  "/client-roles/:id",
  requirePermission("settings.client-roles", "update"),
  companyRoleValidator.companyRolePatch,
  companyRoleController.updateRolePatch,
);
router.patch(
  "/client-roles/:id/status",
  requirePermission("settings.client-roles", "update"),
  companyRoleController.updateStatusPatch,
);
router.patch(
  "/client-roles/:id/delete",
  requirePermission("settings.client-roles", "delete"),
  companyRoleController.softDeleteRolePatch,
);
router.get(
  "/client-roles/trash",
  requirePermission("settings.client-roles", "view"),
  companyRoleController.trashRolesGet,
);
router.patch(
  "/client-roles/:id/restore",
  requirePermission("settings.client-roles", "restore"),
  companyRoleController.restoreRolePatch,
);
router.delete(
  "/client-roles/:id/hard-delete",
  requirePermission("settings.client-roles", "delete"),
  companyRoleController.hardDeleteRoleDelete,
);

export default router;
