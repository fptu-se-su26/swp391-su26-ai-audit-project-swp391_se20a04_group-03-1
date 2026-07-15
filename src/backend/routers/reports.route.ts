import { Router } from "express";
import * as controller from "../controllers/report.controller";
import { requirePermission } from "../middlewares/rbac.middleware";

const router = Router();

const P = (action: string) => requirePermission("reports", action);

// Số liệu tổng hợp cho trang báo cáo.
router.get("/overview", P("view"), controller.overviewGet);

// Xuất báo cáo PDF.
router.get("/export", P("export"), controller.exportGet);

export default router;
