"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/lib/cart-store";
import { startCheckout } from "@/lib/checkout";
import { t, type Locale } from "@/lib/i18n";
import { FreeShippingProgress } from "@/components/FreeShippingProgress";

export function CartDrawer({ locale }: { locale: Locale }) {
  const dict = t(locale);
  const { items, isOpen, closeCart, removeItem, updateQty, total } = useCartStore();
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState(false);

  // The cart store's persist middleware is skipHydration'd (see lib/cart-store.ts) —
  // rehydrate once, here, since this component is always mounted (in the root layout).
  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  async function onCheckout() {
    setError(false);
    setCheckingOut(true);
    try {
      await startCheckout(items, locale);
    } catch {
      setError(true);
      setCheckingOut(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.button
            type="button"
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-forest-950/40 backdrop-blur-sm"
            onClick={closeCart}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
            className="relative flex h-full w-full max-w-md flex-col border-l border-white/60 bg-cream/75 backdrop-blur-2xl shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-5">
          <h2 className="font-display text-lg font-bold text-forest-950">{dict.cartTitle}</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={closeCart}
            className="text-2xl leading-none text-stone-400 hover:text-forest-900"
          >
            ×
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <p className="text-sm text-stone-500">{dict.cartEmpty}</p>
          ) : (
            <ul className="flex flex-col gap-5">
              {items.map((item) => (
                <li key={item.slug} className="flex gap-4">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-stone-50">
                    <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <p className="font-display text-sm font-semibold text-forest-950">{item.name}</p>
                    <p className="text-xs text-stone-500">
                      {item.size}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQty(item.slug, item.quantity - 1)}
                          className="h-6 w-6 rounded-full border border-stone-300 text-xs text-forest-950 hover:border-indigo-400"
                          aria-label="-"
                        >
                          −
                        </button>
                        <span className="w-4 text-center text-xs text-stone-600">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.slug, item.quantity + 1)}
                          className="h-6 w-6 rounded-full border border-stone-300 text-xs text-forest-950 hover:border-indigo-400"
                          aria-label="+"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-display text-sm font-semibold text-forest-950">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.slug)}
                      className="mt-1 self-start text-xs text-stone-400 underline hover:text-earth-600"
                    >
                      {dict.cartRemove}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-stone-200 px-6 py-6">
            <FreeShippingProgress subtotal={total()} locale={locale} />
            <div className="flex items-center justify-between text-sm font-medium text-stone-600">
              <span>{dict.cartSubtotal}</span>
              <span className="font-display text-base font-semibold text-forest-950">
                ${total().toFixed(2)}
              </span>
            </div>
            <p className="mt-2 text-xs text-stone-400">
              {locale === "es"
                ? "Envío calculado en el siguiente paso del pago."
                : "Shipping calculated at the next checkout step."}
            </p>
            <button
              type="button"
              onClick={onCheckout}
              disabled={checkingOut}
              className="mt-4 w-full rounded-sm bg-forest-950 px-6 py-3.5 text-sm font-semibold text-cream transition hover:bg-forest-800 disabled:opacity-60"
            >
              {checkingOut ? dict.cartCheckingOut : dict.cartCheckout}
            </button>
            {error && <p className="mt-3 text-xs text-clay-600">{dict.cartError}</p>}
          </div>
        )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
