import { Router } from "express";
import { getRangeReport } from "../controllers/reportsController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/range", requireAuth, getRangeReport);

export default router;
