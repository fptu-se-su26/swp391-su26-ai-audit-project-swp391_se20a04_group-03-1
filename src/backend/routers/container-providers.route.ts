import { Router } from "express";
import * as providerController from "../controllers/container-providers.controller";
import * as providerValidator from "../validators/container-providers.validator";
import { requirePermission } from "../middlewares/rbac.middleware";
const router = Router();

const P = (action: string) => requirePermission("container-providers", action);

router.get("/", P("view"), providerController.providersGet);

router.get("/detail/:id", P("view"), providerController.providerDetailGet);

router.get("/trash", P("view"), providerController.trashProvidersGet);

router.patch("/restore/:id", P("delete"), providerController.restoreProviderPatch);

router.delete("/hard-delete/:id", P("delete"), providerController.hardDeleteProviderDelete);

router.post(
  "/create",
  P("create"),
  providerValidator.providerPost,
  providerController.createProviderPost,
);

router.patch(
  "/edit",
  P("update"),
  providerValidator.providerEdit,
  providerController.updateProviderPatch,
);

router.patch("/status/:id", P("update"), providerController.updateStatusPatch);

router.patch("/delete/:id", P("delete"), providerController.softDeleteProviderPatch);

export default router;
