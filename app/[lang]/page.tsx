import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, t, type Locale } from "@/lib/i18n";
import { getAllArticles, getFeatured } from "@/lib/content";
import { activeProducts } from "@/lib/products";
import { getProductImageUrl } from "@/lib/product-images";
import { ArticleCard } from "@/components/ArticleCard";
import { ProductCard } from "@/components/ProductCard";
import { PlaceholderPhoto } from "@/components/PlaceholderPhoto";
import { TrustBadges } from "@/components/TrustBadges";
import { CategoryTiles } from "@/components/CategoryTiles";
import { Newsletter } from "@/components/Newsletter";
import { Blob, WaveDivider } from "@/components/illustrations";

const processPhotos: { note: Record<Locale, string> }[] = [
  {
    note: {
      en: "Hands mixing the tallow cream",
      es: "Manos mezclando la crema de sebo",
    },
  },
  {
    note: {
      en: "Fresh herbs from the garden",
      es: "Hierbas frescas del huerto",
    },
  },
  {
    note: {
      en: "Bottling & labeling by hand",
      es: "Envasado y etiquetado a mano",
    },
  },
];

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
  const featuredProducts = activeProducts.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="bg-cream">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 pt-20 pb-24 md:pt-28 md:pb-32 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-earth-600 mb-6">
              {dict.tagline}
            </p>
            <h1 className="font-display text-5xl font-bold leading-[1.08] text-forest-950 max-w-2xl md:text-6xl lg:text-7xl">
              {dict.heroTitle}
            </h1>
            <p className="mt-6 max-w-xl text-base text-stone-500 leading-relaxed md:text-lg">
              {dict.heroSubtitle}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#newsletter"
                className="inline-flex items-center rounded-full bg-forest-950 px-7 py-3.5 text-sm font-semibold text-cream transition hover:bg-forest-800"
              >
                {dict.heroCta}
              </a>
              <Link
                href={`/${locale}/about/`}
                className="inline-flex items-center rounded-full border border-stone-300 px-7 py-3.5 text-sm font-semibold text-forest-950 transition hover:border-forest-400 hover:bg-forest-50"
              >
                {locale === "en" ? "Our story" : "Nuestra historia"}
              </Link>
            </div>
          </div>
          <div className="relative">
            <Blob className="pointer-events-none absolute -top-10 -right-10 h-64 w-64 text-earth-200/70 -z-10" />
            <PlaceholderPhoto
              ratio="portrait"
              locale={locale}
              note={{
                en: "Lifestyle hero photo — the couple in the garden or applying the tallow cream",
                es: "Foto principal — la pareja en el huerto o aplicando la crema de sebo",
              }}
            />
          </div>
        </div>
      </section>

      {/* Divider */}
      <WaveDivider className="bg-white py-6" />

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <>
          <section className="bg-white">
            <div className="mx-auto max-w-6xl px-6 py-20">
              <div className="flex items-end justify-between mb-10">
                <h2 className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-stone-400">
                  {dict.featuredProducts}
                </h2>
                <div className="flex items-center gap-5">
                  <Link
                    href={`/${locale}/quiz/`}
                    className="text-xs font-medium text-earth-700 hover:underline"
                  >
                    {locale === "en" ? "Not sure? Take the quiz" : "¿No sabes? Haz el quiz"}
                  </Link>
                  <Link
                    href={`/${locale}/products/`}
                    className="text-xs font-medium text-forest-700 hover:underline"
                  >
                    {dict.shopAll} →
                  </Link>
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featuredProducts.map((product, i) => {
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
            </div>
          </section>
          <div className="border-t border-stone-200" />
        </>
      )}

      {/* Categories */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-stone-400 mb-10">
            {dict.browseByTopic}
          </h2>
          <CategoryTiles locale={locale} />
        </div>
      </section>

      {/* Brand strip */}
      <section className="bg-forest-950 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-earth-400 mb-4">
                {locale === "en" ? "What we believe" : "Lo que creemos"}
              </p>
              <h2 className="font-display text-3xl font-bold text-cream leading-snug md:text-4xl">
                {locale === "en"
                  ? "Nature gives us everything we need. No reason to add chemicals."
                  : "La naturaleza nos da todo lo que necesitamos. Sin razón para agregar químicos."}
              </h2>
            </div>
            <div className="mt-8 md:mt-0 md:ml-16 shrink-0">
              <Link
                href={`/${locale}/about/`}
                className="inline-flex items-center rounded-full border border-stone-600 px-7 py-3.5 text-sm font-semibold text-cream transition hover:border-cream hover:bg-cream hover:text-forest-950"
              >
                {locale === "en" ? "Meet LYHOFF →" : "Conoce LYHOFF →"}
              </Link>
            </div>
          </div>

          <TrustBadges
            locale={locale}
            theme="dark"
            className="mt-14 border-t border-forest-800 pt-14"
          />
        </div>
      </section>

      <WaveDivider className="bg-forest-950 py-6" tone="dark" />

      {/* Process strip */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-stone-400 mb-10">
            {dict.ourProcess}
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {processPhotos.map((photo, i) => (
              <PlaceholderPhoto key={i} ratio="square" locale={locale} note={photo.note} />
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6">
        {/* Featured */}
        {featured.length > 0 && (
          <section className="py-20">
            <h2 className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-stone-400 mb-10">
              {dict.featured}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((a, i) => (
                <ArticleCard key={a.slug} article={a} locale={locale} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Latest */}
        {latest.length > 0 && (
          <section className="py-20 border-t border-stone-100">
            <div className="flex items-end justify-between mb-10">
              <h2 className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-stone-400">
                {dict.latest}
              </h2>
              <Link
                href={`/${locale}/topics/`}
                className="text-xs font-medium text-forest-700 hover:underline"
              >
                {dict.allArticles} →
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latest.map((a, i) => (
                <ArticleCard key={a.slug} article={a} locale={locale} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Newsletter */}
        <section id="newsletter" className="scroll-mt-20 py-20 border-t border-stone-100">
          <Newsletter locale={locale} variant="panel" />
        </section>
      </div>
    </>
  );
}
