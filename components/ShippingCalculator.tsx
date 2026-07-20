"use client";

import { useEffect, useRef, useState } from "react";
import type { CartItem } from "@/lib/cart-store";
import type { Locale } from "@/lib/i18n";

interface Address {
  zip: string;
}

const EMPTY_ADDRESS: Address = { zip: "" };

export function ShippingCalculator({
  items,
  locale,
  shippingCents,
  onRateChange,
}: {
  items: CartItem[];
  locale: Locale;
  shippingCents: number | null;
  onRateChange: (cents: number | null) => void;
}) {
  const [address, setAddress] = useState<Address>(EMPTY_ADDRESS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // If the cart contents change after a rate was already fetched, the old rate
  // no longer applies to the new items — clear it so checkout can't use a stale quote.
  const itemsKey = items.map((i) => `${i.slug}:${i.quantity}`).join(",");
  const prevItemsKey = useRef(itemsKey);
  useEffect(() => {
    if (prevItemsKey.current !== itemsKey) {
      prevItemsKey.current = itemsKey;
      onRateChange(null);
    }
  }, [itemsKey, onRateChange]);

  const canCalculate = address.zip.trim().length > 0;

  async function calculate() {
    setError(false);
    setLoading(true);
    onRateChange(null);
    try {
      const res = await fetch("/api/shipping-rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ slug: i.slug, quantity: i.quantity })),
          address,
        }),
      });
      const data: { shippingCents?: number } = await res.json();
      if (!res.ok || typeof data.shippingCents !== "number") throw new Error("rate_failed");
      onRateChange(data.shippingCents);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-sm border border-stone-300 bg-white px-3 py-2 text-sm text-forest-950 placeholder:text-stone-400 focus:border-forest-500 focus:outline-none";

  return (
    <div className="border-t border-stone-200 pt-4">
      {shippingCents === null ? (
        <>
          <p className="text-xs font-medium text-stone-600">
            {locale === "es"
              ? "Código postal para ver el envío exacto (opcional)"
              : "ZIP code for exact shipping (optional)"}
          </p>
          <div className="mt-2 flex gap-2">
            <input
              className={inputClass}
              placeholder="ZIP"
              inputMode="numeric"
              value={address.zip}
              onChange={(e) => setAddress({ zip: e.target.value })}
            />
            <button
              type="button"
              onClick={calculate}
              disabled={!canCalculate || loading}
              className="shrink-0 rounded-sm border border-forest-950 px-4 py-2 text-sm font-semibold text-forest-950 transition hover:bg-forest-950 hover:text-cream disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading
                ? locale === "es"
                  ? "Calculando..."
                  : "Calculating..."
                : locale === "es"
                  ? "Calcular"
                  : "Calculate"}
            </button>
          </div>
          <p className="mt-2 text-xs text-stone-400">
            {locale === "es"
              ? "Puedes omitir esto — el envío se confirma en el siguiente paso del pago."
              : "You can skip this — shipping is confirmed on the next checkout step."}
          </p>
          {error && (
            <p className="mt-2 text-xs text-earth-700">
              {locale === "es"
                ? "No pudimos calcular el envío con ese código postal — se usará una tarifa estándar en el pago."
                : "We couldn't calculate shipping for that ZIP — a standard rate will be used at checkout."}
            </p>
          )}
        </>
      ) : (
        <div className="flex items-center justify-between text-sm">
          <span className="text-stone-600">{locale === "es" ? "Envío" : "Shipping"}</span>
          <div className="flex items-center gap-3">
            <span className="font-display font-semibold text-forest-950">
              ${(shippingCents / 100).toFixed(2)}
            </span>
            <button
              type="button"
              onClick={() => onRateChange(null)}
              className="text-xs text-stone-400 underline hover:text-earth-600"
            >
              {locale === "es" ? "cambiar" : "change"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
