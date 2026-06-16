import { Router } from "express";
import authRouter from "./auth.route";

const clientRouter = Router();

clientRouter.use("/auth", authRouter);

export default clientRouter;
