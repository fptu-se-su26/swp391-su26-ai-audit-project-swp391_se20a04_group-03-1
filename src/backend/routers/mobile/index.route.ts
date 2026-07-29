import { Router } from "express";
import * as authController from "../../controllers/mobile/auth.controller";
import * as driverController from "../../controllers/mobile/driver.controller";
import * as gateController from "../../controllers/mobile/gate.controller";
import {
  requireMobileAuth,
  requireRole,
} from "../../middlewares/mobile-auth.middleware";
import { mobileLogin, gateScan } from "../../validators/mobile.validator";

const mobileRouter = Router();

// ─── Auth hợp nhất (backend tự xác định vai trò theo tài khoản) ───────────────
mobileRouter.post("/auth/login", mobileLogin, authController.loginPost);
mobileRouter.get("/auth/me", requireMobileAuth, authController.meGet);
mobileRouter.post("/auth/logout", requireMobileAuth, authController.logoutPost);

// ─── Nghiệp vụ: Tài xế ───────────────────────────────────────────────────────
mobileRouter.get(
  "/driver/appointments",
  requireMobileAuth,
  requireRole("driver"),
  driverController.appointmentsGet,
);

// ─── Nghiệp vụ: Quản lý cổng ─────────────────────────────────────────────────
mobileRouter.post(
  "/gate/scan",
  requireMobileAuth,
  requireRole("gate_manager"),
  gateScan,
  gateController.scanPost,
);

// Lịch sử + thống kê các lượt do chính tài khoản cổng này quét.
mobileRouter.get(
  "/gate/history",
  requireMobileAuth,
  requireRole("gate_manager"),
  gateController.historyGet,
);

export default mobileRouter;
