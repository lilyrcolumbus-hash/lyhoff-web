import fs from "fs";
import path from "path";

const IMAGE_EXTS = /\.(jpg|jpeg|png|webp|avif)$/i;

// Same file → same order everywhere: whichever photo is picked as "main" is
// always first, so the photo shown on the listing card is the same one shown
// first on the product detail page (a mismatch there reads as a broken site).
function sortWithMainFirst(files: string[]): string[] {
  const main = files.find((f) => /^(main|1|01)\./i.test(f));
  const rest = files.filter((f) => f !== main).sort();
  return main ? [main, ...rest] : rest;
}

// Scans /public/images/products/{slug}/ and returns the main image.
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
    const [chosen] = sortWithMainFirst(files);
    return { url: `/images/products/${slug}/${chosen}`, isPlaceholder: false };
  } catch {
    return { url: fallback, isPlaceholder: true };
  }
}

// Returns ALL images in the folder (for a product gallery), main image first —
// matches getProductImageUrl so the gallery opens on the same photo as the card.
export function getProductImageUrls(slug: string): string[] {
  const dir = path.join(process.cwd(), "public", "images", "products", slug);
  try {
    const files = fs.readdirSync(dir).filter((f) => IMAGE_EXTS.test(f));
    return sortWithMainFirst(files).map((f) => `/images/products/${slug}/${f}`);
  } catch {
    return [];
  }
}
