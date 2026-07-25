import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories, isLocale, t, type Locale } from "@/lib/i18n";
import { getAllArticles, getArticlesByCategory } from "@/lib/content";
import { ArticleCard } from "@/components/ArticleCard";
import { Newsletter } from "@/components/Newsletter";
import { CategoryIcon } from "@/components/CategoryIcon";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  return {
    title: t(locale).allArticles,
    alternates: {
      canonical: `/${locale}/topics/`,
      languages: { en: "/en/topics/", es: "/es/topics/" },
    },
  };
}

export default async function TopicsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const dict = t(locale);
  const total = getAllArticles(locale).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <header>
        <h1 className="font-display text-3xl font-bold text-forest-950 sm:text-4xl">
          {dict.allArticles}
        </h1>
      </header>

      {total === 0 && <p className="mt-8 text-stone-500">{dict.noArticles}</p>}

      {categories.map((c) => {
        const articles = getArticlesByCategory(c.slug, locale);
        if (articles.length === 0) return null;
        return (
          <section key={c.slug} className="mt-12">
            <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-forest-900">
              <CategoryIcon slug={c.slug} className="h-6 w-6 text-earth-600" />
              {c.label[locale]}
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((a, i) => (
                <ArticleCard key={a.slug} article={a} locale={locale} index={i} />
              ))}
            </div>
          </section>
        );
      })}

      <section className="mt-14">
        <Newsletter locale={locale} variant="panel" />
      </section>
    </div>
  );
}
