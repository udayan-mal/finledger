import { Router } from "express";
import { createMutualFund, listMutualFunds } from "../controllers/mutualFundController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
router.get("/", listMutualFunds);
router.post("/", createMutualFund);

export default router;
