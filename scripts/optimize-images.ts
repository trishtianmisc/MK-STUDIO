/**
 * One-shot script to optimise all product images in Supabase Storage.
 *
 * What it does:
 *   1. Lists every file in the `product-images` bucket under `dresses/`
 *   2. Downloads each image
 *   3. Converts to WebP (quality 82)
 *   4. Resizes so the widest edge is at most 1200 px (preserves aspect ratio)
 *   5. Re-uploads the optimised version (overwrites original)
 *   6. Updates the products.image URL in the database to point to the .webp file
 *
 * Usage:
 *   npx tsx scripts/optimize-images.ts
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = "product-images";
const FOLDER = "dresses";
const MAX_WIDTH = 1200;
const WEBP_QUALITY = 82;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log("Listing files in storage...");
  const { data: files, error: listError } = await supabase.storage
    .from(BUCKET)
    .list(FOLDER, { limit: 1000, sortBy: { column: "name", order: "asc" } });

  if (listError) {
    console.error("Failed to list files:", listError);
    process.exit(1);
  }

  if (!files || files.length === 0) {
    console.log("No files found.");
    return;
  }

  // Filter to only image files
  const imageFiles = files.filter((f) => {
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    return ["jpg", "jpeg", "png", "webp", "gif", "avif"].includes(ext);
  });

  console.log(`Found ${imageFiles.length} image files.\n`);

  let optimised = 0;
  let skipped = 0;
  let failed = 0;
  let dbUpdated = 0;

  for (const file of imageFiles) {
    const path = `${FOLDER}/${file.name}`;
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";

    process.stdout.write(`  ${file.name} — `);

    try {
      // Download
      const { data: blob, error: dlError } = await supabase.storage
        .from(BUCKET)
        .download(path);

      if (dlError || !blob) {
        console.log(`download failed: ${dlError?.message ?? "no data"}`);
        failed++;
        continue;
      }

      const buffer = Buffer.from(await blob.arrayBuffer());
      const originalSize = buffer.length;

      // If already WebP and small enough, skip
      if (ext === "webp" && originalSize < 200 * 1024) {
        console.log(`already WebP (${fmtSize(originalSize)}), skipping`);
        skipped++;
        continue;
      }

      // Convert + resize
      const optimisedBuffer = await sharp(buffer)
        .rotate()
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();

      const newSize = optimisedBuffer.length;
      const savings = ((1 - newSize / originalSize) * 100).toFixed(0);

      // Upload as WebP (same base name, .webp extension)
      const newName = file.name.replace(/\.[^.]+$/, ".webp");
      const newPath = `${FOLDER}/${newName}`;

      // Delete old file if extension changed
      if (newName !== file.name) {
        await supabase.storage.from(BUCKET).remove([path]);
      }

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(newPath, optimisedBuffer, {
          contentType: "image/webp",
          cacheControl: "31536000",
          upsert: true,
        });

      if (uploadError) {
        console.log(`upload failed: ${uploadError.message}`);
        failed++;
        continue;
      }

      // Update database URL if the filename changed
      if (newName !== file.name) {
        const oldUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
        const newUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${newPath}`;

        const { error: updateError } = await supabase
          .from("products")
          .update({ image: newUrl })
          .eq("image", oldUrl);

        if (!updateError) {
          dbUpdated++;
        }
      }

      console.log(
        `${fmtSize(originalSize)} -> ${fmtSize(newSize)} (${savings}% smaller)`
      );
      optimised++;
    } catch (err: any) {
      console.log(`error: ${err.message}`);
      failed++;
    }
  }

  console.log(
    `\nDone. Optimised: ${optimised}, Skipped: ${skipped}, Failed: ${failed}, DB updated: ${dbUpdated}`
  );
}

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

main();
