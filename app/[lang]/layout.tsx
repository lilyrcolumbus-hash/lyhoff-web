import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  isLocale,
  locales,
  PINTEREST_DOMAIN_VERIFY,
  SITE_NAME,
  SITE_URL,
  t,
  type Locale,
} from "@/lib/i18n";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

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
  const dict = t(locale);
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${SITE_NAME} — ${dict.tagline}`,
      template: `%s · ${SITE_NAME}`,
    },
    description: dict.heroSubtitle,
    alternates: {
      canonical: `/${locale}/`,
      languages: { en: "/en/", es: "/es/" },
    },
    openGraph: {
      siteName: SITE_NAME,
      locale: locale === "en" ? "en_US" : "es_ES",
      type: "website",
    },
    // Pinterest domain verification (Rich Pins + Pinterest analytics). Renders
    // <meta name="p:domain_verify" content="..."> only when the code is set.
    ...(PINTEREST_DOMAIN_VERIFY
      ? { other: { "p:domain_verify": PINTEREST_DOMAIN_VERIFY } }
      : {}),
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <html
      lang={lang}
      className={`${fraunces.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <Header locale={lang} />
        <main className="flex-1">{children}</main>
        <Footer locale={lang} />
      </body>
    </html>
  );
}
