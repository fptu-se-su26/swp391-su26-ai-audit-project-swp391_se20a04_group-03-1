import express from "express";
import * as controller from "../../controllers/client/container.controller";
import * as validator from "../../validators/client/container.validator";
import { requireAuthProvider } from "../../middlewares/auth.middleware";

const router = express.Router();

router.use(requireAuthProvider);

router.get("/", controller.containersGet);
router.get("/detail/:id", controller.getContainerDetail);
router.post("/create", validator.containerPost, controller.createContainerPost);
router.patch("/update", validator.containerEdit, controller.updateContainerPatch);
router.patch("/soft-delete/:id", controller.softDeleteContainerPatch);

router.get("/trash", controller.trashContainersGet);
router.patch("/restore/:id", controller.restoreContainerPatch);
router.delete("/hard-delete/:id", controller.hardDeleteContainerDelete);

export const containerRoutes = router;
