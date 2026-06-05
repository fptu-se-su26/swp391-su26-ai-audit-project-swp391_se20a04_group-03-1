import { Router } from "express";
import * as providerController from "../controllers/container-providers.controller";
import * as providerValidator from "../validators/container-providers.validator";
const router = Router();

router.get("/", providerController.providersGet);

router.get("/detail/:id", providerController.providerDetailGet);

router.get("/trash", providerController.trashProvidersGet);

router.patch("/restore/:id", providerController.restoreProviderPatch);

router.delete("/hard-delete/:id", providerController.hardDeleteProviderDelete);

router.post(
  "/create",
  providerValidator.providerPost,
  providerController.createProviderPost,
);

router.patch(
  "/edit",
  providerValidator.providerEdit,
  providerController.updateProviderPatch,
);

router.patch("/status/:id", providerController.updateStatusPatch);

router.patch("/delete/:id", providerController.softDeleteProviderPatch);

export default router;
