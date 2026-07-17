"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { t, type Locale } from "@/lib/i18n";

const SCENT_LABEL: Record<string, { en: string; es: string }> = {
  Vanilla: { en: "Vanilla", es: "Vainilla" },
  Peppermint: { en: "Peppermint", es: "Menta" },
  Unscented: { en: "Unscented", es: "Sin fragancia" },
};

export function AddToBagButton({
  slug,
  name,
  price,
  size,
  image,
  locale,
  scents,
}: {
  slug: string;
  name: string;
  price: number;
  size: string;
  image: string;
  locale: Locale;
  scents?: string[];
}) {
  const dict = t(locale);
  const { addItem, openCart } = useCartStore();
  const [qty, setQty] = useState(1);
  const [scent, setScent] = useState<string | undefined>(scents?.[0]);

  function onAdd() {
    addItem({ slug, name, price, size, image, scent }, qty);
    openCart();
  }

  return (
    <div className="flex flex-col gap-3">
      {scents && scents.length > 0 && (
        <div>
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
      <div className="flex items-center gap-3">
      <div className="flex items-center gap-3 rounded-sm border border-stone-300 px-3 py-2">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="h-5 w-5 text-sm text-forest-950"
          aria-label="-"
        >
          −
        </button>
        <span className="w-4 text-center text-sm text-stone-600">{qty}</span>
        <button
          type="button"
          onClick={() => setQty((q) => q + 1)}
          className="h-5 w-5 text-sm text-forest-950"
          aria-label="+"
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-2 rounded-sm bg-forest-950 px-7 py-3.5 text-sm font-semibold text-cream transition hover:bg-forest-800 active:scale-95"
      >
        {dict.addToBag}
        <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M2 5h8l-.7 5.2a1 1 0 0 1-1 .8H3.7a1 1 0 0 1-1-.8L2 5z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4 5V3.5a2 2 0 0 1 4 0V5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      </div>
    </div>
  );
}
