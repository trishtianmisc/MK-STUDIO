import { z } from "zod";

export const createCategorySchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200, "Slug too long")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be URL-safe (lowercase alphanumeric with hyphens)"),
  name: z.string().min(1, "Name is required").max(200, "Name too long"),
  description: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  sort_order: z.number().int().default(0),
});

export const updateCategorySchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200, "Slug too long")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be URL-safe (lowercase alphanumeric with hyphens)")
    .optional(),
  name: z.string().min(1, "Name is required").max(200, "Name too long").optional(),
  description: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  sort_order: z.number().int().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
