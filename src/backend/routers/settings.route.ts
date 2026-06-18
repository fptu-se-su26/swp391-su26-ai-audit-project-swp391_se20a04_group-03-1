import { Router } from "express";
import * as adminController from "../controllers/admin.controller";
import * as adminValidator from "../validators/admin.validator";
import * as companyRoleController from "../controllers/companyRole.controller";
import * as companyRoleValidator from "../validators/companyRole.validator";

const router = Router();

router.get("/admins", adminController.adminsGet);
router.post(
  "/admins",
  adminValidator.createAdminPost,
  adminController.adminCreatePost,
);
router.patch(
  "/admins/:id",
  adminValidator.editAdminPatch,
  adminController.adminEditPatch,
);
router.patch("/admins/:id/status", adminController.adminChangeStatusPatch);
router.patch("/admins/:id/delete", adminController.adminDelete);

// Trash
router.get("/admins/trash", adminController.adminsTrashGet);
router.patch("/admins/:id/restore", adminController.adminRestorePatch);
router.delete("/admins/:id/force", adminController.adminForceDelete);

// Client Roles Routes
router.get("/client-roles", companyRoleController.rolesGet);
router.post(
  "/client-roles",
  companyRoleValidator.companyRolePost,
  companyRoleController.createRolePost
);
router.patch(
  "/client-roles/:id",
  companyRoleValidator.companyRolePatch,
  companyRoleController.updateRolePatch
);
router.patch("/client-roles/:id/status", companyRoleController.updateStatusPatch);
router.patch("/client-roles/:id/delete", companyRoleController.softDeleteRolePatch);

// Trash Client Roles Routes
router.get("/client-roles/trash", companyRoleController.trashRolesGet);
router.patch("/client-roles/:id/restore", companyRoleController.restoreRolePatch);
router.delete("/client-roles/:id/hard-delete", companyRoleController.hardDeleteRoleDelete);

export default router;
