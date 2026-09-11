import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";
import * as availabilityController from "../controllers/availability.controller.js";

const router = Router();

// Public routes
router.get("/products/:slug/availability", availabilityController.getAvailability);

// Admin-only routes
router.get("/admin/rentals", requireAuth, requireAdmin, availabilityController.listAllRentals);
router.get("/admin/rentals/upcoming", requireAuth, requireAdmin, availabilityController.listUpcomingRentals);
router.post("/admin/availability", requireAuth, requireAdmin, availabilityController.createAvailability);
router.put("/admin/availability/:id", requireAuth, requireAdmin, availabilityController.updateAvailability);
router.delete("/admin/availability/:id", requireAuth, requireAdmin, availabilityController.deleteAvailability);

export default router;
