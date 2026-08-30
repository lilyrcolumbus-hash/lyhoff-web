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
import { StockVideo } from "@/components/StockVideo";
import { Newsletter } from "@/components/Newsletter";
import { shopCategories } from "@/lib/categories";

// One definition, shared with the header and the shop page — see lib/categories.ts.
const CATEGORIES = shopCategories();
const CONTENT = Object.fromEntries(CATEGORIES.map((c) => [c.key, c.content]));

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    CATEGORIES.filter((c) => productsByCategory(c.key).length > 0).map(({ key }) => ({
      lang,
      category: key,
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

  const c = CONTENT[category];
  if (!c) notFound();
  const cat = category;

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
          <StockVideo ratio="wide" rounded src={c.video} />
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
