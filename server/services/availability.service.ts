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

export interface RentalWithProduct extends RentalDate {
  product_name: string;
  product_slug: string;
  product_image: string | null;
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
 * Get all rental dates across all products (admin).
 */
export async function getAllRentals(): Promise<RentalWithProduct[]> {
  const { data, error } = await supabase
    .from("rental_dates")
    .select("*, products(name, slug, image)")
    .order("start_date", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    product_id: row.product_id,
    start_date: row.start_date,
    end_date: row.end_date,
    type: row.type,
    note: row.note,
    created_at: row.created_at,
    product_name: row.products?.name ?? "Unknown",
    product_slug: row.products?.slug ?? "",
    product_image: row.products?.image ?? null,
  }));
}

/**
 * Get upcoming rental dates (start_date >= today) across all products (admin).
 */
export async function getUpcomingRentals(): Promise<RentalWithProduct[]> {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("rental_dates")
    .select("*, products(name, slug, image)")
    .gte("end_date", today)
    .order("start_date");

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    product_id: row.product_id,
    start_date: row.start_date,
    end_date: row.end_date,
    type: row.type,
    note: row.note,
    created_at: row.created_at,
    product_name: row.products?.name ?? "Unknown",
    product_slug: row.products?.slug ?? "",
    product_image: row.products?.image ?? null,
  }));
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
 * Update a rental date record.
 */
export async function updateRentalDate(id: string, input: {
  start_date?: string;
  end_date?: string;
  type?: string;
  note?: string | null;
}): Promise<RentalDate> {
  const updates: Record<string, any> = {};
  if (input.start_date !== undefined) updates.start_date = input.start_date;
  if (input.end_date !== undefined) updates.end_date = input.end_date;
  if (input.type !== undefined) updates.type = input.type;
  if (input.note !== undefined) updates.note = input.note;

  const { data, error } = await supabase
    .from("rental_dates")
    .update(updates)
    .eq("id", id)
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
