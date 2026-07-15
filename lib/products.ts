export type ProductCategory = "bodycare" | "hair" | "home" | "hoff";

export interface Product {
  asin: string;
  slug: string;
  category: ProductCategory;
  name: { en: string; es: string };
  tagline: { en: string; es: string };
  description: { en: string; es: string };
  ingredients: string[];
  price: number;
  size: string;
  image: string;
  badge?: { en: string; es: string };
  active: boolean;
  /** Products sharing this id are shown as one product with a size/variant selector. */
  variantGroup?: string;
  /** Short scannable claims, pulled from the description — shown as bullets on the product page. */
  benefits: { en: string; es: string }[];
  howToUse: { en: string; es: string };
}

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
      en: "Whipped Tallow Cream",
      es: "Crema de Sebo Batida",
    },
    tagline: {
      en: "Skin that actually heals.",
      es: "Piel que realmente sana.",
    },
    description: {
      en: "Grass-fed beef tallow and jojoba oil — two ingredients, nothing else. Rich in vitamins A, D, E & K. Absorbs fast, no greasy residue. Includes a jade roller.",
      es: "Sebo de res grass-fed y aceite de jojoba — dos ingredientes, nada más. Rico en vitaminas A, D, E y K. Absorción rápida, sin residuo graso. Incluye jade roller.",
    },
    ingredients: ["Grass-fed beef tallow", "Jojoba oil"],
    price: 29.99,
    size: "2 oz",
    image: UNSPLASH("1596755389378-c31d21fd1273"),
    badge: { en: "Best Seller", es: "Más Vendido" },
    active: true,
    variantGroup: "tallow-cream",
    benefits: [
      { en: "Two ingredients, nothing else", es: "Dos ingredientes, nada más" },
      { en: "Rich in vitamins A, D, E & K", es: "Rico en vitaminas A, D, E y K" },
      { en: "Absorbs fast, no greasy residue", es: "Absorción rápida, sin residuo graso" },
    ],
    howToUse: {
      en: "Warm a small amount between your palms and massage into clean, dry skin — face or body. Best applied right after a shower.",
      es: "Calienta una pequeña cantidad entre tus palmas y masajea sobre piel limpia y seca — rostro o cuerpo. Se aplica mejor justo después de la ducha.",
    },
  },
  {
    // Owner action: confirm real price, then flip active to true.
    // 2026-07-15: owner confirmed there is no 4oz jar (removed) — Tallow Cream comes in
    // 1oz/2oz only, same jar molds as Comfrey Salve.
    asin: "PENDING-TALLOW-1OZ",
    slug: "tallow-cream-1oz",
    category: "bodycare",
    name: {
      en: "Whipped Tallow Cream",
      es: "Crema de Sebo Batida",
    },
    tagline: {
      en: "Skin that actually heals.",
      es: "Piel que realmente sana.",
    },
    description: {
      en: "Grass-fed beef tallow and jojoba oil — two ingredients, nothing else. Rich in vitamins A, D, E & K. Absorbs fast, no greasy residue.",
      es: "Sebo de res grass-fed y aceite de jojoba — dos ingredientes, nada más. Rico en vitaminas A, D, E y K. Absorción rápida, sin residuo graso.",
    },
    ingredients: ["Grass-fed beef tallow", "Jojoba oil"],
    price: 0, // PLACEHOLDER — owner has not confirmed the real 1oz price yet.
    size: "1 oz",
    image: UNSPLASH("1596755389378-c31d21fd1273"),
    active: false, // hidden from the live site until a real price is set
    variantGroup: "tallow-cream",
    benefits: [
      { en: "Two ingredients, nothing else", es: "Dos ingredientes, nada más" },
      { en: "Rich in vitamins A, D, E & K", es: "Rico en vitaminas A, D, E y K" },
      { en: "Absorbs fast, no greasy residue", es: "Absorción rápida, sin residuo graso" },
    ],
    howToUse: {
      en: "Warm a small amount between your palms and massage into clean, dry skin — face or body. Best applied right after a shower.",
      es: "Calienta una pequeña cantidad entre tus palmas y masajea sobre piel limpia y seca — rostro o cuerpo. Se aplica mejor justo después de la ducha.",
    },
  },
  {
    asin: "B0FPMDLPQL",
    slug: "comfrey-salve-2oz",
    category: "bodycare",
    name: {
      en: "Organic Comfrey Salve",
      es: "Bálsamo de Consuelda Orgánica",
    },
    tagline: {
      en: "For joints, muscles, and dry skin.",
      es: "Para articulaciones, músculos y piel seca.",
    },
    description: {
      en: "Organic comfrey extract blended with grass-fed beef tallow and jojoba oil. Whipped light texture, fast-absorbing, unscented. For sensitive skin and targeted relief.",
      es: "Extracto orgánico de consuelda con sebo grass-fed y aceite de jojoba. Textura batida y ligera, absorción rápida, sin fragancia.",
    },
    ingredients: ["Grass-fed beef tallow", "Jojoba oil", "Organic comfrey extract"],
    price: 35.99,
    size: "2 oz",
    image: UNSPLASH("1617714651703-d4e8b66efb73"),
    active: true,
    variantGroup: "comfrey-salve",
    benefits: [
      { en: "Traditional \"knitbone\" herb, organic", es: "Hierba tradicional \"suelda huesos\", orgánica" },
      { en: "Whipped light, fast-absorbing texture", es: "Textura batida, ligera, absorción rápida" },
      { en: "Unscented — safe for sensitive skin", es: "Sin fragancia — segura para piel sensible" },
    ],
    howToUse: {
      en: "Massage a small amount into the area of concern 1–2 times daily. For external use only.",
      es: "Masajea una pequeña cantidad en la zona de interés 1–2 veces al día. Solo para uso externo.",
    },
  },
  {
    // Owner action: confirm real price, then flip active to true.
    asin: "PENDING-COMFREY-1OZ",
    slug: "comfrey-salve-1oz",
    category: "bodycare",
    name: {
      en: "Organic Comfrey Salve",
      es: "Bálsamo de Consuelda Orgánica",
    },
    tagline: {
      en: "For joints, muscles, and dry skin.",
      es: "Para articulaciones, músculos y piel seca.",
    },
    description: {
      en: "Organic comfrey extract blended with grass-fed beef tallow and jojoba oil. Whipped light texture, fast-absorbing, unscented. For sensitive skin and targeted relief.",
      es: "Extracto orgánico de consuelda con sebo grass-fed y aceite de jojoba. Textura batida y ligera, absorción rápida, sin fragancia.",
    },
    ingredients: ["Grass-fed beef tallow", "Jojoba oil", "Organic comfrey extract"],
    price: 0, // PLACEHOLDER — owner has not confirmed the real 1oz price yet.
    size: "1 oz",
    image: UNSPLASH("1617714651703-d4e8b66efb73"),
    active: false, // hidden from the live site until a real price is set
    variantGroup: "comfrey-salve",
    benefits: [
      { en: "Traditional \"knitbone\" herb, organic", es: "Hierba tradicional \"suelda huesos\", orgánica" },
      { en: "Whipped light, fast-absorbing texture", es: "Textura batida, ligera, absorción rápida" },
      { en: "Unscented — safe for sensitive skin", es: "Sin fragancia — segura para piel sensible" },
    ],
    howToUse: {
      en: "Massage a small amount into the area of concern 1–2 times daily. For external use only.",
      es: "Masajea una pequeña cantidad en la zona de interés 1–2 veces al día. Solo para uso externo.",
    },
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
      en: "Ultrasonic micronized rosemary, nettle, and jojoba oil. Particles broken down for deeper follicle penetration. Non-greasy. Includes satin bonnet and scalp massager.",
      es: "Romero, ortiga y jojoba micronizados con ultrasonido para mayor penetración. No graso. Incluye gorro de satén y masajeador de cuero cabelludo.",
    },
    ingredients: ["Rosemary extract", "Nettle extract", "Jojoba oil"],
    price: 59.99,
    size: "2 oz",
    image: UNSPLASH("1527799820374-87036042f89f"),
    badge: { en: "New", es: "Nuevo" },
    active: true,
    benefits: [
      { en: "Ultrasonic micronized for deeper penetration", es: "Micronizado con ultrasonido para mayor penetración" },
      { en: "Non-greasy, no heavy residue", es: "No graso, sin residuo pesado" },
      { en: "Includes satin bonnet + scalp massager", es: "Incluye gorro de satén + masajeador de cuero cabelludo" },
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
    ingredients: ["Ancient Utah sea salt", "Purified water", "Natural minerals"],
    price: 33.99,
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
    ingredients: ["Ancient Utah sea salt", "Purified water", "Natural minerals"],
    price: 33.99,
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
    ingredients: ["Organic cane sugar", "Purified water"],
    price: 32.99,
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
    ingredients: ["Methylene blue USP", "Purified water"],
    price: 28.99,
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

/** Listing-grid dedupe: keep only the first (cheapest) product per variantGroup. */
export const dedupeVariants = (list: Product[]) => {
  const seen = new Set<string>();
  return list.filter((p) => {
    if (!p.variantGroup) return true;
    if (seen.has(p.variantGroup)) return false;
    seen.add(p.variantGroup);
    return true;
  });
};
