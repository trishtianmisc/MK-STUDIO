/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("wouter", () => ({
  useLocation: () => ["/contact", vi.fn()],
}));

import Contact from "./Contact";

describe("Contact page", () => {
  afterEach(() => cleanup());

  it("dials the studio in international format", () => {
    render(<Contact />);

    const phone = screen.getByRole("link", { name: "+63 995 181 3723" });
    expect(phone.getAttribute("href")).toBe("tel:+639951813723");
    expect(phone.getAttribute("href")).not.toContain("+0995");
  });

  it("keeps the studio email reachable", () => {
    render(<Contact />);

    const email = screen.getByRole("link", { name: "mksolutionscebu@gmail.com" });
    expect(email.getAttribute("href")).toBe("mailto:mksolutionscebu@gmail.com");
  });

  it("renders the enquiry form", () => {
    render(<Contact />);

    expect(screen.getByRole("button", { name: /send inquiry/i })).toBeTruthy();
    expect(screen.getByPlaceholderText("Name")).toBeTruthy();
  });
});
