import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  categories,
  getCategory,
  isLocale,
  locales,
  t,
  type Locale,
} from "@/lib/i18n";
import { getArticlesByCategory } from "@/lib/content";
import { dedupeVariants, getVariants, productsByCategory } from "@/lib/products";
import { getProductImageUrl } from "@/lib/product-images";
import { ArticleCard } from "@/components/ArticleCard";
import { ProductCard } from "@/components/ProductCard";
import { Newsletter } from "@/components/Newsletter";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    categories.map((c) => ({ lang, category: c.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; category: string }>;
}): Promise<Metadata> {
  const { lang, category } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const cat = getCategory(category);
  if (!cat) return {};
  return {
    title: cat.label[locale],
    description: cat.blurb[locale],
    alternates: {
      canonical: `/${locale}/category/${category}/`,
      languages: {
        en: `/en/category/${category}/`,
        es: `/es/category/${category}/`,
      },
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ lang: string; category: string }>;
}) {
  const { lang, category } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const cat = getCategory(category);
  if (!cat) notFound();
  const dict = t(locale);
  const articles = getArticlesByCategory(category, locale);
  // Content categories (bodycare/remedies/lab) and product categories
  // (bodycare/hair/home/hoff) don't share names 1:1 — map each manually.
  const shopProducts =
    category === "bodycare"
      ? dedupeVariants([...productsByCategory("bodycare"), ...productsByCategory("hair")])
      : category === "remedies"
        ? dedupeVariants(getVariants("comfrey-salve"))
        : category === "lab"
          ? dedupeVariants(productsByCategory("hoff"))
          : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <header className="border-b border-stone-200 pb-8">
        <span className="text-4xl">{cat.emoji}</span>
        <h1 className="mt-3 font-display text-3xl font-bold text-forest-950 sm:text-4xl">
          {cat.label[locale]}
        </h1>
        <p className="mt-2 max-w-2xl text-lg text-stone-600">
          {cat.blurb[locale]}
        </p>
      </header>

      {articles.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a, i) => (
            <ArticleCard key={a.slug} article={a} locale={locale} index={i} />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-stone-500">{dict.noArticles}</p>
      )}

      {shopProducts.length > 0 && (
        <section className="mt-14 border-t border-stone-200 pt-10">
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-stone-400">
              {locale === "en" ? "Shop skin & hair" : "Tienda de piel y cabello"}
            </h2>
            <Link
              href={`/${locale}/products/`}
              className="text-xs font-medium text-forest-700 hover:underline"
            >
              {dict.shopAll} →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shopProducts.map((p, i) => {
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
      )}

      <section className="mt-14">
        <Newsletter locale={locale} variant="inline" />
      </section>
    </div>
  );
}
