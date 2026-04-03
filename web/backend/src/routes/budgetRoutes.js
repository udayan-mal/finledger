import { Router } from "express";
import { createBudget, listBudgets } from "../controllers/budgetController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
router.get("/", listBudgets);
router.post("/", createBudget);

export default router;
