"use client";

import { motion } from "framer-motion";
import type { ComponentType } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { Jar, Droplet, Leaf, Hand } from "@/components/illustrations";

const items: {
  icon: ComponentType<{ className?: string }>;
  label: Record<Locale, string>;
  desc: Record<Locale, string>;
  href?: string;
}[] = [
  {
    icon: Jar,
    label: { en: "Our own professional lab", es: "Laboratorio propio profesional" },
    desc: {
      en: "Real equipment, real standards — not a kitchen recipe.",
      es: "Equipo real, estándares reales — no una receta de cocina.",
    },
  },
  {
    icon: Droplet,
    label: { en: "Tested on ourselves first", es: "Probado en nosotros primero" },
    desc: {
      en: "We use everything we make — daily.",
      es: "Usamos todo lo que hacemos — a diario.",
    },
  },
  {
    icon: Leaf,
    label: { en: "Zero synthetic chemicals", es: "Sin químicos sintéticos" },
    desc: {
      en: "Ingredients you can pronounce. Nothing hidden.",
      es: "Ingredientes que puedes pronunciar. Nada oculto.",
    },
  },
  {
    icon: Hand,
    label: { en: "30-day guarantee", es: "Garantía de 30 días" },
    desc: {
      en: "Unopened returns within 30 days. If something's not right, email us and we'll make it right.",
      es: "Devoluciones sin abrir dentro de 30 días. Si algo no te funciona, escríbenos y lo resolvemos.",
    },
    href: "/shipping-returns/",
  },
];

/** Reusable trust-signal row — same three claims wherever a buy decision happens. */
export function TrustBadges({
  locale,
  theme = "dark",
  className = "",
}: {
  locale: Locale;
  theme?: "dark" | "light";
  className?: string;
}) {
  const labelColor = theme === "dark" ? "text-cream" : "text-forest-950";
  const descColor = theme === "dark" ? "text-stone-400" : "text-stone-500";
  const iconColor = theme === "dark" ? "text-earth-400" : "text-earth-500";

  return (
    <div className={`grid gap-8 sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {items.map((item, i) => {
        const content = (
          <>
            <motion.div
              className={`h-8 w-8 ${iconColor}`}
              animate={{ scale: [1, 1.08, 1] }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.4,
              }}
            >
              <item.icon className="h-full w-full" />
            </motion.div>
            <h3 className={`mt-3 font-display text-base font-semibold ${labelColor}`}>
              {item.label[locale]}
            </h3>
            <p className={`mt-2 text-sm leading-relaxed ${descColor}`}>
              {item.desc[locale]}
            </p>
          </>
        );
        return item.href ? (
          <Link key={item.label.en} href={`/${locale}${item.href}`} className="block hover:opacity-80 transition-opacity">
            {content}
          </Link>
        ) : (
          <div key={item.label.en}>{content}</div>
        );
      })}
    </div>
  );
}
