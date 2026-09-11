import { supabase } from "@/lib/supabase";

const API_BASE = "/api";

export interface RentalDate {
  id: string;
  product_id: string;
  start_date: string;
  end_date: string;
  type: "rented" | "maintenance" | "blocked";
  note: string | null;
  created_at: string;
}

export interface RentalWithProduct extends RentalDate {
  product_name: string;
  product_slug: string;
  product_image: string | null;
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
// PUBLIC READS
// =============================================================================

export async function getProductAvailability(slug: string): Promise<RentalDate[]> {
  return fetchJson<RentalDate[]>(`${API_BASE}/products/${slug}/availability`);
}

// =============================================================================
// ADMIN READS
// =============================================================================

export async function getAllRentals(): Promise<RentalWithProduct[]> {
  return fetchJson<RentalWithProduct[]>(`${API_BASE}/admin/rentals`, {
    headers: await authHeaders(),
  });
}

export async function getUpcomingRentals(): Promise<RentalWithProduct[]> {
  return fetchJson<RentalWithProduct[]>(`${API_BASE}/admin/rentals/upcoming`, {
    headers: await authHeaders(),
  });
}

// =============================================================================
// ADMIN MUTATIONS
// =============================================================================

export async function createRentalDate(input: {
  product_id: string;
  start_date: string;
  end_date: string;
  type: string;
  note?: string | null;
}): Promise<RentalDate> {
  return fetchJson<RentalDate>(`${API_BASE}/admin/availability`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(input),
  });
}

export async function updateRentalDate(id: string, input: {
  start_date?: string;
  end_date?: string;
  type?: string;
  note?: string | null;
}): Promise<RentalDate> {
  return fetchJson<RentalDate>(`${API_BASE}/admin/availability/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(input),
  });
}

export async function deleteRentalDate(id: string): Promise<void> {
  await fetchJson<{ message: string }>(`${API_BASE}/admin/availability/${id}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
}
