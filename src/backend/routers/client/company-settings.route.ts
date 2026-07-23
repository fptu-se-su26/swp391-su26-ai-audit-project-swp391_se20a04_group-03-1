import { Router } from "express";
import * as controller from "../../controllers/client/company-settings.controller";

const router = Router();

router.get("/me", controller.meGet);
router.patch("/me", controller.meUpdatePatch);
router.patch("/password", controller.changePasswordPatch);
router.patch("/logout-all", controller.logoutAllPatch);

export default router;
