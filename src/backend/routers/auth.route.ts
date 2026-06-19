import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import * as authValidate from "../validators/auth.validator";

const router = Router();

// Route: POST /api/auth/register
router.post(
  "/register",
  authValidate.registerPost,
  authController.registerPost,
);

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
