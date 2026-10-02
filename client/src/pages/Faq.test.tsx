/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const setLocation = vi.fn();

vi.mock("wouter", () => ({
  useLocation: () => ["/faq", setLocation],
}));

import Faq from "./Faq";

const BOOKING_FORM_URL = "https://forms.gle/63MSRA933JAaKBEv7";

describe("Rental FAQ page", () => {
  afterEach(() => {
    cleanup();
    setLocation.mockClear();
  });

  it("renders all nineteen questions from the rental policy brief", () => {
    render(<Faq />);

    const questions = document.querySelectorAll(".faq-question");
    expect(questions).toHaveLength(19);

    const expected = [
      "How do I reserve a dress?",
      "How early do I need to book?",
      "Is the rental payment refundable?",
      "Can I reschedule my reservation?",
      "Is there a security deposit?",
      "When will my security deposit be refunded?",
      "Do I need to provide an ID?",
      "Can I pick up my dress?",
      "How does delivery work?",
      "How do I return the dress?",
      "What happens if I return the dress late?",
      "Is cleaning included?",
      "What happens if the dress gets stained?",
      "What happens if the dress is damaged?",
      "What happens if the dress is lost or not returned?",
      "Can I steam or iron the dress?",
      "Can I try on the dress before booking?",
      "What if I need more measurements or sizing help?",
      "What if I still have questions?",
    ];
    expected.forEach((question, index) => {
      expect(questions[index].textContent).toContain(question);
    });
  });

  it("opens the first answer by default and keeps the rest collapsed", () => {
    render(<Faq />);

    const questions = document.querySelectorAll<HTMLButtonElement>(".faq-question");
    expect(questions[0].getAttribute("aria-expanded")).toBe("true");
    expect(questions[1].getAttribute("aria-expanded")).toBe("false");

    const firstAnswer = document.getElementById("faq-a-0");
    expect(firstAnswer?.getAttribute("inert")).toBeNull();
    expect(document.getElementById("faq-a-1")?.getAttribute("inert")).not.toBeNull();
  });

  it("toggles answers independently so more than one can be open", () => {
    render(<Faq />);

    const questions = document.querySelectorAll<HTMLButtonElement>(".faq-question");

    fireEvent.click(questions[1]);
    expect(questions[0].getAttribute("aria-expanded")).toBe("true");
    expect(questions[1].getAttribute("aria-expanded")).toBe("true");

    fireEvent.click(questions[1]);
    expect(questions[1].getAttribute("aria-expanded")).toBe("false");
    expect(questions[0].getAttribute("aria-expanded")).toBe("true");
  });

  it("links the booking references to the Google Form in a new tab", () => {
    render(<Faq />);

    const links = screen.getAllByRole("link", { name: "Booking Form" });
    expect(links.length).toBeGreaterThanOrEqual(2);
    links.forEach((link) => {
      expect(link.getAttribute("href")).toBe(BOOKING_FORM_URL);
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    });
  });

  it("carries the client intro and rental policy confirmation line", () => {
    render(<Faq />);

    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain(
      "know before booking.",
    );
    expect(document.querySelector(".faq-hero-lead")?.textContent).toBe(
      "Everything you need to know before booking your dress with MK Studio Collective. 🤍",
    );

    const note = document.querySelector(".faq-note") as HTMLElement;
    expect(note.textContent).toContain(
      "you confirm that you have read and agreed to MK Studio Collective's Rental Policies.",
    );
    expect(note.textContent).toContain("By submitting a booking");
  });

  it("exposes the FAQ destination in the header, mobile menu, and footer", () => {
    render(<Faq />);

    const faqButtons = screen.getAllByRole("button", { name: /^FAQ/ });
    expect(faqButtons.length).toBe(3);

    expect(document.querySelector(".store-nav .is-current")?.textContent).toBe("FAQ");
  });
});
