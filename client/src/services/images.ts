/**
 * Client-side image service.
 *
 * All image operations go through the Express API (/api/images/*).
 * The browser never uploads directly to Supabase Storage.
 */

const API_BASE = "/api/images";

/**
 * Upload a product image.
 * Returns the created image metadata.
 */
export async function uploadProductImage(
  file: File,
  productId: string,
  options?: { alt_text?: string; sort_order?: number; is_primary?: boolean },
): Promise<{ id: string; url: string; alt_text: string | null; sort_order: number; is_primary: boolean }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("product_id", productId);

  if (options?.alt_text !== undefined) {
    formData.append("alt_text", options.alt_text);
  }
  if (options?.sort_order !== undefined) {
    formData.append("sort_order", String(options.sort_order));
  }
  if (options?.is_primary !== undefined) {
    formData.append("is_primary", String(options.is_primary));
  }

  const response = await fetch(API_BASE + "/upload", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(error.error || `Upload failed (${response.status})`);
  }

  return response.json();
}

/**
 * Delete a product image.
 */
export async function deleteProductImage(imageId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${imageId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Delete failed" }));
    throw new Error(error.error || `Delete failed (${response.status})`);
  }
}

/**
 * Update image metadata (alt_text, sort_order, is_primary).
 */
export async function updateProductImage(
  imageId: string,
  updates: { alt_text?: string; sort_order?: number; is_primary?: boolean },
): Promise<void> {
  const response = await fetch(`${API_BASE}/${imageId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Update failed" }));
    throw new Error(error.error || `Update failed (${response.status})`);
  }
}

/**
 * Get images for a product.
 */
export async function getProductImages(
  productId: string,
): Promise<{ id: string; url: string; alt_text: string | null; sort_order: number; is_primary: boolean }[]> {
  const response = await fetch(`${API_BASE}/product/${productId}`, {
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Fetch failed" }));
    throw new Error(error.error || `Fetch failed (${response.status})`);
  }

  return response.json();
}

/**
 * Reorder images.
 */
export async function reorderProductImages(
  images: { id: string; sort_order: number }[],
): Promise<void> {
  const response = await fetch(`${API_BASE}/reorder/all`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ images }),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Reorder failed" }));
    throw new Error(error.error || `Reorder failed (${response.status})`);
  }
}
