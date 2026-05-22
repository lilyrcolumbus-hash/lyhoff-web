import type { Metadata } from "next";
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
import { ArticleCard } from "@/components/ArticleCard";
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
          {articles.map((a) => (
            <ArticleCard key={a.slug} article={a} locale={locale} />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-stone-500">{dict.noArticles}</p>
      )}

      <section className="mt-14">
        <Newsletter locale={locale} variant="inline" />
      </section>
    </div>
  );
}
