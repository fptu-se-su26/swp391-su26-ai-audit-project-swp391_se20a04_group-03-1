import { Router } from "express";
import * as controller from "../../controllers/client/provider-dashboard.controller";

const router = Router();

router.get("/overview", controller.overviewGet);
router.get("/history", controller.historyGet);

export default router;
