import { Router } from "express";
import * as gateController from "../controllers/gate.controller";
import * as gateValidator from "../validators/gate.validator";
import { requirePermission } from "../middlewares/rbac.middleware";
const router = Router();

const P = (action: string) => requirePermission("gates", action);

router.get("/", P("view"), gateController.gatesGet);
router.post("/create", P("create"), gateValidator.gatePost, gateController.createGatePost);
router.get("/:id", P("view"), gateController.gateDetailGet);
router.patch(
  "/:id/info",
  P("update"),
  gateValidator.gatePost,
  gateController.updateGateInfoPatch,
);
router.delete("/:id", P("delete"), gateController.deleteGateDelete);
router.get("/trash/list", P("view"), gateController.gatesTrashGet);
router.patch("/:id/restore", P("delete"), gateController.restoreGatePatch);
router.delete("/:id/force", P("delete"), gateController.hardDeleteGateDelete);

export default router;
