import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { products } from "@/lib/products";
import { getProductImageUrl } from "@/lib/product-images";
import { ProductQuiz } from "@/components/ProductQuiz";

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
    title: locale === "en" ? "Find your product" : "Encuentra tu producto",
    alternates: {
      canonical: `/${locale}/quiz/`,
      languages: { en: "/en/quiz/", es: "/es/quiz/" },
    },
  };
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;

  const imageMap = Object.fromEntries(
    products.map((p) => [p.slug, getProductImageUrl(p.slug, p.image)]),
  );

  return (
    <div className="bg-cream">
      <div className="mx-auto max-w-3xl px-6 pt-20 pb-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-earth-600 mb-4">
          {locale === "en" ? "Not sure where to start?" : "¿No sabes por dónde empezar?"}
        </p>
        <h1 className="font-display text-4xl font-bold text-forest-950 md:text-5xl">
          {locale === "en" ? "Find your product" : "Encuentra tu producto"}
        </h1>
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-24">
        <ProductQuiz locale={locale} imageMap={imageMap} />
      </div>
    </div>
  );
}
