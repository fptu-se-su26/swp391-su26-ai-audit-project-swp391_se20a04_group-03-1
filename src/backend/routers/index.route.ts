import { Router } from "express";
import authRouter from "./auth.route";
import appointmentRouter from "./appointments.route";
import yardRouter from "./yards.route";
import companyRouter from "./companies.route";
import gateRouter from "./gates.route";
import driversRouter from "./drivers.route";
import { requireAuth } from "../middlewares/auth.middleware";
import scanRouter from "./scan.route";

const rootRouter = Router();

// Combine all routers
rootRouter.use("/auth", authRouter);
rootRouter.use("/appointments", requireAuth, appointmentRouter);
rootRouter.use("/yards", requireAuth, yardRouter);
rootRouter.use("/companies", requireAuth, companyRouter);
rootRouter.use("/gates", requireAuth, gateRouter);
rootRouter.use("/drivers", requireAuth, driversRouter);
rootRouter.use("/scan", scanRouter);

export default rootRouter;
