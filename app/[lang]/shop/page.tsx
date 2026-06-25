import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales, SITE_NAME, SITE_URL, t, type Locale } from "@/lib/i18n";
import { products, productLines, getProductsByLine, BRAND } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { Newsletter } from "@/components/Newsletter";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const dict = t(locale);
  return {
    title: `${BRAND} — ${dict.shopTitle}`,
    description: dict.shopSubtitle,
    alternates: {
      canonical: `/${locale}/shop/`,
      languages: { en: "/en/shop/", es: "/es/shop/" },
    },
    openGraph: {
      type: "website",
      title: `${BRAND} — ${dict.shopTitle}`,
      description: dict.shopSubtitle,
      url: `${SITE_URL}/${locale}/shop/`,
      siteName: SITE_NAME,
      locale: locale === "en" ? "en_US" : "es_ES",
    },
  };
}

export default async function ShopPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const dict = t(locale);

  return (
    <>
      {/* Brand hero — warm clay/cream */}
      <section className="bg-gradient-to-b from-clay-50 to-cream">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:py-24">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-clay-600">
            {dict.shopKicker}
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.1] text-clay-900 sm:text-5xl">
            {BRAND}
          </h1>
          <p className="mt-4 font-display text-xl text-clay-800 sm:text-2xl">
            {dict.shopTitle}
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-stone-600">
            {dict.shopSubtitle}
          </p>
          <div className="mt-8 flex justify-center">
            <a
              href="#products"
              className="rounded-full bg-clay-600 px-6 py-3 text-sm font-semibold text-cream transition hover:bg-clay-700"
            >
              {dict.shopCta}
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4">
        {/* Product lines */}
        <section id="products" className="scroll-mt-20 py-12">
          <h2 className="font-display text-2xl font-bold text-clay-900">
            {dict.shopWhatWeMake}
          </h2>

          {productLines.map((line) => {
            const items = getProductsByLine(line.slug);
            if (items.length === 0) return null;
            return (
              <div key={line.slug} className="mt-8">
                <div className="flex items-baseline gap-3">
                  <span aria-hidden className="text-2xl">
                    {line.emoji}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-clay-900">
                      {line.label[locale]}
                    </h3>
                    <p className="text-sm text-stone-600">{line.blurb[locale]}</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((p) => (
                    <ProductCard key={p.slug} product={p} locale={locale} />
                  ))}
                </div>
              </div>
            );
          })}

          {products.length === 0 && (
            <p className="mt-6 text-stone-600">{dict.shopComingSoon}</p>
          )}
        </section>

        {/* Brand promise strip */}
        <section className="my-8 rounded-3xl bg-clay-50 px-6 py-10 text-center sm:px-10">
          <h2 className="font-display text-2xl font-bold text-clay-900">
            {dict.shopWhyTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-stone-700">
            {dict.shopWhyBody}
          </p>
        </section>

        {/* Newsletter */}
        <section id="newsletter" className="scroll-mt-20 py-12">
          <Newsletter locale={locale} variant="panel" />
        </section>
      </div>
    </>
  );
}
