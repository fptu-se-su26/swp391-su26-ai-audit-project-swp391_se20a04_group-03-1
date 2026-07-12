import { Router } from "express";
import * as driversController from "../controllers/drivers.controller";
import * as driverValidator from "../validators/driver.validator";
import { requirePermission } from "../middlewares/rbac.middleware";

const router = Router();

const P = (action: string) => requirePermission("drivers", action);

router.get("/", P("view"), driversController.driversGet);
router.post("/", P("create"), driverValidator.driverPost, driversController.createDriverPost);
router.get("/trash/list", P("view"), driversController.driversTrashGet);
router.get("/:id", P("view"), driversController.driverDetailGet);
router.patch("/:id", P("update"), driverValidator.driverEdit, driversController.updateDriverPatch);
router.delete("/:id", P("delete"), driversController.softDeleteDriverPatch);
router.patch("/:id/restore", P("delete"), driversController.restoreDriverPatch);
router.delete("/:id/force", P("delete"), driversController.hardDeleteDriverDelete);

export default router;
