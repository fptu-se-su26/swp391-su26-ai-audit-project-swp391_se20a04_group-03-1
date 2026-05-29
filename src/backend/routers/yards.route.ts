import { Router } from "express";
import * as yardController from "../controllers/yard.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", requireAuth, yardController.yardsGet);
router.post("/create", requireAuth, yardController.createYardPost);
router.get("/:id", yardController.yardDetailGet); // Public cho Python AI có thể lấy dữ liệu
router.patch("/:id/slots", requireAuth, yardController.updateYardSlotsPatch);
router.patch("/:id/info", requireAuth, yardController.updateYardInfoPatch);
router.post("/:id/snapshot", requireAuth, yardController.takeYardSnapshotPost);
router.delete("/:id", requireAuth, yardController.deleteYardDelete);
router.post("/:id/sync-status", yardController.syncYardDataPost);

export default router;
