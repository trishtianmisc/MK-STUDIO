import type { Request, Response } from "express";
import * as availabilityService from "../services/availability.service.js";
import { createRentalDateSchema } from "../validators/availability.validator.js";

/**
 * GET /api/products/:slug/availability
 * Public: returns rental dates for a product.
 */
export async function getAvailability(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    if (!slug) {
      res.status(400).json({ error: "Slug is required" });
      return;
    }

    const dates = await availabilityService.getAvailabilityBySlug(slug);
    res.json(dates);
  } catch (err) {
    console.error("[Availability Get]", err);
    res.status(500).json({ error: "Failed to fetch availability" });
  }
}

/**
 * POST /api/admin/availability
 * Admin only. Creates a rental date record.
 */
export async function createAvailability(req: Request, res: Response) {
  try {
    const parsed = createRentalDateSchema.safeParse(req.body);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      res.status(400).json({ error: "Validation failed", details: errors });
      return;
    }

    const date = await availabilityService.createRentalDate(parsed.data);
    res.status(201).json(date);
  } catch (err) {
    console.error("[Availability Create]", err);
    res.status(500).json({ error: "Failed to create rental date" });
  }
}

/**
 * DELETE /api/admin/availability/:id
 * Admin only. Deletes a rental date record.
 */
export async function deleteAvailability(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "Rental date ID is required" });
      return;
    }

    await availabilityService.deleteRentalDate(id);
    res.status(200).json({ message: "Rental date deleted" });
  } catch (err) {
    console.error("[Availability Delete]", err);
    res.status(500).json({ error: "Failed to delete rental date" });
  }
}
