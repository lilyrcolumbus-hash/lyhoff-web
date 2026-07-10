import { notFound } from "next/navigation";
import { isLocale, locales } from "@/lib/i18n";
import { CheckoutSuccessClient } from "@/components/CheckoutSuccessClient";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function CheckoutSuccessPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <CheckoutSuccessClient locale={lang} />;
}
