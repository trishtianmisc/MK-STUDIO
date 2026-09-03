import { supabase } from "@/lib/supabase";

const API_BASE = "/api/images";

async function getAuthToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Upload a product image (admin only).
 */
export async function uploadProductImage(
  file: File,
  productId: string,
  options?: { alt_text?: string; sort_order?: number; is_primary?: boolean },
): Promise<{ id: string; url: string; alt_text: string | null; sort_order: number; is_primary: boolean }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("product_id", productId);
  if (options?.alt_text !== undefined) formData.append("alt_text", options.alt_text);
  if (options?.sort_order !== undefined) formData.append("sort_order", String(options.sort_order));
  if (options?.is_primary !== undefined) formData.append("is_primary", String(options.is_primary));

  const response = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
    credentials: "include",
    headers: await authHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(error.error || `Upload failed (${response.status})`);
  }
  return response.json();
}

/**
 * Delete a product image (admin only).
 */
export async function deleteProductImage(imageId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${imageId}`, {
    method: "DELETE",
    credentials: "include",
    headers: await authHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Delete failed" }));
    throw new Error(error.error || `Delete failed (${response.status})`);
  }
}

/**
 * Update image metadata (admin only).
 */
export async function updateProductImage(
  imageId: string,
  updates: { alt_text?: string; sort_order?: number; is_primary?: boolean },
): Promise<void> {
  const response = await fetch(`${API_BASE}/${imageId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(updates),
    credentials: "include",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Update failed" }));
    throw new Error(error.error || `Update failed (${response.status})`);
  }
}

/**
 * Get images for a product (public).
 */
export async function getProductImages(
  productId: string,
): Promise<{ id: string; url: string; alt_text: string | null; sort_order: number; is_primary: boolean; product_id: string; created_at: string }[]> {
  const response = await fetch(`${API_BASE}/product/${productId}`, { credentials: "include" });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Fetch failed" }));
    throw new Error(error.error || `Fetch failed (${response.status})`);
  }
  return response.json();
}

/**
 * Reorder images (admin only).
 */
export async function reorderProductImages(
  images: { id: string; sort_order: number }[],
): Promise<void> {
  const response = await fetch(`${API_BASE}/reorder/all`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify({ images }),
    credentials: "include",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Reorder failed" }));
    throw new Error(error.error || `Reorder failed (${response.status})`);
  }
}
