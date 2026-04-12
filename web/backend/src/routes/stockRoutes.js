import { Router } from "express";
import { createStockTrade, listStockTrades, updateStockTrade, deleteStockTrade } from "../controllers/stockController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
router.get("/", listStockTrades);
router.post("/", createStockTrade);
router.patch("/:id", updateStockTrade);
router.delete("/:id", deleteStockTrade);

export default router;
