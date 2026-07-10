import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, locales, SITE_NAME, type Locale } from "@/lib/i18n";
import { ingredients } from "@/lib/ingredients";
import { getProduct } from "@/lib/products";

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
  return {
    title: locale === "en" ? `Ingredients — ${SITE_NAME}` : `Ingredientes — ${SITE_NAME}`,
    alternates: {
      canonical: `/${locale}/ingredients/`,
      languages: { en: "/en/ingredients/", es: "/es/ingredients/" },
    },
  };
}

export default async function IngredientsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;

  return (
    <div className="bg-cream">
      <div className="mx-auto max-w-3xl px-6 pt-20 pb-16">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-earth-600 mb-4">
          {locale === "en" ? "Full transparency" : "Transparencia total"}
        </p>
        <h1 className="font-display text-5xl font-bold text-forest-950 md:text-6xl">
          {locale === "en" ? "What's actually in it" : "Lo que de verdad lleva"}
        </h1>
        <p className="mt-5 text-base text-stone-500 leading-relaxed">
          {locale === "en"
            ? "Every ingredient we use, in plain language — what it is, why it's in the jar, and which products it's in. No proprietary blends hiding what's really inside."
            : "Cada ingrediente que usamos, en palabras simples — qué es, por qué está en el frasco, y en qué productos lo encuentras. Sin mezclas \"propietarias\" que escondan lo que realmente lleva."}
        </p>
      </div>

      <div className="border-t border-stone-200" />

      <div className="mx-auto max-w-3xl px-6 py-16">
        <ul className="flex flex-col divide-y divide-stone-200">
          {ingredients.map((ing) => (
            <li key={ing.slug} className="py-8">
              <h2 className="font-display text-xl font-bold text-forest-950">
                {ing.name[locale]}
              </h2>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                {ing.blurb[locale]}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {ing.usedIn.map((slug) => {
                  const product = getProduct(slug);
                  if (!product) return null;
                  return (
                    <Link
                      key={slug}
                      href={`/${locale}/products/${slug}/`}
                      className="text-[10px] font-medium uppercase tracking-wide text-earth-700 border border-earth-300 px-2 py-0.5 hover:bg-earth-50 transition-colors"
                    >
                      {product.name[locale]}
                    </Link>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
