import Link from "next/link";
import { notFound } from "next/navigation";
import { categories, isLocale, t, type Locale } from "@/lib/i18n";
import { getAllArticles, getFeatured } from "@/lib/content";
import { ArticleCard } from "@/components/ArticleCard";
import { Newsletter } from "@/components/Newsletter";

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const dict = t(locale);

  const featured = getFeatured(locale);
  const latest = getAllArticles(locale).slice(0, 6);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-forest-50 to-cream">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:py-24">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-earth-600">
            {dict.tagline}
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.1] text-forest-950 sm:text-5xl">
            {dict.heroTitle}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-stone-600">
            {dict.heroSubtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#newsletter"
              className="rounded-full bg-forest-800 px-6 py-3 text-sm font-semibold text-cream transition hover:bg-forest-700"
            >
              {dict.heroCta}
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4">
        {/* Featured */}
        {featured.length > 0 && (
          <section className="py-12">
            <h2 className="font-display text-2xl font-bold text-forest-900">
              {dict.featured}
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((a) => (
                <ArticleCard key={a.slug} article={a} locale={locale} />
              ))}
            </div>
          </section>
        )}

        {/* Browse by topic */}
        <section className="py-12">
          <h2 className="font-display text-2xl font-bold text-forest-900">
            {dict.browseByTopic}
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/${locale}/category/${c.slug}/`}
                className="group rounded-2xl border border-stone-200 bg-white p-6 transition hover:-translate-y-1 hover:border-forest-300 hover:shadow-md"
              >
                <span className="text-3xl">{c.emoji}</span>
                <h3 className="mt-3 font-display text-lg font-semibold text-forest-900 group-hover:text-forest-700">
                  {c.label[locale]}
                </h3>
                <p className="mt-1 text-sm text-stone-600">{c.blurb[locale]}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Latest */}
        {latest.length > 0 && (
          <section className="py-12">
            <div className="flex items-end justify-between">
              <h2 className="font-display text-2xl font-bold text-forest-900">
                {dict.latest}
              </h2>
              <Link
                href={`/${locale}/topics/`}
                className="text-sm font-medium text-forest-700 hover:underline"
              >
                {dict.allArticles} →
              </Link>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latest.map((a) => (
                <ArticleCard key={a.slug} article={a} locale={locale} />
              ))}
            </div>
          </section>
        )}

        {/* Shop band — content → product funnel */}
        <section className="py-12">
          <div className="flex flex-col items-start gap-4 rounded-3xl bg-gradient-to-br from-clay-100 to-clay-50 px-6 py-10 sm:px-10 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-clay-600">
                {dict.shopKicker}
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-clay-900">
                {dict.shopTitle}
              </h2>
              <p className="mt-2 text-stone-700">{dict.shopWhyBody}</p>
            </div>
            <Link
              href={`/${locale}/shop/`}
              className="shrink-0 rounded-full bg-clay-600 px-6 py-3 text-sm font-semibold text-cream transition hover:bg-clay-700"
            >
              {dict.shopCta}
            </Link>
          </div>
        </section>

        {/* Newsletter */}
        <section id="newsletter" className="scroll-mt-20 py-12">
          <Newsletter locale={locale} variant="panel" />
        </section>
      </div>
    </>
  );
}
