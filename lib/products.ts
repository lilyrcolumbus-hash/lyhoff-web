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
  /** Real customer reviews, kept in their original language (not translated). */
  reviews?: { text: string; author: string; location: string }[];
}

export const SCENT_OPTIONS = ["Unscented", "Peppermint", "Vanilla"];

const UNSPLASH = (id: string, w = 800, h = 900) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&q=90&auto=format&fit=crop`;

// Local image path by slug — drop file in /public/images/products/{slug}.jpg
// and it auto-replaces the Unsplash placeholder. No code change needed.
export const localImagePath = (slug: string) => `/images/products/${slug}.jpg`;

export const products: Product[] = [
  {
    asin: "B0FHJ5YC63",
    slug: "tallow-cream-2oz",
    category: "bodycare",
    name: {
      en: "Whipped Tallow Cream — Unscented",
      es: "Crema de Sebo Batida — Sin Fragancia",
    },
    tagline: {
      en: "Skin that actually heals.",
      es: "Piel que realmente sana.",
    },
    description: {
      en: "Grass-fed beef tallow and jojoba oil — two ingredients, nothing else, no fragrance. Rich in vitamins A, D, E & K. Absorbs fast, no greasy residue. Includes a free jade facial roller.",
      es: "Sebo de res grass-fed y aceite de jojoba — dos ingredientes, nada más, sin fragancia. Rico en vitaminas A, D, E y K. Absorción rápida, sin residuo graso. Incluye un rodillo de jade de regalo.",
    },
    ingredients: [{ en: "Grass-fed beef tallow", es: "Sebo de res grass-fed" }, { en: "Jojoba oil", es: "Aceite de jojoba" }],
    price: 13.99,
    size: "2 oz",
    image: UNSPLASH("1596755389378-c31d21fd1273"),
    badge: { en: "Best Seller", es: "Más Vendido" },
    active: true,
    variantGroup: "tallow-cream",
    scent: "Unscented",
    scentGroup: "tallow-cream-2oz",
    benefits: [
      { en: "Two ingredients, nothing else", es: "Dos ingredientes, nada más" },
      { en: "Rich in vitamins A, D, E & K", es: "Rico en vitaminas A, D, E y K" },
      { en: "Absorbs fast, no greasy residue", es: "Absorción rápida, sin residuo graso" },
      { en: "Free jade facial roller included", es: "Incluye rodillo de jade de regalo" },
    ],
    howToUse: {
      en: "Warm a small amount between your palms and massage into clean, dry skin — face or body. Best applied right after a shower.",
      es: "Calienta una pequeña cantidad entre tus palmas y masajea sobre piel limpia y seca — rostro o cuerpo. Se aplica mejor justo después de la ducha.",
    },
    reviews: [
      { text: "Honestly, what I like most is how honest the formula is: just tallow and jojoba, no weird hidden ingredients — that transparency is appreciated.", author: "Jayden", location: "Stillwater, OK" },
    ],
  },
  {
    asin: "B0FHJ5YC63",
    slug: "tallow-cream-2oz-peppermint",
    category: "bodycare",
    name: {
      en: "Whipped Tallow Cream — Peppermint",
      es: "Crema de Sebo Batida — Menta",
    },
    tagline: {
      en: "Skin that actually heals.",
      es: "Piel que realmente sana.",
    },
    description: {
      en: "Grass-fed beef tallow and jojoba oil with a cool, awakening peppermint finish — feels incredible after a shower or on tired skin. Rich in vitamins A, D, E & K. Includes a free jade facial roller.",
      es: "Sebo de res grass-fed y aceite de jojoba con un toque final de menta fresca y despertador — se siente increíble después de la ducha o en piel cansada. Rico en vitaminas A, D, E y K. Incluye un rodillo de jade de regalo.",
    },
    ingredients: [{ en: "Grass-fed beef tallow", es: "Sebo de res grass-fed" }, { en: "Jojoba oil", es: "Aceite de jojoba" }, { en: "Peppermint oil", es: "Aceite de menta" }],
    price: 13.99,
    size: "2 oz",
    image: UNSPLASH("1596755389378-c31d21fd1273"),
    active: true,
    variantGroup: "tallow-cream",
    scent: "Peppermint",
    scentGroup: "tallow-cream-2oz",
    benefits: [
      { en: "Cool, awakening peppermint finish", es: "Toque final de menta fresca y despertador" },
      { en: "Rich in vitamins A, D, E & K", es: "Rico en vitaminas A, D, E y K" },
      { en: "Absorbs fast, no greasy residue", es: "Absorción rápida, sin residuo graso" },
      { en: "Free jade facial roller included", es: "Incluye rodillo de jade de regalo" },
    ],
    howToUse: {
      en: "Warm a small amount between your palms and massage into clean, dry skin — face or body. Best applied right after a shower.",
      es: "Calienta una pequeña cantidad entre tus palmas y masajea sobre piel limpia y seca — rostro o cuerpo. Se aplica mejor justo después de la ducha.",
    },
    reviews: [
      { text: "Honestly, what I like most is how honest the formula is: just tallow and jojoba, no weird hidden ingredients — that transparency is appreciated.", author: "Jayden", location: "Stillwater, OK" },
    ],
  },
  {
    asin: "B0FHJ5YC63",
    slug: "tallow-cream-2oz-vanilla",
    category: "bodycare",
    name: {
      en: "Whipped Tallow Cream — Vanilla",
      es: "Crema de Sebo Batida — Vainilla",
    },
    tagline: {
      en: "Skin that actually heals.",
      es: "Piel que realmente sana.",
    },
    description: {
      en: "Grass-fed beef tallow and jojoba oil with warm, comforting vanilla folded in — our customers' favorite. Rich in vitamins A, D, E & K. Includes a free jade facial roller.",
      es: "Sebo de res grass-fed y aceite de jojoba con vainilla cálida y reconfortante — el favorito de nuestros clientes. Rico en vitaminas A, D, E y K. Incluye un rodillo de jade de regalo.",
    },
    ingredients: [{ en: "Grass-fed beef tallow", es: "Sebo de res grass-fed" }, { en: "Jojoba oil", es: "Aceite de jojoba" }, { en: "Vanilla extract", es: "Extracto de vainilla" }],
    price: 13.99,
    size: "2 oz",
    image: UNSPLASH("1596755389378-c31d21fd1273"),
    active: false, // hidden for now — owner: keep only Unscented + Peppermint live (2026-07-20)
    variantGroup: "tallow-cream",
    scent: "Vanilla",
    scentGroup: "tallow-cream-2oz",
    benefits: [
      { en: "Warm, comforting vanilla scent", es: "Aroma cálido y reconfortante a vainilla" },
      { en: "Rich in vitamins A, D, E & K", es: "Rico en vitaminas A, D, E y K" },
      { en: "Absorbs fast, no greasy residue", es: "Absorción rápida, sin residuo graso" },
      { en: "Free jade facial roller included", es: "Incluye rodillo de jade de regalo" },
    ],
    howToUse: {
      en: "Warm a small amount between your palms and massage into clean, dry skin — face or body. Best applied right after a shower.",
      es: "Calienta una pequeña cantidad entre tus palmas y masajea sobre piel limpia y seca — rostro o cuerpo. Se aplica mejor justo después de la ducha.",
    },
    reviews: [
      { text: "Honestly, what I like most is how honest the formula is: just tallow and jojoba, no weird hidden ingredients — that transparency is appreciated.", author: "Jayden", location: "Stillwater, OK" },
    ],
  },
  {
    // Owner action: confirm real price, then flip active to true.
    // 2026-07-15: owner confirmed there is no 4oz jar (removed) — Tallow Cream comes in
    // 1oz/2oz only, same jar molds as Comfrey Salve.
    asin: "PENDING-TALLOW-1OZ",
    slug: "tallow-cream-1oz",
    category: "bodycare",
    name: {
      en: "Whipped Tallow Cream — Unscented",
      es: "Crema de Sebo Batida — Sin Fragancia",
    },
    tagline: {
      en: "Skin that actually heals.",
      es: "Piel que realmente sana.",
    },
    description: {
      en: "Grass-fed beef tallow and jojoba oil — two ingredients, nothing else, no fragrance. Rich in vitamins A, D, E & K. Absorbs fast, no greasy residue. Includes a free jade facial roller.",
      es: "Sebo de res grass-fed y aceite de jojoba — dos ingredientes, nada más, sin fragancia. Rico en vitaminas A, D, E y K. Absorción rápida, sin residuo graso. Incluye un rodillo de jade de regalo.",
    },
    ingredients: [{ en: "Grass-fed beef tallow", es: "Sebo de res grass-fed" }, { en: "Jojoba oil", es: "Aceite de jojoba" }],
    price: 0, // PLACEHOLDER — owner has not confirmed the real 1oz price yet.
    size: "1 oz",
    image: UNSPLASH("1596755389378-c31d21fd1273"),
    active: false, // hidden from the live site until a real price is set
    variantGroup: "tallow-cream",
    scent: "Unscented",
    scentGroup: "tallow-cream-1oz",
    benefits: [
      { en: "Two ingredients, nothing else", es: "Dos ingredientes, nada más" },
      { en: "Rich in vitamins A, D, E & K", es: "Rico en vitaminas A, D, E y K" },
      { en: "Absorbs fast, no greasy residue", es: "Absorción rápida, sin residuo graso" },
      { en: "Free jade facial roller included", es: "Incluye rodillo de jade de regalo" },
    ],
    howToUse: {
      en: "Warm a small amount between your palms and massage into clean, dry skin — face or body. Best applied right after a shower.",
      es: "Calienta una pequeña cantidad entre tus palmas y masajea sobre piel limpia y seca — rostro o cuerpo. Se aplica mejor justo después de la ducha.",
    },
    reviews: [
      { text: "Honestly, what I like most is how honest the formula is: just tallow and jojoba, no weird hidden ingredients — that transparency is appreciated.", author: "Jayden", location: "Stillwater, OK" },
    ],
  },
  {
    asin: "PENDING-TALLOW-1OZ",
    slug: "tallow-cream-1oz-peppermint",
    category: "bodycare",
    name: {
      en: "Whipped Tallow Cream — Peppermint",
      es: "Crema de Sebo Batida — Menta",
    },
    tagline: {
      en: "Skin that actually heals.",
      es: "Piel que realmente sana.",
    },
    description: {
      en: "Grass-fed beef tallow and jojoba oil with a cool, awakening peppermint finish. Rich in vitamins A, D, E & K. Includes a free jade facial roller.",
      es: "Sebo de res grass-fed y aceite de jojoba con un toque final de menta fresca y despertador. Rico en vitaminas A, D, E y K. Incluye un rodillo de jade de regalo.",
    },
    ingredients: [{ en: "Grass-fed beef tallow", es: "Sebo de res grass-fed" }, { en: "Jojoba oil", es: "Aceite de jojoba" }, { en: "Peppermint oil", es: "Aceite de menta" }],
    price: 0, // PLACEHOLDER — owner has not confirmed the real 1oz price yet.
    size: "1 oz",
    image: UNSPLASH("1596755389378-c31d21fd1273"),
    active: false, // hidden from the live site until a real price is set
    variantGroup: "tallow-cream",
    scent: "Peppermint",
    scentGroup: "tallow-cream-1oz",
    benefits: [
      { en: "Cool, awakening peppermint finish", es: "Toque final de menta fresca y despertador" },
      { en: "Rich in vitamins A, D, E & K", es: "Rico en vitaminas A, D, E y K" },
      { en: "Absorbs fast, no greasy residue", es: "Absorción rápida, sin residuo graso" },
      { en: "Free jade facial roller included", es: "Incluye rodillo de jade de regalo" },
    ],
    howToUse: {
      en: "Warm a small amount between your palms and massage into clean, dry skin — face or body. Best applied right after a shower.",
      es: "Calienta una pequeña cantidad entre tus palmas y masajea sobre piel limpia y seca — rostro o cuerpo. Se aplica mejor justo después de la ducha.",
    },
    reviews: [
      { text: "Honestly, what I like most is how honest the formula is: just tallow and jojoba, no weird hidden ingredients — that transparency is appreciated.", author: "Jayden", location: "Stillwater, OK" },
    ],
  },
  {
    asin: "PENDING-TALLOW-1OZ",
    slug: "tallow-cream-1oz-vanilla",
    category: "bodycare",
    name: {
      en: "Whipped Tallow Cream — Vanilla",
      es: "Crema de Sebo Batida — Vainilla",
    },
    tagline: {
      en: "Skin that actually heals.",
      es: "Piel que realmente sana.",
    },
    description: {
      en: "Grass-fed beef tallow and jojoba oil with warm, comforting vanilla folded in. Rich in vitamins A, D, E & K. Includes a free jade facial roller.",
      es: "Sebo de res grass-fed y aceite de jojoba con vainilla cálida y reconfortante. Rico en vitaminas A, D, E y K. Incluye un rodillo de jade de regalo.",
    },
    ingredients: [{ en: "Grass-fed beef tallow", es: "Sebo de res grass-fed" }, { en: "Jojoba oil", es: "Aceite de jojoba" }, { en: "Vanilla extract", es: "Extracto de vainilla" }],
    price: 0, // PLACEHOLDER — owner has not confirmed the real 1oz price yet.
    size: "1 oz",
    image: UNSPLASH("1596755389378-c31d21fd1273"),
    active: false, // hidden from the live site until a real price is set
    variantGroup: "tallow-cream",
    scent: "Vanilla",
    scentGroup: "tallow-cream-1oz",
    benefits: [
      { en: "Warm, comforting vanilla scent", es: "Aroma cálido y reconfortante a vainilla" },
      { en: "Rich in vitamins A, D, E & K", es: "Rico en vitaminas A, D, E y K" },
      { en: "Absorbs fast, no greasy residue", es: "Absorción rápida, sin residuo graso" },
      { en: "Free jade facial roller included", es: "Incluye rodillo de jade de regalo" },
    ],
    howToUse: {
      en: "Warm a small amount between your palms and massage into clean, dry skin — face or body. Best applied right after a shower.",
      es: "Calienta una pequeña cantidad entre tus palmas y masajea sobre piel limpia y seca — rostro o cuerpo. Se aplica mejor justo después de la ducha.",
    },
    reviews: [
      { text: "Honestly, what I like most is how honest the formula is: just tallow and jojoba, no weird hidden ingredients — that transparency is appreciated.", author: "Jayden", location: "Stillwater, OK" },
    ],
  },
  {
    asin: "B0FPMDLPQL",
    slug: "comfrey-salve-2oz",
    category: "bodycare",
    name: {
      en: "Organic Comfrey Salve — Unscented",
      es: "Bálsamo de Consuelda Orgánica — Sin Fragancia",
    },
    tagline: {
      en: "For joints, muscles, and dry skin.",
      es: "Para articulaciones, músculos y piel seca.",
    },
    description: {
      en: "Organic comfrey extract blended with grass-fed beef tallow and jojoba oil, no fragrance added. Whipped light texture, fast-absorbing. The safest choice for sensitive or broken skin.",
      es: "Extracto orgánico de consuelda con sebo grass-fed y aceite de jojoba, sin fragancia agregada. Textura batida y ligera, absorción rápida. La opción más segura para piel sensible o irritada.",
    },
    ingredients: [{ en: "Grass-fed beef tallow", es: "Sebo de res grass-fed" }, { en: "Jojoba oil", es: "Aceite de jojoba" }, { en: "Organic comfrey extract", es: "Extracto orgánico de consuelda" }],
    price: 14.97,
    size: "2 oz",
    image: UNSPLASH("1617714651703-d4e8b66efb73"),
    active: true,
    variantGroup: "comfrey-salve",
    scent: "Unscented",
    scentGroup: "comfrey-salve-2oz",
    benefits: [
      { en: "Traditional \"knitbone\" herb, organic", es: "Hierba tradicional \"suelda huesos\", orgánica" },
      { en: "Whipped light, fast-absorbing texture", es: "Textura batida, ligera, absorción rápida" },
      { en: "Unscented — safe for sensitive skin", es: "Sin fragancia — segura para piel sensible" },
    ],
    howToUse: {
      en: "Massage a small amount into the area of concern 1–2 times daily. For external use only.",
      es: "Masajea una pequeña cantidad en la zona de interés 1–2 veces al día. Solo para uso externo.",
    },
    reviews: [
      { text: "This salve is practical, whipped-texture and fast-absorbing, easy to apply on joints or muscles.", author: "Cheyenne", location: "Jackson Township, MO" },
      { text: "It's a simple combination of tallow, jojoba, and comfrey (\"knitbone\") extract, unscented, good for sensitive skin.", author: "Luna", location: "Ord, NE" },
    ],
  },
  {
    asin: "B0FPMDLPQL",
    slug: "comfrey-salve-2oz-peppermint",
    category: "bodycare",
    name: {
      en: "Organic Comfrey Salve — Peppermint",
      es: "Bálsamo de Consuelda Orgánica — Menta",
    },
    tagline: {
      en: "For joints, muscles, and dry skin.",
      es: "Para articulaciones, músculos y piel seca.",
    },
    description: {
      en: "Organic comfrey extract blended with grass-fed beef tallow and jojoba oil. Peppermint adds a cooling kick that works especially well on sore muscles after a long day.",
      es: "Extracto orgánico de consuelda con sebo grass-fed y aceite de jojoba. La menta suma un efecto frío que funciona muy bien en músculos adoloridos después de un día largo.",
    },
    ingredients: [{ en: "Grass-fed beef tallow", es: "Sebo de res grass-fed" }, { en: "Jojoba oil", es: "Aceite de jojoba" }, { en: "Organic comfrey extract", es: "Extracto orgánico de consuelda" }, { en: "Peppermint oil", es: "Aceite de menta" }],
    price: 14.97,
    size: "2 oz",
    image: UNSPLASH("1617714651703-d4e8b66efb73"),
    active: true,
    variantGroup: "comfrey-salve",
    scent: "Peppermint",
    scentGroup: "comfrey-salve-2oz",
    benefits: [
      { en: "Traditional \"knitbone\" herb, organic", es: "Hierba tradicional \"suelda huesos\", orgánica" },
      { en: "Whipped light, fast-absorbing texture", es: "Textura batida, ligera, absorción rápida" },
      { en: "Cooling peppermint, great on sore muscles", es: "Menta refrescante, ideal en músculos adoloridos" },
    ],
    howToUse: {
      en: "Massage a small amount into the area of concern 1–2 times daily. For external use only.",
      es: "Masajea una pequeña cantidad en la zona de interés 1–2 veces al día. Solo para uso externo.",
    },
    reviews: [
      { text: "This salve is practical, whipped-texture and fast-absorbing, easy to apply on joints or muscles.", author: "Cheyenne", location: "Jackson Township, MO" },
    ],
  },
  {
    asin: "B0FPMDLPQL",
    slug: "comfrey-salve-2oz-vanilla",
    category: "bodycare",
    name: {
      en: "Organic Comfrey Salve — Vanilla",
      es: "Bálsamo de Consuelda Orgánica — Vainilla",
    },
    tagline: {
      en: "For joints, muscles, and dry skin.",
      es: "Para articulaciones, músculos y piel seca.",
    },
    description: {
      en: "Organic comfrey extract blended with grass-fed beef tallow and jojoba oil, softened with warm vanilla for an easier daily ritual.",
      es: "Extracto orgánico de consuelda con sebo grass-fed y aceite de jojoba, suavizado con vainilla cálida para un ritual diario más agradable.",
    },
    ingredients: [{ en: "Grass-fed beef tallow", es: "Sebo de res grass-fed" }, { en: "Jojoba oil", es: "Aceite de jojoba" }, { en: "Organic comfrey extract", es: "Extracto orgánico de consuelda" }, { en: "Vanilla extract", es: "Extracto de vainilla" }],
    price: 14.97,
    size: "2 oz",
    image: UNSPLASH("1617714651703-d4e8b66efb73"),
    active: true,
    variantGroup: "comfrey-salve",
    scent: "Vanilla",
    scentGroup: "comfrey-salve-2oz",
    benefits: [
      { en: "Traditional \"knitbone\" herb, organic", es: "Hierba tradicional \"suelda huesos\", orgánica" },
      { en: "Whipped light, fast-absorbing texture", es: "Textura batida, ligera, absorción rápida" },
      { en: "Warm vanilla scent", es: "Aroma cálido a vainilla" },
    ],
    howToUse: {
      en: "Massage a small amount into the area of concern 1–2 times daily. For external use only.",
      es: "Masajea una pequeña cantidad en la zona de interés 1–2 veces al día. Solo para uso externo.",
    },
    reviews: [
      { text: "This salve is practical, whipped-texture and fast-absorbing, easy to apply on joints or muscles.", author: "Cheyenne", location: "Jackson Township, MO" },
    ],
  },
  {
    // Owner action: confirm real price, then flip active to true.
    asin: "PENDING-COMFREY-1OZ",
    slug: "comfrey-salve-1oz",
    category: "bodycare",
    name: {
      en: "Organic Comfrey Salve — Unscented",
      es: "Bálsamo de Consuelda Orgánica — Sin Fragancia",
    },
    tagline: {
      en: "For joints, muscles, and dry skin.",
      es: "Para articulaciones, músculos y piel seca.",
    },
    description: {
      en: "Organic comfrey extract blended with grass-fed beef tallow and jojoba oil, no fragrance added. Whipped light texture, fast-absorbing. The safest choice for sensitive or broken skin.",
      es: "Extracto orgánico de consuelda con sebo grass-fed y aceite de jojoba, sin fragancia agregada. Textura batida y ligera, absorción rápida. La opción más segura para piel sensible o irritada.",
    },
    ingredients: [{ en: "Grass-fed beef tallow", es: "Sebo de res grass-fed" }, { en: "Jojoba oil", es: "Aceite de jojoba" }, { en: "Organic comfrey extract", es: "Extracto orgánico de consuelda" }],
    price: 0, // PLACEHOLDER — owner has not confirmed the real 1oz price yet.
    size: "1 oz",
    image: UNSPLASH("1617714651703-d4e8b66efb73"),
    active: false, // hidden from the live site until a real price is set
    variantGroup: "comfrey-salve",
    scent: "Unscented",
    scentGroup: "comfrey-salve-1oz",
    benefits: [
      { en: "Traditional \"knitbone\" herb, organic", es: "Hierba tradicional \"suelda huesos\", orgánica" },
      { en: "Whipped light, fast-absorbing texture", es: "Textura batida, ligera, absorción rápida" },
      { en: "Unscented — safe for sensitive skin", es: "Sin fragancia — segura para piel sensible" },
    ],
    howToUse: {
      en: "Massage a small amount into the area of concern 1–2 times daily. For external use only.",
      es: "Masajea una pequeña cantidad en la zona de interés 1–2 veces al día. Solo para uso externo.",
    },
    reviews: [
      { text: "This salve is practical, whipped-texture and fast-absorbing, easy to apply on joints or muscles.", author: "Cheyenne", location: "Jackson Township, MO" },
      { text: "It's a simple combination of tallow, jojoba, and comfrey (\"knitbone\") extract, unscented, good for sensitive skin.", author: "Luna", location: "Ord, NE" },
    ],
  },
  {
    asin: "PENDING-COMFREY-1OZ",
    slug: "comfrey-salve-1oz-peppermint",
    category: "bodycare",
    name: {
      en: "Organic Comfrey Salve — Peppermint",
      es: "Bálsamo de Consuelda Orgánica — Menta",
    },
    tagline: {
      en: "For joints, muscles, and dry skin.",
      es: "Para articulaciones, músculos y piel seca.",
    },
    description: {
      en: "Organic comfrey extract blended with grass-fed beef tallow and jojoba oil. Peppermint adds a cooling kick that works especially well on sore muscles after a long day.",
      es: "Extracto orgánico de consuelda con sebo grass-fed y aceite de jojoba. La menta suma un efecto frío que funciona muy bien en músculos adoloridos después de un día largo.",
    },
    ingredients: [{ en: "Grass-fed beef tallow", es: "Sebo de res grass-fed" }, { en: "Jojoba oil", es: "Aceite de jojoba" }, { en: "Organic comfrey extract", es: "Extracto orgánico de consuelda" }, { en: "Peppermint oil", es: "Aceite de menta" }],
    price: 0, // PLACEHOLDER — owner has not confirmed the real 1oz price yet.
    size: "1 oz",
    image: UNSPLASH("1617714651703-d4e8b66efb73"),
    active: false, // hidden from the live site until a real price is set
    variantGroup: "comfrey-salve",
    scent: "Peppermint",
    scentGroup: "comfrey-salve-1oz",
    benefits: [
      { en: "Traditional \"knitbone\" herb, organic", es: "Hierba tradicional \"suelda huesos\", orgánica" },
      { en: "Whipped light, fast-absorbing texture", es: "Textura batida, ligera, absorción rápida" },
      { en: "Cooling peppermint, great on sore muscles", es: "Menta refrescante, ideal en músculos adoloridos" },
    ],
    howToUse: {
      en: "Massage a small amount into the area of concern 1–2 times daily. For external use only.",
      es: "Masajea una pequeña cantidad en la zona de interés 1–2 veces al día. Solo para uso externo.",
    },
    reviews: [
      { text: "This salve is practical, whipped-texture and fast-absorbing, easy to apply on joints or muscles.", author: "Cheyenne", location: "Jackson Township, MO" },
    ],
  },
  {
    asin: "PENDING-COMFREY-1OZ",
    slug: "comfrey-salve-1oz-vanilla",
    category: "bodycare",
    name: {
      en: "Organic Comfrey Salve — Vanilla",
      es: "Bálsamo de Consuelda Orgánica — Vainilla",
    },
    tagline: {
      en: "For joints, muscles, and dry skin.",
      es: "Para articulaciones, músculos y piel seca.",
    },
    description: {
      en: "Organic comfrey extract blended with grass-fed beef tallow and jojoba oil, softened with warm vanilla for an easier daily ritual.",
      es: "Extracto orgánico de consuelda con sebo grass-fed y aceite de jojoba, suavizado con vainilla cálida para un ritual diario más agradable.",
    },
    ingredients: [{ en: "Grass-fed beef tallow", es: "Sebo de res grass-fed" }, { en: "Jojoba oil", es: "Aceite de jojoba" }, { en: "Organic comfrey extract", es: "Extracto orgánico de consuelda" }, { en: "Vanilla extract", es: "Extracto de vainilla" }],
    price: 0, // PLACEHOLDER — owner has not confirmed the real 1oz price yet.
    size: "1 oz",
    image: UNSPLASH("1617714651703-d4e8b66efb73"),
    active: false, // hidden from the live site until a real price is set
    variantGroup: "comfrey-salve",
    scent: "Vanilla",
    scentGroup: "comfrey-salve-1oz",
    benefits: [
      { en: "Traditional \"knitbone\" herb, organic", es: "Hierba tradicional \"suelda huesos\", orgánica" },
      { en: "Whipped light, fast-absorbing texture", es: "Textura batida, ligera, absorción rápida" },
      { en: "Warm vanilla scent", es: "Aroma cálido a vainilla" },
    ],
    howToUse: {
      en: "Massage a small amount into the area of concern 1–2 times daily. For external use only.",
      es: "Masajea una pequeña cantidad en la zona de interés 1–2 veces al día. Solo para uso externo.",
    },
    reviews: [
      { text: "This salve is practical, whipped-texture and fast-absorbing, easy to apply on joints or muscles.", author: "Cheyenne", location: "Jackson Township, MO" },
    ],
  },
  {
    asin: "B0DX7J7N6B",
    slug: "hair-growth-oil",
    category: "hair",
    name: {
      en: "Hair Growth Oil",
      es: "Aceite para el Crecimiento Capilar",
    },
    tagline: {
      en: "Stronger roots. Visible growth.",
      es: "Raíces más fuertes. Crecimiento visible.",
    },
    description: {
      en: "Ultrasonic micronized rosemary, nettle, and jojoba oil. Particles broken down for deeper follicle penetration. Non-greasy. Includes a free silicone scalp massager and a black satin bonnet.",
      es: "Romero, ortiga y jojoba micronizados con ultrasonido para mayor penetración. No graso. Incluye de regalo un masajeador de cuero cabelludo de silicona y un gorro de satén negro.",
    },
    ingredients: [{ en: "Rosemary extract", es: "Extracto de romero" }, { en: "Nettle extract", es: "Extracto de ortiga" }, { en: "Jojoba oil", es: "Aceite de jojoba" }],
    price: 38.97,
    size: "2 oz",
    image: UNSPLASH("1527799820374-87036042f89f"),
    badge: { en: "New", es: "Nuevo" },
    active: true,
    benefits: [
      { en: "Ultrasonic micronized for deeper penetration", es: "Micronizado con ultrasonido para mayor penetración" },
      { en: "Non-greasy, no heavy residue", es: "No graso, sin residuo pesado" },
      { en: "Free silicone scalp massager + black satin bonnet included", es: "Incluye de regalo masajeador de silicona + gorro de satén negro" },
    ],
    howToUse: {
      en: "Apply a few drops directly to the scalp and massage in circular motions for 2–3 minutes. Use 3–4 times per week.",
      es: "Aplica unas gotas directo en el cuero cabelludo y masajea en círculos por 2–3 minutos. Usa 3–4 veces por semana.",
    },
  },
  {
    asin: "B0FMQPDLFN",
    slug: "sea-salt-spray-her",
    category: "hair",
    name: {
      en: "Organic Sea Salt Spray — For Her",
      es: "Spray de Sal Marina Orgánica — Para Ella",
    },
    tagline: {
      en: "Volume and texture, nothing artificial.",
      es: "Volumen y textura, sin nada artificial.",
    },
    description: {
      en: "Ancient sea salt from Utah's inland sea. No microplastics, no dyes, no synthetic fragrance. Matte finish, non-sticky. Works on all hair types.",
      es: "Sal marina antigua del mar interior de Utah. Sin microplásticos, sin colorantes, sin fragancia sintética. Acabado mate, no pegajoso.",
    },
    ingredients: [{ en: "Ancient Utah sea salt", es: "Sal marina antigua de Utah" }, { en: "Purified water", es: "Agua purificada" }, { en: "Natural minerals", es: "Minerales naturales" }],
    price: 23.97,
    size: "8 oz — For Her",
    image: UNSPLASH("1505118380757-91f5f5632de0"),
    active: true,
    variantGroup: "sea-salt-spray",
    benefits: [
      { en: "Ancient inland sea salt — no microplastics", es: "Sal de mar interior antiguo — sin microplásticos" },
      { en: "Matte finish, non-sticky", es: "Acabado mate, no pegajoso" },
      { en: "Works on all hair types", es: "Funciona en todo tipo de cabello" },
    ],
    howToUse: {
      en: "Spray into damp or dry hair from mid-length to ends. Scrunch or twist for texture. Reapply as needed.",
      es: "Rocía sobre cabello húmedo o seco, desde el medio hasta las puntas. Enrosca o presiona para dar textura. Reaplica si es necesario.",
    },
  },
  {
    // Owner action: same product/price/size as "For Her" per owner — swap in the real
    // photo + confirm naming when the label art is ready.
    asin: "B0FMQPDLFN-M",
    slug: "sea-salt-spray-him",
    category: "hair",
    name: {
      en: "Organic Sea Salt Spray — For Him",
      es: "Spray de Sal Marina Orgánica — Para Él",
    },
    tagline: {
      en: "Volume and texture, nothing artificial.",
      es: "Volumen y textura, sin nada artificial.",
    },
    description: {
      en: "Ancient sea salt from Utah's inland sea. No microplastics, no dyes, no synthetic fragrance. Matte finish, non-sticky. Works on all hair types.",
      es: "Sal marina antigua del mar interior de Utah. Sin microplásticos, sin colorantes, sin fragancia sintética. Acabado mate, no pegajoso.",
    },
    ingredients: [{ en: "Ancient Utah sea salt", es: "Sal marina antigua de Utah" }, { en: "Purified water", es: "Agua purificada" }, { en: "Natural minerals", es: "Minerales naturales" }],
    price: 23.97,
    size: "8 oz — For Him",
    image: UNSPLASH("1505118380757-91f5f5632de0"),
    active: true,
    variantGroup: "sea-salt-spray",
    benefits: [
      { en: "Ancient inland sea salt — no microplastics", es: "Sal de mar interior antiguo — sin microplásticos" },
      { en: "Matte finish, non-sticky", es: "Acabado mate, no pegajoso" },
      { en: "Works on all hair types", es: "Funciona en todo tipo de cabello" },
    ],
    howToUse: {
      en: "Spray into damp or dry hair from mid-length to ends. Scrunch or twist for texture. Reapply as needed.",
      es: "Rocía sobre cabello húmedo o seco, desde el medio hasta las puntas. Enrosca o presiona para dar textura. Reaplica si es necesario.",
    },
  },
  {
    asin: "B0FHJB99W4",
    slug: "hummingbird-nectar",
    category: "home",
    name: {
      en: "Organic Hummingbird Nectar",
      es: "Néctar Orgánico para Colibríes",
    },
    tagline: {
      en: "Pure nectar. No dyes. No boiling.",
      es: "Néctar puro. Sin colorantes. Sin hervir.",
    },
    description: {
      en: "100% organic powder, dissolves instantly in water. No dyes, no preservatives, no additives. Each 8oz pouch makes 64oz of nectar. 4-pack for full garden coverage.",
      es: "Polvo 100% orgánico, se disuelve al instante en agua. Sin colorantes, sin conservantes. Cada bolsa de 8oz hace 64oz de néctar. Pack de 4.",
    },
    ingredients: [{ en: "Organic cane sugar", es: "Azúcar de caña orgánica" }, { en: "Purified water", es: "Agua purificada" }],
    price: 22.97,
    size: "4-Pack / 8 oz each",
    image: UNSPLASH("1552728089-57bdde30beb3"),
    active: true,
    benefits: [
      { en: "Dissolves instantly — no boiling", es: "Se disuelve al instante — sin hervir" },
      { en: "No dyes, no preservatives", es: "Sin colorantes, sin conservantes" },
      { en: "Each pouch makes 64oz of nectar", es: "Cada bolsa rinde 64oz de néctar" },
    ],
    howToUse: {
      en: "Empty one pouch into a clean feeder and add 8 cups of water. Stir until dissolved. Replace every 3–4 days.",
      es: "Vacía una bolsa en un bebedero limpio y agrega 8 tazas de agua. Revuelve hasta disolver. Cambia cada 3–4 días.",
    },
    reviews: [
      { text: "Just two ingredients, organic cane sugar and water, no additives or dyes.", author: "Amy", location: "Hetford County, NC" },
      { text: "Dissolves instantly, good yield, no need to boil water.", author: "Joshua", location: "San Bernardino, CA" },
      { text: "Shipping is calculated separately at checkout, not included in the listed price.", author: "River", location: "Bend, OR" },
    ],
  },
  {
    asin: "B0FBHD84ZX",
    slug: "methylene-blue",
    category: "hoff",
    name: {
      en: "Methylene Blue 1%",
      es: "Azul de Metileno 1%",
    },
    tagline: {
      en: "Pharmaceutical grade. Precision formula.",
      es: "Grado farmacéutico. Fórmula de precisión.",
    },
    description: {
      en: "USP pharmaceutical grade methylene blue. 1% concentration in a 2oz dropper bottle. No formaldehyde, no alcohol, gluten-free. For technical and research applications.",
      es: "Azul de metileno grado farmacéutico USP. Concentración 1% en frasco gotero de 59ml. Sin formaldehído, sin alcohol, libre de gluten.",
    },
    ingredients: [{ en: "Methylene blue USP", es: "Azul de metileno USP" }, { en: "Purified water", es: "Agua purificada" }],
    price: 24.97,
    size: "2 oz / 59 ml",
    image: UNSPLASH("1587854692152-cbe660dbde88"),
    active: true,
    benefits: [
      { en: "USP pharmaceutical grade", es: "Grado farmacéutico USP" },
      { en: "No formaldehyde, no alcohol", es: "Sin formaldehído, sin alcohol" },
      { en: "Gluten-free", es: "Libre de gluten" },
    ],
    howToUse: {
      en: "Use strictly according to the product label. Consult a healthcare provider before use.",
      es: "Usar estrictamente según la etiqueta del producto. Consulta a un profesional de salud antes de usar.",
    },
    reviews: [
      { text: "Pharmaceutical USP grade, no formaldehyde or alcohol, which is a serious quality standard.", author: "Sedona", location: "Sandford, ME" },
      { text: "The label recommends consulting a doctor before use, which is a good thing given the nature of the product.", author: "Orion", location: "Oak Hill, WV" },
      { text: "It's a delicate substance that can interact with medications like antidepressants, so it's not something to take lightly.", author: "Mason", location: "Seymour, IN" },
    ],
  },
];

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
