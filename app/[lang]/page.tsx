import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, t, type Locale } from "@/lib/i18n";
import { getAllArticles, getFeatured } from "@/lib/content";
import { activeProducts, dedupeVariants } from "@/lib/products";
import { getProductImageUrl } from "@/lib/product-images";
import { ArticleCard } from "@/components/ArticleCard";
import { ProductCard } from "@/components/ProductCard";
import { StockPhoto } from "@/components/StockPhoto";
import { TrustBadges } from "@/components/TrustBadges";
import { CategoryTiles } from "@/components/CategoryTiles";
import { Newsletter } from "@/components/Newsletter";
import { Blob, WaveDivider } from "@/components/illustrations";
import { HeroText } from "@/components/HeroText";
import { FloatingLeaves } from "@/components/FloatingLeaves";

const processPhotos: { note: Record<Locale, string>; stockSrc: string }[] = [
  {
    note: {
      en: "Hands mixing the tallow cream",
      es: "Manos mezclando la crema de sebo",
    },
    stockSrc:
      "https://images.unsplash.com/photo-1651592280676-a01949b60cd7?w=600&h=600&q=80&auto=format&fit=crop",
  },
  {
    note: {
      en: "Fresh herbs from the garden",
      es: "Hierbas frescas del huerto",
    },
    stockSrc:
      "https://images.unsplash.com/photo-1749655248287-d1e0acb5f8d1?w=600&h=600&q=80&auto=format&fit=crop",
  },
  {
    note: {
      en: "Bottling & labeling by hand",
      es: "Envasado y etiquetado a mano",
    },
    stockSrc:
      "https://images.unsplash.com/photo-1709666414115-47ecd5143293?w=600&h=600&q=80&auto=format&fit=crop",
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
  const featuredProducts = dedupeVariants(activeProducts).slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative bg-cream overflow-hidden">
        <FloatingLeaves />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-6 pt-20 pb-24 md:pt-28 md:pb-32 lg:grid-cols-2 lg:items-center lg:gap-16">
          <HeroText
            locale={locale}
            tagline={dict.tagline}
            title={dict.heroTitle}
            subtitle={dict.heroSubtitle}
            cta={dict.heroCta}
          />
          <div className="relative">
            <Blob className="pointer-events-none absolute -top-10 -right-10 h-64 w-64 text-earth-200/70 -z-10" />
            <Blob className="pointer-events-none absolute -bottom-12 -left-8 h-40 w-40 text-forest-100 -z-10" />
            <StockPhoto
              ratio="portrait"
              rounded
              className="shadow-2xl shadow-forest-950/10"
              src="https://images.unsplash.com/photo-1582745741856-1a5d68158ba3?w=700&h=875&q=80&auto=format&fit=crop"
              alt={locale === "en" ? "Naturally grown rosemary" : "Romero cultivado al natural"}
            >
              <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full bg-cream/95 px-4 py-2.5 shadow-lg backdrop-blur-sm">
                <span className="text-base" aria-hidden>🌿</span>
                <span className="font-display text-xs font-semibold text-forest-950">
                  {locale === "en" ? "Zero synthetic chemicals" : "Sin químicos sintéticos"}
                </span>
              </div>
            </StockPhoto>
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
              <StockPhoto key={i} ratio="square" rounded src={photo.stockSrc} alt={photo.note[locale]} />
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
