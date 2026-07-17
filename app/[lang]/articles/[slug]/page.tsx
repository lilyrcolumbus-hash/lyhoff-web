import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCategory,
  isLocale,
  locales,
  SITE_NAME,
  SITE_URL,
  t,
  type Locale,
} from "@/lib/i18n";
import { getArticle, getRelated, getSlugs } from "@/lib/content";
import { Mdx } from "@/components/Mdx";
import { CoverImage } from "@/components/CoverImage";
import { ArticleCard } from "@/components/ArticleCard";
import { Newsletter } from "@/components/Newsletter";
import { SaveToPinterest } from "@/components/SaveToPinterest";

export const dynamicParams = false;

export function generateStaticParams() {
  const slugs = getSlugs();
  const params = locales.flatMap((lang) =>
    slugs.map((slug) => ({ lang, slug })),
  );
  // `output: export` requires a dynamic route to emit at least one path. With no
  // articles yet, emit a single placeholder that 404s (the page calls notFound()
  // because getArticle returns null). Nothing links to it; it's noindex.
  return params.length > 0 ? params : [{ lang: "en", slug: "__none__" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const article = getArticle(slug, locale);
  if (!article) return {};

  const url = `${SITE_URL}/${locale}/articles/${slug}/`;
  const image = article.pinImage ?? article.heroImage;

  return {
    title: article.title,
    description: article.description,
    keywords: article.tags,
    alternates: {
      canonical: `/${locale}/articles/${slug}/`,
      languages: {
        en: `/en/articles/${slug}/`,
        es: `/es/articles/${slug}/`,
      },
    },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.description,
      url,
      siteName: SITE_NAME,
      locale: locale === "en" ? "en_US" : "es_ES",
      publishedTime: article.publishedAt,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const article = getArticle(slug, locale);
  if (!article) notFound();

  const dict = t(locale);
  const cat = getCategory(article.category);
  const related = getRelated(article, locale);
  const url = `${SITE_URL}/${locale}/articles/${slug}/`;
  const image = article.pinImage ?? article.heroImage;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    inLanguage: locale,
    keywords: article.tags.join(", "),
    articleSection: cat?.label[locale],
    mainEntityOfPage: url,
    ...(image ? { image: image.startsWith("http") ? image : SITE_URL + image } : {}),
    publisher: { "@type": "Organization", name: SITE_NAME },
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1 text-xs text-stone-500">
        <Link href={`/${locale}/`} className="hover:text-forest-700">
          {SITE_NAME}
        </Link>
        <span aria-hidden>/</span>
        <Link
          href={`/${locale}/category/${article.category}/`}
          className="hover:text-forest-700"
        >
          {cat?.label[locale]}
        </Link>
      </nav>

      {article.draft && (
        <p className="mt-4 rounded-lg border border-earth-400/40 bg-earth-500/10 px-3 py-2 text-xs font-semibold text-earth-700">
          ⚠️ {dict.draftBadge}
        </p>
      )}

      <header className="mt-4">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-forest-600">
          <span>{cat?.emoji}</span>
          <span>{cat?.label[locale]}</span>
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-forest-950 sm:text-4xl">
          {article.title}
        </h1>
        <p className="mt-3 text-lg text-stone-600">{article.description}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-stone-500">
          <span>
            {dict.publishedOn}{" "}
            {new Date(article.publishedAt).toLocaleDateString(
              locale === "en" ? "en-US" : "es-ES",
              { year: "numeric", month: "long", day: "numeric" },
            )}
          </span>
          <span>·</span>
          <span>
            {article.readingMinutes} {dict.minRead}
          </span>
          <span className="ml-auto">
            <SaveToPinterest
              locale={locale}
              title={article.title}
              imageUrl={image}
            />
          </span>
        </div>
      </header>

      <div className="mt-8 overflow-hidden rounded-sm">
        <CoverImage
          src={article.heroImage}
          alt={article.title}
          category={article.category}
          ratio="wide"
        />
      </div>

      <div className="mt-8">
        <Mdx source={article.content} />
      </div>

      {/* Pinterest save CTA */}
      <div className="mt-10 flex flex-col items-center gap-3 rounded-sm border border-stone-200 bg-stone-50 px-6 py-8 text-center">
        <p className="font-display text-lg font-semibold text-forest-900">
          {locale === "en" ? "Found this useful?" : "¿Te sirvió esta guía?"}
        </p>
        <SaveToPinterest
          locale={locale}
          title={article.title}
          imageUrl={image}
        />
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold text-forest-900">
            {dict.relatedTitle}
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((a, i) => (
              <ArticleCard key={a.slug} article={a} locale={locale} index={i} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-12">
        <Newsletter locale={locale} variant="inline" />
      </section>
    </article>
  );
}
