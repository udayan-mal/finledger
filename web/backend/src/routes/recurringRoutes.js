import { Router } from "express";
import { listRecurring, createRecurring } from "../controllers/recurringController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
router.get("/", listRecurring);
router.post("/", createRecurring);

export default router;
