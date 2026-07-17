"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export function HeroText({
  locale,
  tagline,
  title,
  subtitle,
  cta,
  theme = "dark",
}: {
  locale: Locale;
  tagline: string;
  title: string;
  subtitle: string;
  cta: string;
  /** "light" = light text for a dark/video background; "dark" = default text on cream. */
  theme?: "dark" | "light";
}) {
  const light = theme === "light";
  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.p
        variants={item}
        className={`text-xs font-semibold uppercase tracking-[0.25em] mb-6 ${light ? "text-earth-300" : "text-earth-600"}`}
      >
        {tagline}
      </motion.p>
      <motion.h1
        variants={item}
        className={`font-display text-5xl font-bold leading-[1.08] max-w-2xl md:text-6xl lg:text-7xl ${light ? "text-cream" : "text-forest-950"}`}
      >
        {title}
      </motion.h1>
      <motion.p
        variants={item}
        className={`mt-6 max-w-xl text-base leading-relaxed md:text-lg ${light ? "text-cream/85" : "text-stone-500"}`}
      >
        {subtitle}
      </motion.p>
      <motion.div variants={item} className="mt-10 flex flex-wrap gap-4">
        <a
          href="#newsletter"
          className={
            light
              ? "inline-flex items-center rounded-sm bg-cream px-7 py-3.5 text-sm font-semibold text-forest-950 transition hover:bg-white hover:scale-105 active:scale-95"
              : "inline-flex items-center rounded-sm bg-forest-950 px-7 py-3.5 text-sm font-semibold text-cream transition hover:bg-forest-800 hover:scale-105 active:scale-95"
          }
        >
          {cta}
        </a>
        <Link
          href={`/${locale}/about/`}
          className={
            light
              ? "inline-flex items-center rounded-sm border border-cream/50 px-7 py-3.5 text-sm font-semibold text-cream transition hover:border-cream hover:bg-cream/10 hover:scale-105 active:scale-95"
              : "inline-flex items-center rounded-sm border border-stone-300 px-7 py-3.5 text-sm font-semibold text-forest-950 transition hover:border-forest-400 hover:bg-forest-50 hover:scale-105 active:scale-95"
          }
        >
          {locale === "en" ? "Our story" : "Nuestra historia"}
        </Link>
      </motion.div>
    </motion.div>
  );
}
