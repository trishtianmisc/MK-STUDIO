import { supabase } from "../lib/supabase.js";

export interface RentalDate {
  id: string;
  product_id: string;
  start_date: string;
  end_date: string;
  type: "rented" | "maintenance" | "blocked";
  note: string | null;
  created_at: string;
}

/**
 * Get all rental dates for a product by slug.
 */
export async function getAvailabilityBySlug(slug: string): Promise<RentalDate[]> {
  const { data: product, error: prodErr } = await supabase
    .from("products")
    .select("id")
    .eq("slug", slug)
    .single();

  if (prodErr || !product) return [];

  const { data, error } = await supabase
    .from("rental_dates")
    .select("*")
    .eq("product_id", product.id)
    .order("start_date");

  if (error) throw error;
  return (data ?? []) as RentalDate[];
}

/**
 * Get all rental dates for a product by ID.
 */
export async function getAvailabilityByProductId(productId: string): Promise<RentalDate[]> {
  const { data, error } = await supabase
    .from("rental_dates")
    .select("*")
    .eq("product_id", productId)
    .order("start_date");

  if (error) throw error;
  return (data ?? []) as RentalDate[];
}

/**
 * Create a rental date record.
 */
export async function createRentalDate(input: {
  product_id: string;
  start_date: string;
  end_date: string;
  type: string;
  note?: string | null;
}): Promise<RentalDate> {
  const { data, error } = await supabase
    .from("rental_dates")
    .insert({
      product_id: input.product_id,
      start_date: input.start_date,
      end_date: input.end_date,
      type: input.type,
      note: input.note ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as RentalDate;
}

/**
 * Delete a rental date record.
 */
export async function deleteRentalDate(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("rental_dates")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}
