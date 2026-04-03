import { Router } from "express";
import { createStockTrade, listStockTrades } from "../controllers/stockController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
router.get("/", listStockTrades);
router.post("/", createStockTrade);

export default router;
