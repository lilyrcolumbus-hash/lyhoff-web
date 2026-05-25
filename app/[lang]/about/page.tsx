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
      "SmartGrowth began with a simple belief: that what you put on your body and in your kitchen should be natural, honest, and free of synthetic chemicals.",
      "Frustrated by how much of what's sold today is full of additives, we chose a different path — to grow our own and create what we use, with real plants and a great deal of care.",
      "Here we share that journey: what we grow, what we make, and what we've learned along the way. Everything organic, everything intentional. No chemicals, no shortcuts — just good things, done right.",
    ],
  },
  es: {
    title: "Sobre SmartGrowth",
    draft: "Borrador — revísalo y personalízalo antes de lanzar.",
    body: [
      "SmartGrowth nació de una idea simple: que lo que pones en tu cuerpo y en tu cocina debería ser natural, honesto y libre de químicos sintéticos.",
      "Cansados de cuánto de lo que se vende hoy está lleno de aditivos, elegimos otro camino — cultivar lo nuestro y crear lo que usamos, con plantas reales y mucho cuidado.",
      "Aquí compartimos ese camino: lo que cultivamos, lo que creamos, y lo que hemos aprendido. Todo orgánico, todo con intención. Sin químicos, sin atajos — solo cosas buenas, bien hechas.",
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
