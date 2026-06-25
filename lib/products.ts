// LYHOFF store — product catalog and the Amazon/Etsy connection.
//
// This site is the content destination (SmartGrowth articles → Pinterest →
// here). The shop section is the LYHOFF brand: products the couple formulates,
// tests and uses themselves, sold on Amazon / Etsy. Since the site is a 100%
// static export with no checkout, each product page "connects" to the real
// listing by linking out to Amazon (primary) and Etsy (secondary).
//
// ──────────────────────────────────────────────────────────────────────────
// HOW TO CONNECT A REAL LISTING (owner): set `amazonUrl` / `etsyUrl` on the
// product below to the exact listing URL. Until a product has its own URL, the
// Buy button falls back to the brand storefront (AMAZON_STOREFRONT /
// ETSY_STOREFRONT) and, if that's empty too, to an Amazon search for the brand
// — so buttons always lead somewhere real, never a dead link.
// ──────────────────────────────────────────────────────────────────────────

import type { Locale } from "./i18n";

export const BRAND = "LYHOFF";

// Brand storefronts. Paste the real URLs when available, e.g.
//   AMAZON_STOREFRONT = "https://www.amazon.com/stores/LYHOFF/page/XXXX"
//   ETSY_STOREFRONT   = "https://www.etsy.com/shop/LYHOFF"
// Leave empty to fall back to an Amazon search for the brand.
export const AMAZON_STOREFRONT = "";
export const ETSY_STOREFRONT = "";

// Optional Amazon Associates tag (e.g. "lyhoff-20"). Appended to amazon.com
// links when set so traffic we send is tracked/credited. Empty = no tag.
export const AMAZON_ASSOCIATES_TAG = "";

// Product lines (audiences differ — see brand strategy in CLAUDE.md).
export type ProductLine = "body" | "home";

export interface ProductLineMeta {
  slug: ProductLine;
  emoji: string;
  label: Record<Locale, string>;
  blurb: Record<Locale, string>;
}

export const productLines: ProductLineMeta[] = [
  {
    slug: "body",
    emoji: "🧴",
    label: { en: "LYHOFF Body", es: "LYHOFF Body" },
    blurb: {
      en: "Skin, hair and personal care — tallow-based, nothing synthetic.",
      es: "Piel, cabello y cuidado personal — a base de sebo, nada sintético.",
    },
  },
  {
    slug: "home",
    emoji: "🏡",
    label: { en: "LYHOFF Home", es: "LYHOFF Home" },
    blurb: {
      en: "Natural solutions for the garden and the home.",
      es: "Soluciones naturales para el jardín y el hogar.",
    },
  },
];

export function getProductLine(slug: string): ProductLineMeta | undefined {
  return productLines.find((l) => l.slug === slug);
}

export interface Product {
  slug: string;
  line: ProductLine;
  name: Record<Locale, string>;
  // Short, result-focused promise (sell the result, not the product).
  tagline: Record<Locale, string>;
  // 1–2 sentence story / what it is.
  description: Record<Locale, string>;
  // Visible ingredient list — transparency is a brand pillar.
  ingredients: Record<Locale, string>;
  benefits: Record<Locale, string[]>;
  size?: Record<Locale, string>;
  price?: string; // e.g. "$24" — optional until pricing is final.
  image?: string; // /images/products/<slug>.jpg (square works best)
  amazonUrl?: string;
  etsyUrl?: string;
  featured?: boolean;
}

// ──────────────────────────────────────────────────────────────────────────
// Catalog. Only real, documented products are listed (no invented SKUs).
// Copy is professional/aspirational per brand voice — never "homemade".
// Fill in amazonUrl / etsyUrl / image / price as listings and photos land.
// ──────────────────────────────────────────────────────────────────────────
export const products: Product[] = [
  {
    slug: "tallow-cream",
    line: "body",
    name: { en: "Tallow Cream", es: "Crema de Sebo" },
    tagline: {
      en: "Deeply nourished skin that actually feels alive.",
      es: "Piel profundamente nutrida que de verdad se siente viva.",
    },
    description: {
      en: "A small-batch whipped balm built on grass-fed tallow — the closest match to skin's own oils. It melts in, calms, and restores the barrier without a single synthetic.",
      es: "Un bálsamo batido en pequeños lotes a base de sebo de pastura — lo más parecido a los aceites naturales de la piel. Se funde, calma y restaura la barrera sin un solo sintético.",
    },
    ingredients: {
      en: "Grass-fed tallow, organic jojoba oil, vitamin E.",
      es: "Sebo de pastura, aceite de jojoba orgánico, vitamina E.",
    },
    benefits: {
      en: ["Restores the skin barrier", "Non-greasy, fast absorbing", "Just 3 whole ingredients"],
      es: ["Restaura la barrera de la piel", "No grasoso, absorción rápida", "Solo 3 ingredientes reales"],
    },
    size: { en: "2 oz", es: "60 ml" },
    featured: true,
  },
  {
    slug: "natural-pesticide",
    line: "home",
    name: { en: "Natural Garden Spray", es: "Spray Natural para Jardín" },
    tagline: {
      en: "Protect what you grow — without the chemicals.",
      es: "Protege lo que cultivas — sin químicos.",
    },
    description: {
      en: "A plant-based garden spray that keeps pests off your beds while staying safe around food, kids and pollinators. The way a garden should be protected.",
      es: "Un spray de jardín a base de plantas que mantiene las plagas lejos de tus cultivos sin riesgo para la comida, los niños ni los polinizadores. Como un huerto debe protegerse.",
    },
    ingredients: {
      en: "Cold-pressed plant oils, potassium soap, purified water.",
      es: "Aceites vegetales prensados en frío, jabón potásico, agua purificada.",
    },
    benefits: {
      en: ["Safe around food gardens", "Pollinator-conscious", "No synthetic pesticides"],
      es: ["Seguro en huertos de comida", "Cuida a los polinizadores", "Sin pesticidas sintéticos"],
    },
    featured: true,
  },
  {
    slug: "hummingbird-nectar",
    line: "home",
    name: { en: "Hummingbird Nectar", es: "Néctar para Colibríes" },
    tagline: {
      en: "Bring the garden to life — clean nectar, no dyes.",
      es: "Da vida al jardín — néctar limpio, sin colorantes.",
    },
    description: {
      en: "A clean, dye-free nectar that hummingbirds actually thrive on. Just what they need, nothing they don't.",
      es: "Un néctar limpio y sin colorantes con el que los colibríes realmente prosperan. Justo lo que necesitan, nada de lo que no.",
    },
    ingredients: {
      en: "Pure cane sucrose, purified water. No red dye, ever.",
      es: "Sacarosa de caña pura, agua purificada. Sin colorante rojo, nunca.",
    },
    benefits: {
      en: ["No red dye", "Dissolves clear and clean", "Backyard-tested"],
      es: ["Sin colorante rojo", "Se disuelve limpio y claro", "Probado en nuestro jardín"],
    },
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductSlugs(): string[] {
  return products.map((p) => p.slug);
}

export function getProductsByLine(line: ProductLine): Product[] {
  return products.filter((p) => p.line === line);
}

export function getFeaturedProducts(): Product[] {
  const f = products.filter((p) => p.featured);
  return f.length > 0 ? f : products.slice(0, 3);
}

export function getRelatedProducts(current: Product, limit = 3): Product[] {
  const rest = products.filter((p) => p.slug !== current.slug);
  const sameLine = rest.filter((p) => p.line === current.line);
  const otherLine = rest.filter((p) => p.line !== current.line);
  return [...sameLine, ...otherLine].slice(0, limit);
}

function withTag(url: string): string {
  if (!AMAZON_ASSOCIATES_TAG || !url.includes("amazon.")) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}tag=${AMAZON_ASSOCIATES_TAG}`;
}

/** Resolve the Amazon link for a product. Always returns a real destination:
 *  the product listing → the brand storefront → an Amazon brand search. */
export function amazonLink(product: Product): string {
  if (product.amazonUrl) return withTag(product.amazonUrl);
  if (AMAZON_STOREFRONT) return withTag(AMAZON_STOREFRONT);
  const q = encodeURIComponent(`${BRAND} ${product.name.en}`);
  return withTag(`https://www.amazon.com/s?k=${q}`);
}

/** Resolve the Etsy link, or null when there is nothing to link to. */
export function etsyLink(product: Product): string | null {
  if (product.etsyUrl) return product.etsyUrl;
  if (ETSY_STOREFRONT) return ETSY_STOREFRONT;
  return null;
}
