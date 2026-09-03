import { supabase } from "@/lib/supabase";

const API_BASE = "/api/categories";

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  sort_order?: number;
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

export async function getCategories(): Promise<Category[]> {
  return fetchJson<Category[]>(API_BASE);
}

export async function getCategoryBySlug(slug: string): Promise<Category> {
  return fetchJson<Category>(`${API_BASE}/${slug}`);
}

// =============================================================================
// ADMIN MUTATIONS
// =============================================================================

export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  return fetchJson<Category>(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(input),
  });
}

export async function updateCategory(id: string, input: Partial<CreateCategoryInput>): Promise<Category> {
  return fetchJson<Category>(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(input),
  });
}

export async function deleteCategory(id: string): Promise<void> {
  await fetchJson<{ message: string }>(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
}
