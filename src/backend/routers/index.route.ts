import { Router } from "express";
import authRouter from "./auth.route";
import appointmentRouter from "./appointments.route";
import { requireAuth } from "../middlewares/auth.middleware";
const rootRouter = Router();

// Combine all routers
rootRouter.use("/auth", authRouter);
rootRouter.use("/appointments", requireAuth, appointmentRouter);

export default rootRouter;
