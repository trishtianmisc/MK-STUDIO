import { describe, expect, it } from "vitest";
import {
  uploadImageSchema,
  updateImageSchema,
  reorderImagesSchema,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  MAX_IMAGES_PER_PRODUCT,
} from "./images.validator.js";

const VALID_UUID = "123e4567-e89b-4123-a456-426614174000";

describe("uploadImageSchema", () => {
  it("accepts valid minimal input", () => {
    const result = uploadImageSchema.safeParse({
      product_id: VALID_UUID,
    });
    expect(result.success).toBe(true);
  });

  it("accepts full input", () => {
    const result = uploadImageSchema.safeParse({
      product_id: VALID_UUID,
      alt_text: "A beautiful dress",
      sort_order: 3,
      is_primary: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid product_id", () => {
    expect(
      uploadImageSchema.safeParse({ product_id: "not-a-uuid" }).success
    ).toBe(false);
  });

  it("rejects missing product_id", () => {
    expect(uploadImageSchema.safeParse({}).success).toBe(false);
  });

  it("rejects alt_text over 200 characters", () => {
    expect(
      uploadImageSchema.safeParse({
        product_id: VALID_UUID,
        alt_text: "x".repeat(201),
      }).success
    ).toBe(false);
  });

  it("accepts alt_text at exactly 200 characters", () => {
    expect(
      uploadImageSchema.safeParse({
        product_id: VALID_UUID,
        alt_text: "x".repeat(200),
      }).success
    ).toBe(true);
  });

  it("rejects sort_order below 0", () => {
    expect(
      uploadImageSchema.safeParse({
        product_id: VALID_UUID,
        sort_order: -1,
      }).success
    ).toBe(false);
  });

  it("rejects sort_order above 100", () => {
    expect(
      uploadImageSchema.safeParse({
        product_id: VALID_UUID,
        sort_order: 101,
      }).success
    ).toBe(false);
  });

  it("accepts sort_order at boundaries (0 and 100)", () => {
    expect(
      uploadImageSchema.safeParse({
        product_id: VALID_UUID,
        sort_order: 0,
      }).success
    ).toBe(true);
    expect(
      uploadImageSchema.safeParse({
        product_id: VALID_UUID,
        sort_order: 100,
      }).success
    ).toBe(true);
  });
});

describe("updateImageSchema", () => {
  it("accepts partial input", () => {
    expect(updateImageSchema.safeParse({ alt_text: "New alt" }).success).toBe(true);
    expect(updateImageSchema.safeParse({ sort_order: 5 }).success).toBe(true);
    expect(updateImageSchema.safeParse({ is_primary: true }).success).toBe(true);
    expect(updateImageSchema.safeParse({}).success).toBe(true);
  });

  it("rejects invalid values", () => {
    expect(updateImageSchema.safeParse({ alt_text: "x".repeat(201) }).success).toBe(false);
    expect(updateImageSchema.safeParse({ sort_order: -1 }).success).toBe(false);
    expect(updateImageSchema.safeParse({ sort_order: 101 }).success).toBe(false);
  });
});

describe("reorderImagesSchema", () => {
  it("accepts valid reorder input", () => {
    const result = reorderImagesSchema.safeParse({
      images: [
        { id: VALID_UUID, sort_order: 0 },
        { id: "123e4567-e89b-4123-a456-426614174001", sort_order: 1 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty array", () => {
    expect(reorderImagesSchema.safeParse({ images: [] }).success).toBe(false);
  });

  it("rejects invalid UUID", () => {
    expect(
      reorderImagesSchema.safeParse({
        images: [{ id: "bad", sort_order: 0 }],
      }).success
    ).toBe(false);
  });

  it("rejects sort_order out of range", () => {
    expect(
      reorderImagesSchema.safeParse({
        images: [{ id: VALID_UUID, sort_order: -1 }],
      }).success
    ).toBe(false);
    expect(
      reorderImagesSchema.safeParse({
        images: [{ id: VALID_UUID, sort_order: 101 }],
      }).success
    ).toBe(false);
  });
});

describe("constants", () => {
  it("allows correct MIME types", () => {
    expect(ALLOWED_MIME_TYPES).toContain("image/jpeg");
    expect(ALLOWED_MIME_TYPES).toContain("image/png");
    expect(ALLOWED_MIME_TYPES).toContain("image/webp");
    expect(ALLOWED_MIME_TYPES).not.toContain("image/svg+xml");
  });

  it("sets file size limit to 5 MB", () => {
    expect(MAX_FILE_SIZE).toBe(5 * 1024 * 1024);
  });

  it("sets max images per product to 10", () => {
    expect(MAX_IMAGES_PER_PRODUCT).toBe(10);
  });
});
