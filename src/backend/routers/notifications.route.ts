import { Router } from "express";
import * as controller from "../controllers/notification.controller";

const router = Router();

// KHÔNG gắn requirePermission: chuông thông báo là tiện ích chung, mọi tài khoản
// admin đã đăng nhập đều được xem thông báo của chính mình. Việc phân quyền nằm
// ở các trang mà thông báo trỏ tới (link), không nằm ở bản thân thông báo.
router.get("/", controller.listGet);
router.patch("/read-all", controller.markAllReadPatch);
router.patch("/:id/read", controller.markReadPatch);

export default router;
