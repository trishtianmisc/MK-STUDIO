import type { Request, Response } from "express";
import * as categoryService from "../services/categories.service.js";
import { createCategorySchema, updateCategorySchema } from "../validators/categories.validator.js";

/**
 * GET /api/categories
 * Public. Returns all categories.
 */
export async function listCategories(_req: Request, res: Response) {
  try {
    const categories = await categoryService.getAllCategories();
    res.json(categories);
  } catch (err) {
    console.error("[Categories List]", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
}

/**
 * GET /api/categories/:id
 * Public. Returns a single category by ID.
 */
export async function getCategoryById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: "Category ID is required" });
      return;
    }

    const category = await categoryService.getCategoryById(id);
    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
    res.json(category);
  } catch (err) {
    console.error("[Category Get]", err);
    res.status(500).json({ error: "Failed to fetch category" });
  }
}

/**
 * POST /api/categories
 * Admin only. Creates a new category.
 */
export async function createCategory(req: Request, res: Response) {
  try {
    const parsed = createCategorySchema.safeParse(req.body);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      res.status(400).json({ error: "Validation failed", details: errors });
      return;
    }

    const input = parsed.data;

    // Check for duplicate slug
    if (await categoryService.slugExists(input.slug)) {
      res.status(409).json({ error: "A category with this slug already exists" });
      return;
    }

    const category = await categoryService.createCategory(input);
    res.status(201).json(category);
  } catch (err) {
    console.error("[Category Create]", err);
    res.status(500).json({ error: "Failed to create category" });
  }
}

/**
 * PUT /api/categories/:id
 * Admin only. Updates an existing category.
 */
export async function updateCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: "Category ID is required" });
      return;
    }

    const parsed = updateCategorySchema.safeParse(req.body);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      res.status(400).json({ error: "Validation failed", details: errors });
      return;
    }

    const input = parsed.data;

    // Check category exists
    const existing = await categoryService.getCategoryById(id);
    if (!existing) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    // Check for duplicate slug (if changing slug)
    if (input.slug && input.slug !== existing.slug) {
      if (await categoryService.slugExists(input.slug, id)) {
        res.status(409).json({ error: "A category with this slug already exists" });
        return;
      }
    }

    const updated = await categoryService.updateCategory(id, input);
    res.json(updated);
  } catch (err) {
    console.error("[Category Update]", err);
    res.status(500).json({ error: "Failed to update category" });
  }
}

/**
 * DELETE /api/categories/:id
 * Admin only. Deletes a category.
 * Returns 409 if products still reference this category (ON DELETE RESTRICT).
 */
export async function deleteCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: "Category ID is required" });
      return;
    }

    const existing = await categoryService.getCategoryById(id);
    if (!existing) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    // Check if products reference this category
    const productCount = await categoryService.countProductsByCategory(id);
    if (productCount > 0) {
      res.status(409).json({
        error: `Cannot delete category — ${productCount} product(s) still reference it. Remove or reassign them first.`,
      });
      return;
    }

    await categoryService.deleteCategory(id);
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error("[Category Delete]", err);
    res.status(500).json({ error: "Failed to delete category" });
  }
}
