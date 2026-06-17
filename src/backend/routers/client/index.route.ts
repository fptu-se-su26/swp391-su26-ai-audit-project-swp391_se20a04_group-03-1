import { Router } from "express";
import authRouter from "./auth.route";
import authProviderRouter from "./auth-provider.route";
import driversRouter from "./drivers.route";
import trucksRouter from "./trucks.route";
import { containerRoutes } from "./containers.route";
import { providerSettingsRoutes } from "./provider-settings.route";
import { requireAuthCompany } from "../../middlewares/auth.middleware";

const clientRouter = Router();

clientRouter.use("/auth", authRouter);
clientRouter.use("/provider/auth", authProviderRouter);
clientRouter.use("/drivers", requireAuthCompany, driversRouter);
clientRouter.use("/trucks", requireAuthCompany, trucksRouter);
clientRouter.use("/provider/containers", containerRoutes);
clientRouter.use("/provider/settings", providerSettingsRoutes);

export default clientRouter;
