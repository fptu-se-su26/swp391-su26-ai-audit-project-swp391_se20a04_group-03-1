import express from "express";
import * as controller from "../../controllers/client/provider-settings.controller";
import { requireAuthProvider } from "../../middlewares/auth.middleware";

const router = express.Router();

router.use(requireAuthProvider);

router.get("/", controller.getSettings);
router.patch("/bic", controller.updateBicCodes);
router.patch("/profile", controller.updateProfilePatch);
router.patch("/password", controller.changePasswordPatch);
router.patch("/logout-all", controller.logoutAllPatch);

export const providerSettingsRoutes = router;
