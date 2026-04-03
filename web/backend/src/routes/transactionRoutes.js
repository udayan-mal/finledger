import { Router } from "express";
import { transactionSchema } from "@finledger/shared";
import {
  createTransaction,
  deleteTransaction,
  listTransactions,
  updateTransaction
} from "../controllers/transactionController.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(requireAuth);
router.get("/", listTransactions);
router.post("/", validate(transactionSchema), createTransaction);
router.patch("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

export default router;
