import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";

type Product = Database["public"]["Tables"]["products"]["Row"];

export async function getProducts() {
  const { data, error } = await supabase.from("products").select("*").order("sort_order");
  if (error) throw error;
  return data;
}

export async function getProductBySlug(slug: string) {
  const { data, error } = await supabase.from("products").select("*").eq("slug", slug).single();
  if (error) throw error;
  return data;
}

export async function getProductsByCategory(categoryId: number) {
  const { data, error } = await supabase.from("products").select("*").eq("category_id", categoryId).order("sort_order");
  if (error) throw error;
  return data;
}

export async function getFeaturedProducts() {
  const { data, error } = await supabase.from("products").select("*").eq("is_featured", true).order("sort_order");
  if (error) throw error;
  return data;
}
