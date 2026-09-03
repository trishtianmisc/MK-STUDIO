import { describe, expect, it } from "vitest";
import { createProductSchema, updateProductSchema } from "./products.validator.js";

describe("createProductSchema", () => {
  const validInput = {
    category_id: "123e4567-e89b-4123-a456-426614174000",
    slug: "test-product",
    name: "Test Product",
    rental_price: 1500,
  };

  it("accepts valid minimal input", () => {
    const result = createProductSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.slug).toBe("test-product");
      expect(result.data.name).toBe("Test Product");
      expect(result.data.rental_price).toBe(1500);
      expect(result.data.availability).toBe("Available");
      expect(result.data.is_featured).toBe(false);
      expect(result.data.is_public).toBe(true);
      expect(result.data.sizes).toEqual([]);
      expect(result.data.unavailable_days).toEqual([]);
    }
  });

  it("accepts full input with all fields", () => {
    const result = createProductSchema.safeParse({
      ...validInput,
      description: "A test description",
      details: "Details here",
      sizing: "Fits UK 8-12",
      sizes: ["UK 8", "UK 10", "UK 12"],
      fabric: "Silk",
      color: "Red",
      availability: "Limited",
      unavailable_days: [5, 10, 15],
      rental_note: "3-day rental",
      is_featured: true,
      is_public: false,
      image: "/images/test.jpg",
      sort_order: 5,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    expect(createProductSchema.safeParse({}).success).toBe(false);
    expect(createProductSchema.safeParse({ slug: "test" }).success).toBe(false);
    expect(createProductSchema.safeParse({ name: "Test" }).success).toBe(false);
    expect(createProductSchema.safeParse({ rental_price: 1000 }).success).toBe(false);
  });

  it("rejects invalid category_id", () => {
    const result = createProductSchema.safeParse({
      ...validInput,
      category_id: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid slug format", () => {
    expect(
      createProductSchema.safeParse({ ...validInput, slug: "Invalid Slug!" }).success
    ).toBe(false);
    expect(
      createProductSchema.safeParse({ ...validInput, slug: "UPPERCASE" }).success
    ).toBe(false);
    expect(
      createProductSchema.safeParse({ ...validInput, slug: "has spaces" }).success
    ).toBe(false);
  });

  it("rejects non-positive rental_price", () => {
    expect(
      createProductSchema.safeParse({ ...validInput, rental_price: -100 }).success
    ).toBe(false);
    expect(
      createProductSchema.safeParse({ ...validInput, rental_price: 0 }).success
    ).toBe(false);
    expect(
      createProductSchema.safeParse({ ...validInput, rental_price: 15.50 }).success
    ).toBe(false);
  });

  it("rejects invalid availability", () => {
    expect(
      createProductSchema.safeParse({ ...validInput, availability: "Sold" }).success
    ).toBe(false);
  });

  it("accepts null for nullable fields", () => {
    const result = createProductSchema.safeParse({
      ...validInput,
      description: null,
      details: null,
      fabric: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid unavailable_days values", () => {
    expect(
      createProductSchema.safeParse({
        ...validInput,
        unavailable_days: [0],
      }).success
    ).toBe(false);
    expect(
      createProductSchema.safeParse({
        ...validInput,
        unavailable_days: [32],
      }).success
    ).toBe(false);
  });
});

describe("updateProductSchema", () => {
  it("accepts partial input", () => {
    expect(updateProductSchema.safeParse({ name: "Updated" }).success).toBe(true);
    expect(updateProductSchema.safeParse({ slug: "new-slug" }).success).toBe(true);
    expect(updateProductSchema.safeParse({ rental_price: 2000 }).success).toBe(true);
    expect(updateProductSchema.safeParse({}).success).toBe(true);
  });

  it("rejects invalid slug", () => {
    expect(updateProductSchema.safeParse({ slug: "Bad Slug" }).success).toBe(false);
  });

  it("rejects invalid category_id", () => {
    expect(updateProductSchema.safeParse({ category_id: "bad" }).success).toBe(false);
  });

  it("rejects negative rental_price", () => {
    expect(updateProductSchema.safeParse({ rental_price: -1 }).success).toBe(false);
  });
});
