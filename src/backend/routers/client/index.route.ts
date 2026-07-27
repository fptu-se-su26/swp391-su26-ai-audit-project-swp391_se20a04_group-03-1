import { Router } from "express";
import authRouter from "./auth.route";
import authProviderRouter from "./auth-provider.route";
import driversRouter from "./drivers.route";
import trucksRouter from "./trucks.route";
import { containerRoutes } from "./containers.route";
import companyContainersRouter from "./company-containers.route";
import { providerSettingsRoutes } from "./provider-settings.route";
import appointmentRouter from "./appointments.route";
import companyDashboardRouter from "./company-dashboard.route";
import companySettingsRouter from "./company-settings.route";
import companyNotificationsRouter from "./company-notifications.route";
import providerDashboardRouter from "./provider-dashboard.route";
import providerNotificationsRouter from "./provider-notifications.route";
import {
  requireAuthCompany,
  requireAuthProvider,
} from "../../middlewares/auth.middleware";

const clientRouter = Router();

clientRouter.use("/auth", authRouter);
clientRouter.use("/provider/auth", authProviderRouter);
clientRouter.use("/drivers", requireAuthCompany, driversRouter);
clientRouter.use("/trucks", requireAuthCompany, trucksRouter);
clientRouter.use("/containers", requireAuthCompany, companyContainersRouter);
clientRouter.use("/provider/containers", containerRoutes);
clientRouter.use("/provider/settings", providerSettingsRoutes);
clientRouter.use(
  "/provider/dashboard",
  requireAuthProvider,
  providerDashboardRouter,
);
clientRouter.use(
  "/provider/notifications",
  requireAuthProvider,
  providerNotificationsRouter,
);
clientRouter.use("/appointments", requireAuthCompany, appointmentRouter);
clientRouter.use("/dashboard", requireAuthCompany, companyDashboardRouter);
clientRouter.use("/settings", requireAuthCompany, companySettingsRouter);
clientRouter.use("/notifications", requireAuthCompany, companyNotificationsRouter);

export default clientRouter;
