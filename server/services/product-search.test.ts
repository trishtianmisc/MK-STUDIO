import { describe, expect, it } from "vitest";
import { buildSearchOr, sanitizeSearchTerm, SEARCH_MAX_LENGTH } from "./product-search.js";

const CAT_A = "4ea66fc8-8d65-4145-a0df-078ad4f0c9c8";
const CAT_B = "e3570dbd-f201-483e-a569-2f3dedca85bb";

describe("sanitizeSearchTerm", () => {
  it("trims and collapses whitespace", () => {
    expect(sanitizeSearchTerm("  red   ruched  ")).toBe("red ruched");
  });

  it("strips characters that would break the or= grammar", () => {
    expect(sanitizeSearchTerm('gown) OR (name.eq."x"')).toBe("gown OR name.eq. x");
    expect(sanitizeSearchTerm("a,b{c}d\\e*f%g")).toBe("a b c d e f g");
  });

  it("treats null, undefined and blank input as empty", () => {
    expect(sanitizeSearchTerm(null)).toBe("");
    expect(sanitizeSearchTerm(undefined)).toBe("");
    expect(sanitizeSearchTerm("   ")).toBe("");
    expect(sanitizeSearchTerm("(){}")).toBe("");
  });

  it("caps the term length", () => {
    expect(sanitizeSearchTerm("a".repeat(500))).toHaveLength(SEARCH_MAX_LENGTH);
  });
});

describe("buildSearchOr", () => {
  it("returns null for an empty term so PostgREST never sees or=()", () => {
    expect(buildSearchOr("")).toBeNull();
    expect(buildSearchOr("   ")).toBeNull();
    expect(buildSearchOr(undefined)).toBeNull();
    expect(buildSearchOr("(),{}")).toBeNull();
  });

  it("matches name, style, length and brand", () => {
    const clause = buildSearchOr("gown");
    expect(clause).toBe(
      "name.ilike.*gown*,style.ilike.*gown*,length.ilike.*gown*,brand.ilike.*gown*,sizes.ov.{gown}",
    );
  });

  it("adds category ids only when some are supplied", () => {
    expect(buildSearchOr("vacation", [CAT_A])).toContain(`category_id.in.(${CAT_A})`);
    expect(buildSearchOr("vacation", [])).not.toContain("category_id");
    expect(buildSearchOr("vacation")).not.toContain("category_id");
  });

  it("drops ids that are not UUIDs", () => {
    const clause = buildSearchOr("vacation", ["not-a-uuid", CAT_B, "1 OR 1=1"]);
    expect(clause).toContain(`category_id.in.(${CAT_B})`);
    expect(clause).not.toContain("not-a-uuid");
    expect(clause).not.toContain("1 OR 1=1");
  });

  it("queries measurements only for a bare number", () => {
    expect(buildSearchOr("48")).toContain("waist_in.eq.48");
    expect(buildSearchOr("48")).toContain("dress_length_in.eq.48");
    expect(buildSearchOr("48 cm")).not.toContain("waist_in");
    expect(buildSearchOr("gown")).not.toContain("waist_in");
  });

  it("neutralises branch-breaking input before building the clause", () => {
    const term = sanitizeSearchTerm('red),name.ilike.*evil*"');
    expect(term).toBe("red name.ilike. evil");
    expect(buildSearchOr('red),name.ilike.*evil*"')).toBe(
      `name.ilike.*${term}*,style.ilike.*${term}*,length.ilike.*${term}*,brand.ilike.*${term}*,sizes.ov.{${term}}`,
    );
  });
});
