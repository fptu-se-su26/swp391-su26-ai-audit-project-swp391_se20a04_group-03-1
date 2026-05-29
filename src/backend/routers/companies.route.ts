import { Router } from "express";
import * as companyController from "../controllers/company.controller";
import * as companyValidator from "../validators/company.validator";
const router = Router();

router.get("/", companyController.companiesGet);

router.get("/detail/:id", companyController.companyDetailGet);

router.get("/trash", companyController.trashCompaniesGet);

router.patch("/restore/:id", companyController.restoreCompanyPatch);

router.delete("/hard-delete/:id", companyController.hardDeleteCompanyDelete);

router.post(
  "/create",
  companyValidator.companyPost,
  companyController.createCompanyPost,
);

router.patch(
  "/edit",
  companyValidator.companyEdit,
  companyController.updateCompanyPatch,
);

router.patch("/status/:id", companyController.updateStatusPatch);

router.patch("/delete/:id", companyController.softDeleteCompanyPatch);

export default router;
