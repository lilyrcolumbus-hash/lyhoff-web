"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { startCheckout } from "@/lib/checkout";
import { t, type Locale } from "@/lib/i18n";
import { FreeShippingProgress } from "@/components/FreeShippingProgress";
import { ShippingCalculator } from "@/components/ShippingCalculator";

export function CartPageClient({ locale }: { locale: Locale }) {
  const dict = t(locale);
  const { items, removeItem, updateQty, total } = useCartStore();
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState(false);
  const [shippingCents, setShippingCents] = useState<number | null>(null);

  async function onCheckout() {
    setError(false);
    setCheckingOut(true);
    try {
      await startCheckout(items, locale, shippingCents);
    } catch {
      setError(true);
      setCheckingOut(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl font-bold text-forest-950 sm:text-4xl">
        {dict.cartTitle}
      </h1>

      {items.length === 0 ? (
        <div className="mt-8">
          <p className="text-stone-500">{dict.cartEmpty}</p>
          <Link
            href={`/${locale}/products/`}
            className="mt-6 inline-flex items-center rounded-full bg-forest-950 px-7 py-3.5 text-sm font-semibold text-cream transition hover:bg-forest-800"
          >
            {dict.shopAll} →
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-8 flex flex-col divide-y divide-stone-200 border-t border-b border-stone-200">
            {items.map((item) => (
              <li key={item.slug} className="flex gap-5 py-6">
                <div className="relative h-28 w-24 shrink-0 overflow-hidden bg-stone-50">
                  <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col">
                  <p className="font-display text-base font-semibold text-forest-950">{item.name}</p>
                  <p className="text-sm text-stone-500">{item.size}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => updateQty(item.slug, item.quantity - 1)}
                        className="h-7 w-7 rounded-full border border-stone-300 text-sm text-forest-950 hover:border-forest-500"
                        aria-label="-"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-sm text-stone-600">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.slug, item.quantity + 1)}
                        className="h-7 w-7 rounded-full border border-stone-300 text-sm text-forest-950 hover:border-forest-500"
                        aria-label="+"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-display text-base font-semibold text-forest-950">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.slug)}
                    className="mt-2 self-start text-xs text-stone-400 underline hover:text-earth-600"
                  >
                    {dict.cartRemove}
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <FreeShippingProgress subtotal={total()} locale={locale} />
          </div>

          <div className="flex items-center justify-between text-sm text-stone-600">
            <span className="font-medium">{dict.cartSubtotal}</span>
            <span className="font-display text-base font-semibold text-forest-950">
              ${total().toFixed(2)}
            </span>
          </div>

          <div className="mt-4">
            <ShippingCalculator
              items={items}
              locale={locale}
              shippingCents={shippingCents}
              onRateChange={setShippingCents}
            />
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-4">
            <span className="text-sm font-medium text-stone-600">
              {locale === "es" ? "Total" : "Total"}
            </span>
            <span className="font-display text-2xl font-bold text-forest-950">
              ${(total() + (shippingCents ?? 0) / 100).toFixed(2)}
            </span>
          </div>

          <button
            type="button"
            onClick={onCheckout}
            disabled={checkingOut}
            className="mt-6 w-full rounded-full bg-forest-950 px-7 py-4 text-sm font-semibold text-cream transition hover:bg-forest-800 disabled:opacity-60 sm:w-auto"
          >
            {checkingOut ? dict.cartCheckingOut : dict.cartCheckout}
          </button>
          {error && <p className="mt-3 text-sm text-earth-700">{dict.cartError}</p>}
        </>
      )}
    </div>
  );
}
