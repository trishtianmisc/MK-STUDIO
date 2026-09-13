import { supabase } from "../lib/supabase.js";
import type { Database } from "../types/database.js";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

/** Product with joined category — returned by catalogue queries */
export type ProductWithRelations = ProductRow & {
  categories: CategoryRow | null;
};

const SELECT_WITH_RELATIONS = "*, categories(*)" as const;

/** Lightweight select for admin list view — drops heavy fields not shown in the table */
const SELECT_ADMIN_LIST = "id, category_id, name, slug, style, length, brand, rental_price, availability, is_featured, image, sort_order, is_public, created_at, updated_at, categories(id, slug, name)" as const;

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

/**
 * Get all public products (for anonymous/public access).
 * Includes category and image data.
 */
export async function getPublicProducts(
  page = 1,
  limit = 20,
): Promise<PaginatedResult<ProductWithRelations>> {
  const offset = (page - 1) * limit;

  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("is_public", true);

  const total = count ?? 0;

  const { data, error } = await supabase
    .from("products")
    .select(SELECT_WITH_RELATIONS)
    .eq("is_public", true)
    .order("sort_order")
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return {
    data: (data ?? []) as unknown as ProductWithRelations[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get all products (admin view — includes private products).
 * Uses lightweight column set for list views.
 */
export async function getAllProducts(
  page = 1,
  limit = 1000,
): Promise<PaginatedResult<ProductWithRelations>> {
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from("products")
    .select(SELECT_ADMIN_LIST, { count: "exact" })
    .order("sort_order")
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return {
    data: (data ?? []) as unknown as ProductWithRelations[],
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}

/**
 * Get a single public product by slug.
 * Includes category and image data.
 */
export async function getPublicProductBySlug(slug: string): Promise<ProductWithRelations | null> {
  const { data, error } = await supabase
    .from("products")
    .select(SELECT_WITH_RELATIONS)
    .eq("slug", slug)
    .eq("is_public", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as unknown as ProductWithRelations | null;
}

/**
 * Get a single product by slug (admin view — includes private products).
 * Includes category and image data.
 */
export async function getProductBySlug(slug: string): Promise<ProductWithRelations | null> {
  const { data, error } = await supabase
    .from("products")
    .select(SELECT_WITH_RELATIONS)
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as unknown as ProductWithRelations | null;
}

/**
 * Get a single product by ID (admin view).
 * Does not include relations (used internally for validation).
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
 * Get featured public products.
 * Includes category and image data.
 */
export async function getFeaturedProducts(): Promise<ProductWithRelations[]> {
  const { data, error } = await supabase
    .from("products")
    .select(SELECT_WITH_RELATIONS)
    .eq("is_public", true)
    .eq("is_featured", true)
    .order("sort_order");

  if (error) throw error;
  return (data ?? []) as unknown as ProductWithRelations[];
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

/**
 * Get admin dashboard stats — lightweight single query.
 */
export async function getAdminStats(): Promise<{
  totalProducts: number;
  publicProducts: number;
  featuredProducts: number;
  totalCategories: number;
}> {
  const [total, pub, feat, cats] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_public", true),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_featured", true),
    supabase.from("categories").select("id", { count: "exact", head: true }),
  ]);

  return {
    totalProducts: total.count ?? 0,
    publicProducts: pub.count ?? 0,
    featuredProducts: feat.count ?? 0,
    totalCategories: cats.count ?? 0,
  };
}
