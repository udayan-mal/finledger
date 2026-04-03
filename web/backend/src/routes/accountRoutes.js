import { Router } from "express";
import { createAccount, listAccounts } from "../controllers/accountController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
router.get("/", listAccounts);
router.post("/", createAccount);

export default router;
