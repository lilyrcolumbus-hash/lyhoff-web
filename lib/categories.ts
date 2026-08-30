import { categoryOverrides } from "@/lib/settings";

/**
 * The shop's categories: one definition, in one place.
 *
 * These same four titles used to be written out by hand in the header, the shop
 * page and the category page. Three copies of a name is three chances to rename
 * two of them — this is the seam that stops that, and it is also what lets her
 * add a line without me.
 *
 * A category's `key` is its URL and is fixed once created, for the same reason a
 * product's slug is: people link to it. Everything else about it is text she can
 * change.
 */
export interface CategoryContent {
  title: { en: string; es: string };
  headline: { en: string; es: string };
  sub: { en: string; es: string };
  why: { en: string; es: string };
  video: string;
}

/** What the code ships with, and the fallback for anything she hasn't touched. */
export const DEFAULT_CATEGORIES: Record<string, CategoryContent> = {
  bodycare: {
    title: { en: "Skin & Body", es: "Piel y Cuerpo" },
    headline: { en: "Skin that heals, not just moisturizes.", es: "Piel que sana, no solo hidrata." },
    sub: {
      en: "Small-batch tallow skincare, formulated and tested on ourselves.",
      es: "Skincare de sebo elaborado en pequeños lotes, formulado y probado en nosotros.",
    },
    why: {
      en: "Grass-fed tallow is remarkably close to your skin's own lipids — it absorbs instead of sitting on top, with none of the synthetic emulsifiers most store creams rely on to fake that feeling.",
      es: "El sebo grass-fed es notablemente similar a los lípidos naturales de tu piel — se absorbe en vez de quedarse encima, sin los emulsificantes sintéticos que usan la mayoría de las cremas para simular esa sensación.",
    },
    video: "/videos/mixing.mp4",
  },
  hair: {
    title: { en: "Hair Care", es: "Cuidado Capilar" },
    headline: { en: "Hair care that works with your scalp, not against it.", es: "Cuidado capilar que trabaja con tu cuero cabelludo, no en su contra." },
    sub: {
      en: "Chemical-free hair treatments that work with your scalp, not against it.",
      es: "Tratamientos capilares sin químicos que trabajan con tu cuero cabelludo.",
    },
    why: {
      en: "Most drugstore hair products are built around sulfates and silicones that coat the problem instead of solving it. Ours are built around what actually feeds a healthy scalp.",
      es: "La mayoría de los productos capilares de tienda están hechos con sulfatos y siliconas que cubren el problema en vez de resolverlo. Los nuestros están hechos con lo que realmente nutre un cuero cabelludo sano.",
    },
    video: "/videos/herbs.mp4",
  },
  home: {
    title: { en: "Home & Garden", es: "Hogar y Jardín" },
    headline: { en: "Simple, safe solutions for your garden and home.", es: "Soluciones simples y seguras para tu jardín y tu hogar." },
    sub: {
      en: "Natural solutions for your garden and outdoor space.",
      es: "Soluciones naturales para tu jardín y exterior.",
    },
    why: {
      en: "Anything we put in the garden ends up near the people, pets, and pollinators we care about — so it starts the same way everything else here does: no synthetic chemicals, full stop.",
      es: "Todo lo que ponemos en el jardín termina cerca de las personas, mascotas y polinizadores que nos importan — así que empieza igual que todo lo demás acá: sin químicos sintéticos, punto.",
    },
    video: "/videos/soil.mp4",
  },
  hoff: {
    title: { en: "HOFF — Health", es: "HOFF — Salud" },
    headline: { en: "Precision-grade formulas for people who read labels.", es: "Fórmulas de precisión para quienes leen las etiquetas." },
    sub: {
      en: "Pharmaceutical grade supplements and precision formulas.",
      es: "Suplementos grado farmacéutico y fórmulas de precisión.",
    },
    why: {
      en: "HOFF is our separate line for people who want to know exactly what's in what they take — sourced carefully, dosed precisely, nothing hidden behind a proprietary blend.",
      es: "HOFF es nuestra línea aparte para quienes quieren saber exactamente qué contiene lo que toman — con abastecimiento cuidadoso, dosis precisas, nada oculto detrás de una mezcla \"propietaria\".",
    },
    video: "/videos/bottling.mp4",
  },
};

/** Order matters — it is the order they appear in the menu and on the shop page. */
export const DEFAULT_ORDER = Object.keys(DEFAULT_CATEGORIES);

interface StoredCategory extends Partial<CategoryContent> {
  key?: string;
}

function stored(): StoredCategory[] {
  const value = (categoryOverrides as { list?: unknown }).list;
  return Array.isArray(value) ? (value as StoredCategory[]) : [];
}

const EMPTY = { en: "", es: "" };

/**
 * Every category, in order, merged over the compiled defaults.
 *
 * A stored category the code has never heard of is hers — a new line — and gets
 * empty text rather than being dropped. A compiled one she hasn't reordered
 * keeps its place.
 */
export function shopCategories(): { key: string; content: CategoryContent }[] {
  const overrides = stored();
  const keys = overrides.length > 0 ? overrides.map((c) => c.key ?? "").filter(Boolean) : DEFAULT_ORDER;

  return keys.map((key) => {
    const base = DEFAULT_CATEGORIES[key];
    const override = overrides.find((c) => c.key === key);
    return {
      key,
      content: {
        title: override?.title ?? base?.title ?? { ...EMPTY },
        headline: override?.headline ?? base?.headline ?? { ...EMPTY },
        sub: override?.sub ?? base?.sub ?? { ...EMPTY },
        why: override?.why ?? base?.why ?? { ...EMPTY },
        video: override?.video ?? base?.video ?? "",
      },
    };
  });
}

export function categoryContent(key: string): CategoryContent | undefined {
  return shopCategories().find((c) => c.key === key)?.content;
}
