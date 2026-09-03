import { supabase } from "../lib/supabase.js";
import type { Database } from "../types/database.js";

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];
type CategoryUpdate = Database["public"]["Tables"]["categories"]["Update"];

/**
 * Get all categories.
 */
export async function getAllCategories(): Promise<CategoryRow[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  if (error) throw error;
  return data ?? [];
}

/**
 * Get a single category by slug.
 */
export async function getCategoryBySlug(slug: string): Promise<CategoryRow | null> {
  const { data, error } = await supabase
    .from("categories")
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
 * Get a single category by ID.
 */
export async function getCategoryById(id: string): Promise<CategoryRow | null> {
  const { data, error } = await supabase
    .from("categories")
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
 * Create a new category.
 */
export async function createCategory(input: Record<string, unknown>): Promise<CategoryRow> {
  const { data, error } = await supabase
    .from("categories")
    .insert(input as CategoryInsert)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update an existing category.
 */
export async function updateCategory(id: string, input: Record<string, unknown>): Promise<CategoryRow | null> {
  const { data, error } = await supabase
    .from("categories")
    .update(input as CategoryUpdate)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a category by ID.
 */
export async function deleteCategory(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}

/**
 * Check if a category with the given slug already exists.
 */
export async function slugExists(slug: string, excludeId?: string): Promise<boolean> {
  let query = supabase
    .from("categories")
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
