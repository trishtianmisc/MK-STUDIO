import { describe, expect, it } from "vitest";
import { categoryMeta, showcaseProducts } from "./catalogue";

describe("MK Studio static catalogue", () => {
  it("contains a well-formed product for every category", () => {
    expect(showcaseProducts.length).toBeGreaterThanOrEqual(9);

    for (const product of showcaseProducts) {
      expect(product.slug).toMatch(/^[a-z0-9-]+$/);
      expect(product.name.length).toBeGreaterThan(2);
      expect(product.image).toMatch(/^\/images\//);
      expect(categoryMeta[product.category]).toBeDefined();
    }
  });

  it("keeps all four catalogue occasions represented", () => {
    const represented = new Set(showcaseProducts.map(product => product.category));
    expect(represented).toEqual(new Set(["wedding-guest", "date-night", "studio-to-dinner", "consignment"]));
  });
});
