import { Router } from "express";
import * as trucksController from "../../controllers/client/truck.controller";
import * as truckValidator from "../../validators/client/truck.validator";

const router = Router();

router.get("/", trucksController.trucksGet);
router.post("/", truckValidator.truckPost, trucksController.createTruckPost);
router.get("/trash/list", trucksController.trucksTrashGet);
router.get("/:id", trucksController.truckDetailGet);
router.patch("/:id", truckValidator.truckEdit, trucksController.updateTruckPatch);
router.delete("/:id", trucksController.softDeleteTruckPatch);
router.patch("/:id/restore", trucksController.restoreTruckPatch);
router.delete("/:id/force", trucksController.hardDeleteTruckDelete);

export default router;
