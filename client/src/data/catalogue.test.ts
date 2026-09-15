import { describe, expect, it } from "vitest";
import { toShowcaseProduct, formatRentalPrice } from "./catalogue";
import type { ProductWithRelations } from "@/services/products";

const mockProductRow: ProductWithRelations = {
  id: "123e4567-e89b-4123-a456-426614174000",
  category_id: "123e4567-e89b-4123-a456-426614174001",
  name: "Test Dress",
  slug: "test-dress",
  style: "Silk",
  length: "Maxi",
  sizes: ["UK 8", "UK 10", "UK 12"],
  brand: "Zara",
  rental_price: 1500,
  availability: "Available",
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
  });

  it("handles missing category gracefully", () => {
    const row = { ...mockProductRow, categories: null };
    const result = toShowcaseProduct(row);
    expect(result.category).toBe("");
    expect(result.categoryLabel).toBe("");
  });

  it("formats rental price as PHP currency", () => {
    expect(formatRentalPrice(1500)).toContain("1,500");
    expect(formatRentalPrice(0)).toContain("0");
  });
});
