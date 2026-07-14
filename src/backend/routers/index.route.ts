import { Router } from "express";
import authRouter from "./auth.route";
import appointmentRouter from "./appointments.route";
import yardRouter from "./yards.route";
import companyRouter from "./companies.route";
import gateRouter from "./gates.route";
import driversRouter from "./drivers.route";
import { requireAuth } from "../middlewares/auth.middleware";
import { attachPermissions } from "../middlewares/rbac.middleware";
import scanRouter from "./scan.route";
import containerProvidersRouter from "./container-providers.route";
import settingsRouter from "./settings.route";
import reportsRouter from "./reports.route";
import clientRouter from "./client/index.route";
import mobileRouter from "./mobile/index.route";

import { containersRoutes } from "./containers.route";
import { trucksRoutes } from "./trucks.route";

const rootRouter = Router();

// Combine all routers
rootRouter.use("/client", clientRouter);
rootRouter.use("/auth", authRouter);
// App mobile (tài xế + quản lý cổng): xác thực Bearer riêng, không dùng cookie.
rootRouter.use("/mobile", mobileRouter);

// Khu vực admin: requireAuth (xác thực) -> attachPermissions (nạp quyền).
// Việc siết quyền theo resource + action (view/create/update/delete/export)
// được đặt trong từng router con để phân tách CRUD rõ ràng.
rootRouter.use("/appointments", requireAuth, attachPermissions, appointmentRouter);
rootRouter.use("/yards", requireAuth, attachPermissions, yardRouter);
rootRouter.use("/companies", requireAuth, attachPermissions, companyRouter);
rootRouter.use("/gates", requireAuth, attachPermissions, gateRouter);
rootRouter.use("/drivers", requireAuth, attachPermissions, driversRouter);
rootRouter.use(
  "/container-providers",
  requireAuth,
  attachPermissions,
  containerProvidersRouter,
);
rootRouter.use("/containers", requireAuth, attachPermissions, containersRoutes);
// trucks: chưa có resource riêng trong catalog -> chỉ nạp quyền, không cổng.
rootRouter.use("/trucks", requireAuth, attachPermissions, trucksRoutes);
rootRouter.use("/scan", scanRouter);
rootRouter.use("/reports", requireAuth, attachPermissions, reportsRouter);

// settings: cổng truy cập & CRUD được siết chi tiết bên trong settings.route.ts
rootRouter.use("/settings", requireAuth, attachPermissions, settingsRouter);

export default rootRouter;
