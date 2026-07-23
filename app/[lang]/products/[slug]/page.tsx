import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, locales, SITE_NAME, SITE_URL, type Locale } from "@/lib/i18n";
import {
  dedupeVariants,
  getProduct,
  getScentVariants,
  getSizeVariants,
  products,
  productsByCategory,
} from "@/lib/products";
import { getProductImageUrl, getProductImageUrls } from "@/lib/product-images";
import { ProductCard } from "@/components/ProductCard";
import { TrustBadges } from "@/components/TrustBadges";
import { AddToBagButton } from "@/components/AddToBagButton";
import { ProductGallery } from "@/components/ProductGallery";
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

  const related = dedupeVariants(productsByCategory(product.category)).filter(
    (p) => p.slug !== product.slug && p.variantGroup !== product.variantGroup,
  );
  const sizeVariants = product.variantGroup ? getSizeVariants(product.variantGroup) : [];
  const scentVariants = product.scentGroup ? getScentVariants(product.scentGroup) : [];

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
        <ProductGallery
          images={gallery}
          alt={name}
          isPlaceholder={isPlaceholderGallery}
          placeholderLabel={locale === "en" ? "Photo needed" : "Foto pendiente"}
        />

        {/* Info */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-earth-600 mb-2">
            {product.size}
          </p>
          <div className="mb-3 flex flex-wrap gap-2">
            {badge && (
              <span className="inline-block bg-forest-950 text-cream text-[10px] font-semibold uppercase tracking-widest px-3 py-1">
                {badge}
              </span>
            )}
            {product.gift && (
              <span className="inline-block bg-earth-600 text-cream text-[10px] font-semibold uppercase tracking-widest px-3 py-1">
                {locale === "en" ? "+ Free gift" : "+ Regalo"}
              </span>
            )}
          </div>
          <h1 className="font-display text-3xl font-bold text-forest-950 sm:text-4xl">
            {name}
          </h1>
          <p className="mt-2 text-base font-medium text-stone-500 italic">{tagline}</p>
          <p className="mt-5 text-base text-stone-600 leading-relaxed">{description}</p>

          <ul className="mt-4 flex flex-col gap-1.5">
            {product.benefits.map((b) => (
              <li key={b.en} className="flex items-start gap-2 text-sm text-stone-600">
                <span className="mt-1 text-earth-500" aria-hidden>✓</span>
                {b[locale]}
              </li>
            ))}
          </ul>

          {sizeVariants.length > 1 && (
            <div className="mt-6">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">
                {locale === "en" ? "Size" : "Tamaño"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {sizeVariants.map((v) => (
                  <Link
                    key={v.slug}
                    href={`/${locale}/products/${v.slug}/`}
                    className={`rounded-sm border px-4 py-2 text-sm font-medium transition ${
                      v.size === product.size
                        ? "border-forest-950 bg-forest-950 text-cream"
                        : "border-stone-300 text-forest-950 hover:border-forest-500"
                    }`}
                  >
                    {v.size}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {scentVariants.length > 1 && (
            <div className="mt-6">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">
                {locale === "en" ? "Scent" : "Aroma"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {scentVariants.map((v) => (
                  <Link
                    key={v.slug}
                    href={`/${locale}/products/${v.slug}/`}
                    className={`rounded-sm border px-4 py-2 text-sm font-medium transition ${
                      v.slug === product.slug
                        ? "border-forest-950 bg-forest-950 text-cream"
                        : "border-stone-300 text-forest-950 hover:border-forest-500"
                    }`}
                  >
                    {v.scent}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">
              {locale === "en" ? "Ingredients" : "Ingredientes"}
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {product.ingredients.map((ing) => (
                <span
                  key={ing.en}
                  className="text-[10px] font-medium uppercase tracking-wide text-stone-500 border border-stone-200 px-2 py-0.5"
                >
                  {ing[locale]}
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

          <div className="mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">
              {locale === "en" ? "How to use" : "Cómo usar"}
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">{product.howToUse[locale]}</p>
          </div>

          {product.gift && (
            <div className="mt-8 flex items-center gap-3 bg-earth-600 px-4 py-3.5">
              <span className="text-sm font-bold uppercase tracking-wide text-cream shrink-0">
                {locale === "en" ? "Free gift:" : "Regalo:"}
              </span>
              <span className="text-sm font-medium text-cream">{product.gift[locale]}</span>
            </div>
          )}

          <div className={`flex flex-col gap-4 border-t border-stone-200 pt-8 sm:flex-row sm:items-center sm:justify-between ${product.gift ? "mt-4" : "mt-8"}`}>
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

          <p className="mt-4 text-xs text-stone-400">
            {locale === "en"
              ? "Shipping calculated at checkout · Packed and shipped by us, not a warehouse · Questions? Email us directly."
              : "Envío calculado en el pago · Empacado y enviado por nosotros, no por una bodega · ¿Dudas? Escríbenos directo."}
          </p>

          <TrustBadges locale={locale} theme="light" className="mt-10 border-t border-stone-200 pt-8 sm:grid-cols-1 gap-6" />
        </div>
      </div>

      {/* Reviews — real customer quotes only, no fabricated testimonials */}
      <div className="mx-auto max-w-6xl px-6">
        <div className="border-t border-stone-200 py-10">
          <h2 className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-stone-400 mb-3">
            {locale === "en" ? "Reviews" : "Reseñas"}
          </h2>
          {product.reviews && product.reviews.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-3">
              {product.reviews.map((r, i) => (
                <blockquote key={i} className="bg-cream/60 backdrop-blur-xl border border-stone-200 p-5">
                  <p className="text-sm text-stone-700 leading-relaxed">&ldquo;{r.text}&rdquo;</p>
                  <footer className="mt-3 text-xs font-medium text-stone-400">
                    {r.author}, {r.location}
                  </footer>
                </blockquote>
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-500 max-w-md">
              {locale === "en"
                ? "Real customer reviews are coming soon. We'd rather wait and show you real ones than make them up."
                : "Las reseñas reales de clientes llegan pronto. Preferimos esperar y mostrarte reseñas reales antes que inventarlas."}
            </p>
          )}
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
