import { describe, expect, it } from "vitest";
import { resolveSeo, SEO_BY_PATH, SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";

describe("SEO copy", () => {
  it("keeps the client-mandated homepage title and description", () => {
    expect(SITE_TITLE).toBe("MK Studio Collective | Dress Rental in Cebu");
    expect(SITE_DESCRIPTION).toBe(
      "Rent curated dresses in Cebu for weddings, birthdays, parties and vacations. Browse over 100 pieces online with pickup in Talamban or delivery.",
    );
  });

  it("gives every public route a title and a description", () => {
    Object.entries(SEO_BY_PATH).forEach(([path, meta]) => {
      expect(meta.title.length, `${path} title`).toBeGreaterThan(10);
      expect(meta.title.length, `${path} title`).toBeLessThanOrEqual(60);
      expect(meta.description.length, `${path} description`).toBeGreaterThan(60);
      expect(meta.description).toMatch(/Cebu|rental|dress/i);
    });
  });

  it("leaves product pages to ProductDetail", () => {
    expect(resolveSeo("/catalogue/the-valentina")).toBeNull();
    expect(resolveSeo("/catalogue/velvet-evening-slip")).toBeNull();
    expect(resolveSeo("/catalogue")).toEqual(SEO_BY_PATH["/catalogue"]);
  });

  it("falls back to the site defaults for unknown routes", () => {
    expect(resolveSeo("/")).toEqual({
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
    });
    expect(resolveSeo("/admin")).toEqual({
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
    });
  });
});
