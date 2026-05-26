import { Router } from "express";
import * as yardController from "../controllers/yard.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", requireAuth, yardController.yardsGet);
router.post("/create", requireAuth, yardController.createYardPost);
router.get("/:id", yardController.yardDetailGet); // Public cho Python AI có thể lấy dữ liệu
router.patch("/:id/slots", requireAuth, yardController.updateYardSlotsPatch);
router.delete("/:id", requireAuth, yardController.deleteYardDelete);

export default router;
