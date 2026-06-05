import { Router } from "express";
import * as scanController from "../controllers/scan.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

// Python AI webhook (No Auth)
router.post("/", scanController.scanPost);

// Frontend Endpoints (Require Auth)
router.get("/logs", requireAuth, scanController.getLogs);
router.get("/logs/paginated", requireAuth, scanController.getLogsPaginated);
router.get("/logs/trash/list", requireAuth, scanController.logsTrashGet);
router.get("/logs/:id", requireAuth, scanController.getLogDetail);
router.delete("/logs/:id", requireAuth, scanController.softDeleteLogDelete);
router.delete("/logs/:id/force", requireAuth, scanController.hardDeleteLogDelete);
router.patch("/logs/:id/restore", requireAuth, scanController.restoreLogPatch);
router.patch("/logs/:id/checkout", requireAuth, scanController.manualCheckoutPatch);

export default router;
