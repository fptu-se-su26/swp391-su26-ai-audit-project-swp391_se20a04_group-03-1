import { Router } from "express";
import { register } from "../controllers/auth.controller";
import * as authValidate from "../validators/auth.validator";

const router = Router();

// Route: POST /api/auth/register
router.post("/register", authValidate.registerPost, register);

export default router;
