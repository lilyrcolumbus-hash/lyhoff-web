import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, t, type Locale } from "@/lib/i18n";
import { activeProducts, dedupeVariants, productsByCategory } from "@/lib/products";
import { getProductImageUrl } from "@/lib/product-images";
import { ProductCard } from "@/components/ProductCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  return {
    title: locale === "en" ? "Shop" : "Tienda",
    alternates: {
      canonical: `/${locale}/products/`,
      languages: { en: "/en/products/", es: "/es/products/" },
    },
  };
}

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;

  const bodycare = dedupeVariants(productsByCategory("bodycare"));
  const hair = dedupeVariants(productsByCategory("hair"));
  const home = dedupeVariants(productsByCategory("home"));
  const hoff = dedupeVariants(productsByCategory("hoff"));

  const sections = [
    {
      key: "bodycare",
      title: { en: "Skin & Body", es: "Piel y Cuerpo" },
      sub: { en: "Small-batch tallow skincare, formulated and tested on ourselves.", es: "Skincare de sebo elaborado en pequeños lotes, formulado y probado en nosotros." },
      products: bodycare,
    },
    {
      key: "hair",
      title: { en: "Hair Care", es: "Cuidado Capilar" },
      sub: { en: "Chemical-free hair treatments that work with your scalp, not against it.", es: "Tratamientos capilares sin químicos que trabajan con tu cuero cabelludo." },
      products: hair,
    },
    {
      key: "home",
      title: { en: "Home & Garden", es: "Hogar y Jardín" },
      sub: { en: "Natural solutions for your garden and outdoor space.", es: "Soluciones naturales para tu jardín y exterior." },
      products: home,
    },
    {
      key: "hoff",
      title: { en: "HOFF — Health", es: "HOFF — Salud" },
      sub: { en: "Pharmaceutical grade supplements and precision formulas.", es: "Suplementos grado farmacéutico y fórmulas de precisión." },
      products: hoff,
    },
  ].filter((s) => s.products.length > 0);

  return (
    <div className="bg-cream">
      {/* Header */}
      <div className="mx-auto max-w-6xl px-6 pt-20 pb-14">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-earth-600 mb-4">
          {locale === "en" ? "What we make" : "Lo que hacemos"}
        </p>
        <h1 className="font-display text-5xl font-bold text-forest-950 max-w-lg md:text-6xl">
          {locale === "en" ? "Our Products" : "Nuestros Productos"}
        </h1>
        <p className="mt-5 max-w-lg text-base text-stone-500 leading-relaxed">
          {locale === "en"
            ? "Every product in this shop is made by us, used by us, and sold because it works. No synthetic chemicals. No artificial fillers. Real ingredients only."
            : "Cada producto en esta tienda lo hacemos nosotros, lo usamos nosotros, y lo vendemos porque funciona. Sin químicos sintéticos. Sin rellenos artificiales."}
        </p>
        <p className="mt-4 text-sm text-stone-400">
          {locale === "en"
            ? `${activeProducts.length} products, shipped by us`
            : `${activeProducts.length} productos, enviados por nosotros`}
        </p>
        <Link
          href={`/${locale}/quiz/`}
          className="mt-6 inline-flex items-center rounded-full border border-earth-400 px-6 py-2.5 text-xs font-semibold text-earth-700 transition hover:bg-earth-50"
        >
          {locale === "en" ? "Not sure where to start? Take the quiz →" : "¿No sabes por dónde empezar? Haz el quiz →"}
        </Link>
      </div>

      <div className="border-t border-stone-200" />

      {/* Sections */}
      {sections.map((section) => (
        <section key={section.key} className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-10">
            <h2 className="font-display text-2xl font-bold text-forest-950">
              {section.title[locale]}
            </h2>
            <p className="mt-2 text-sm text-stone-500 max-w-lg">
              {section.sub[locale]}
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {section.products.map((product, i) => {
              const image = getProductImageUrl(product.slug, product.image);
              return (
                <ProductCard
                  key={product.asin}
                  product={product}
                  locale={locale}
                  index={i}
                  imageUrl={image.url}
                  isPlaceholderImage={image.isPlaceholder}
                />
              );
            })}
          </div>
          <div className="mt-10 border-b border-stone-100" />
        </section>
      ))}

      {/* Trust bar */}
      <div className="bg-forest-950 py-14">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-4">
            {locale === "en" ? "Secure checkout, packed by us" : "Pago seguro, empacado por nosotros"}
          </p>
          <p className="mx-auto max-w-sm text-sm text-stone-400">
            {locale === "en"
              ? "Every order ships from our own hands, no middleman."
              : "Cada pedido sale de nuestras propias manos, sin intermediarios."}
          </p>
          <a
            href="https://www.etsy.com/shop/lyhoff"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-3 rounded-full border border-stone-700 px-8 py-3.5 text-sm font-semibold text-cream hover:border-stone-500 hover:bg-forest-800 transition"
          >
            {locale === "en" ? "Also on Etsy" : "También en Etsy"}
          </a>
        </div>
      </div>
    </div>
  );
}
