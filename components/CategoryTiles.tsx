"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { ComponentType } from "react";
import { categories, type CategorySlug, type Locale } from "@/lib/i18n";
import { Droplet, Jar } from "@/components/illustrations";

const ICONS: Record<CategorySlug, ComponentType<{ className?: string }>> = {
  bodycare: Droplet,
  remedies: Jar,
};

export function CategoryTiles({ locale }: { locale: Locale }) {
  return (
    <div className="grid gap-px bg-stone-200 border border-stone-200 sm:grid-cols-2">
      {categories.map((c, i) => {
        const Icon = ICONS[c.slug];
        return (
          <motion.div
            key={c.slug}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              href={`/${locale}/category/${c.slug}/`}
              className="group flex h-full flex-col justify-between bg-white p-8 transition hover:bg-forest-950"
            >
              <div>
                <Icon className="h-7 w-7 text-earth-500 group-hover:text-earth-300 transition-colors" />
                <h3 className="mt-4 font-display text-lg font-semibold text-forest-950 group-hover:text-cream transition-colors">
                  {c.label[locale]}
                </h3>
                <p className="mt-2 text-sm text-stone-500 leading-relaxed group-hover:text-stone-300 transition-colors">
                  {c.blurb[locale]}
                </p>
              </div>
              <span className="mt-8 text-xs font-medium text-stone-400 group-hover:text-stone-300 transition-colors">
                {locale === "en" ? "Read guides →" : "Ver guías →"}
              </span>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
