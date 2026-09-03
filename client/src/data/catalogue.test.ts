import { describe, expect, it } from "vitest";
import { categoryMeta, toShowcaseProduct, formatRentalPrice } from "./catalogue";
import type { ProductWithRelations } from "@/services/products";

const mockProductRow: ProductWithRelations = {
  id: "123e4567-e89b-4123-a456-426614174000",
  category_id: "123e4567-e89b-4123-a456-426614174001",
  name: "Test Dress",
  slug: "test-dress",
  description: "A test dress",
  details: "Test details",
  sizing: "Fits UK 8-12",
  sizes: ["UK 8", "UK 10", "UK 12"],
  fabric: "Silk",
  color: "Red",
  rental_price: 1500,
  availability: "Available",
  unavailable_days: [5, 10],
  rental_note: "3-day rental",
  is_featured: true,
  image: "/images/test.jpg",
  sort_order: 1,
  is_public: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  categories: {
    id: "123e4567-e89b-4123-a456-426614174001",
    slug: "wedding-guest",
    name: "Wedding guest",
    description: null,
    image: null,
    sort_order: 1,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  product_images: [],
};

describe("MK Studio catalogue adapter", () => {
  it("converts a product row to ShowcaseProduct shape", () => {
    const result = toShowcaseProduct(mockProductRow);

    expect(result.slug).toBe("test-dress");
    expect(result.name).toBe("Test Dress");
    expect(result.category).toBe("wedding-guest");
    expect(result.categoryLabel).toBe("Wedding guest");
    expect(result.rentalPrice).toBe(1500);
    expect(result.featured).toBe(true);
    expect(result.image).toBe("/images/test.jpg");
    expect(result.sizes).toEqual(["UK 8", "UK 10", "UK 12"]);
    expect(result.unavailableDays).toEqual([5, 10]);
  });

  it("handles missing category gracefully", () => {
    const row = { ...mockProductRow, categories: null };
    const result = toShowcaseProduct(row);
    expect(result.category).toBe("");
    expect(result.categoryLabel).toBe("");
  });

  it("prefers primary image from product_images", () => {
    const row: ProductWithRelations = {
      ...mockProductRow,
      image: "/images/fallback.jpg",
      product_images: [
        { id: "1", product_id: "x", url: "/images/secondary.jpg", alt_text: null, sort_order: 0, is_primary: false, created_at: "" },
        { id: "2", product_id: "x", url: "/images/primary.jpg", alt_text: null, sort_order: 1, is_primary: true, created_at: "" },
      ],
    };
    const result = toShowcaseProduct(row);
    expect(result.image).toBe("/images/primary.jpg");
  });

  it("falls back to first image when no primary exists", () => {
    const row: ProductWithRelations = {
      ...mockProductRow,
      image: null,
      product_images: [
        { id: "1", product_id: "x", url: "/images/first.jpg", alt_text: null, sort_order: 2, is_primary: false, created_at: "" },
        { id: "2", product_id: "x", url: "/images/second.jpg", alt_text: null, sort_order: 1, is_primary: false, created_at: "" },
      ],
    };
    const result = toShowcaseProduct(row);
    // Should be sorted by sort_order, so index 0 is sort_order 1
    expect(result.image).toBe("/images/second.jpg");
  });

  it("has all four catalogue occasions in categoryMeta", () => {
    const keys = Object.keys(categoryMeta);
    expect(keys).toContain("wedding-guest");
    expect(keys).toContain("date-night");
    expect(keys).toContain("studio-to-dinner");
    expect(keys).toContain("consignment");
  });

  it("formats rental price as PHP currency", () => {
    expect(formatRentalPrice(1500)).toContain("1,500");
    expect(formatRentalPrice(0)).toContain("0");
  });
});
