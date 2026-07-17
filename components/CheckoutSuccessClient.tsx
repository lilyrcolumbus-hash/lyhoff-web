"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { type Locale } from "@/lib/i18n";
import { Leaf } from "@/components/illustrations";

export function CheckoutSuccessClient({ locale }: { locale: Locale }) {
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="mx-auto max-w-lg px-6 py-24 text-center">
      <Leaf className="mx-auto h-10 w-10 text-forest-500" />
      <h1 className="mt-4 font-display text-3xl font-bold text-forest-950">
        {locale === "en" ? "Thank you!" : "¡Gracias!"}
      </h1>
      <p className="mt-4 text-base text-stone-600 leading-relaxed">
        {locale === "en"
          ? "Your order is in. We pack and ship everything ourselves, by hand — a confirmation and receipt are on their way to your email."
          : "Tu pedido está confirmado. Nosotros mismos empacamos y enviamos todo a mano — una confirmación y recibo llegarán a tu correo."}
      </p>
      <Link
        href={`/${locale}/products/`}
        className="mt-8 inline-flex items-center rounded-sm bg-forest-950 px-7 py-3.5 text-sm font-semibold text-cream transition hover:bg-forest-800"
      >
        {locale === "en" ? "Continue shopping" : "Seguir comprando"} →
      </Link>
    </div>
  );
}
