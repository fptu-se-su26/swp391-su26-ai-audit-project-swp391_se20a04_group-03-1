import { Router } from "express";
import * as controller from "../controllers/dashboard.controller";
import { requirePermission } from "../middlewares/rbac.middleware";

const router = Router();

router.get(
  "/overview",
  requirePermission("dashboard", "view"),
  controller.overviewGet,
);

export default router;
