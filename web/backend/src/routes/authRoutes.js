import { Router } from "express";
import { authLoginSchema, authRegisterSchema } from "@finledger/shared";
import { login, refresh, register, getProfile, updateProfile } from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/register", validate(authRegisterSchema), register);
router.post("/login", validate(authLoginSchema), login);
router.post("/refresh", refresh);
router.get("/profile", requireAuth, getProfile);
router.patch("/profile", requireAuth, updateProfile);

export default router;
