import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";
import * as categoriesController from "../controllers/categories.controller.js";

const router = Router();

// Public routes (no auth required)
router.get("/", categoriesController.listCategories);
router.get("/:id", categoriesController.getCategoryById);

// Admin-only routes
router.post("/", requireAuth, requireAdmin, categoriesController.createCategory);
router.put("/:id", requireAuth, requireAdmin, categoriesController.updateCategory);
router.delete("/:id", requireAuth, requireAdmin, categoriesController.deleteCategory);

export default router;
