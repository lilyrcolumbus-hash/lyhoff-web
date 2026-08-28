import type { Locale } from "./i18n";
import generated from "./products.generated.json";

// Owner decision (2026-07-21): prices below already have the $9.99 flat shipping rate
// (worker.ts's FLAT_SHIPPING_CENTS) subtracted out, so product price + shipping at checkout
// equals what used to be the standalone product price. If FLAT_SHIPPING_CENTS ever changes,
// these need re-adjusting to match.
export type ProductCategory = "bodycare" | "hair" | "home" | "hoff";

export interface Product {
  asin: string;
  slug: string;
  category: ProductCategory;
  name: { en: string; es: string };
  tagline: { en: string; es: string };
  description: { en: string; es: string };
  ingredients: { en: string; es: string }[];
  price: number;
  size: string;
  image: string;
  badge?: { en: string; es: string };
  active: boolean;
  /** Products sharing this id are shown as one product with a size selector. */
  variantGroup?: string;
  /** Which scent this exact product is, if it comes in more than one — "Unscented" | "Vanilla" | "Peppermint". */
  scent?: string;
  /** Products sharing this id (same size, different scent) are shown as a scent selector. */
  scentGroup?: string;
  /** Short scannable claims, pulled from the description — shown as bullets on the product page. */
  benefits: { en: string; es: string }[];
  howToUse: { en: string; es: string };
  /** Real customer reviews — translated to both languages so the site never mixes languages. */
  reviews?: { text: { en: string; es: string }; author: string; location: string }[];
  /** Free physical gift included with purchase — shown as a standalone highlighted callout, not buried in benefits. */
  gift?: { en: string; es: string };
  /**
   * The gallery, in the order the owner arranged it in the panel; first is the
   * main photo. An entry starting with "/" is a file in the repo, anything else
   * is a path in the product-photos bucket — see lib/product-images.ts.
   */
  photos?: string[];
  /**
   * Units on hand. Absent means the product is not stock tracked and always
   * sells; 0 means sold out. Checkout re-reads this live before taking money —
   * the value here is a snapshot from the last publish.
   */
  stock?: number;
  /**
   * Overrides for the search-result title and the description under it. Absent
   * for most products, which is correct: the product's own name and description
   * are usually exactly what should appear there.
   */
  seo?: { title?: { en: string; es: string }; description?: { en: string; es: string } };
}

export const SCENT_OPTIONS = ["Unscented", "Peppermint", "Vanilla"];

export const SCENT_LABELS: Record<string, { en: string; es: string }> = {
  Unscented: { en: "Unscented", es: "Sin fragancia" },
  Peppermint: { en: "Peppermint", es: "Menta" },
  Vanilla: { en: "Vanilla", es: "Vainilla" },
};

// `Product.size` is the canonical English string used for cart/Stripe/dedup
// keys — this only translates the handful of English words inside it
// ("For Her"/"For Him"/"each") for display, without changing the stored value.
export function translateSize(size: string, locale: Locale): string {
  if (locale === "en") return size;
  return size
    .replace("For Her", "Para Ella")
    .replace("For Him", "Para Él")
    .replace("each", "c/u");
}

const UNSPLASH = (id: string, w = 800, h = 900) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&q=90&auto=format&fit=crop`;

// Local image path by slug — drop file in /public/images/products/{slug}.jpg
// and it auto-replaces the Unsplash placeholder. No code change needed.
export const localImagePath = (slug: string) => `/images/products/${slug}.jpg`;

// The catalogue is no longer written here. scripts/fetch-products.mjs pulls it
// from Supabase at build time into products.generated.json, so the owner can
// edit products in the admin panel without touching code — while the data
// itself is still frozen into the bundle, never read live. worker.ts prices
// Stripe from this same import, which is what guarantees the price shown and
// the price charged come from one snapshot.
//
// Every helper below is unchanged: they operate on `products` regardless of
// where it came from, so no page or component needed editing for this switch.
export const products: Product[] = generated as Product[];

export const activeProducts = products.filter((p) => p.active);

export const productsByCategory = (cat: ProductCategory) =>
  activeProducts.filter((p) => p.category === cat);

export const getProduct = (slug: string) =>
  products.find((p) => p.slug === slug);

/** All active products sharing a variantGroup, sorted by price. */
export const getVariants = (variantGroup: string) =>
  activeProducts
    .filter((p) => p.variantGroup === variantGroup)
    .sort((a, b) => a.price - b.price);

/**
 * Size picker only: one product per unique size within a variantGroup — a
 * variantGroup may hold several scent siblings per size (e.g. tallow-cream has
 * 2oz-unscented/peppermint/vanilla + 1oz-*), and the size picker should show
 * exactly one pill per size. Prefers the "Unscented" sibling as that size's
 * representative when there's a choice.
 */
export const getSizeVariants = (variantGroup: string) => {
  const bySize = new Map<string, Product>();
  for (const p of getVariants(variantGroup)) {
    const existing = bySize.get(p.size);
    if (!existing || p.scent === "Unscented") bySize.set(p.size, p);
  }
  return [...bySize.values()].sort((a, b) => a.price - b.price);
};

/** All active products sharing a scentGroup (same product + size, different scent). */
export const getScentVariants = (scentGroup: string) =>
  activeProducts
    .filter((p) => p.scentGroup === scentGroup)
    .sort((a, b) => SCENT_OPTIONS.indexOf(a.scent ?? "") - SCENT_OPTIONS.indexOf(b.scent ?? ""));

/** Listing-grid dedupe: keep only the first product per variantGroup (declaration order). */
export const dedupeVariants = (list: Product[]) => {
  const seen = new Set<string>();
  return list.filter((p) => {
    if (!p.variantGroup) return true;
    if (seen.has(p.variantGroup)) return false;
    seen.add(p.variantGroup);
    return true;
  });
};
