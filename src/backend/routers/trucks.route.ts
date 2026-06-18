import { Router } from "express";
import * as truckController from "../controllers/truck.controller";

export const trucksRoutes = Router();

trucksRoutes.get("/", truckController.trucksGet);
