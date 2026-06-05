import { Router } from "express";
import authRouter from "./auth.router";

const rootRouter = Router();

// Combine all routers
rootRouter.use("/auth", authRouter);

export default rootRouter;
