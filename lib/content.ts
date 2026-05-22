import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import type { CategorySlug, Locale } from "./i18n";

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

export interface ArticleMeta {
  slug: string;
  title: string;
  description: string;
  category: CategorySlug;
  tags: string[];
  publishedAt: string; // ISO date (YYYY-MM-DD)
  heroImage?: string;
  pinImage?: string; // 2:3 vertical image for Pinterest
  draft: boolean;
  featured: boolean;
  readingMinutes: number;
}

export interface Article extends ArticleMeta {
  content: string; // raw MDX body
  locale: Locale;
}

/** Folder names under content/articles — each is one article slug. */
export function getSlugs(): string[] {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  return fs
    .readdirSync(ARTICLES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

function readArticleFile(slug: string, locale: Locale): Article | null {
  const filePath = path.join(ARTICLES_DIR, slug, `${locale}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  return {
    slug,
    locale,
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    category: (data.category ?? "recipes") as CategorySlug,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    publishedAt: String(data.publishedAt ?? "1970-01-01"),
    heroImage: data.heroImage ? String(data.heroImage) : undefined,
    pinImage: data.pinImage ? String(data.pinImage) : undefined,
    draft: Boolean(data.draft ?? false),
    featured: Boolean(data.featured ?? false),
    readingMinutes: Math.max(1, Math.round(readingTime(content).minutes)),
    content,
  };
}

/** One article in a given locale; falls back to the other locale's file if the
 *  translation is missing so a half-translated article still renders. */
export function getArticle(slug: string, locale: Locale): Article | null {
  return (
    readArticleFile(slug, locale) ??
    readArticleFile(slug, locale === "en" ? "es" : "en")
  );
}

function byNewest(a: ArticleMeta, b: ArticleMeta): number {
  return b.publishedAt.localeCompare(a.publishedAt);
}

export function getAllArticles(locale: Locale): Article[] {
  return getSlugs()
    .map((slug) => getArticle(slug, locale))
    .filter((a): a is Article => a !== null)
    .sort(byNewest);
}

export function getArticlesByCategory(
  category: string,
  locale: Locale,
): Article[] {
  return getAllArticles(locale).filter((a) => a.category === category);
}

export function getFeatured(locale: Locale): Article[] {
  const all = getAllArticles(locale);
  const featured = all.filter((a) => a.featured);
  return featured.length > 0 ? featured : all.slice(0, 3);
}

export function getRelated(
  current: ArticleMeta,
  locale: Locale,
  limit = 3,
): Article[] {
  const all = getAllArticles(locale).filter((a) => a.slug !== current.slug);
  const sameCategory = all.filter((a) => a.category === current.category);
  const rest = all.filter((a) => a.category !== current.category);
  return [...sameCategory, ...rest].slice(0, limit);
}
