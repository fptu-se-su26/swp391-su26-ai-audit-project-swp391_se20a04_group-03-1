import { Router } from "express";
import authRouter from "./auth.route";
import appointmentRouter from "./appointments.route";
import yardRouter from "./yards.route";
import { requireAuth } from "../middlewares/auth.middleware";
const rootRouter = Router();

// Combine all routers
rootRouter.use("/auth", authRouter);
rootRouter.use("/appointments", requireAuth, appointmentRouter);
rootRouter.use("/yards", yardRouter);

export default rootRouter;
