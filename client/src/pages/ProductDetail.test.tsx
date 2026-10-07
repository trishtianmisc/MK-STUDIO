/** @vitest-environment jsdom */
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("wouter", () => ({
  useRoute: () => ["/catalogue/:slug", { slug: "the-valentina" }],
  useLocation: () => ["/catalogue/the-valentina", vi.fn()],
}));

vi.mock("@/components/AvailabilityCalendar", () => ({ default: () => null }));

const { useProductMock } = vi.hoisted(() => ({ useProductMock: vi.fn() }));
vi.mock("@/hooks/useProducts", () => ({ useProduct: useProductMock }));

import ProductDetail from "./ProductDetail";

const valentina = {
  id: "1",
  category_id: "4",
  slug: "the-valentina",
  name: "The Valentina",
  style: "Satin slip",
  length: "Maxi",
  sizes: ["S"],
  brand: "Curated by MK Studio",
  rental_price: 300,
  additional_day_price: null,
  availability: "Available",
  rental_note: "3-day rental",
  closet: "MK STUDIO",
  is_featured: false,
  image: "/images/test.jpg",
  sort_order: 0,
  is_public: true,
  created_at: "",
  updated_at: "",
  categories: { id: "4", slug: "wedding-guest", name: "Wedding guest", description: null, image: null, sort_order: 1, created_at: "", updated_at: "" },
};

function metaContent(attr: "name" | "property", key: string) {
  const el = Array.from(document.head.querySelectorAll("meta")).find(
    (m) => m.getAttribute(attr) === key,
  );
  return el?.getAttribute("content") ?? null;
}

describe("ProductDetail SEO", () => {
  beforeEach(() => {
    useProductMock.mockReset();
  });

  afterEach(() => {
    cleanup();
    document.title = "";
  });

  it("titles the page after the dress itself", () => {
    useProductMock.mockReturnValue({ product: valentina, loading: false, error: null });
    render(<ProductDetail />);

    expect(document.title).toBe("The Valentina | Dress Rental Cebu | MK Studio Collective");

    const description = metaContent("name", "description") ?? "";
    expect(description).toContain("Rent The Valentina in Cebu");
    expect(description).not.toContain("the The");
    expect(metaContent("property", "og:title")).toBe(document.title);
  });

  it("falls back to catalogue metadata while the dress is loading", () => {
    useProductMock.mockReturnValue({ product: null, loading: true, error: null });
    render(<ProductDetail />);

    expect(document.title).toBe("Dress Rental Catalogue in Cebu | MK Studio Collective");
    expect(metaContent("name", "description")).toContain("Browse over 100 rental dresses in Cebu");
  });
});

describe("ProductDetail measurements", () => {
  beforeEach(() => {
    useProductMock.mockReset();
  });

  afterEach(() => {
    cleanup();
    document.title = "";
  });

  const metaText = (container: HTMLElement) =>
    container.querySelector(".product-detail-meta")?.textContent ?? "";

  it("shows waist and garment length in inches", () => {
    useProductMock.mockReturnValue({
      product: { ...valentina, waist_in: 26, dress_length_in: 48 },
      loading: false,
      error: null,
    });
    const { container } = render(<ProductDetail />);

    const text = metaText(container);
    expect(text).toContain("Length (in)48 in");
    expect(text).toContain("Waist26 in");
    expect(text).toContain("LengthMaxi");
  });

  it("hides both rows when measurements are not stored", () => {
    useProductMock.mockReturnValue({
      product: { ...valentina, waist_in: null, dress_length_in: null },
      loading: false,
      error: null,
    });
    const { container } = render(<ProductDetail />);

    const text = metaText(container);
    expect(text).not.toContain("Length (in)");
    expect(text).not.toContain("Waist");
    expect(text).toContain("Length");
  });
});
