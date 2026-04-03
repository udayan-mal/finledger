import { Router } from "express";
import authRoutes from "./authRoutes.js";
import accountRoutes from "./accountRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import transactionRoutes from "./transactionRoutes.js";
import stockRoutes from "./stockRoutes.js";
import mutualFundRoutes from "./mutualFundRoutes.js";
import budgetRoutes from "./budgetRoutes.js";
import goalRoutes from "./goalRoutes.js";
import reportRoutes from "./reportRoutes.js";
import netWorthRoutes from "./netWorthRoutes.js";
import aiRoutes from "./aiRoutes.js";
import uploadRoutes from "./uploadRoutes.js";
import categoryRoutes from "./categoryRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/accounts", accountRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/transactions", transactionRoutes);
router.use("/stock-trades", stockRoutes);
router.use("/mutual-funds", mutualFundRoutes);
router.use("/budgets", budgetRoutes);
router.use("/goals", goalRoutes);
router.use("/reports", reportRoutes);
router.use("/net-worth", netWorthRoutes);
router.use("/ai", aiRoutes);
router.use("/upload", uploadRoutes);
router.use("/categories", categoryRoutes);

export default router;
