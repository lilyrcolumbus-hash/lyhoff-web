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
  return { title: locale === "en" ? "Privacy Policy" : "Política de Privacidad" };
}

export default async function PrivacyPage({
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
        {en ? "Privacy Policy" : "Política de Privacidad"}
      </h1>
      <p className="mt-2 text-xs text-stone-400">
        {en ? "Last updated July 2026" : "Última actualización: julio 2026"}
      </p>

      <div className="prose-sg mt-8">
        <p>
          {en
            ? "LYHOFF LLC (\"we\", \"us\") respects your privacy. This page explains what information we collect on this site, why, and what we do with it."
            : "LYHOFF LLC (\"nosotros\") respeta tu privacidad. Esta página explica qué información recopilamos en este sitio, por qué, y qué hacemos con ella."}
        </p>

        <h2>{en ? "What we collect" : "Qué recopilamos"}</h2>
        <ul>
          <li>
            <strong>{en ? "Newsletter signup:" : "Suscripción al boletín:"}</strong>{" "}
            {en
              ? "your email address, stored in our own database (Supabase) so we can send you updates. We never sell or share this list."
              : "tu correo electrónico, guardado en nuestra propia base de datos (Supabase) para enviarte novedades. Nunca vendemos ni compartimos esta lista."}
          </li>
          <li>
            <strong>{en ? "Orders:" : "Pedidos:"}</strong>{" "}
            {en
              ? "when you check out, your name, shipping address, and payment details are collected and processed directly by Stripe, our payment processor — we never see or store your full card number."
              : "cuando pagas, tu nombre, dirección de envío y datos de pago los recibe y procesa directamente Stripe, nuestro procesador de pagos — nosotros nunca vemos ni guardamos tu número de tarjeta completo."}
          </li>
          <li>
            <strong>{en ? "Shopping bag:" : "Bolsa de compras:"}</strong>{" "}
            {en
              ? "the items in your cart are saved in your own browser (localStorage) — not sent to us until you check out."
              : "los productos en tu bolsa se guardan en tu propio navegador (localStorage) — no nos llegan hasta que completas el pago."}
          </li>
        </ul>

        <h2>{en ? "How we use it" : "Cómo lo usamos"}</h2>
        <p>
          {en
            ? "To fulfill and ship your orders, respond to your questions, and — only if you subscribe — send our newsletter. That's it."
            : "Para preparar y enviar tus pedidos, responder tus preguntas, y — solo si te suscribes — enviarte nuestro boletín. Eso es todo."}
        </p>

        <h2>{en ? "Third parties" : "Terceros"}</h2>
        <p>
          {en
            ? "We use Stripe to process payments and Supabase to store our newsletter list. We don't use advertising trackers or sell your data to anyone."
            : "Usamos Stripe para procesar pagos y Supabase para guardar nuestra lista de correo. No usamos rastreadores publicitarios ni vendemos tus datos a nadie."}
        </p>

        <h2>{en ? "Your rights" : "Tus derechos"}</h2>
        <p>
          {en
            ? "You can unsubscribe from our newsletter at any time (link in every email), or email us to request that we delete your data."
            : "Puedes cancelar tu suscripción al boletín cuando quieras (link en cada correo), o escribirnos para pedir que borremos tus datos."}
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
