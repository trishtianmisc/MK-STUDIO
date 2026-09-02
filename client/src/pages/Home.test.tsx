/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const setLocation = vi.fn();
const scrollIntoView = vi.fn();

vi.mock("wouter", () => ({
  useLocation: () => ["/", setLocation],
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

  it("opens the mobile navigation and routes its contact action", () => {
    render(<Home />);

    fireEvent.click(screen.getByRole("button", { name: /toggle main menu/i }));
    fireEvent.click(screen.getByRole("button", { name: /contact the studio/i }));

    expect(setLocation).toHaveBeenLastCalledWith("/contact");
  });

  it("keeps the remaining header, discovery, product, order, and footer links connected", () => {
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoView,
    });
    render(<Home />);

    fireEvent.click(screen.getByRole("button", { name: /shop the edit/i }));
    expect(scrollIntoView).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /the wedding edit/i }));
    expect(setLocation).toHaveBeenLastCalledWith("/catalogue");

    fireEvent.click(screen.getByRole("button", { name: /view the velvet evening slip/i }));
    expect(setLocation).toHaveBeenLastCalledWith("/catalogue/velvet-evening-slip");

    fireEvent.click(screen.getByRole("button", { name: "Contact" }));
    expect(setLocation).toHaveBeenLastCalledWith("/contact");
  });

  it("connects every remaining header, discovery-door, and footer destination", () => {
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoView,
    });
    render(<Home />);

    fireEvent.click(screen.getByRole("button", { name: "New in" }));
    expect(scrollIntoView).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "How it works" }));
    expect(scrollIntoView).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByRole("button", { name: /after dark/i }));
    expect(setLocation).toHaveBeenLastCalledWith("/catalogue");
    fireEvent.click(screen.getByRole("button", { name: /studio days/i }));
    expect(setLocation).toHaveBeenLastCalledWith("/catalogue");

    fireEvent.click(screen.getByRole("button", { name: "Catalogue" }));
    expect(setLocation).toHaveBeenLastCalledWith("/catalogue");
    fireEvent.click(screen.getByRole("button", { name: "Our story" }));
    expect(setLocation).toHaveBeenLastCalledWith("/about");
  });
});
