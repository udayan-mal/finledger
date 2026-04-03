import { Router } from "express";
import { createGoal, listGoals } from "../controllers/goalController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
router.get("/", listGoals);
router.post("/", createGoal);

export default router;
