import { Router } from "express";
import * as adminController from "../controllers/admin.controller";
import * as adminValidator from "../validators/admin.validator";

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

export default router;
