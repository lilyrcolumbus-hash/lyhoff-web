"use client";

import { motion } from "framer-motion";
import type { ComponentType } from "react";
import type { Locale } from "@/lib/i18n";
import { Jar, Droplet, Leaf } from "@/components/illustrations";

const items: {
  icon: ComponentType<{ className?: string }>;
  label: Record<Locale, string>;
  desc: Record<Locale, string>;
}[] = [
  {
    icon: Jar,
    label: { en: "Small-batch crafted", es: "Elaborado en pequeños lotes" },
    desc: {
      en: "Every product made by hand, in limited quantities.",
      es: "Cada producto hecho a mano, en cantidades limitadas.",
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
    <div className={`grid gap-8 sm:grid-cols-3 ${className}`}>
      {items.map((item, i) => (
        <div key={item.label.en}>
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
        </div>
      ))}
    </div>
  );
}
