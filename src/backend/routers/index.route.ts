import { Router } from "express";
import authRouter from "./auth.route";
import appointmentRouter from "./appointments.route";
import yardRouter from "./yards.route";
import companyRouter from "./companies.route";
import gateRouter from "./gates.route";
import { requireAuth } from "../middlewares/auth.middleware";

const rootRouter = Router();

// Combine all routers
rootRouter.use("/auth", authRouter);
rootRouter.use("/appointments", requireAuth, appointmentRouter);
rootRouter.use("/yards", requireAuth, yardRouter);
rootRouter.use("/companies", requireAuth, companyRouter);
rootRouter.use("/gates", requireAuth, gateRouter);

import * as scanController from "../controllers/scan.controller";
rootRouter.post("/gate/scan", scanController.scanPost);
rootRouter.get("/gate/logs", scanController.getLogs);

export default rootRouter;
