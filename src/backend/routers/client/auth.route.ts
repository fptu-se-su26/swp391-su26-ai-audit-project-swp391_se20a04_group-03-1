import { Router } from "express";
import * as authController from "../../controllers/client/auth.controller";
import * as authValidate from "../../validators/client/auth.validator";

const router = Router();

router.post("/register", authValidate.registerPost, authController.registerPost);
router.post("/login", authValidate.loginPost, authController.loginPost);
router.get("/logout", authController.logout);

export default router;
