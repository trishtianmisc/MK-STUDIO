import { supabase } from "@/lib/supabase";

const BUCKET_NAME = "product-images";

export function getProductImageUrl(path: string): string {
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadProductImage(file: File, path: string) {
  const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  return data;
}

export async function deleteProductImage(path: string) {
  const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);
  if (error) throw error;
}
