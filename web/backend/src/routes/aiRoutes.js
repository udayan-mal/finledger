import { Router } from "express";
import { chatAdvisor, getInsights } from "../controllers/aiController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/chat", requireAuth, chatAdvisor);
router.get("/insights", requireAuth, getInsights);

export default router;
