import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, t, type Locale } from "@/lib/i18n";
import { getAllArticles, getFeatured } from "@/lib/content";
import { activeProducts, dedupeVariants } from "@/lib/products";
import { getProductImageUrl } from "@/lib/product-images";
import { ArticleCard } from "@/components/ArticleCard";
import { ProductCard } from "@/components/ProductCard";
import { StockVideo } from "@/components/StockVideo";
import { FullBleedVideo } from "@/components/FullBleedVideo";
import { TrustBadges } from "@/components/TrustBadges";
import { CategoryTiles } from "@/components/CategoryTiles";
import { Newsletter } from "@/components/Newsletter";
import { WaveDivider, Leaf } from "@/components/illustrations";
import { HeroText } from "@/components/HeroText";

const processVideos: { note: Record<Locale, string>; videoSrc: string }[] = [
  {
    note: {
      en: "Processed in our own lab, small batch",
      es: "Procesado en nuestro laboratorio, en pequeños lotes",
    },
    videoSrc: "/videos/mixing.mp4",
  },
  {
    note: {
      en: "Fresh herbs from the garden",
      es: "Hierbas frescas del huerto",
    },
    videoSrc: "/videos/herbs.mp4",
  },
  {
    note: {
      en: "Bottling & labeling by hand",
      es: "Envasado y etiquetado a mano",
    },
    videoSrc: "/videos/bottling.mp4",
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
      {/* Hero — full-bleed video, first thing every visitor sees */}
      <section className="relative min-h-[85vh] w-full overflow-hidden bg-forest-950">
        <video
          src="/videos/nature.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950/85 via-forest-950/45 to-forest-950/20" />
        <div className="relative mx-auto flex min-h-[85vh] max-w-6xl flex-col justify-center px-6 py-24">
          <HeroText
            locale={locale}
            theme="light"
            tagline={dict.tagline}
            title={dict.heroTitle}
            subtitle={dict.heroSubtitle}
            cta={dict.heroCta}
          />
          <div className="mt-8 inline-flex w-fit items-center gap-2 rounded-sm bg-cream/95 px-4 py-2.5 shadow-lg backdrop-blur-sm">
            <Leaf className="h-4 w-4 text-forest-600" />
            <span className="font-display text-xs font-semibold text-forest-950">
              {locale === "en" ? "Zero synthetic chemicals" : "Sin químicos sintéticos"}
            </span>
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
                className="inline-flex items-center rounded-sm border border-stone-600 px-7 py-3.5 text-sm font-semibold text-cream transition hover:border-cream hover:bg-cream hover:text-forest-950"
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

      {/* Full-bleed cinematic moment */}
      <FullBleedVideo
        src="/videos/herbs.mp4"
        heading={
          locale === "en"
            ? "Grown, harvested, and made — all by us."
            : "Cultivado, cosechado y hecho — todo por nosotros."
        }
        sub={
          locale === "en"
            ? "No warehouse, no middleman. Just a couple in Ohio and a garden."
            : "Sin bodega, sin intermediarios. Solo una pareja en Ohio y un huerto."
        }
      />

      {/* Process strip */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-stone-400 mb-10">
            {dict.ourProcess}
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {processVideos.map((video, i) => (
              <div key={i}>
                <StockVideo ratio="square" rounded src={video.videoSrc} />
                <p className="mt-3 text-center text-xs font-medium text-stone-500">{video.note[locale]}</p>
              </div>
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
