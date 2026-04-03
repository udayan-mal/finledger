import { Router } from "express";
import { getReceiptUploadUrl } from "../controllers/uploadController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/receipt", requireAuth, getReceiptUploadUrl);

export default router;
