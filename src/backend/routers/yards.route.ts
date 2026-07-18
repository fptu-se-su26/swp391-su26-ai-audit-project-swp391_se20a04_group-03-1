import { Router } from "express";
import * as yardController from "../controllers/yard.controller";
import * as yardValidator from "../validators/yard.validator";
import { requirePermission } from "../middlewares/rbac.middleware";

const router = Router();

const P = (action: string) => requirePermission("yards", action);

router.get("/", P("view"), yardController.yardsGet);
router.post("/create", P("create"), yardValidator.yardPost, yardController.createYardPost);
router.get("/:id", P("view"), yardController.yardDetailGet); // Public cho Python AI (qua internal-secret)
router.patch("/:id/slots", P("update"), yardController.updateYardSlotsPatch);
router.patch(
  "/:id/info",
  P("update"),
  yardValidator.yardPost,
  yardController.updateYardInfoPatch,
);
router.post("/:id/snapshot", P("update"), yardController.takeYardSnapshotPost);
router.delete("/:id", P("delete"), yardController.deleteYardDelete);
router.post("/:id/sync-status", P("update"), yardController.syncYardDataPost);
// CV báo mã container đọc được ở 1 ô của bãi -> backend đối chiếu & phát loa nếu sai vị trí.
// Nội bộ (x-internal-secret bỏ qua auth -> coi như super admin).
router.post("/:id/verify-slot", P("update"), yardController.verifyYardSlotPost);

router.get("/trash/list", P("view"), yardController.yardsTrashGet);
router.patch("/:id/restore", P("delete"), yardController.restoreYardPatch);
router.delete("/:id/force", P("delete"), yardController.hardDeleteYardDelete);

export default router;
