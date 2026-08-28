import fs from "fs";
import path from "path";
import { site } from "@/site.config";
import { products } from "@/lib/products";

const IMAGE_EXTS = /\.(jpg|jpeg|png|webp|avif)$/i;

/** Where photos uploaded from the admin panel live. */
export const PHOTO_BUCKET = "product-photos";
const STORAGE_BASE = `${site.data.supabaseUrl}/storage/v1/object/public/${PHOTO_BUCKET}`;

/**
 * A photo is stored as a plain string, and there are two kinds.
 *
 * One starting with "/" is a file committed to the repo, served by Cloudflare
 * with the rest of the site. Anything else is a path inside the storage bucket,
 * uploaded from the panel. Both live in the same ordered list so the 163MB of
 * photos already in git did not have to be moved to put the gallery under the
 * owner's control — and so the host can be changed later by rewriting one
 * function instead of a column.
 */
export function photoUrl(entry: string): string {
  return entry.startsWith("/") || entry.startsWith("http") ? entry : `${STORAGE_BASE}/${entry}`;
}

/** Absolute, for OpenGraph and JSON-LD, which cannot use a site-relative path. */
export function absolutePhotoUrl(entry: string, origin: string): string {
  const url = photoUrl(entry);
  return url.startsWith("http") ? url : `${origin}${url}`;
}

// Same file → same order everywhere: whichever photo is picked as "main" is
// always first, so the photo shown on the listing card is the same one shown
// first on the product detail page (a mismatch there reads as a broken site).
function sortWithMainFirst(files: string[]): string[] {
  const main = files.find((f) => /^(main|1|01)\./i.test(f));
  const rest = files.filter((f) => f !== main).sort();
  return main ? [main, ...rest] : rest;
}

/**
 * The gallery, in the order the owner arranged it.
 *
 * The `photos` column is the source of truth. Scanning the folder is kept only
 * as a fallback for a product whose column has never been filled — a new site
 * dropping images straight into the repo still works without touching the
 * database first.
 */
function galleryFor(slug: string): string[] {
  const stored = products.find((p) => p.slug === slug)?.photos;
  if (stored && stored.length > 0) return stored;

  const dir = path.join(process.cwd(), "public", "images", "products", slug);
  try {
    const files = fs.readdirSync(dir).filter((f) => IMAGE_EXTS.test(f));
    return sortWithMainFirst(files).map((f) => `/images/products/${slug}/${f}`);
  } catch {
    return [];
  }
}

/**
 * The one photo that represents the product. Falls back to the generic
 * placeholder when there is none — `isPlaceholder` tells the caller so it can
 * flag it as not a real product photo rather than quietly passing it off.
 */
export function getProductImageUrl(
  slug: string,
  fallback: string,
): { url: string; isPlaceholder: boolean } {
  const [first] = galleryFor(slug);
  return first ? { url: photoUrl(first), isPlaceholder: false } : { url: fallback, isPlaceholder: true };
}

/** Every photo, main first — matches getProductImageUrl so the gallery opens on the card's photo. */
export function getProductImageUrls(slug: string): string[] {
  return galleryFor(slug).map(photoUrl);
}
