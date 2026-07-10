export interface Ingredient {
  slug: string;
  name: { en: string; es: string };
  usedIn: string[]; // product slugs
  blurb: { en: string; es: string };
}

export const ingredients: Ingredient[] = [
  {
    slug: "grass-fed-beef-tallow",
    name: { en: "Grass-fed beef tallow", es: "Sebo de res grass-fed" },
    usedIn: ["tallow-cream-2oz", "tallow-cream-4oz", "comfrey-salve"],
    blurb: {
      en: "A traditional skincare fat, used for generations before synthetic moisturizers existed. Its fatty-acid profile is close to what skin naturally produces, and it carries fat-soluble vitamins A, D, E and K.",
      es: "Una grasa tradicional para el cuidado de la piel, usada por generaciones antes de que existieran las cremas sintéticas. Su perfil de ácidos grasos es cercano al que la piel produce naturalmente, y lleva vitaminas liposolubles A, D, E y K.",
    },
  },
  {
    slug: "jojoba-oil",
    name: { en: "Jojoba oil", es: "Aceite de jojoba" },
    usedIn: ["tallow-cream-2oz", "tallow-cream-4oz", "comfrey-salve", "hair-growth-oil"],
    blurb: {
      en: "Technically a liquid wax, not an oil — which is why it's structurally close to skin's own sebum and absorbs without feeling greasy.",
      es: "Técnicamente es una cera líquida, no un aceite — por eso es estructuralmente cercano al sebo natural de la piel y se absorbe sin sensación grasosa.",
    },
  },
  {
    slug: "organic-comfrey-extract",
    name: { en: "Organic comfrey extract", es: "Extracto orgánico de consuelda" },
    usedIn: ["comfrey-salve"],
    blurb: {
      en: "Comfrey has been used in folk skincare for centuries — old herbalists called it \"knitbone.\" We use an organic extract, blended light so it stays gentle on sensitive skin.",
      es: "La consuelda se ha usado en el cuidado tradicional de la piel por siglos — los herbolarios antiguos la llamaban \"suelda huesos\". Usamos un extracto orgánico, en una mezcla ligera para que sea suave con la piel sensible.",
    },
  },
  {
    slug: "rosemary-extract",
    name: { en: "Rosemary extract", es: "Extracto de romero" },
    usedIn: ["hair-growth-oil"],
    blurb: {
      en: "A staple of traditional hair care across Mediterranean cultures for generations, valued for scalp stimulation.",
      es: "Un ingrediente tradicional del cuidado capilar en culturas mediterráneas por generaciones, valorado por estimular el cuero cabelludo.",
    },
  },
  {
    slug: "nettle-extract",
    name: { en: "Nettle extract", es: "Extracto de ortiga" },
    usedIn: ["hair-growth-oil"],
    blurb: {
      en: "Nettle is mineral-rich and has a long history in traditional hair rinses, usually paired with rosemary the way we pair it here.",
      es: "La ortiga es rica en minerales y tiene una larga historia en enjuagues capilares tradicionales, normalmente combinada con romero, tal como la usamos aquí.",
    },
  },
  {
    slug: "ancient-utah-sea-salt",
    name: { en: "Ancient Utah sea salt", es: "Sal marina antigua de Utah" },
    usedIn: ["sea-salt-spray"],
    blurb: {
      en: "Mined from an ancient inland sea bed rather than harvested from today's oceans — no microplastics, because it predates plastic entirely.",
      es: "Extraída de un antiguo lecho marino interior, no de los océanos actuales — sin microplásticos, porque es anterior a que existiera el plástico.",
    },
  },
  {
    slug: "organic-cane-sugar",
    name: { en: "Organic cane sugar", es: "Azúcar de caña orgánica" },
    usedIn: ["hummingbird-nectar"],
    blurb: {
      en: "The same simple sugar hummingbirds get from flower nectar in the wild — nothing dyed, nothing artificial, just dissolved in water.",
      es: "El mismo azúcar simple que los colibríes obtienen del néctar de las flores en la naturaleza — sin colorantes, sin nada artificial, solo disuelto en agua.",
    },
  },
  {
    slug: "methylene-blue-usp",
    name: { en: "Methylene blue, USP grade", es: "Azul de metileno, grado USP" },
    usedIn: ["methylene-blue"],
    blurb: {
      en: "USP is the pharmaceutical-grade purity standard — we chose it over lower industrial grades intentionally. Use strictly per the product label.",
      es: "USP es el estándar de pureza grado farmacéutico — lo elegimos intencionalmente en lugar de grados industriales inferiores. Usar estrictamente según la etiqueta del producto.",
    },
  },
];

export const getIngredient = (slug: string) =>
  ingredients.find((i) => i.slug === slug);
