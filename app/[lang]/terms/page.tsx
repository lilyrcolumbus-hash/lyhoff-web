import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/lib/i18n";

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
  return { title: locale === "en" ? "Terms of Service" : "Términos de Servicio" };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const en = locale === "en";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-display text-3xl font-bold text-forest-950 sm:text-4xl">
        {en ? "Terms of Service" : "Términos de Servicio"}
      </h1>
      <p className="mt-2 text-xs text-stone-400">
        {en ? "Last updated July 2026" : "Última actualización: julio 2026"}
      </p>

      <div className="prose-sg mt-8">
        <p>
          {en
            ? "By using lyhoff-web.lilyrcolumbus.workers.dev and buying from us, you agree to these terms. We're a small, family-run business — these are written in plain language on purpose."
            : "Al usar lyhoff-web.lilyrcolumbus.workers.dev y comprar con nosotros, aceptas estos términos. Somos un negocio familiar pequeño — están escritos en lenguaje simple a propósito."}
        </p>

        <h2>{en ? "Orders & payment" : "Pedidos y pago"}</h2>
        <p>
          {en
            ? "Prices are listed in US dollars. Payment is processed securely by Stripe at checkout. We reserve the right to cancel and refund an order if we're out of stock or something looks fraudulent."
            : "Los precios están en dólares estadounidenses. El pago se procesa de forma segura con Stripe al finalizar la compra. Nos reservamos el derecho de cancelar y reembolsar un pedido si no tenemos stock o algo parece fraudulento."}
        </p>

        <h2>{en ? "Product use" : "Uso del producto"}</h2>
        <p>
          {en
            ? "Our products are made in small batches with natural ingredients. Check the ingredient list on each product page before buying if you have allergies. Discontinue use and consult a doctor if irritation occurs."
            : "Nuestros productos se hacen en pequeños lotes con ingredientes naturales. Revisa la lista de ingredientes en cada página de producto antes de comprar si tienes alergias. Suspende el uso y consulta a un médico si hay irritación."}
        </p>

        <h2>{en ? "Intellectual property" : "Propiedad intelectual"}</h2>
        <p>
          {en
            ? "All text, photos, and the LYHOFF name/logo on this site belong to LYHOFF LLC. Please don't copy or reuse them without asking."
            : "Todo el texto, fotos, y el nombre/logo de LYHOFF en este sitio pertenecen a LYHOFF LLC. Por favor no los copies ni reutilices sin permiso."}
        </p>

        <h2>{en ? "Limitation of liability" : "Limitación de responsabilidad"}</h2>
        <p>
          {en
            ? "We do our best to describe our products accurately, but we're not liable for indirect or incidental damages from using them. Our liability is limited to the amount you paid for the product."
            : "Hacemos lo posible por describir nuestros productos con precisión, pero no somos responsables por daños indirectos o incidentales derivados de su uso. Nuestra responsabilidad se limita al monto que pagaste por el producto."}
        </p>

        <h2>{en ? "Governing law" : "Ley aplicable"}</h2>
        <p>
          {en
            ? "These terms are governed by the laws of the State of Ohio, USA."
            : "Estos términos se rigen por las leyes del Estado de Ohio, Estados Unidos."}
        </p>

        <h2>{en ? "Questions" : "Preguntas"}</h2>
        <p>
          {en ? "Email us at " : "Escríbenos a "}
          <a href="mailto:lyhoffllc.info@gmail.com">lyhoffllc.info@gmail.com</a>.
        </p>
      </div>
    </div>
  );
}
