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
  },
  {
    asin: "B0FHTHNH56",
    slug: "tallow-cream-4oz",
    // Uses tallow-cream-2oz images as fallback until 4oz folder has photos
    category: "bodycare",
    name: {
      en: "Whipped Tallow Cream",
      es: "Crema de Sebo Batida",
    },
    tagline: {
      en: "More of what your skin needs.",
      es: "Más de lo que tu piel necesita.",
    },
    description: {
      en: "Same clean formula as our 2oz — grass-fed tallow and jojoba oil — in a larger jar. With jade roller included for daily ritual.",
      es: "La misma fórmula limpia en un frasco más grande. Con jade roller incluido.",
    },
    ingredients: ["Grass-fed beef tallow", "Jojoba oil"],
    price: 29.99,
    size: "4 oz",
    image: UNSPLASH("1611080541599-8c6dbde7ad3e"),
    badge: { en: "Best Value", es: "Mejor Valor" },
    active: true,
  },
  {
    asin: "B0FPMDLPQL",
    slug: "comfrey-salve",
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
  },
  {
    asin: "B0FMQPDLFN",
    slug: "sea-salt-spray",
    category: "hair",
    name: {
      en: "Organic Sea Salt Spray",
      es: "Spray de Sal Marina Orgánica",
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
    size: "8 oz",
    image: UNSPLASH("1505118380757-91f5f5632de0"),
    active: true,
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
  },
];

export const activeProducts = products.filter((p) => p.active);

export const productsByCategory = (cat: ProductCategory) =>
  activeProducts.filter((p) => p.category === cat);

export const getProduct = (slug: string) =>
  products.find((p) => p.slug === slug);
