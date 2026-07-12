import { Router } from "express";
import * as controller from "../controllers/containers.controller";
import { requirePermission } from "../middlewares/rbac.middleware";

const router = Router();

const P = (action: string) => requirePermission("containers", action);

router.get("/", P("view"), controller.getContainers);
router.get("/detail/:id", P("view"), controller.getContainerDetail);
// NOTE: Admin creates/edits bypass client validation or use a custom admin validator. For simplicity, we just use the controller directly.
router.post("/create", P("create"), controller.createContainerPost);
router.patch("/update", P("update"), controller.updateContainerPatch);
router.patch("/soft-delete/:id", P("delete"), controller.softDeleteContainerPatch);
router.get("/trash", P("view"), controller.trashContainersGet);
router.patch("/restore/:id", P("delete"), controller.restoreContainerPatch);
router.delete("/hard-delete/:id", P("delete"), controller.hardDeleteContainerDelete);

export const containersRoutes = router;
