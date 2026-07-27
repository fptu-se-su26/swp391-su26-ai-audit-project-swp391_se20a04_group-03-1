import { Router } from "express";
import * as controller from "../../controllers/client/company-notification.controller";

const router = Router();

router.get("/", controller.listGet);
router.patch("/read-all", controller.markAllReadPatch);
router.patch("/:id/read", controller.markReadPatch);

export default router;
