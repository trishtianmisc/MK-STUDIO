/** @vitest-environment jsdom */
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { submitFeedbackMock, locationMock } = vi.hoisted(() => ({
  submitFeedbackMock: vi.fn(),
  locationMock: { current: "/" },
}));

vi.mock("wouter", () => ({
  useLocation: () => [locationMock.current, vi.fn()],
}));

vi.mock("@/services/feedback", () => ({
  submitFeedback: submitFeedbackMock,
}));

import FeedbackWidget from "./FeedbackWidget";

describe("Feedback widget", () => {
  beforeEach(() => {
    locationMock.current = "/";
  });

  afterEach(() => {
    cleanup();
    submitFeedbackMock.mockReset();
  });

  it("shows the floating button on public routes", () => {
    render(<FeedbackWidget />);

    expect(
      screen.getByRole("button", { name: /open feedback form/i })
    ).toBeTruthy();
  });

  it("hides on admin routes", () => {
    locationMock.current = "/admin/dashboard";
    render(<FeedbackWidget />);

    expect(
      screen.queryByRole("button", { name: /open feedback form/i })
    ).toBeNull();
  });

  it("opens a modal with the star rating on click", () => {
    render(<FeedbackWidget />);

    fireEvent.click(
      screen.getByRole("button", { name: /open feedback form/i })
    );

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(
      screen.getByRole("radiogroup", { name: /rating out of 5/i })
    ).toBeTruthy();
  });

  it("keeps submit disabled until a rating is chosen, then submits", async () => {
    submitFeedbackMock.mockResolvedValue({ ok: true });
    render(<FeedbackWidget />);

    fireEvent.click(
      screen.getByRole("button", { name: /open feedback form/i })
    );

    const submit = screen.getByRole("button", {
      name: /send feedback/i,
    }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);

    fireEvent.click(screen.getByRole("radio", { name: "4 stars" }));

    expect(
      (
        screen.getByRole("button", {
          name: /send feedback/i,
        }) as HTMLButtonElement
      ).disabled
    ).toBe(false);

    fireEvent.change(screen.getByPlaceholderText(/what worked/i), {
      target: { value: "Great filters." },
    });
    fireEvent.submit(document.querySelector("form")!);

    await waitFor(() => {
      expect(submitFeedbackMock).toHaveBeenCalledWith({
        rating: 4,
        message: "Great filters.",
      });
    });

    expect(await screen.findByText(/thank you/i)).toBeTruthy();
  });
});
