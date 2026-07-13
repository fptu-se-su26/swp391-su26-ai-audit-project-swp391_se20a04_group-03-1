import { Router } from "express";
import * as companyController from "../controllers/company.controller";
import * as companyValidator from "../validators/company.validator";
import { requirePermission } from "../middlewares/rbac.middleware";
const router = Router();

const P = (action: string) => requirePermission("companies", action);

router.get("/", P("view"), companyController.companiesGet);

router.get("/detail/:id", P("view"), companyController.companyDetailGet);

router.get("/trash", P("view"), companyController.trashCompaniesGet);

router.patch("/restore/:id", P("delete"), companyController.restoreCompanyPatch);

router.delete("/hard-delete/:id", P("delete"), companyController.hardDeleteCompanyDelete);

router.post(
  "/create",
  P("create"),
  companyValidator.companyPost,
  companyController.createCompanyPost,
);

router.patch(
  "/edit",
  P("update"),
  companyValidator.companyEdit,
  companyController.updateCompanyPatch,
);

router.patch("/status/:id", P("update"), companyController.updateStatusPatch);

router.patch("/delete/:id", P("delete"), companyController.softDeleteCompanyPatch);

export default router;
