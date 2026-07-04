"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { amazonUrl, type Product } from "@/lib/products";
import type { Locale } from "@/lib/i18n";

interface Props {
  product: Product;
  locale: Locale;
  imageUrl: string;
  isPlaceholderImage?: boolean;
  index?: number;
}

export function ProductCard({
  product,
  locale,
  imageUrl,
  isPlaceholderImage = false,
  index = 0,
}: Props) {
  const name = product.name[locale];
  const tagline = product.tagline[locale];
  const description = product.description[locale];
  const badge = product.badge?.[locale];

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group flex flex-col bg-white border border-stone-200 hover:border-stone-300 hover:shadow-lg transition-all duration-300"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-stone-50 aspect-[4/5]">
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {badge && !isPlaceholderImage && (
          <span className="absolute top-3 left-3 bg-forest-950 text-cream text-[10px] font-semibold uppercase tracking-widest px-3 py-1">
            {badge}
          </span>
        )}
        {isPlaceholderImage && (
          <span className="absolute top-3 left-3 bg-earth-600 text-cream text-[10px] font-semibold uppercase tracking-widest px-3 py-1">
            {locale === "en" ? "Photo needed" : "Foto pendiente"}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-earth-600 mb-2">
          {product.size}
        </p>
        <h3 className="font-display text-lg font-bold text-forest-950 leading-tight">
          {name}
        </h3>
        <p className="mt-1 text-sm font-medium text-stone-500 italic">
          {tagline}
        </p>
        <p className="mt-3 text-sm text-stone-600 leading-relaxed line-clamp-3">
          {description}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {product.ingredients.slice(0, 3).map((ing) => (
            <span
              key={ing}
              className="text-[10px] font-medium uppercase tracking-wide text-stone-500 border border-stone-200 px-2 py-0.5"
            >
              {ing}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-6 flex items-center justify-between">
          <span className="font-display text-xl font-bold text-forest-950">
            ${product.price.toFixed(2)}
          </span>
          <a
            href={amazonUrl(product.asin)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-forest-950 px-5 py-2.5 text-xs font-semibold text-cream transition hover:bg-forest-800 active:scale-95"
          >
            {locale === "en" ? "Buy on Amazon" : "Comprar en Amazon"}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </div>
    </motion.div>
  );
}
