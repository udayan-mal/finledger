import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createSipPlan,
  deleteSipPlan,
  listSipPlans,
  markSipPaid,
  skipSip,
  snoozeSip,
  updateSipPlan
} from "../controllers/sipController.js";

const router = Router();

router.use(requireAuth);
router.get("/", listSipPlans);
router.post("/", createSipPlan);
router.patch("/:id", updateSipPlan);
router.delete("/:id", deleteSipPlan);
router.post("/:id/mark-paid", markSipPaid);
router.post("/:id/skip", skipSip);
router.post("/:id/snooze", snoozeSip);

export default router;