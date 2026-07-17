import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, locales, SITE_NAME, SITE_URL, type Locale } from "@/lib/i18n";
import { dedupeVariants, getProduct, getVariants, products, productsByCategory } from "@/lib/products";
import { getProductImageUrl, getProductImageUrls, getScentImageUrls } from "@/lib/product-images";
import { ProductCard } from "@/components/ProductCard";
import { ProductDetailClient } from "@/components/ProductDetailClient";
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
    title: product.name[locale],
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

  // Real scent-specific photos, if any exist yet (see getScentImageUrls) — empty
  // for a scent means "no real photos for it," so the client falls back to `gallery`.
  const scentGalleries: Record<string, string[]> = {};
  for (const s of product.scents ?? []) {
    scentGalleries[s] = getScentImageUrls(product.slug, s);
  }

  const related = dedupeVariants(productsByCategory(product.category)).filter(
    (p) => p.slug !== product.slug && p.variantGroup !== product.variantGroup,
  );
  const variants = product.variantGroup ? getVariants(product.variantGroup) : [];

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

      <ProductDetailClient
        product={product}
        locale={locale}
        name={name}
        tagline={tagline}
        description={description}
        badge={badge}
        defaultGallery={gallery}
        scentGalleries={scentGalleries}
        isPlaceholderGallery={isPlaceholderGallery}
        variants={variants}
      />

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
