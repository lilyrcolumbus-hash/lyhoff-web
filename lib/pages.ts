import generated from "./pages.generated.json";
import type { Locale } from "@/lib/i18n";

/**
 * The blocks a page can be made of.
 *
 * A fixed set, on purpose. A code editor in the panel would let one syntax
 * error fail the whole build and publish nothing at all — Shopify can afford
 * one because a broken template there ruins one page, not the site. These
 * cover what a shop page actually needs, and none of them can break a build.
 */
export type Block =
  | { type: "heading"; text: { en: string; es: string } }
  | { type: "text"; text: { en: string; es: string } }
  | { type: "image"; src: string; alt: { en: string; es: string } }
  | { type: "video"; src: string; heading: { en: string; es: string } }
  | { type: "products"; slugs: string[]; heading: { en: string; es: string } }
  | { type: "faq"; items: { q: { en: string; es: string }; a: { en: string; es: string } }[] }
  | { type: "button"; label: { en: string; es: string }; path: string };

export interface Page {
  slug: string;
  title: { en: string; es: string };
  blocks: Block[];
  seo?: { title?: { en: string; es: string }; description?: { en: string; es: string } } | null;
}

/** Only published pages are in the bundle — see scripts/fetch-pages.mjs. */
export const pages = generated as unknown as Page[];

export function getPage(slug: string): Page | undefined {
  return pages.find((page) => page.slug === slug);
}

export function pageTitle(page: Page, locale: Locale): string {
  return page.title[locale] || page.title.en || page.slug;
}
