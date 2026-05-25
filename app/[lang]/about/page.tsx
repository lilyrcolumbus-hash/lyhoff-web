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
      "SmartGrowth is the two of us making everything we use at home — naturally, by hand, from what we grow.",
      "It started with a simple decision: we didn't want the chemicals packed into so much of what's sold here, so we learned to make it ourselves. We grow our own food and herbs, then turn the harvest into meals, ferments and preserves (canning), and our own skin, hair and herbal care — with our own tools and plenty of trial and error.",
      "This is where we share all of it: what we grow, what we cook and put up, and what we make for our bodies — what worked, what didn't, and how you can do it too. Real, organic, honest. No chemicals, no perfect homestead — just the good stuff, made at home.",
    ],
  },
  es: {
    title: "Sobre SmartGrowth",
    draft: "Borrador — revísalo y personalízalo antes de lanzar.",
    body: [
      "SmartGrowth somos los dos haciendo en casa todo lo que usamos — natural, a mano, de lo que cultivamos.",
      "Empezó con una decisión simple: no queríamos los químicos que traen tantas cosas que se venden aquí, así que aprendimos a hacerlo nosotros mismos. Cultivamos nuestra comida y hierbas, y convertimos la cosecha en comida, fermentos y conservas (canning), y nuestro propio cuidado de piel, cabello y remedios — con nuestras propias herramientas y mucho ensayo y error.",
      "Aquí compartimos todo: lo que cultivamos, lo que cocinamos y conservamos, y lo que hacemos para el cuerpo — lo que funcionó, lo que no, y cómo tú también puedes. Real, orgánico, honesto. Sin químicos, sin finca perfecta — solo lo bueno, hecho en casa.",
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
