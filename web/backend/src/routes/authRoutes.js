import { Router } from "express";
import { authLoginSchema, authRegisterSchema } from "@finledger/shared";
import { login, refresh, register } from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.post("/register", validate(authRegisterSchema), register);
router.post("/login", validate(authLoginSchema), login);
router.post("/refresh", refresh);

export default router;
