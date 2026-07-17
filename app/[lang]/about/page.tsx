import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, t, type Locale } from "@/lib/i18n";
import { Newsletter } from "@/components/Newsletter";
import { StockPhoto } from "@/components/StockPhoto";
import { StockVideo } from "@/components/StockVideo";
import { FullBleedVideo } from "@/components/FullBleedVideo";
import { Blob } from "@/components/illustrations";

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

const copy: Record<Locale, { title: string; body: string[] }> = {
  en: {
    title: "About LYHOFF",
    body: [
      "Most store shelves are full of products with ingredients you can't pronounce — synthetic fillers, fragrances, preservatives nobody asked for. We got tired of trusting labels we couldn't understand, so we started making our own.",
      "We're a bilingual couple who grow much of what we use ourselves — then process that harvest in our own certified laboratory, with the same care and precision as any professional formulator. The difference is what we leave out: no synthetic fillers, no shortcuts, no ingredients we can't pronounce. Just nature, handled with real equipment and real standards.",
      "Every formula is small-batch, and every one of them we use on ourselves first, every day, before it ever reaches a jar for sale.",
    ],
  },
  es: {
    title: "Sobre LYHOFF",
    body: [
      "La mayoría de los productos de tienda están llenos de ingredientes que no podés pronunciar — rellenos sintéticos, fragancias, conservantes que nadie pidió. Nos cansamos de confiar en etiquetas que no entendíamos, así que empezamos a hacer los nuestros.",
      "Somos una pareja bilingüe que cultiva gran parte de lo que usa — y procesa esa cosecha en nuestro propio laboratorio certificado, con el mismo cuidado y precisión que cualquier formulador profesional. La diferencia está en lo que dejamos afuera: sin rellenos sintéticos, sin atajos, sin ingredientes que no podamos pronunciar. Solo naturaleza, tratada con equipo real y estándares reales.",
      "Cada fórmula es en pequeños lotes, y cada una la usamos nosotros primero, a diario, antes de que llegue a un frasco a la venta.",
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
    <div>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl font-bold text-forest-950 sm:text-4xl">
          {c.title}
        </h1>
        <div className="relative mt-8 max-w-sm">
          <Blob className="pointer-events-none absolute -bottom-8 -left-8 h-48 w-48 text-forest-100 -z-10" />
          <StockPhoto
            ratio="portrait"
            rounded
            src="https://images.unsplash.com/photo-1651592280676-a01949b60cd7?w=700&h=875&q=80&auto=format&fit=crop"
            alt={locale === "en" ? "Hands in the garden" : "Manos en el huerto"}
          />
        </div>
        <div className="prose-sg mt-8">
          {c.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>

      <FullBleedVideo
        src="/videos/mixing.mp4"
        height="h-[45vh] md:h-[60vh]"
        heading={
          locale === "en"
            ? "Real lab. Real standards. Zero shortcuts."
            : "Laboratorio real. Estándares reales. Sin atajos."
        }
        sub={
          locale === "en"
            ? "Every jar we sell, we processed ourselves — and use ourselves."
            : "Cada frasco que vendemos, lo procesamos nosotros — y lo usamos nosotros."
        }
      />

      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="grid gap-4 sm:grid-cols-2">
          <StockPhoto
            ratio="square"
            rounded
            src="https://images.unsplash.com/photo-1709666414115-47ecd5143293?w=600&h=600&q=80&auto=format&fit=crop"
            alt={locale === "en" ? "Bottled and labeled in small batches" : "Envasado y etiquetado en pequeños lotes"}
          />
          <StockVideo ratio="square" rounded src="/videos/soil.mp4" />
        </div>
        <section className="mt-12">
          <Newsletter locale={locale} variant="panel" />
        </section>
      </div>
    </div>
  );
}
