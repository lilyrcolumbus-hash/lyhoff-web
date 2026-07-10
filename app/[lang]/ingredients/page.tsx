import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales, SITE_NAME, type Locale } from "@/lib/i18n";
import { ingredients } from "@/lib/ingredients";
import { IngredientCard, type IngredientIcon } from "@/components/IngredientCard";

const ICONS: IngredientIcon[] = ["jar", "droplet", "leaf", "sprout", "leaf", "droplet", "droplet", "jar"];

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
      <div className="mx-auto max-w-3xl px-6 pt-20 pb-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-earth-600 mb-4">
          {locale === "en" ? "Full transparency" : "Transparencia total"}
        </p>
        <h1 className="font-display text-5xl font-bold text-forest-950 md:text-6xl">
          {locale === "en" ? "What's actually in it" : "Lo que de verdad lleva"}
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-base text-stone-500 leading-relaxed">
          {locale === "en"
            ? "Every ingredient we use, in plain language. No proprietary blends hiding what's really inside — tap a card to flip it."
            : "Cada ingrediente que usamos, en palabras simples. Sin mezclas \"propietarias\" que escondan lo que realmente lleva — toca una tarjeta para voltearla."}
        </p>
      </div>

      <div className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ingredients.map((ing, i) => (
            <IngredientCard
              key={ing.slug}
              ingredient={ing}
              icon={ICONS[i % ICONS.length]}
              locale={locale}
              index={i}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
