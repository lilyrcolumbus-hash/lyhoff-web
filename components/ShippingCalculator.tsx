"use client";

import { useEffect, useRef, useState } from "react";
import type { CartItem } from "@/lib/cart-store";
import type { Locale } from "@/lib/i18n";

interface Address {
  name: string;
  street1: string;
  city: string;
  state: string;
  zip: string;
}

const EMPTY_ADDRESS: Address = { name: "", street1: "", city: "", state: "", zip: "" };

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

  const canCalculate =
    address.name.trim() &&
    address.street1.trim() &&
    address.city.trim() &&
    address.state.trim() &&
    address.zip.trim();

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
    "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-forest-950 placeholder:text-stone-400 focus:border-forest-500 focus:outline-none";

  return (
    <div className="border-t border-stone-200 pt-4">
      {shippingCents === null ? (
        <>
          <p className="text-xs font-medium text-stone-600">
            {locale === "es" ? "Calcula tu envío" : "Calculate your shipping"}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <input
              className={`${inputClass} col-span-2`}
              placeholder={locale === "es" ? "Nombre completo" : "Full name"}
              value={address.name}
              onChange={(e) => setAddress({ ...address, name: e.target.value })}
            />
            <input
              className={`${inputClass} col-span-2`}
              placeholder={locale === "es" ? "Dirección" : "Street address"}
              value={address.street1}
              onChange={(e) => setAddress({ ...address, street1: e.target.value })}
            />
            <input
              className={inputClass}
              placeholder={locale === "es" ? "Ciudad" : "City"}
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
            />
            <input
              className={inputClass}
              placeholder={locale === "es" ? "Estado" : "State"}
              value={address.state}
              onChange={(e) => setAddress({ ...address, state: e.target.value })}
            />
            <input
              className={`${inputClass} col-span-2`}
              placeholder="ZIP"
              value={address.zip}
              onChange={(e) => setAddress({ ...address, zip: e.target.value })}
            />
          </div>
          <button
            type="button"
            onClick={calculate}
            disabled={!canCalculate || loading}
            className="mt-3 w-full rounded-sm border border-forest-950 px-4 py-2.5 text-sm font-semibold text-forest-950 transition hover:bg-forest-950 hover:text-cream disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading
              ? locale === "es"
                ? "Calculando..."
                : "Calculating..."
              : locale === "es"
                ? "Calcular envío"
                : "Calculate shipping"}
          </button>
          {error && (
            <p className="mt-2 text-xs text-earth-700">
              {locale === "es"
                ? "No pudimos calcular el envío. Revisa la dirección o inténtalo de nuevo — se usará una tarifa estándar en el pago."
                : "We couldn't calculate shipping. Check the address or try again — a standard rate will be used at checkout."}
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
