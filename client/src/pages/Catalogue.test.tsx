/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("wouter", () => ({
  useLocation: () => ["/catalogue", vi.fn()],
}));

const useProductsMock = vi.hoisted(() => vi.fn());
vi.mock("@/hooks/useProducts", () => ({ useProducts: useProductsMock }));

vi.mock("@/hooks/useCategories", () => ({
  useCategories: () => ({
    categories: [
      {
        id: "1",
        slug: "vacation",
        name: "Vacation",
        description: "Away somewhere.",
        image: null,
        sort_order: 1,
        created_at: "",
        updated_at: "",
      },
    ],
  }),
}));

vi.mock("@/services/products", () => ({
  getFilterOptions: vi.fn(() => new Promise(() => {})),
}));

import Catalogue from "./Catalogue";

const productRow = {
  id: "1",
  category_id: "1",
  name: "The Estelle Gown",
  slug: "the-estelle-gown",
  style: "Draped",
  length: "Maxi",
  waist_in: 31,
  dress_length_in: 58,
  sizes: ["L"],
  brand: "Zara",
  rental_price: 1500,
  additional_day_price: 100,
  availability: "Available",
  rental_note: "3-day rental",
  closet: "MK STUDIO",
  is_featured: true,
  image: "/images/test.jpg",
  sort_order: 1,
  is_public: true,
  created_at: "",
  updated_at: "",
  categories: {
    id: "1",
    slug: "vacation",
    name: "Vacation",
    description: null,
    image: null,
    sort_order: 1,
    created_at: "",
    updated_at: "",
  },
};

function mockList(products: unknown[], total = products.length) {
  useProductsMock.mockReturnValue({
    products,
    loading: false,
    loadingMore: false,
    error: null,
    total,
    hasMore: false,
    loadMore: vi.fn(),
  });
}

const openSearch = () => fireEvent.click(screen.getByRole("button", { name: "Open catalogue search" }));

describe("Catalogue search", () => {
  beforeEach(() => {
    useProductsMock.mockReset();
    mockList([productRow], 42);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("opens the search overlay from the toolbar", () => {
    render(<Catalogue />);
    expect(screen.queryByRole("dialog")).toBeNull();

    openSearch();

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByPlaceholderText(/name, style, size/i)).toBeTruthy();
  });

  it("closes the overlay with Escape, Enter and Show results", () => {
    render(<Catalogue />);

    openSearch();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();

    openSearch();
    fireEvent.keyDown(screen.getByPlaceholderText(/name, style, size/i), { key: "Enter" });
    expect(screen.queryByRole("dialog")).toBeNull();

    openSearch();
    fireEvent.click(screen.getByRole("button", { name: /show results/i }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("clears the term from the Clear button", () => {
    render(<Catalogue />);
    openSearch();

    const overlayInput = screen.getByPlaceholderText(/name, style, size/i) as HTMLInputElement;
    fireEvent.change(overlayInput, { target: { value: "gown" } });
    expect(overlayInput.value).toBe("gown");

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(overlayInput.value).toBe("");
  });

  it("debounces the term into the product query", async () => {
    vi.useFakeTimers();
    render(<Catalogue />);
    openSearch();

    const overlayInput = screen.getByPlaceholderText(/name, style, size/i);
    fireEvent.change(overlayInput, { target: { value: "gown" } });
    expect(useProductsMock).toHaveBeenLastCalledWith(undefined, expect.objectContaining({ q: undefined }));

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(useProductsMock).toHaveBeenLastCalledWith(undefined, expect.objectContaining({ q: "gown" }));
  });

  it("reports the server-side result total and the searched term", () => {
    render(<Catalogue />);

    const context = document.querySelector(".catalogue-context")!;
    expect(context.textContent).toContain("42 pieces");
    expect(context.textContent).toContain("The full studio edit");
  });

  it("offers a reset when the search matches nothing", () => {
    mockList([], 0);
    render(<Catalogue />);

    const empty = document.querySelector(".catalogue-empty")!;
    expect(empty.textContent).toContain("No pieces found");

    fireEvent.click(screen.getByRole("button", { name: /reset catalogue/i }));
    expect(document.querySelector(".catalogue-empty")).toBeTruthy();
  });
});
