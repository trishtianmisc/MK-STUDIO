const MAX_WIDTH = 1200;
const WEBP_QUALITY = 82;

/**
 * Optimize an image file in the browser: resize to max width and convert to WebP.
 * Returns a new File ready for upload. Skips optimization if already WebP and small.
 */
export async function optimizeImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  // If already WebP and under 200 KB, skip
  if (file.type === "image/webp" && file.size < 200 * 1024) return file;

  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");

  let { width, height } = bitmap;
  if (width > MAX_WIDTH) {
    height = Math.round((height / width) * MAX_WIDTH);
    width = MAX_WIDTH;
  }

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Canvas toBlob failed"))),
      "image/webp",
      WEBP_QUALITY / 100,
    );
  });

  const baseName = file.name.replace(/\.[^.]+$/, "");
  return new File([blob], `${baseName}.webp`, { type: "image/webp" });
}
