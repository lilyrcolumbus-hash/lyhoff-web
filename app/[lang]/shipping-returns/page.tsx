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
  return { title: locale === "en" ? "Shipping & Returns" : "Envíos y Devoluciones" };
}

export default async function ShippingReturnsPage({
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
        {en ? "Shipping & Returns" : "Envíos y Devoluciones"}
      </h1>
      <p className="mt-2 text-xs text-stone-400">
        {en ? "Last updated July 2026" : "Última actualización: julio 2026"}
      </p>

      <div className="prose-sg mt-8">
        <h2>{en ? "Shipping" : "Envíos"}</h2>
        <p>
          {en
            ? "Every order is packed and shipped by us, by hand — not from a warehouse. We ship via USPS from Ohio, USA."
            : "Cada pedido lo empacamos y enviamos nosotros mismos, a mano — no sale de una bodega. Enviamos por USPS desde Ohio, Estados Unidos."}
        </p>
        <ul>
          <li>
            <strong>{en ? "Processing time:" : "Tiempo de procesamiento:"}</strong>{" "}
            {en ? "1–3 business days before your order ships." : "1–3 días hábiles antes de que se envíe tu pedido."}
          </li>
          <li>
            <strong>{en ? "Shipping cost:" : "Costo de envío:"}</strong>{" "}
            {en
              ? "a flat $6.99, or free on orders of $50 or more (calculated at checkout)."
              : "$6.99 fijo, o gratis en pedidos de $50 o más (se calcula en el checkout)."}
          </li>
          <li>
            <strong>{en ? "Where we ship:" : "A dónde enviamos:"}</strong>{" "}
            {en ? "currently the United States only." : "por ahora, solo dentro de Estados Unidos."}
          </li>
          <li>
            <strong>{en ? "Tracking:" : "Rastreo:"}</strong>{" "}
            {en
              ? "you'll get a tracking number by email once your order ships."
              : "te llegará un número de rastreo por correo cuando se envíe tu pedido."}
          </li>
        </ul>

        <h2>{en ? "Returns & Exchanges" : "Devoluciones y Cambios"}</h2>
        <p>
          {en
            ? "We want you to be happy with what you bought. If something isn't right:"
            : "Queremos que estés contento con lo que compraste. Si algo no está bien:"}
        </p>
        <ul>
          <li>
            {en
              ? "Unopened, unused products can be returned within 30 days of delivery for a full refund."
              : "Productos sin abrir y sin usar se pueden devolver dentro de los 30 días después de la entrega, para un reembolso completo."}
          </li>
          <li>
            {en
              ? "For hygiene reasons, we can't accept returns on opened or used skincare/body-care products — if a product doesn't agree with you, email us and we'll help make it right."
              : "Por razones de higiene, no podemos aceptar devoluciones de productos de cuidado de piel/cuerpo abiertos o usados — si un producto no te funcionó, escríbenos y te ayudamos."}
          </li>
          <li>
            {en
              ? "Damaged or wrong item? Email us within 7 days of delivery with a photo and your order number — we'll send a replacement or refund, no return shipping needed."
              : "¿Producto dañado o equivocado? Escríbenos dentro de 7 días de la entrega con una foto y tu número de pedido — te enviamos un reemplazo o reembolso, sin necesidad de devolver el envío."}
          </li>
          <li>
            {en
              ? "Refunds are issued to your original payment method within 5–10 business days of us receiving the return."
              : "Los reembolsos se procesan a tu método de pago original en 5–10 días hábiles después de recibir la devolución."}
          </li>
        </ul>

        <h2>{en ? "Questions" : "Preguntas"}</h2>
        <p>
          {en ? "Email us at " : "Escríbenos a "}
          <a href="mailto:lyhoffllc.info@gmail.com">lyhoffllc.info@gmail.com</a>
          {en ? " — a real person (us) will get back to you." : " — te responde una persona real (nosotros)."}
        </p>
      </div>
    </div>
  );
}
