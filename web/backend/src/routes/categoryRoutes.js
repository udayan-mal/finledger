import { Router } from "express";
import { createCategory, listCategories } from "../controllers/categoryController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
router.get("/", listCategories);
router.post("/", createCategory);

export default router;
