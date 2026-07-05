import { Router } from "express";
import * as authController from "../../controllers/client/auth.controller";
import * as authValidate from "../../validators/client/auth.validator";

const router = Router();

// Đăng ký công khai đã bị vô hiệu hóa: chỉ tài khoản được cấp & xét duyệt mới vào hệ thống.
router.post("/login", authValidate.loginPost, authController.loginPost);
router.get("/logout", authController.logout);

router.post("/password/forgot", authValidate.forgotPasswordPost, authController.forgotPasswordPost);
router.post("/password/otp", authValidate.otpPasswordPost, authController.otpPasswordPost);
router.post("/password/reset", authValidate.resetPasswordPost, authController.resetPasswordPost);

export default router;
