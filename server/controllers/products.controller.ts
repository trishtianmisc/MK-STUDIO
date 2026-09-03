import type { Request, Response } from "express";
import * as productService from "../services/products.service.js";
import { createProductSchema, updateProductSchema } from "../validators/products.validator.js";

/**
 * GET /api/products
 * Public: returns only public products.
 * Admin (with Bearer token): returns all products.
 */
export async function listProducts(req: Request, res: Response) {
  try {
    const hasAuth = req.headers.authorization?.startsWith("Bearer ");

    if (hasAuth) {
      // Verify admin status — if not admin, fall back to public view
      const { getUser, isAdmin } = await import("../services/auth.service.js");
      const token = req.headers.authorization!.slice(7);
      const user = await getUser(token);

      if (user) {
        const admin = await isAdmin(user.id);
        if (admin) {
          const products = await productService.getAllProducts();
          res.json(products);
          return;
        }
      }
    }

    const products = await productService.getPublicProducts();
    res.json(products);
  } catch (err) {
    console.error("[Products List]", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
}

/**
 * GET /api/products/featured
 * Public: returns featured public products.
 */
export async function listFeaturedProducts(req: Request, res: Response) {
  try {
    const products = await productService.getFeaturedProducts();
    res.json(products);
  } catch (err) {
    console.error("[Products Featured]", err);
    res.status(500).json({ error: "Failed to fetch featured products" });
  }
}

/**
 * GET /api/products/:slug
 * Public: returns a single public product by slug.
 */
export async function getProductBySlug(req: Request, res: Response) {
  try {
    const { slug } = req.params;

    if (!slug) {
      res.status(400).json({ error: "Slug is required" });
      return;
    }

    const hasAuth = req.headers.authorization?.startsWith("Bearer ");

    if (hasAuth) {
      const { getUser, isAdmin } = await import("../services/auth.service.js");
      const token = req.headers.authorization!.slice(7);
      const user = await getUser(token);

      if (user) {
        const admin = await isAdmin(user.id);
        if (admin) {
          const product = await productService.getProductBySlug(slug);
          if (!product) {
            res.status(404).json({ error: "Product not found" });
            return;
          }
          res.json(product);
          return;
        }
      }
    }

    const product = await productService.getPublicProductBySlug(slug);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(product);
  } catch (err) {
    console.error("[Product Get]", err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
}

/**
 * POST /api/products
 * Admin only. Creates a new product.
 */
export async function createProduct(req: Request, res: Response) {
  try {
    const parsed = createProductSchema.safeParse(req.body);

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
    if (await productService.slugExists(input.slug)) {
      res.status(409).json({ error: "A product with this slug already exists" });
      return;
    }

    // Validate category exists
    if (!(await productService.categoryExists(input.category_id))) {
      res.status(400).json({ error: "Invalid category_id — category does not exist" });
      return;
    }

    const product = await productService.createProduct(input);
    res.status(201).json(product);
  } catch (err) {
    console.error("[Product Create]", err);
    res.status(500).json({ error: "Failed to create product" });
  }
}

/**
 * PUT /api/products/:id
 * Admin only. Updates an existing product.
 */
export async function updateProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: "Product ID is required" });
      return;
    }

    const parsed = updateProductSchema.safeParse(req.body);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      res.status(400).json({ error: "Validation failed", details: errors });
      return;
    }

    const input = parsed.data;

    // Check product exists
    const existing = await productService.getProductById(id);
    if (!existing) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    // Check for duplicate slug (if changing slug)
    if (input.slug && input.slug !== existing.slug) {
      if (await productService.slugExists(input.slug, id)) {
        res.status(409).json({ error: "A product with this slug already exists" });
        return;
      }
    }

    // Validate category exists (if changing category)
    if (input.category_id && input.category_id !== existing.category_id) {
      if (!(await productService.categoryExists(input.category_id))) {
        res.status(400).json({ error: "Invalid category_id — category does not exist" });
        return;
      }
    }

    const updated = await productService.updateProduct(id, input);
    res.json(updated);
  } catch (err) {
    console.error("[Product Update]", err);
    res.status(500).json({ error: "Failed to update product" });
  }
}

/**
 * DELETE /api/products/:id
 * Admin only. Deletes a product and its Storage images.
 */
export async function deleteProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: "Product ID is required" });
      return;
    }

    const existing = await productService.getProductById(id);
    if (!existing) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    // Clean up Storage objects before deleting the product
    // ON DELETE CASCADE handles DB cleanup, but Storage objects need explicit removal
    try {
      const { getAllImagesForProduct, extractStoragePathFromUrl, deleteFromStorage } = await import("../services/images.service.js");
      const images = await getAllImagesForProduct(id);

      for (const image of images) {
        const storagePath = extractStoragePathFromUrl(image.url);
        if (storagePath) {
          try {
            await deleteFromStorage(storagePath);
          } catch (storageErr) {
            console.error(`[Product Delete] Failed to delete Storage object: ${storagePath}`, storageErr);
            // Continue with other images — don't fail the entire delete
          }
        }
      }
    } catch (imgErr) {
      // If image cleanup fails entirely, log and continue with product deletion
      // The DB cascade will remove image records even if Storage objects remain
      console.error("[Product Delete] Image cleanup failed, proceeding with product deletion:", imgErr);
    }

    await productService.deleteProduct(id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("[Product Delete]", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
}
