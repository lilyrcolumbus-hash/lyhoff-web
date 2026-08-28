import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageBlocks } from "@/components/PageBlocks";
import { getPage, pageTitle, pages } from "@/lib/pages";
import { isLocale, locales, SITE_NAME, type Locale } from "@/lib/i18n";

// Static export: every page has to be listed up front, and anything not listed
// 404s rather than being rendered on demand.
export const dynamicParams = false;

export async function generateStaticParams() {
  // A site with no pages of its own still has to emit something, or the export
  // fails on a route with zero paths. This one 404s, which is correct.
  const slugs = pages.length > 0 ? pages.map((page) => page.slug) : ["__none__"];
  return locales.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const page = getPage(slug);
  if (!page || !isLocale(lang)) return { title: SITE_NAME };
  const locale: Locale = lang;

  return {
    title: page.seo?.title?.[locale]?.trim() || pageTitle(page, locale),
    description: page.seo?.description?.[locale]?.trim(),
  };
}

export default async function ComposedPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const page = getPage(slug);
  if (!page) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <h1 className="font-display text-3xl font-bold text-forest-950 sm:text-4xl">
        {pageTitle(page, lang)}
      </h1>
      <PageBlocks blocks={page.blocks} locale={lang} />
    </main>
  );
}
