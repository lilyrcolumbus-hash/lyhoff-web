"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/products";
import { type Locale } from "@/lib/i18n";
import { ProductGallery } from "@/components/ProductGallery";
import { AddToBagButton } from "@/components/AddToBagButton";
import { TrustBadges } from "@/components/TrustBadges";

const SCENT_LABEL: Record<string, { en: string; es: string }> = {
  Vanilla: { en: "Vanilla", es: "Vainilla" },
  Peppermint: { en: "Peppermint", es: "Menta" },
  Unscented: { en: "Unscented", es: "Sin fragancia" },
};

export function ProductDetailClient({
  product,
  locale,
  name,
  tagline,
  description,
  badge,
  defaultGallery,
  scentGalleries,
  isPlaceholderGallery,
  variants,
}: {
  product: Product;
  locale: Locale;
  name: string;
  tagline: string;
  description: string;
  badge?: string;
  defaultGallery: string[];
  scentGalleries: Record<string, string[]>;
  isPlaceholderGallery: boolean;
  variants: Product[];
}) {
  const scents = product.scents;
  const [scent, setScent] = useState<string | undefined>(scents?.[0]);

  const scentGallery = scent ? scentGalleries[scent] : undefined;
  const gallery = scentGallery && scentGallery.length > 0 ? scentGallery : defaultGallery;
  const usingScentPhotos = Boolean(scentGallery && scentGallery.length > 0);
  const displayName = scent ? `${name} — ${SCENT_LABEL[scent]?.[locale] ?? scent}` : name;

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-6 py-10 lg:grid-cols-2 lg:gap-16">
      {/* Gallery — swaps to scent-specific photos when real ones exist for the selected scent */}
      <ProductGallery
        images={gallery}
        alt={displayName}
        isPlaceholder={isPlaceholderGallery && !usingScentPhotos}
        placeholderLabel={locale === "en" ? "Photo needed" : "Foto pendiente"}
      />

      {/* Info */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-earth-600 mb-2">
          {product.size}
        </p>
        {badge && (
          <span className="inline-block mb-3 bg-forest-950 text-cream text-[10px] font-semibold uppercase tracking-widest px-3 py-1">
            {badge}
          </span>
        )}
        <h1 className="font-display text-3xl font-bold text-forest-950 sm:text-4xl">
          {displayName}
        </h1>
        <p className="mt-2 text-base font-medium text-stone-500 italic">{tagline}</p>
        {scent && (
          <p className="mt-1 text-sm text-earth-700">{product.scentNotes?.[scent]?.[locale]}</p>
        )}
        <p className="mt-5 text-base text-stone-600 leading-relaxed">{description}</p>

        <ul className="mt-4 flex flex-col gap-1.5">
          {product.benefits.map((b) => (
            <li key={b.en} className="flex items-start gap-2 text-sm text-stone-600">
              <span className="mt-1 text-earth-500" aria-hidden>✓</span>
              {b[locale]}
            </li>
          ))}
        </ul>

        {variants.length > 1 && (
          <div className="mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">
              {locale === "en" ? "Size" : "Tamaño"}
            </h2>
            <div className="flex flex-wrap gap-2">
              {variants.map((v) => (
                <Link
                  key={v.slug}
                  href={`/${locale}/products/${v.slug}/`}
                  className={`rounded-sm border px-4 py-2 text-sm font-medium transition ${
                    v.slug === product.slug
                      ? "border-forest-950 bg-forest-950 text-cream"
                      : "border-stone-300 text-forest-950 hover:border-forest-500"
                  }`}
                >
                  {v.size}
                </Link>
              ))}
            </div>
          </div>
        )}

        {scents && scents.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">
              {locale === "en" ? "Scent" : "Aroma"}
            </h2>
            <div className="flex flex-wrap gap-2">
              {scents.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScent(s)}
                  className={`rounded-sm border px-4 py-2 text-sm font-medium transition ${
                    s === scent
                      ? "border-forest-950 bg-forest-950 text-cream"
                      : "border-stone-300 text-forest-950 hover:border-forest-500"
                  }`}
                >
                  {SCENT_LABEL[s]?.[locale] ?? s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">
            {locale === "en" ? "Ingredients" : "Ingredientes"}
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {product.ingredients.map((ing) => (
              <span
                key={ing}
                className="text-[10px] font-medium uppercase tracking-wide text-stone-500 border border-stone-200 px-2 py-0.5"
              >
                {ing}
              </span>
            ))}
          </div>
          <Link
            href={`/${locale}/ingredients/`}
            className="mt-3 inline-block text-xs font-medium text-forest-700 hover:underline"
          >
            {locale === "en" ? "Learn more about our ingredients →" : "Conoce más sobre nuestros ingredientes →"}
          </Link>
        </div>

        <div className="mt-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">
            {locale === "en" ? "How to use" : "Cómo usar"}
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed">{product.howToUse[locale]}</p>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-stone-200 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-display text-2xl font-bold text-forest-950">
            ${product.price.toFixed(2)}
          </span>
          <AddToBagButton
            slug={product.slug}
            name={name}
            price={product.price}
            size={product.size}
            image={gallery[0]}
            locale={locale}
            scent={scent}
          />
        </div>

        <p className="mt-4 text-xs text-stone-400">
          {locale === "en"
            ? "Shipping calculated in cart · Packed and shipped by us, not a warehouse · Questions? Email us directly."
            : "Envío calculado en el carrito · Empacado y enviado por nosotros, no por una bodega · ¿Dudas? Escríbenos directo."}
        </p>

        <TrustBadges locale={locale} theme="light" className="mt-10 border-t border-stone-200 pt-8 sm:grid-cols-1 gap-6" />
      </div>
    </div>
  );
}
