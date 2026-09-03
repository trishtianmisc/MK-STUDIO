import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";
import * as imagesController from "../controllers/images.controller.js";
import { MAX_FILE_SIZE } from "../validators/images.validator.js";

const router = Router();

// Configure multer for memory storage (buffer in memory, no disk writes)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

// Public routes
router.get("/product/:productId", imagesController.listImagesByProduct);

// Admin-only routes
router.post(
  "/upload",
  requireAuth,
  requireAdmin,
  upload.single("file"),
  imagesController.uploadImage,
);
router.patch("/reorder/all", requireAuth, requireAdmin, imagesController.reorderImages);
router.delete("/:id", requireAuth, requireAdmin, imagesController.deleteImage);
router.patch("/:id", requireAuth, requireAdmin, imagesController.updateImage);

export default router;
