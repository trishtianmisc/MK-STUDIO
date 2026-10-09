import { supabase } from "@/lib/supabase";

const API_BASE = "/api";

export type FeedbackStatus = "new" | "reviewed" | "archived";

export interface Feedback {
  id: string;
  rating: number;
  message: string | null;
  status: FeedbackStatus;
  created_at: string;
}

async function getAuthToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { credentials: "include", ...init });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || `Request failed (${response.status})`);
  }
  return response.json();
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// =============================================================================
// PUBLIC
// =============================================================================

export async function submitFeedback(input: {
  rating: number;
  message?: string;
}): Promise<{ ok: boolean }> {
  return fetchJson<{ ok: boolean }>(`${API_BASE}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

// =============================================================================
// ADMIN
// =============================================================================

export async function getFeedback(): Promise<Feedback[]> {
  return fetchJson<Feedback[]>(`${API_BASE}/admin/feedback`, {
    headers: await authHeaders(),
  });
}

export async function updateFeedbackStatus(
  id: string,
  status: FeedbackStatus
): Promise<Feedback> {
  return fetchJson<Feedback>(`${API_BASE}/admin/feedback/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify({ status }),
  });
}

export async function deleteFeedback(id: string): Promise<void> {
  await fetchJson<{ ok: boolean }>(`${API_BASE}/admin/feedback/${id}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
}
