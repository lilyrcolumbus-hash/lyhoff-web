"use client";

import type { CartItem } from "@/lib/cart-store";
import type { Locale } from "@/lib/i18n";

/** POSTs the cart to the Worker's /api/checkout and redirects to Stripe Checkout. */
export async function startCheckout(items: CartItem[], locale: Locale): Promise<void> {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: items.map((i) => ({ slug: i.slug, quantity: i.quantity })),
      locale,
    }),
  });

  if (!res.ok) {
    throw new Error("checkout_failed");
  }

  const data: { url?: string } = await res.json();
  if (!data.url) {
    throw new Error("checkout_no_url");
  }

  window.location.href = data.url;
}
