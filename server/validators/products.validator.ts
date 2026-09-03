import { z } from "zod";

export const createProductSchema = z.object({
  category_id: z.string().uuid("Invalid category ID"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200, "Slug too long")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be URL-safe (lowercase alphanumeric with hyphens)"),
  name: z.string().min(1, "Name is required").max(200, "Name too long"),
  description: z.string().nullable().optional(),
  details: z.string().nullable().optional(),
  sizing: z.string().nullable().optional(),
  sizes: z.array(z.string()).default([]),
  fabric: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  rental_price: z.number().int().positive("Rental price must be positive"),
  availability: z.enum(["Available", "Limited", "Unavailable"]).default("Available"),
  unavailable_days: z.array(z.number().int().min(1).max(31)).default([]),
  rental_note: z.string().nullable().optional(),
  is_featured: z.boolean().default(false),
  is_public: z.boolean().default(true),
  image: z.string().nullable().optional(),
  sort_order: z.number().int().default(0),
});

export const updateProductSchema = z.object({
  category_id: z.string().uuid("Invalid category ID").optional(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200, "Slug too long")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be URL-safe (lowercase alphanumeric with hyphens)")
    .optional(),
  name: z.string().min(1, "Name is required").max(200, "Name too long").optional(),
  description: z.string().nullable().optional(),
  details: z.string().nullable().optional(),
  sizing: z.string().nullable().optional(),
  sizes: z.array(z.string()).optional(),
  fabric: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  rental_price: z.number().int().positive("Rental price must be positive").optional(),
  availability: z.enum(["Available", "Limited", "Unavailable"]).optional(),
  unavailable_days: z.array(z.number().int().min(1).max(31)).optional(),
  rental_note: z.string().nullable().optional(),
  is_featured: z.boolean().optional(),
  is_public: z.boolean().optional(),
  image: z.string().nullable().optional(),
  sort_order: z.number().int().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
