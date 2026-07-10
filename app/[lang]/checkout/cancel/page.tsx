import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/lib/i18n";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function CheckoutCancelPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;

  return (
    <div className="mx-auto max-w-lg px-6 py-24 text-center">
      <h1 className="font-display text-3xl font-bold text-forest-950">
        {locale === "en" ? "Your bag is still here" : "Tu bolsa sigue aquí"}
      </h1>
      <p className="mt-4 text-base text-stone-600 leading-relaxed">
        {locale === "en"
          ? "Checkout was cancelled — nothing was charged. Your items are still in your bag whenever you're ready."
          : "El pago fue cancelado — no se cobró nada. Tus productos siguen en tu bolsa cuando quieras continuar."}
      </p>
      <Link
        href={`/${locale}/cart/`}
        className="mt-8 inline-flex items-center rounded-full bg-forest-950 px-7 py-3.5 text-sm font-semibold text-cream transition hover:bg-forest-800"
      >
        {locale === "en" ? "Back to bag" : "Volver a la bolsa"} →
      </Link>
    </div>
  );
}
