import { Router } from "express";
import authRouter from "./auth.route";
import driversRouter from "./drivers.route";
import trucksRouter from "./trucks.route";
import { requireAuthCompany } from "../../middlewares/auth.middleware";

const clientRouter = Router();

clientRouter.use("/auth", authRouter);
clientRouter.use("/drivers", requireAuthCompany, driversRouter);
clientRouter.use("/trucks", requireAuthCompany, trucksRouter);

export default clientRouter;
