import { supabase } from "@/lib/supabase";

const API_BASE = "/api/products";

export interface ProductWithRelations {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  details: string | null;
  sizing: string | null;
  sizes: string[];
  fabric: string | null;
  color: string | null;
  rental_price: number;
  availability: "Available" | "Limited" | "Unavailable";
  unavailable_days: number[];
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
  product_images: {
    id: string;
    product_id: string;
    url: string;
    alt_text: string | null;
    sort_order: number;
    is_primary: boolean;
    created_at: string;
  }[];
}

export interface CreateProductInput {
  category_id: string;
  name: string;
  slug: string;
  description?: string;
  details?: string;
  sizing?: string;
  sizes?: string[];
  fabric?: string;
  color?: string;
  rental_price: number;
  availability?: "Available" | "Limited" | "Unavailable";
  unavailable_days?: number[];
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

export async function getProducts(): Promise<ProductWithRelations[]> {
  return fetchJson<ProductWithRelations[]>(API_BASE);
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
