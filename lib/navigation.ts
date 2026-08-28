import { navigationOverrides } from "@/lib/settings";
import { dictionary, type Locale } from "@/lib/i18n";

export interface NavLink {
  label: { en: string; es: string };
  /** Path under the locale, e.g. "topics" for /en/topics/. */
  path: string;
}

/**
 * The header links, as they are today.
 *
 * Shop is not in this list on purpose: it is a menu that builds itself from the
 * categories that actually have products in them, so a category emptying out
 * removes its own link. Making that editable would mean someone could link to a
 * category with nothing in it.
 */
export const DEFAULT_HEADER_LINKS: NavLink[] = [
  { label: { en: dictionary.en.navTopics, es: dictionary.es.navTopics }, path: "topics" },
  { label: { en: "Ingredients", es: "Ingredientes" }, path: "ingredients" },
  { label: { en: dictionary.en.navAbout, es: dictionary.es.navAbout }, path: "about" },
  { label: { en: "Account", es: "Cuenta" }, path: "account" },
];

function isNavLink(value: unknown): value is NavLink {
  const link = value as NavLink;
  return (
    typeof link?.path === "string" &&
    link.path.length > 0 &&
    typeof link.label?.en === "string" &&
    typeof link.label?.es === "string"
  );
}

/**
 * What the owner arranged, or the defaults. A stored list that is empty or
 * malformed falls back rather than shipping a header with no links in it —
 * a navigation bar is not something to lose to a bad save.
 */
export function headerLinks(): NavLink[] {
  const stored = navigationOverrides.header;
  if (!Array.isArray(stored)) return DEFAULT_HEADER_LINKS;
  const valid = stored.filter(isNavLink);
  return valid.length > 0 ? valid : DEFAULT_HEADER_LINKS;
}

/** Absolute path for a link in a given language. */
export function navHref(link: NavLink, locale: Locale): string {
  return link.path.startsWith("http") ? link.path : `/${locale}/${link.path.replace(/^\/|\/$/g, "")}/`;
}
