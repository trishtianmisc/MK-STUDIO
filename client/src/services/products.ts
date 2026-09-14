import { supabase } from "@/lib/supabase";

const API_BASE = "/api/products";

export interface ProductWithRelations {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  style: string | null;
  length: string | null;
  sizes: string[];
  brand: string | null;
  rental_price: number;
  availability: "Available" | "Limited" | "Unavailable";
  rental_note: string | null;
  is_featured: boolean;
  image: string | null;
  sort_order: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  categories: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    image: string | null;
    sort_order: number;
    created_at: string;
    updated_at: string;
  } | null;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateProductInput {
  category_id: string;
  name: string;
  slug: string;
  style?: string;
  length?: string;
  sizes?: string[];
  brand?: string;
  rental_price: number;
  availability?: "Available" | "Limited" | "Unavailable";
  rental_note?: string;
  is_featured?: boolean;
  image?: string;
  sort_order?: number;
  is_public?: boolean;
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

export async function getProducts(page = 1, limit = 20, category?: string): Promise<PaginatedResult<ProductWithRelations>> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (category) params.set("category", category);
  return fetchJson<PaginatedResult<ProductWithRelations>>(`${API_BASE}?${params}`);
}

// =============================================================================
// ADMIN READS
// =============================================================================

export interface AdminStats {
  totalProducts: number;
  publicProducts: number;
  featuredProducts: number;
  totalCategories: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const response = await fetch(`${API_BASE}/admin/stats`, {
    credentials: "include",
    headers: await authHeaders(),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || `Request failed (${response.status})`);
  }
  return response.json();
}

export async function getAdminProducts(): Promise<ProductWithRelations[]> {
  const response = await fetch(`${API_BASE}?page=1&limit=50`, {
    credentials: "include",
    headers: await authHeaders(),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || `Request failed (${response.status})`);
  }
  const result = await response.json();
  return Array.isArray(result) ? result : result.data ?? [];
}

export async function getProductBySlug(slug: string): Promise<ProductWithRelations> {
  return fetchJson<ProductWithRelations>(`${API_BASE}/${slug}`);
}

export async function getFeaturedProducts(): Promise<ProductWithRelations[]> {
  return fetchJson<ProductWithRelations[]>(`${API_BASE}/featured`);
}

// =============================================================================
// ADMIN MUTATIONS
// =============================================================================

export async function createProduct(input: CreateProductInput): Promise<ProductWithRelations> {
  return fetchJson<ProductWithRelations>(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(input),
  });
}

export async function updateProduct(id: string, input: Partial<CreateProductInput>): Promise<ProductWithRelations> {
  return fetchJson<ProductWithRelations>(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(input),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await fetchJson<{ message: string }>(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
}
