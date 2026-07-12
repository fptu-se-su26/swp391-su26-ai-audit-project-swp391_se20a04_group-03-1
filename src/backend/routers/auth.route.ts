import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import * as authValidate from "../validators/auth.validator";

const router = Router();

// Đăng ký công khai đã bị vô hiệu hóa: chỉ tài khoản được cấp & xét duyệt mới vào hệ thống.
router.post("/login", authValidate.loginPost, authController.loginPost);

router.get("/client-roles", authController.getClientRoles);

router.get("/logout", authController.logout);

router.post(
  "/forgot-password",
  authValidate.forgotPasswordPost,
  authController.forgotPasswordPost,
);

router.post(
  "/reset-password",
  authValidate.resetPasswordPost,
  authController.resetPasswordPost,
);

export default router;
