import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
  clearAdminPreviewSession,
  grantAdminPreviewSession,
  hasAdminPreviewSession,
  validateAdminCredentials,
} from "./adminAccess";

const sessionValues = new Map<string, string>();

beforeEach(() => {
  sessionValues.clear();
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      sessionStorage: {
        getItem: (key: string) => sessionValues.get(key) ?? null,
        setItem: (key: string, value: string) => sessionValues.set(key, value),
        removeItem: (key: string) => sessionValues.delete(key),
      },
    },
  });
});

afterEach(() => {
  Reflect.deleteProperty(globalThis, "window");
});

describe("temporary admin preview credentials", () => {
  it("accepts only the configured fixed credentials", () => {
    expect(validateAdminCredentials(ADMIN_USERNAME, ADMIN_PASSWORD)).toBe(true);
    expect(validateAdminCredentials("wrong-user", ADMIN_PASSWORD)).toBe(false);
    expect(validateAdminCredentials(ADMIN_USERNAME, "wrong-password")).toBe(false);
  });

  it("grants only a session-only preview entry and clears it on sign out", () => {
    expect(hasAdminPreviewSession()).toBe(false);
    grantAdminPreviewSession();
    expect(hasAdminPreviewSession()).toBe(true);
    clearAdminPreviewSession();
    expect(hasAdminPreviewSession()).toBe(false);
  });
});
