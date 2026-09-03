import { supabase } from "../lib/supabase.js";
import type { Database } from "../types/database.js";
import { MAX_IMAGES_PER_PRODUCT } from "../validators/images.validator.js";

const BUCKET_NAME = "product-images";

type ProductImageRow = Database["public"]["Tables"]["product_images"]["Row"];
type ProductImageInsert = Database["public"]["Tables"]["product_images"]["Insert"];
type ProductImageUpdate = Database["public"]["Tables"]["product_images"]["Update"];

// =============================================================================
// STORAGE OPERATIONS
// =============================================================================

/**
 * Upload a file to Supabase Storage.
 * Returns the full public URL of the uploaded object.
 */
export async function uploadToStorage(
  path: string,
  file: Buffer,
  contentType: string,
): Promise<string> {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      contentType,
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);

  return data.publicUrl;
}

/**
 * Delete an object from Supabase Storage.
 */
export async function deleteFromStorage(path: string): Promise<void> {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);

  if (error) throw error;
}

// =============================================================================
// DATABASE OPERATIONS
// =============================================================================

/**
 * Get images for a product.
 * Public view (anon client) respects RLS — only public product images.
 */
export async function getImagesByProduct(productId: string): Promise<ProductImageRow[]> {
  const { data, error } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order");

  if (error) throw error;
  return data ?? [];
}

/**
 * Get a single image by ID.
 */
export async function getImageById(id: string): Promise<ProductImageRow | null> {
  const { data, error } = await supabase
    .from("product_images")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
}

/**
 * Count images for a product.
 */
export async function countImagesByProduct(productId: string): Promise<number> {
  const { count, error } = await supabase
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);

  if (error) throw error;
  return count ?? 0;
}

/**
 * Create a product_images record.
 */
export async function createImageRecord(input: ProductImageInsert): Promise<ProductImageRow> {
  const { data, error } = await supabase
    .from("product_images")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a product_images record.
 */
export async function updateImageRecord(
  id: string,
  input: ProductImageUpdate,
): Promise<ProductImageRow | null> {
  const { data, error } = await supabase
    .from("product_images")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a product_images record.
 */
export async function deleteImageRecord(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}

/**
 * Clear primary flag for all images of a product.
 */
export async function clearPrimaryImages(productId: string): Promise<void> {
  const { error } = await supabase
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", productId)
    .eq("is_primary", true);

  if (error) throw error;
}

/**
 * Check if product exists.
 */
export async function productExists(productId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("id", productId);

  if (error) throw error;
  return (count ?? 0) > 0;
}

/**
 * Check if product is public.
 */
export async function isProductPublic(productId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("products")
    .select("is_public")
    .eq("id", productId)
    .single();

  if (error || !data) return false;
  return data.is_public === true;
}

/**
 * Get all images for a product (for cleanup purposes).
 */
export async function getAllImagesForProduct(productId: string): Promise<ProductImageRow[]> {
  const { data, error } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId);

  if (error) throw error;
  return data ?? [];
}

/**
 * Extract Storage path from a public URL.
 * URL format: https://xxx.supabase.co/storage/v1/object/public/product-images/{path}
 */
export function extractStoragePathFromUrl(url: string): string | null {
  const marker = "/object/public/product-images/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

/**
 * Enforce max images limit.
 * Throws if limit exceeded.
 */
export async function enforceImageLimit(productId: string): Promise<void> {
  const count = await countImagesByProduct(productId);
  if (count >= MAX_IMAGES_PER_PRODUCT) {
    throw new ImageLimitError(productId, count);
  }
}

/**
 * Reorder multiple images.
 */
export async function reorderImages(
  updates: { id: string; sort_order: number }[],
): Promise<void> {
  for (const { id, sort_order } of updates) {
    const { error } = await supabase
      .from("product_images")
      .update({ sort_order })
      .eq("id", id);

    if (error) throw error;
  }
}

// =============================================================================
// ERRORS
// =============================================================================

export class ImageLimitError extends Error {
  constructor(
    public productId: string,
    public currentCount: number,
  ) {
    super(`Image limit reached for product ${productId}: ${currentCount}/${MAX_IMAGES_PER_PRODUCT}`);
    this.name = "ImageLimitError";
  }
}

export class StorageUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StorageUploadError";
  }
}

export class StorageDeleteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StorageDeleteError";
  }
}
