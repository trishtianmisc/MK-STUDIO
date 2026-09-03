import type { Request, Response } from "express";
import { nanoid } from "nanoid";
import * as imageService from "../services/images.service.js";
import {
  uploadImageSchema,
  updateImageSchema,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
} from "../validators/images.validator.js";

/**
 * POST /api/images/upload
 * Admin only. Uploads a product image.
 * Accepts multipart/form-data with fields: file, product_id, alt_text, sort_order, is_primary
 */
export async function uploadImage(req: Request, res: Response) {
  try {
    // Check file was provided
    if (!req.file) {
      res.status(400).json({ error: "No image file provided" });
      return;
    }

    const file = req.file;

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype as typeof ALLOWED_MIME_TYPES[number])) {
      res.status(415).json({
        error: `Unsupported file type: ${file.mimetype}. Allowed types: JPEG, PNG, WebP`,
      });
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      res.status(413).json({
        error: `File too large: ${Math.round(file.size / 1024 / 1024 * 10) / 10} MB. Maximum: 5 MB`,
      });
      return;
    }

    // Parse and validate form fields
    const body = {
      product_id: req.body.product_id,
      alt_text: req.body.alt_text || undefined,
      sort_order: req.body.sort_order !== undefined ? Number(req.body.sort_order) : undefined,
      is_primary: req.body.is_primary !== undefined ? req.body.is_primary === "true" : undefined,
    };

    const parsed = uploadImageSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      res.status(400).json({ error: "Validation failed", details: errors });
      return;
    }

    const input = parsed.data;

    // Validate product exists
    if (!(await imageService.productExists(input.product_id))) {
      res.status(400).json({ error: "Invalid product_id — product does not exist" });
      return;
    }

    // Enforce max images limit
    try {
      await imageService.enforceImageLimit(input.product_id);
    } catch (err) {
      if (err instanceof imageService.ImageLimitError) {
        res.status(409).json({
          error: `Image limit reached: ${err.currentCount}/${10} images per product`,
        });
        return;
      }
      throw err;
    }

    // Generate safe Storage path
    const ext = getExtension(file.mimetype);
    const fileName = `${nanoid(12)}.${ext}`;
    const storagePath = `products/${input.product_id}/${fileName}`;

    // Upload to Storage
    let publicUrl: string;
    try {
      publicUrl = await imageService.uploadToStorage(storagePath, file.buffer, file.mimetype);
    } catch (err) {
      console.error("[Image Upload] Storage error:", err);
      res.status(500).json({ error: "Failed to upload image to storage" });
      return;
    }

    // Handle primary image: clear existing primary if this one is primary
    const isPrimary = input.is_primary === true;
    if (isPrimary) {
      await imageService.clearPrimaryImages(input.product_id);
    }

    // Auto-set primary if this is the first image
    const imageCount = await imageService.countImagesByProduct(input.product_id);
    const shouldBePrimary = isPrimary || imageCount === 0;

    // Insert DB record
    let imageRecord;
    try {
      imageRecord = await imageService.createImageRecord({
        product_id: input.product_id,
        url: publicUrl,
        alt_text: input.alt_text ?? null,
        sort_order: input.sort_order ?? imageCount,
        is_primary: shouldBePrimary,
      });
    } catch (err) {
      // Cleanup: delete the uploaded Storage object
      console.error("[Image Upload] DB insert failed, cleaning up Storage:", err);
      try {
        await imageService.deleteFromStorage(storagePath);
      } catch (cleanupErr) {
        console.error("[Image Upload] Storage cleanup also failed:", cleanupErr);
      }
      res.status(500).json({ error: "Failed to save image metadata" });
      return;
    }

    res.status(201).json(imageRecord);
  } catch (err) {
    console.error("[Image Upload]", err);
    res.status(500).json({ error: "Failed to upload image" });
  }
}

/**
 * DELETE /api/images/:id
 * Admin only. Deletes an image and its Storage object.
 */
export async function deleteImage(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: "Image ID is required" });
      return;
    }

    // Find the image record
    const image = await imageService.getImageById(id);
    if (!image) {
      res.status(404).json({ error: "Image not found" });
      return;
    }

    // Extract Storage path from URL
    const storagePath = imageService.extractStoragePathFromUrl(image.url);
    if (!storagePath) {
      res.status(500).json({ error: "Invalid image URL format" });
      return;
    }

    // Delete Storage object first
    try {
      await imageService.deleteFromStorage(storagePath);
    } catch (err) {
      console.error("[Image Delete] Storage deletion failed:", err);
      res.status(500).json({ error: "Failed to delete image from storage" });
      return;
    }

    // Delete DB record
    await imageService.deleteImageRecord(id);

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (err) {
    console.error("[Image Delete]", err);
    res.status(500).json({ error: "Failed to delete image" });
  }
}

/**
 * PATCH /api/images/:id
 * Admin only. Updates image metadata (alt_text, sort_order, is_primary).
 */
export async function updateImage(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: "Image ID is required" });
      return;
    }

    const parsed = updateImageSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      res.status(400).json({ error: "Validation failed", details: errors });
      return;
    }

    const input = parsed.data;

    // Check image exists
    const existing = await imageService.getImageById(id);
    if (!existing) {
      res.status(404).json({ error: "Image not found" });
      return;
    }

    // Handle primary image toggle
    if (input.is_primary === true) {
      await imageService.clearPrimaryImages(existing.product_id);
    }

    const updated = await imageService.updateImageRecord(id, {
      ...(input.alt_text !== undefined && { alt_text: input.alt_text }),
      ...(input.sort_order !== undefined && { sort_order: input.sort_order }),
      ...(input.is_primary !== undefined && { is_primary: input.is_primary }),
    });

    res.json(updated);
  } catch (err) {
    console.error("[Image Update]", err);
    res.status(500).json({ error: "Failed to update image" });
  }
}

/**
 * GET /api/images/product/:productId
 * Public. Returns images for a product (respects RLS).
 * Admin users see all images; anon users see only public product images.
 */
export async function listImagesByProduct(req: Request, res: Response) {
  try {
    const { productId } = req.params;

    if (!productId) {
      res.status(400).json({ error: "Product ID is required" });
      return;
    }

    const images = await imageService.getImagesByProduct(productId);
    res.json(images);
  } catch (err) {
    console.error("[Images List]", err);
    res.status(500).json({ error: "Failed to fetch images" });
  }
}

/**
 * PATCH /api/images/reorder
 * Admin only. Reorders images for a product.
 * Accepts JSON body: { images: [{ id, sort_order }] }
 */
export async function reorderImages(req: Request, res: Response) {
  try {
    const { images } = req.body;

    if (!Array.isArray(images) || images.length === 0) {
      res.status(400).json({ error: "images array is required and must not be empty" });
      return;
    }

    // Validate each entry
    for (const img of images) {
      if (!img.id || typeof img.sort_order !== "number") {
        res.status(400).json({
          error: "Each image must have an id (UUID) and sort_order (number)",
        });
        return;
      }
      if (img.sort_order < 0 || img.sort_order > 100) {
        res.status(400).json({ error: "sort_order must be between 0 and 100" });
        return;
      }
    }

    await imageService.reorderImages(images);
    res.json({ message: "Images reordered successfully" });
  } catch (err) {
    console.error("[Images Reorder]", err);
    res.status(500).json({ error: "Failed to reorder images" });
  }
}

// =============================================================================
// HELPERS
// =============================================================================

function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  return map[mimeType] ?? "jpg";
}
