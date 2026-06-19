import { Router } from "express";
import * as driversController from "../../controllers/client/driver.controller";
import * as driverValidator from "../../validators/client/driver.validator";

const router = Router();

router.get("/", driversController.driversGet);
router.post("/", driverValidator.driverPost, driversController.createDriverPost);
router.get("/trash/list", driversController.driversTrashGet);
router.get("/:id", driversController.driverDetailGet);
router.patch("/:id", driverValidator.driverEdit, driversController.updateDriverPatch);
router.delete("/:id", driversController.softDeleteDriverPatch);
router.patch("/:id/restore", driversController.restoreDriverPatch);
router.delete("/:id/force", driversController.hardDeleteDriverDelete);

export default router;
