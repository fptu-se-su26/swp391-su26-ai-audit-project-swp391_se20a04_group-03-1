import express from "express";
import * as controller from "../../controllers/client/provider-settings.controller";
import { requireAuthProvider } from "../../middlewares/auth.middleware";

const router = express.Router();

router.use(requireAuthProvider);

router.get("/", controller.getSettings);
router.patch("/bic", controller.updateBicCodes);

export const providerSettingsRoutes = router;
