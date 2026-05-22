import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, t, type Locale } from "@/lib/i18n";
import { Newsletter } from "@/components/Newsletter";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  return {
    title: t(locale).aboutTitle,
    alternates: {
      canonical: `/${locale}/about/`,
      languages: { en: "/en/about/", es: "/es/about/" },
    },
  };
}

// Draft copy — honest framing of the project; personalize before launch.
const copy: Record<Locale, { title: string; draft: string; body: string[] }> = {
  en: {
    title: "About SmartGrowth",
    draft: "Draft — review and personalize before launch.",
    body: [
      "SmartGrowth is a small, hands-on operation making natural remedies and personal-care products from the plants we grow and harvest ourselves.",
      "We make herbal extracts and tinctures, handmade skincare — creams, body oils and face masks — and natural personal care like sea-salt deodorant. We also grow and process functional mushrooms such as lion's mane into powders and extracts. When a recipe needs an ingredient we can't grow, we source it natural and organic.",
      "Everything is organic, made by hand, in small batches. This is where we share what we make and how we grow it.",
    ],
  },
  es: {
    title: "Sobre SmartGrowth",
    draft: "Borrador — revísalo y personalízalo antes de lanzar.",
    body: [
      "SmartGrowth es un proyecto pequeño y artesanal donde hacemos remedios naturales y productos de cuidado personal con las plantas que cultivamos y cosechamos nosotros mismos.",
      "Hacemos extractos y tinturas herbales, cuidado de la piel hecho a mano — cremas, aceites corporales y mascarillas faciales — y cuidado personal natural como desodorante de sal marina. También cultivamos y procesamos hongos funcionales como el lion's mane en polvos y extractos. Cuando una receta necesita un ingrediente que no podemos cultivar, lo conseguimos natural y orgánico.",
      "Todo es orgánico, hecho a mano y en lotes pequeños. Aquí compartimos lo que hacemos y cómo lo cultivamos.",
    ],
  },
};

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const c = copy[locale];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="mb-6 rounded-lg border border-earth-400/40 bg-earth-500/10 px-3 py-2 text-xs font-semibold text-earth-700">
        ⚠️ {c.draft}
      </p>
      <h1 className="font-display text-3xl font-bold text-forest-950 sm:text-4xl">
        {c.title}
      </h1>
      <div className="prose-sg mt-6">
        {c.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <section className="mt-12">
        <Newsletter locale={locale} variant="panel" />
      </section>
    </div>
  );
}
