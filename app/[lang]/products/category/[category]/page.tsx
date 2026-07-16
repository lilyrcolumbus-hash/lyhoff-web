import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import {
  activeProducts,
  dedupeVariants,
  productsByCategory,
  type ProductCategory,
} from "@/lib/products";
import { getProductImageUrl } from "@/lib/product-images";
import { ProductCard } from "@/components/ProductCard";
import { TrustBadges } from "@/components/TrustBadges";
import { StockPhoto } from "@/components/StockPhoto";
import { Newsletter } from "@/components/Newsletter";

const CATEGORIES: ProductCategory[] = ["bodycare", "hair", "home", "hoff"];

const CONTENT: Record<
  ProductCategory,
  {
    title: { en: string; es: string };
    headline: { en: string; es: string };
    sub: { en: string; es: string };
    why: { en: string; es: string };
    image: { src: string; alt: { en: string; es: string } };
  }
> = {
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
    image: {
      src: "https://images.unsplash.com/photo-1709666414115-47ecd5143293?w=900&h=700&q=85&auto=format&fit=crop",
      alt: { en: "Hand-bottled, small batch", es: "Envasado a mano, en pequeños lotes" },
    },
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
    image: {
      src: "https://images.unsplash.com/photo-1749655248287-d1e0acb5f8d1?w=900&h=700&q=85&auto=format&fit=crop",
      alt: { en: "Fresh herbs from the garden", es: "Hierbas frescas del huerto" },
    },
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
    image: {
      src: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=900&h=700&q=85&auto=format&fit=crop",
      alt: { en: "Garden and harvest", es: "Huerto y cosecha" },
    },
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
    image: {
      src: "https://images.unsplash.com/photo-1651592280676-a01949b60cd7?w=900&h=700&q=85&auto=format&fit=crop",
      alt: { en: "Careful, hands-on formulation", es: "Formulación cuidadosa, hecha a mano" },
    },
  },
};

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    CATEGORIES.filter((c) => productsByCategory(c).length > 0).map((category) => ({
      lang,
      category,
    })),
  );
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; category: string }>;
}): Promise<Metadata> {
  const { lang, category } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const c = CONTENT[category as ProductCategory];
  if (!c) return {};
  return {
    title: c.title[locale],
    description: c.sub[locale],
    alternates: {
      canonical: `/${locale}/products/category/${category}/`,
      languages: {
        en: `/en/products/category/${category}/`,
        es: `/es/products/category/${category}/`,
      },
    },
  };
}

export default async function ProductCategoryPage({
  params,
}: {
  params: Promise<{ lang: string; category: string }>;
}) {
  const { lang, category } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;

  if (!CATEGORIES.includes(category as ProductCategory)) notFound();
  const cat = category as ProductCategory;
  const c = CONTENT[cat];

  const products = dedupeVariants(productsByCategory(cat));
  if (products.length === 0) notFound();

  const more = dedupeVariants(activeProducts)
    .filter((p) => p.category !== cat)
    .slice(0, 3);

  return (
    <div className="bg-cream">
      <div className="mx-auto max-w-6xl px-6 pt-10">
        <nav className="flex flex-wrap items-center gap-1 text-xs text-stone-500">
          <Link href={`/${locale}/products/`} className="hover:text-forest-700">
            {locale === "en" ? "Shop" : "Tienda"}
          </Link>
          <span aria-hidden>/</span>
          <span className="text-stone-700">{c.title[locale]}</span>
        </nav>
      </div>

      {/* Header */}
      <div className="mx-auto max-w-6xl px-6 pt-8 pb-14">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-earth-600 mb-4">
          {c.title[locale]}
        </p>
        <h1 className="font-display text-4xl font-bold text-forest-950 max-w-2xl md:text-5xl">
          {c.headline[locale]}
        </h1>
        <p className="mt-5 max-w-lg text-base text-stone-500 leading-relaxed">
          {c.sub[locale]}
        </p>
      </div>

      <div className="border-t border-stone-200" />

      {/* Products — only this category */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, i) => {
            const image = getProductImageUrl(product.slug, product.image);
            return (
              <ProductCard
                key={product.asin}
                product={product}
                locale={locale}
                index={i}
                imageUrl={image.url}
                isPlaceholderImage={image.isPlaceholder}
              />
            );
          })}
        </div>
      </section>

      {/* Why this category — editorial trust content */}
      <div className="border-t border-stone-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-2 lg:items-center lg:gap-16">
          <StockPhoto
            ratio="wide"
            rounded
            src={c.image.src}
            alt={c.image.alt[locale]}
          />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-earth-600 mb-4">
              {locale === "en" ? "Why it's different" : "Por qué es diferente"}
            </p>
            <p className="font-display text-xl leading-relaxed text-forest-950 sm:text-2xl">
              {c.why[locale]}
            </p>
            <Link
              href={`/${locale}/ingredients/`}
              className="mt-6 inline-flex items-center text-sm font-semibold text-forest-700 hover:underline"
            >
              {locale === "en" ? "See every ingredient we use →" : "Ver todos los ingredientes que usamos →"}
            </Link>
          </div>
        </div>
      </div>

      {/* Trust bar */}
      <div className="mx-auto max-w-6xl px-6">
        <TrustBadges locale={locale} theme="light" className="border-t border-stone-200 py-16" />
      </div>

      {/* Cross-sell — clearly separate, not mixed into the category grid above */}
      {more.length > 0 && (
        <div className="mx-auto max-w-6xl px-6">
          <section className="border-t border-stone-200 py-16">
            <h2 className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-stone-400 mb-10">
              {locale === "en" ? "From our other collections" : "De nuestras otras colecciones"}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((p, i) => {
                const image = getProductImageUrl(p.slug, p.image);
                return (
                  <ProductCard
                    key={p.asin}
                    product={p}
                    locale={locale}
                    index={i}
                    imageUrl={image.url}
                    isPlaceholderImage={image.isPlaceholder}
                  />
                );
              })}
            </div>
          </section>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-6">
        <section className="border-t border-stone-200 py-16">
          <Newsletter locale={locale} variant="panel" />
        </section>
      </div>
    </div>
  );
}
