import { Router } from "express";
import multer from "multer";
import { transactionSchema } from "@finledger/shared";
import {
  createTransaction,
  deleteTransaction,
  listTransactions,
  updateTransaction,
  uploadTransactionsCSV
} from "../controllers/transactionController.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

router.use(requireAuth);
router.get("/", listTransactions);
router.post("/upload/csv", upload.single("file"), uploadTransactionsCSV);
router.post("/", validate(transactionSchema), createTransaction);
router.patch("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

export default router;
