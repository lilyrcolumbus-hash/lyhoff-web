"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { getCategory, t, type Locale } from "@/lib/i18n";
import type { ArticleMeta } from "@/lib/content";
import { CoverImage } from "./CoverImage";

export function ArticleCard({
  article,
  locale,
  index = 0,
}: {
  article: ArticleMeta;
  locale: Locale;
  index?: number;
}) {
  const dict = t(locale);
  const cat = getCategory(article.category);
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/${locale}/articles/${article.slug}/`}
        className="group flex flex-col overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
      >
        <div className="overflow-hidden">
          <CoverImage
            src={article.heroImage}
            alt={article.title}
            category={article.category}
            ratio="wide"
            className="transition duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-forest-600">
            <span>{cat?.emoji}</span>
            <span>{cat?.label[locale]}</span>
            {article.draft && (
              <span className="ml-auto rounded-sm bg-earth-500/15 px-2 py-0.5 text-[10px] font-semibold normal-case text-earth-700">
                {dict.draftBadge}
              </span>
            )}
          </div>
          <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-forest-900 group-hover:text-forest-700">
            {article.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-stone-600">
            {article.description}
          </p>
          <div className="mt-4 flex items-center gap-1 text-sm font-medium text-forest-700">
            {dict.readMore}
            <span aria-hidden className="transition group-hover:translate-x-0.5">
              →
            </span>
            <span className="ml-auto text-xs font-normal text-stone-400">
              {article.readingMinutes} {dict.minRead}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
