"use client";

import type { CartItem } from "@/lib/cart-store";
import type { Locale } from "@/lib/i18n";

// Both known codes share this one slot — a customer only ever has one
// applicable code at a time (first-order welcome, or a later returning-
// customer code from a thank-you card), and the checkout only ever pre-applies
// whichever was written here last.
export const WELCOME_CODE_STORAGE_KEY = "lyhoff-welcome-code";
export const WELCOME_CODE = "WELCOME10";
export const RETURNING_CODE = "THANKYOU15";

/** POSTs the cart to the Worker's /api/checkout and redirects to Stripe Checkout. */
export async function startCheckout(items: CartItem[], locale: Locale): Promise<void> {
  const promoCode = localStorage.getItem(WELCOME_CODE_STORAGE_KEY) || undefined;

  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: items.map((i) => ({ slug: i.slug, quantity: i.quantity })),
      locale,
      promoCode,
    }),
  });

  if (!res.ok) {
    // Stock is re-read live at this point, so a cart assembled minutes ago can
    // legitimately be refused here. Name that case so the cart can say what
    // happened instead of showing the generic "something went wrong".
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error === "out_of_stock" ? "out_of_stock" : "checkout_failed");
  }

  const data: { url?: string } = await res.json();
  if (!data.url) {
    throw new Error("checkout_no_url");
  }

  window.location.href = data.url;
}
