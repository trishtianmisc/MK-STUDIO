export const ADMIN_USERNAME = "mkstudio-admin";
export const ADMIN_PASSWORD = "MKStudio-Preview-2026";

const ADMIN_SESSION_KEY = "mk-studio-admin-preview-session";

export function validateAdminCredentials(username: string, password: string) {
  return username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export function hasAdminPreviewSession() {
  return typeof window !== "undefined" && window.sessionStorage.getItem(ADMIN_SESSION_KEY) === "granted";
}

export function grantAdminPreviewSession() {
  window.sessionStorage.setItem(ADMIN_SESSION_KEY, "granted");
}

export function clearAdminPreviewSession() {
  window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
}
