import fs from "fs";
import path from "path";

const IMAGE_EXTS = /\.(jpg|jpeg|png|webp|avif)$/i;

// Scans /public/images/products/{slug}/ and returns the first image found.
// Falls back to the Unsplash placeholder if the folder is empty or missing —
// `isPlaceholder` tells the caller so it can flag it as not a real product photo.
export function getProductImageUrl(
  slug: string,
  fallback: string,
): { url: string; isPlaceholder: boolean } {
  const dir = path.join(process.cwd(), "public", "images", "products", slug);
  try {
    const files = fs.readdirSync(dir).filter((f) => IMAGE_EXTS.test(f));
    if (files.length === 0) return { url: fallback, isPlaceholder: true };
    // Prioritize files named "main", "MAIN", "1", "01"
    const main = files.find((f) => /^(main|MAIN|1|01)\./i.test(f));
    const chosen = main ?? files.sort()[0];
    return { url: `/images/products/${slug}/${chosen}`, isPlaceholder: false };
  } catch {
    return { url: fallback, isPlaceholder: true };
  }
}

// Returns ALL images in the folder (for a product gallery).
export function getProductImageUrls(slug: string): string[] {
  const dir = path.join(process.cwd(), "public", "images", "products", slug);
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => IMAGE_EXTS.test(f))
      .map((f) => `/images/products/${slug}/${f}`);
  } catch {
    return [];
  }
}
