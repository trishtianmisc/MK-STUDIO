import { describe, expect, it } from "vitest";
import { createCategorySchema, updateCategorySchema } from "./categories.validator.js";

describe("createCategorySchema", () => {
  const validInput = {
    slug: "wedding-guest",
    name: "Wedding Guest",
  };

  it("accepts valid minimal input", () => {
    const result = createCategorySchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.slug).toBe("wedding-guest");
      expect(result.data.name).toBe("Wedding Guest");
      expect(result.data.sort_order).toBe(0);
    }
  });

  it("accepts full input", () => {
    const result = createCategorySchema.safeParse({
      ...validInput,
      description: "For the invitation",
      image: "/images/category.jpg",
      sort_order: 3,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    expect(createCategorySchema.safeParse({}).success).toBe(false);
    expect(createCategorySchema.safeParse({ slug: "test" }).success).toBe(false);
    expect(createCategorySchema.safeParse({ name: "Test" }).success).toBe(false);
  });

  it("rejects invalid slug format", () => {
    expect(
      createCategorySchema.safeParse({ ...validInput, slug: "Invalid Slug!" }).success
    ).toBe(false);
    expect(
      createCategorySchema.safeParse({ ...validInput, slug: "has spaces" }).success
    ).toBe(false);
  });

  it("accepts null for nullable fields", () => {
    const result = createCategorySchema.safeParse({
      ...validInput,
      description: null,
      image: null,
    });
    expect(result.success).toBe(true);
  });
});

describe("updateCategorySchema", () => {
  it("accepts partial input", () => {
    expect(updateCategorySchema.safeParse({ name: "Updated" }).success).toBe(true);
    expect(updateCategorySchema.safeParse({}).success).toBe(true);
  });

  it("rejects invalid slug", () => {
    expect(updateCategorySchema.safeParse({ slug: "Bad Slug" }).success).toBe(false);
  });
});
