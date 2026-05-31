import { Router } from "express";
import * as gateController from "../controllers/gate.controller";
import * as gateValidator from "../validators/gate.validator";

const router = Router();

router.get("/", gateController.gatesGet);
router.post("/create", gateValidator.gatePost, gateController.createGatePost);
router.get("/:id", gateController.gateDetailGet);
router.patch(
  "/:id/info",
  gateValidator.gatePost,
  gateController.updateGateInfoPatch,
);
router.delete("/:id", gateController.deleteGateDelete);

export default router;
