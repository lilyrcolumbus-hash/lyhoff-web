import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, locales, SITE_NAME, SITE_URL, type Locale } from "@/lib/i18n";
import { getProduct, products, productsByCategory } from "@/lib/products";
import { getProductImageUrl, getProductImageUrls } from "@/lib/product-images";
import { ProductCard } from "@/components/ProductCard";
import { TrustBadges } from "@/components/TrustBadges";
import { AddToBagButton } from "@/components/AddToBagButton";
import { Newsletter } from "@/components/Newsletter";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    products.map((p) => ({ lang, slug: p.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const product = getProduct(slug);
  if (!product) return {};

  return {
    title: `${product.name[locale]} — ${SITE_NAME}`,
    description: product.description[locale],
    alternates: {
      canonical: `/${locale}/products/${slug}/`,
      languages: {
        en: `/en/products/${slug}/`,
        es: `/es/products/${slug}/`,
      },
    },
    openGraph: {
      type: "website",
      title: product.name[locale],
      description: product.description[locale],
      url: `${SITE_URL}/${locale}/products/${slug}/`,
      siteName: SITE_NAME,
      locale: locale === "en" ? "en_US" : "es_ES",
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const product = getProduct(slug);
  if (!product) notFound();

  const name = product.name[locale];
  const tagline = product.tagline[locale];
  const description = product.description[locale];
  const badge = product.badge?.[locale];

  const localImages = getProductImageUrls(product.slug);
  const fallback = getProductImageUrl(product.slug, product.image);
  const gallery = localImages.length > 0 ? localImages : [fallback.url];
  const isPlaceholderGallery = localImages.length === 0 && fallback.isPlaceholder;

  const related = productsByCategory(product.category).filter(
    (p) => p.slug !== product.slug,
  );

  return (
    <div className="bg-cream">
      <div className="mx-auto max-w-6xl px-6 pt-10">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1 text-xs text-stone-500">
          <Link href={`/${locale}/`} className="hover:text-forest-700">
            {SITE_NAME}
          </Link>
          <span aria-hidden>/</span>
          <Link href={`/${locale}/products/`} className="hover:text-forest-700">
            {locale === "en" ? "Shop" : "Tienda"}
          </Link>
          <span aria-hidden>/</span>
          <span className="text-stone-700">{name}</span>
        </nav>
      </div>

      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-10 lg:grid-cols-2 lg:gap-16">
        {/* Gallery */}
        <div>
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-50">
            <Image
              src={gallery[0]}
              alt={name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            {isPlaceholderGallery && (
              <span className="absolute top-3 left-3 bg-earth-600 text-cream text-[10px] font-semibold uppercase tracking-widest px-3 py-1">
                {locale === "en" ? "Photo needed" : "Foto pendiente"}
              </span>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {gallery.slice(1, 5).map((src) => (
                <div key={src} className="relative aspect-square overflow-hidden bg-stone-50">
                  <Image src={src} alt={name} fill sizes="25vw" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-earth-600 mb-2">
            {product.size}
          </p>
          {badge && (
            <span className="inline-block mb-3 bg-forest-950 text-cream text-[10px] font-semibold uppercase tracking-widest px-3 py-1">
              {badge}
            </span>
          )}
          <h1 className="font-display text-3xl font-bold text-forest-950 sm:text-4xl">
            {name}
          </h1>
          <p className="mt-2 text-base font-medium text-stone-500 italic">{tagline}</p>
          <p className="mt-5 text-base text-stone-600 leading-relaxed">{description}</p>

          <div className="mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">
              {locale === "en" ? "Ingredients" : "Ingredientes"}
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {product.ingredients.map((ing) => (
                <span
                  key={ing}
                  className="text-[10px] font-medium uppercase tracking-wide text-stone-500 border border-stone-200 px-2 py-0.5"
                >
                  {ing}
                </span>
              ))}
            </div>
            <Link
              href={`/${locale}/ingredients/`}
              className="mt-3 inline-block text-xs font-medium text-forest-700 hover:underline"
            >
              {locale === "en" ? "Learn more about our ingredients →" : "Conoce más sobre nuestros ingredientes →"}
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-stone-200 pt-8">
            <span className="font-display text-2xl font-bold text-forest-950">
              ${product.price.toFixed(2)}
            </span>
            <AddToBagButton
              slug={product.slug}
              name={name}
              price={product.price}
              size={product.size}
              image={gallery[0]}
              locale={locale}
            />
          </div>

          <TrustBadges locale={locale} theme="light" className="mt-10 border-t border-stone-200 pt-8 sm:grid-cols-1 gap-6" />
        </div>
      </div>

      {/* Reviews — honest placeholder, no fabricated testimonials */}
      <div className="mx-auto max-w-6xl px-6">
        <div className="border-t border-stone-200 py-10">
          <h2 className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-stone-400 mb-3">
            {locale === "en" ? "Reviews" : "Reseñas"}
          </h2>
          <p className="text-sm text-stone-500 max-w-md">
            {locale === "en"
              ? "Real customer reviews are coming soon. We'd rather wait and show you real ones than make them up."
              : "Las reseñas reales de clientes llegan pronto. Preferimos esperar y mostrarte reseñas reales antes que inventarlas."}
          </p>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mx-auto max-w-6xl px-6">
          <section className="border-t border-stone-200 py-16">
            <h2 className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-stone-400 mb-10">
              {locale === "en" ? "You might also like" : "También te puede gustar"}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => {
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
