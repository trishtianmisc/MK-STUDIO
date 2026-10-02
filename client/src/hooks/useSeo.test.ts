/** @vitest-environment jsdom */
import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useSeo } from "@/hooks/useSeo";

const HEAD_TAGS = [
  'meta[name="description"]',
  'meta[property="og:title"]',
  'meta[property="og:description"]',
  'meta[name="twitter:title"]',
  'meta[name="twitter:description"]',
  'meta[property="og:url"]',
  'link[rel="canonical"]',
];

afterEach(() => {
  document.title = "";
  HEAD_TAGS.forEach((selector) => {
    document.head.querySelectorAll(selector).forEach((el) => el.remove());
  });
});

describe("useSeo", () => {
  it("writes the title, description, social tags and canonical url", () => {
    const canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);

    renderHook(() =>
      useSeo({ title: "Rental FAQ | MK Studio Collective", description: "Answers to common rental questions." }),
    );

    expect(document.title).toBe("Rental FAQ | MK Studio Collective");
    expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
      "Answers to common rental questions.",
    );
    expect(document.querySelector('meta[property="og:title"]')?.getAttribute("content")).toBe(
      "Rental FAQ | MK Studio Collective",
    );
    expect(document.querySelector('meta[name="twitter:description"]')?.getAttribute("content")).toBe(
      "Answers to common rental questions.",
    );

    const url = window.location.origin + window.location.pathname;
    expect(document.querySelector('meta[property="og:url"]')?.getAttribute("content")).toBe(url);
    expect(canonical.getAttribute("href")).toBe(url);
  });

  it("creates the meta description when the document has none", () => {
    expect(document.head.querySelector('meta[name="description"]')).toBeNull();

    renderHook(() => useSeo({ title: "MK Studio", description: "Cebu dress rental." }));

    expect(document.head.querySelector('meta[name="description"]')).not.toBeNull();
    expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
      "Cebu dress rental.",
    );
  });

  it("leaves the document untouched when there is no meta to apply", () => {
    document.title = "Untouched";
    renderHook(() => useSeo(null));
    expect(document.title).toBe("Untouched");
    expect(document.head.querySelector('meta[name="description"]')).toBeNull();
  });
});
