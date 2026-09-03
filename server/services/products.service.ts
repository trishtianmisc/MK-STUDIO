import { supabase } from "../lib/supabase.js";
import type { Database } from "../types/database.js";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

/**
 * Get all public products (for anonymous/public access).
 * Ordered by sort_order.
 */
export async function getPublicProducts(): Promise<ProductRow[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_public", true)
    .order("sort_order");

  if (error) throw error;
  return data ?? [];
}

/**
 * Get all products (admin view — includes private products).
 */
export async function getAllProducts(): Promise<ProductRow[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort_order");

  if (error) throw error;
  return data ?? [];
}

/**
 * Get a single public product by slug.
 */
export async function getPublicProductBySlug(slug: string): Promise<ProductRow | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_public", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
}

/**
 * Get a single product by slug (admin view — includes private products).
 */
export async function getProductBySlug(slug: string): Promise<ProductRow | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
}

/**
 * Get a single product by ID (admin view).
 */
export async function getProductById(id: string): Promise<ProductRow | null> {
  const { data, error } = await supabase
    .from("products")
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
 * Create a new product.
 */
export async function createProduct(input: Record<string, unknown>): Promise<ProductRow> {
  const { data, error } = await supabase
    .from("products")
    .insert(input as ProductInsert)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update an existing product.
 */
export async function updateProduct(id: string, input: Record<string, unknown>): Promise<ProductRow | null> {
  const { data, error } = await supabase
    .from("products")
    .update(input as ProductUpdate)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a product by ID.
 */
export async function deleteProduct(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}

/**
 * Check if a product with the given slug already exists.
 */
export async function slugExists(slug: string, excludeId?: string): Promise<boolean> {
  let query = supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("slug", slug);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { count, error } = await query;

  if (error) throw error;
  return (count ?? 0) > 0;
}

/**
 * Check if a category exists.
 */
export async function categoryExists(categoryId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from("categories")
    .select("id", { count: "exact", head: true })
    .eq("id", categoryId);

  if (error) throw error;
  return (count ?? 0) > 0;
}

/**
 * Count products referencing a category.
 */
export async function countProductsByCategory(categoryId: string): Promise<number> {
  const { count, error } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", categoryId);

  if (error) throw error;
  return count ?? 0;
}
