/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ADMIN_PASSWORD, ADMIN_USERNAME } from "@/lib/adminAccess";
import AdminAccess from "./AdminAccess";

function submitCredentials(username: string, password: string) {
  fireEvent.change(screen.getByPlaceholderText("Studio username"), { target: { value: username } });
  fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: password } });
  fireEvent.click(screen.getByRole("button", { name: /open studio preview/i }));
}

describe("AdminAccess", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows a visible error for invalid fixed credentials", () => {
    render(<AdminAccess />);

    submitCredentials("not-admin", "wrong-password");

    expect(screen.getByRole("alert").textContent).toContain("The username or password is not recognised.");
    expect(screen.getByRole("button", { name: /open studio preview/i })).not.toBeNull();
  });

  it("opens the admin preview for valid credentials and returns to sign-in after sign out", () => {
    render(<AdminAccess />);

    submitCredentials(ADMIN_USERNAME, ADMIN_PASSWORD);

    expect(screen.getByText("Static admin interface preview")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /sign out/i }));

    expect(screen.getByRole("button", { name: /open studio preview/i })).not.toBeNull();
    expect(screen.queryByText("Static admin interface preview")).toBeNull();
  });
});
