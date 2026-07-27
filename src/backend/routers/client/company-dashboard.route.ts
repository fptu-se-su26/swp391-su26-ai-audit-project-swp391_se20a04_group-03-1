import { Router } from "express";
import * as controller from "../../controllers/client/company-dashboard.controller";

const router = Router();

router.get("/overview", controller.overviewGet);

export default router;
