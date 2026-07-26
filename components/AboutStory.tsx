"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import { StockPhoto } from "@/components/StockPhoto";
import { StockVideo } from "@/components/StockVideo";
import { Leaf, Droplet, Jar } from "@/components/illustrations";

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
};

function StoryRow({
  text,
  media,
  reverse = false,
}: {
  text: string;
  media: ReactNode;
  reverse?: boolean;
}) {
  return (
    <div
      className={`grid items-center gap-8 sm:grid-cols-2 sm:gap-12 ${
        reverse ? "sm:[&>*:first-child]:order-2" : ""
      }`}
    >
      <motion.div {...fadeUp}>{media}</motion.div>
      <motion.p
        {...fadeUp}
        className="prose-sg text-base leading-relaxed text-stone-600 sm:text-lg"
      >
        {text}
      </motion.p>
    </div>
  );
}

/** First two alternating text/media rows — sits above the full-bleed video break. */
export function AboutStoryRows({
  locale,
  paragraphs,
}: {
  locale: Locale;
  paragraphs: [string, string];
}) {
  return (
    <div className="flex flex-col gap-16 sm:gap-24">
      <StoryRow
        text={paragraphs[0]}
        media={
          <StockPhoto
            ratio="square"
            rounded
            src="https://images.unsplash.com/photo-1709666414115-47ecd5143293?w=700&h=700&q=80&auto=format&fit=crop"
            alt={locale === "en" ? "Bottled and labeled in small batches" : "Envasado y etiquetado en pequeños lotes"}
          />
        }
      />
      <StoryRow
        reverse
        text={paragraphs[1]}
        media={<StockVideo ratio="square" rounded src="/videos/soil.mp4" />}
      />
    </div>
  );
}

/** Pull-quote, values grid, and closing line — sits below the full-bleed video break. */
export function AboutStoryClosing({
  locale,
  paragraphs,
}: {
  locale: Locale;
  paragraphs: [string, string];
}) {
  const values = [
    {
      icon: Leaf,
      label: locale === "en" ? "Simple ingredients" : "Ingredientes simples",
      desc:
        locale === "en"
          ? "A handful of real ingredients, never dozens of synthetic ones."
          : "Un puñado de ingredientes reales, nunca decenas de sintéticos.",
    },
    {
      icon: Droplet,
      label: locale === "en" ? "Tested on ourselves first" : "Probado en nosotros primero",
      desc:
        locale === "en"
          ? "We use everything we make — daily, before it's ever sold."
          : "Usamos todo lo que hacemos — a diario, antes de venderlo.",
    },
    {
      icon: Jar,
      label: locale === "en" ? "Our own certified lab" : "Laboratorio propio certificado",
      desc:
        locale === "en"
          ? "Real equipment, real standards — not a kitchen shortcut."
          : "Equipo real, estándares reales — no un atajo de cocina.",
    },
  ];

  return (
    <div className="flex flex-col gap-16 sm:gap-20">
      <motion.blockquote
        {...fadeUp}
        className="mx-auto max-w-2xl border-l-2 border-earth-400 pl-6 font-display text-xl font-medium leading-snug text-forest-950 sm:pl-8 sm:text-2xl"
      >
        {paragraphs[0]}
      </motion.blockquote>

      <motion.div {...fadeUp} className="grid gap-8 border-t border-stone-200 pt-12 sm:grid-cols-3">
        {values.map((v) => (
          <div key={v.label}>
            <v.icon className="h-8 w-8 text-earth-500" />
            <h3 className="mt-3 font-display text-base font-semibold text-forest-950">
              {v.label}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-500">{v.desc}</p>
          </div>
        ))}
      </motion.div>

      <motion.p
        {...fadeUp}
        className="prose-sg text-center font-display text-lg font-medium text-forest-950 sm:text-xl"
      >
        {paragraphs[1]}
      </motion.p>
    </div>
  );
}
