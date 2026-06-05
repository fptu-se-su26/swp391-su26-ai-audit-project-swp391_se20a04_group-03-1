import { Router } from "express";
import * as yardController from "../controllers/yard.controller";
import * as yardValidator from "../validators/yard.validator";

const router = Router();

router.get("/", yardController.yardsGet);
router.post("/create", yardValidator.yardPost, yardController.createYardPost);
router.get("/:id", yardController.yardDetailGet); // Public cho Python AI có thể lấy dữ liệu
router.patch("/:id/slots", yardController.updateYardSlotsPatch);
router.patch(
  "/:id/info",
  yardValidator.yardPost,
  yardController.updateYardInfoPatch,
);
router.post("/:id/snapshot", yardController.takeYardSnapshotPost);
router.delete("/:id", yardController.deleteYardDelete);
router.post("/:id/sync-status", yardController.syncYardDataPost);

router.get("/trash/list", yardController.yardsTrashGet);
router.patch("/:id/restore", yardController.restoreYardPatch);
router.delete("/:id/force", yardController.hardDeleteYardDelete);

export default router;
