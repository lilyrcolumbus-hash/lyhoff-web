import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, t, type Locale } from "@/lib/i18n";
import { Newsletter } from "@/components/Newsletter";
import { PlaceholderPhoto } from "@/components/PlaceholderPhoto";

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
    title: "About LYHOFF",
    draft: "Draft — review and personalize before launch.",
    body: [
      "LYHOFF started with a simple belief: what we put on our skin and use in our home should be natural, honest, and free of synthetic chemicals.",
      "We're a bilingual couple who grow much of what we use ourselves — then turn that harvest into what we make: tallow skincare, hair care, and home essentials. Every formula is small-batch, and every one of them we use on ourselves first, every day, before it ever reaches a jar for sale.",
      "No synthetic fillers, no shortcuts, no ingredients we can't pronounce. Just what the garden gives us, made with care — the same way people did before store shelves were full of chemicals.",
    ],
  },
  es: {
    title: "Sobre LYHOFF",
    draft: "Borrador — revísalo y personalízalo antes de lanzar.",
    body: [
      "LYHOFF nació de una idea simple: lo que ponemos en nuestra piel y usamos en casa debería ser natural, honesto y libre de químicos sintéticos.",
      "Somos una pareja bilingüe que cultiva gran parte de lo que usa — y convierte esa cosecha en lo que hacemos: skincare de sebo, cuidado capilar y esenciales para el hogar. Cada fórmula es en pequeños lotes, y cada una la usamos nosotros primero, a diario, antes de que llegue a un frasco a la venta.",
      "Sin rellenos sintéticos, sin atajos, sin ingredientes que no podamos pronunciar. Solo lo que da el huerto, hecho con cuidado — como se hacía antes de que las tiendas se llenaran de químicos.",
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
      <PlaceholderPhoto
        ratio="portrait"
        locale={locale}
        className="mt-8 max-w-sm"
        note={{
          en: "Couple portrait / founders photo",
          es: "Foto de la pareja / fundadores",
        }}
      />
      <div className="prose-sg mt-8">
        {c.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <PlaceholderPhoto
          ratio="square"
          locale={locale}
          note={{
            en: "Hands making a product",
            es: "Manos elaborando un producto",
          }}
        />
        <PlaceholderPhoto
          ratio="square"
          locale={locale}
          note={{
            en: "Garden or harvest shot",
            es: "Foto del huerto o la cosecha",
          }}
        />
      </div>
      <section className="mt-12">
        <Newsletter locale={locale} variant="panel" />
      </section>
    </div>
  );
}
