import { Router } from "express";
import { getNetWorthHistory } from "../controllers/netWorthController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/history", requireAuth, getNetWorthHistory);

export default router;
