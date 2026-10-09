import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";
import { rateLimit } from "../middleware/rateLimit.js";
import * as feedbackController from "../controllers/feedback.controller.js";

const router = Router();

const submitLimiter = rateLimit(15 * 60 * 1000, 5);

// Public — anyone can submit feedback (rate limited)
router.post("/feedback", submitLimiter, feedbackController.submitFeedback);

// Admin-only
router.get(
  "/admin/feedback",
  requireAuth,
  requireAdmin,
  feedbackController.listFeedback
);
router.patch(
  "/admin/feedback/:id",
  requireAuth,
  requireAdmin,
  feedbackController.updateFeedback
);
router.delete(
  "/admin/feedback/:id",
  requireAuth,
  requireAdmin,
  feedbackController.deleteFeedback
);

export default router;
