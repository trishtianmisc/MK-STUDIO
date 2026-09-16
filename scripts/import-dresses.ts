import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import XLSX from "xlsx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const EXCEL_PATH = path.resolve(__dirname, "../tests/MK_Studio_Dress_Catalogue.xlsx");
const IMAGE_DIR = path.resolve(__dirname, "../tests/MK DRESS COLLECTION (2)");

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function getOrCreateCategories(): Promise<Map<string, string>> {
  const { data: existing } = await supabase.from("categories").select("id, name");
  const map = new Map<string, string>();
  for (const cat of existing || []) map.set(cat.name, cat.id);

  const needed = ["Date Night"];
  for (const name of needed) {
    if (!map.has(name)) {
      const slug = slugify(name);
      const { data, error } = await supabase
        .from("categories")
        .insert({ slug, name, sort_order: 99 })
        .select("id")
        .single();
      if (error) throw new Error(`Failed to create category "${name}": ${error.message}`);
      map.set(name, data.id);
      console.log(`  Created category: "${name}" (${data.id})`);
    }
  }
  return map;
}

async function uploadImage(num: number): Promise<string | null> {
  const filePath = path.join(IMAGE_DIR, `${num}.png`);
  if (!fs.existsSync(filePath)) {
    console.warn(`  Image ${num}.png not found, skipping`);
    return null;
  }
  const fileBuffer = fs.readFileSync(filePath);
  const storagePath = `dresses/${num}.png`;

  const { error } = await supabase.storage
    .from("product-images")
    .upload(storagePath, fileBuffer, {
      contentType: "image/png",
      upsert: true,
    });
  if (error) {
    console.error(`  Failed to upload ${num}.png:`, error.message);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from("product-images")
    .getPublicUrl(storagePath);
  return urlData.publicUrl;
}

async function main() {
  console.log("=== MK Studio Dress Import ===\n");

  console.log("1. Loading Excel...");
  const wb = XLSX.readFile(EXCEL_PATH);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
  const dresses = rows.filter((r) => typeof r[0] === "number" && r[1]);
  console.log(`   Found ${dresses.length} dresses\n`);

  console.log("2. Resolving categories...");
  const categoryMap = await getOrCreateCategories();
  for (const [name, id] of categoryMap) {
    console.log(`   ${name}: ${id}`);
  }
  console.log();

  console.log("3. Uploading images...");
  const imageUrlMap = new Map<number, string>();
  for (const row of dresses) {
    const num: number = row[0];
    const url = await uploadImage(num);
    if (url) imageUrlMap.set(num, url);
    if (num % 10 === 0 || num === dresses.length) {
      process.stdout.write(`   ${num}/${dresses.length} uploaded\r`);
    }
  }
  console.log(`\n   ${imageUrlMap.size}/${dresses.length} images uploaded\n`);

  console.log("4. Inserting products...");
  let inserted = 0;
  let failed = 0;

  for (const row of dresses) {
    const [num, name, size, style, length, brand, category, rentPrice] = row;

    const categoryId = categoryMap.get(category);
    if (!categoryId) {
      console.error(`   SKIP #${num}: Unknown category "${category}"`);
      failed++;
      continue;
    }

    const slug = slugify(name);
    const imageUrl = imageUrlMap.get(num) || null;
    const sizes = size ? [String(size)] : [];

    const { error } = await supabase.from("products").insert({
      category_id: categoryId,
      slug,
      name,
      style: style || null,
      length: length || null,
      sizes,
      brand: brand || null,
      rental_price: rentPrice,
      availability: "Available",
      is_featured: false,
      is_public: true,
      image: imageUrl,
      sort_order: num,
    });

    if (error) {
      console.error(`   FAIL #${num} "${name}": ${error.message}`);
      failed++;
    } else {
      inserted++;
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`   Inserted: ${inserted}`);
  console.log(`   Failed:   ${failed}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
