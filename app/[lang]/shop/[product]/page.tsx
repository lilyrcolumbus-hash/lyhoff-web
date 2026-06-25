import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  isLocale,
  locales,
  SITE_NAME,
  SITE_URL,
  t,
  type Locale,
} from "@/lib/i18n";
import {
  getProduct,
  getProductSlugs,
  getProductLine,
  getRelatedProducts,
  amazonLink,
  BRAND,
  type Product,
} from "@/lib/products";
import { ProductImage } from "@/components/ProductImage";
import { ProductCard } from "@/components/ProductCard";
import { BuyButtons } from "@/components/BuyButtons";
import { Newsletter } from "@/components/Newsletter";

export const dynamicParams = false;

export function generateStaticParams() {
  const slugs = getProductSlugs();
  const params = locales.flatMap((lang) =>
    slugs.map((product) => ({ lang, product })),
  );
  // `output: export` needs at least one path; emit a placeholder that 404s
  // if the catalog is ever empty.
  return params.length > 0 ? params : [{ lang: "en", product: "__none__" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; product: string }>;
}): Promise<Metadata> {
  const { lang, product: slug } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const product = getProduct(slug);
  if (!product) return {};

  const title = `${product.name[locale]} — ${BRAND}`;
  return {
    title,
    description: product.tagline[locale],
    alternates: {
      canonical: `/${locale}/shop/${slug}/`,
      languages: {
        en: `/en/shop/${slug}/`,
        es: `/es/shop/${slug}/`,
      },
    },
    openGraph: {
      type: "website",
      title,
      description: product.description[locale],
      url: `${SITE_URL}/${locale}/shop/${slug}/`,
      siteName: SITE_NAME,
      locale: locale === "en" ? "en_US" : "es_ES",
      images: product.image ? [{ url: product.image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: product.tagline[locale],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ lang: string; product: string }>;
}) {
  const { lang, product: slug } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const product: Product | undefined = getProduct(slug);
  if (!product) notFound();

  const dict = t(locale);
  const line = getProductLine(product.line);
  const related = getRelatedProducts(product);
  const amazon = amazonLink(product);
  const url = `${SITE_URL}/${locale}/shop/${slug}/`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name[locale],
    description: product.description[locale],
    brand: { "@type": "Brand", name: BRAND },
    category: line?.label[locale],
    inLanguage: locale,
    ...(product.image
      ? {
          image: product.image.startsWith("http")
            ? product.image
            : SITE_URL + product.image,
        }
      : {}),
    offers: {
      "@type": "Offer",
      url: amazon,
      availability: "https://schema.org/InStock",
      ...(product.price
        ? { price: product.price.replace(/[^0-9.]/g, ""), priceCurrency: "USD" }
        : {}),
    },
    mainEntityOfPage: url,
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1 text-xs text-stone-500">
        <Link href={`/${locale}/shop/`} className="hover:text-clay-700">
          {BRAND}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-clay-700">{line?.label[locale]}</span>
      </nav>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        {/* Image */}
        <div className="overflow-hidden rounded-3xl border border-clay-100">
          <ProductImage
            src={product.image}
            alt={product.name[locale]}
            line={product.line}
            ratio="square"
          />
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-clay-600">
            <span aria-hidden>{line?.emoji}</span>
            <span>{line?.label[locale]}</span>
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-clay-900 sm:text-4xl">
            {product.name[locale]}
          </h1>
          <p className="mt-3 text-lg text-stone-700">
            {product.tagline[locale]}
          </p>

          <div className="mt-4 flex items-center gap-4">
            {product.price && (
              <span className="font-display text-2xl font-semibold text-clay-800">
                {product.price}
              </span>
            )}
            {product.size && (
              <span className="text-sm text-stone-500">
                {product.size[locale]}
              </span>
            )}
          </div>

          <div className="mt-6">
            <BuyButtons product={product} locale={locale} />
            <p className="mt-2 text-xs text-stone-500">{dict.shopBuyNote}</p>
          </div>

          {/* Benefits */}
          <div className="mt-8">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-clay-700">
              {dict.shopBenefits}
            </h2>
            <ul className="mt-3 space-y-2">
              {product.benefits[locale].map((b) => (
                <li key={b} className="flex items-start gap-2 text-stone-700">
                  <span aria-hidden className="mt-1 text-clay-500">
                    ✓
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Story + ingredients */}
      <section className="mt-12 grid gap-8 rounded-3xl bg-clay-50 px-6 py-8 sm:px-10 md:grid-cols-2">
        <div>
          <h2 className="font-display text-xl font-semibold text-clay-900">
            {product.name[locale]}
          </h2>
          <p className="mt-3 text-stone-700">{product.description[locale]}</p>
        </div>
        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-clay-700">
            {dict.shopIngredients}
          </h2>
          <p className="mt-3 text-stone-700">{product.ingredients[locale]}</p>
        </div>
      </section>

      {/* Buy again CTA */}
      <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-clay-100 bg-white px-6 py-8 text-center">
        <p className="font-display text-lg font-semibold text-clay-900">
          {product.tagline[locale]}
        </p>
        <BuyButtons product={product} locale={locale} />
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-12">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-2xl font-bold text-clay-900">
              {dict.shopRelated}
            </h2>
            <Link
              href={`/${locale}/shop/`}
              className="text-sm font-medium text-clay-700 hover:underline"
            >
              {dict.shopBackToShop} →
            </Link>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} locale={locale} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-12">
        <Newsletter locale={locale} variant="inline" />
      </section>
    </div>
  );
}
