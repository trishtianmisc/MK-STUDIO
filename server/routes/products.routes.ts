import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";
import * as productsController from "../controllers/products.controller.js";

const router = Router();

// Admin-only routes (must come before /:slug)
router.get("/admin/stats", requireAuth, requireAdmin, productsController.getAdminStats);

// Public routes (no auth required)
router.get("/", productsController.listProducts);
router.get("/featured", productsController.listFeaturedProducts);
router.get("/:slug", productsController.getProductBySlug);

// Admin-only routes
router.post("/", requireAuth, requireAdmin, productsController.createProduct);
router.put("/:id", requireAuth, requireAdmin, productsController.updateProduct);
router.delete("/:id", requireAuth, requireAdmin, productsController.deleteProduct);

export default router;
