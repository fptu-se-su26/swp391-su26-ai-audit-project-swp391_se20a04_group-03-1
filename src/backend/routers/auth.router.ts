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

router.get("/logout", authController.logout);

export default router;
