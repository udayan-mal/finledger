import { Router } from "express";
import { createMutualFund, listMutualFunds, updateMutualFund, deleteMutualFund } from "../controllers/mutualFundController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
router.get("/", listMutualFunds);
router.post("/", createMutualFund);
router.patch("/:id", updateMutualFund);
router.delete("/:id", deleteMutualFund);

export default router;
