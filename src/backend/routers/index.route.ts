import { Router } from "express";
import authRouter from "./auth.route";
import appointmentRouter from "./appointments.route";
import yardRouter from "./yards.route";
import { requireAuth } from "../middlewares/auth.middleware";
import companyRouter from "./companies.route";
const rootRouter = Router();

// Combine all routers
rootRouter.use("/auth", authRouter);
rootRouter.use("/appointments", requireAuth, appointmentRouter);
rootRouter.use("/yards", requireAuth, yardRouter);
rootRouter.use("/companies", requireAuth, companyRouter);

export default rootRouter;
