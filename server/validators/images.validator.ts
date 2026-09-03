import { z } from "zod";

export const uploadImageSchema = z.object({
  product_id: z.string().uuid("Invalid product ID"),
  alt_text: z.string().max(200, "Alt text must be 200 characters or fewer").optional(),
  sort_order: z.number().int().min(0).max(100).optional(),
  is_primary: z.boolean().optional(),
});

export const updateImageSchema = z.object({
  alt_text: z.string().max(200, "Alt text must be 200 characters or fewer").optional(),
  sort_order: z.number().int().min(0).max(100).optional(),
  is_primary: z.boolean().optional(),
});

export const reorderImagesSchema = z.object({
  images: z.array(z.object({
    id: z.string().uuid(),
    sort_order: z.number().int().min(0).max(100),
  })).min(1).max(10),
});

export type UploadImageInput = z.infer<typeof uploadImageSchema>;
export type UpdateImageInput = z.infer<typeof updateImageSchema>;
export type ReorderImagesInput = z.infer<typeof reorderImagesSchema>;

/** Allowed MIME types for product images */
export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

/** Maximum file size: 5 MB */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Maximum images per product */
export const MAX_IMAGES_PER_PRODUCT = 10;
