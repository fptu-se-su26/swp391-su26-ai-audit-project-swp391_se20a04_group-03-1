import { Router } from "express";
import * as controller from "../controllers/containers.controller";

const router = Router();

router.get("/", controller.getContainers);
router.get("/detail/:id", controller.getContainerDetail);
// NOTE: Admin creates/edits bypass client validation or use a custom admin validator. For simplicity, we just use the controller directly.
router.post("/create", controller.createContainerPost);
router.patch("/update", controller.updateContainerPatch);
router.patch("/soft-delete/:id", controller.softDeleteContainerPatch);
router.get("/trash", controller.trashContainersGet);
router.patch("/restore/:id", controller.restoreContainerPatch);
router.delete("/hard-delete/:id", controller.hardDeleteContainerDelete);

export const containersRoutes = router;
