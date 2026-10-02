/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const setLocation = vi.fn();
const scrollIntoView = vi.fn();

vi.mock("wouter", () => ({
  useLocation: () => ["/", setLocation],
}));

vi.mock("@/hooks/useProducts", () => ({
  useFeaturedProducts: () => ({
    products: [
      {
        id: "1",
        category_id: "1",
        name: "The Velvet Evening Slip",
        slug: "velvet-evening-slip",
        style: "Silk velvet",
        length: "Maxi",
        sizes: ["UK 6", "UK 8"],
        brand: "Curated by MK Studio",
        rental_price: 1800,
        availability: "Available",
        rental_note: "3-day rental",
        is_featured: true,
        image: "/images/test.jpg",
        sort_order: 1,
        is_public: true,
        created_at: "",
        updated_at: "",
        categories: { id: "1", slug: "wedding-guest", name: "Wedding guest", description: null, image: null, sort_order: 1, created_at: "", updated_at: "" },
      },
    ],
    loading: false,
    error: null,
  }),
}));

import Home from "./Home";

describe("Collection Rail homepage", () => {
  afterEach(() => {
    cleanup();
    setLocation.mockClear();
    scrollIntoView.mockClear();
  });

  it("routes from the hero and current-edit calls to action into the catalogue", () => {
    render(<Home />);

    fireEvent.click(screen.getByRole("button", { name: /shop the collection/i }));
    expect(setLocation).toHaveBeenLastCalledWith("/catalogue");

    fireEvent.click(screen.getByRole("button", { name: /view all pieces/i }));
    expect(setLocation).toHaveBeenLastCalledWith("/catalogue");
  });

  it("states the Cebu dress rental service and fulfilment options above the fold", () => {
    render(<Home />);

    const hero = document.querySelector(".rail-hero") as HTMLElement;
    expect(hero).not.toBeNull();
    expect(hero.textContent).toContain("Cebu dress rental");
    expect(hero.textContent).toContain(
      "Cebu's online shared closet for weddings, parties, vacations and everything worth dressing up for.",
    );
    expect(hero.textContent).toContain("Pickup available · Delivery within Cebu");
  });

  it("opens the mobile navigation and routes its contact action", () => {
    render(<Home />);

    fireEvent.click(screen.getByRole("button", { name: /open main menu/i }));
    fireEvent.click(screen.getByRole("button", { name: /contact the studio/i }));

    expect(setLocation).toHaveBeenLastCalledWith("/contact");
  });

  it("keeps the header, product, and footer links connected", () => {
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoView,
    });
    render(<Home />);

    fireEvent.click(screen.getAllByRole("button", { name: "Shop the edit" })[0]);
    expect(scrollIntoView).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "View The Velvet Evening Slip" }));
    expect(setLocation).toHaveBeenLastCalledWith("/catalogue/velvet-evening-slip");

    fireEvent.click(screen.getByRole("button", { name: "Contact" }));
    expect(setLocation).toHaveBeenLastCalledWith("/contact");
  });

  it("connects the remaining header and footer destinations", () => {
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoView,
    });
    render(<Home />);

    fireEvent.click(screen.getAllByRole("button", { name: "New in" })[0]);
    expect(scrollIntoView).toHaveBeenCalled();
    fireEvent.click(screen.getAllByRole("button", { name: "How it works" })[0]);
    expect(scrollIntoView).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByRole("button", { name: "Catalogue" }));
    expect(setLocation).toHaveBeenLastCalledWith("/catalogue");
    fireEvent.click(screen.getByRole("button", { name: "Our story" }));
    expect(setLocation).toHaveBeenLastCalledWith("/about");
  });
});
