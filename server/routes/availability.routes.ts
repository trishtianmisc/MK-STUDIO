import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";
import * as availabilityController from "../controllers/availability.controller.js";

const router = Router();

// Public routes
router.get("/products/:slug/availability", availabilityController.getAvailability);

// Admin-only routes
router.post("/admin/availability", requireAuth, requireAdmin, availabilityController.createAvailability);
router.delete("/admin/availability/:id", requireAuth, requireAdmin, availabilityController.deleteAvailability);

export default router;
