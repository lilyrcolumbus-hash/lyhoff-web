"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { Ingredient } from "@/lib/ingredients";
import { getProduct } from "@/lib/products";
import type { Locale } from "@/lib/i18n";
import { Jar, Droplet, Leaf, Sprout } from "@/components/illustrations";

const ICON_MAP = { jar: Jar, droplet: Droplet, leaf: Leaf, sprout: Sprout } as const;
export type IngredientIcon = keyof typeof ICON_MAP;

export function IngredientCard({
  ingredient,
  icon,
  locale,
  index,
}: {
  ingredient: Ingredient;
  icon: IngredientIcon;
  locale: Locale;
  index: number;
}) {
  const Icon = ICON_MAP[icon];
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.button
      type="button"
      onClick={() => setFlipped((f) => !f)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="relative h-64 w-full text-left [perspective:1000px]"
      aria-label={ingredient.name[locale]}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative h-full w-full [transform-style:preserve-3d]"
      >
        {/* Front */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 border border-stone-200 bg-white p-6 text-center [backface-visibility:hidden]">
          <Icon className="h-10 w-10 text-earth-500" />
          <h3 className="font-display text-base font-bold text-forest-950">
            {ingredient.name[locale]}
          </h3>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
            {locale === "en" ? "Tap to learn more" : "Toca para saber más"}
          </p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 flex flex-col justify-between border border-forest-950 bg-forest-950 p-5 text-left [backface-visibility:hidden]"
          style={{ transform: "rotateY(180deg)" }}
        >
          <p className="text-sm text-stone-200 leading-relaxed">{ingredient.blurb[locale]}</p>
          <div className="flex flex-wrap gap-1.5">
            {ingredient.usedIn.map((slug) => {
              const product = getProduct(slug);
              if (!product) return null;
              return (
                <Link
                  key={slug}
                  href={`/${locale}/products/${slug}/`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-[10px] font-medium uppercase tracking-wide text-earth-300 border border-earth-300/40 px-2 py-0.5 hover:bg-earth-500/10"
                >
                  {product.name[locale]}
                </Link>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.button>
  );
}
