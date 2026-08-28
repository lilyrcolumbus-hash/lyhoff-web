"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { t, type Locale } from "@/lib/i18n";

export function AddToBagButton({
  slug,
  name,
  price,
  size,
  image,
  locale,
  stock,
}: {
  slug: string;
  name: string;
  price: number;
  size: string;
  image: string;
  locale: Locale;
  /** Units on hand. Undefined means the product is not stock tracked. */
  stock?: number;
}) {
  const dict = t(locale);
  const { addItem, openCart } = useCartStore();
  const [qty, setQty] = useState(1);

  const soldOut = stock === 0;
  // Cap the stepper at what actually exists, so nobody assembles a cart that
  // checkout is only going to refuse.
  const max = stock ?? Infinity;

  function onAdd() {
    addItem({ slug, name, price, size, image }, qty);
    openCart();
  }

  if (soldOut) {
    return (
      <span className="inline-flex items-center rounded-sm border border-stone-300 px-7 py-3.5 text-sm font-semibold text-stone-500">
        {dict.soldOut}
      </span>
    );
  }

  return (
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
          onClick={() => setQty((q) => Math.min(max, q + 1))}
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
  );
}
