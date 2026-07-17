"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { Leaf } from "@/components/illustrations";

const STORAGE_KEY = "lyhoff-welcome-seen";
// Owner action: create a matching promotion code named WELCOME10 in the Stripe
// dashboard (Products → Coupons → +New, then add a promotion code "WELCOME10")
// with whatever discount you want to actually honor. Checkout already accepts
// promo codes (allow_promotion_codes: true in worker.ts) — this just needs the
// code to exist on Stripe's side to actually work.
const CODE = "WELCOME10";

type Status = "idle" | "loading" | "success" | "error";

export function WelcomePopup({ locale }: { locale: Locale }) {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const timer = setTimeout(() => setVisible(true), 15000);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "1");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || status === "loading") return;
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      setStatus(res.ok ? "success" : "error");
      if (res.ok) localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      setStatus("error");
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest-950/50 px-4">
      <div className="relative w-full max-w-sm rounded-sm border border-white/60 bg-cream/75 backdrop-blur-2xl p-8 text-center shadow-2xl">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute top-3 right-3 text-xl leading-none text-stone-400 hover:text-forest-900"
        >
          ×
        </button>

        {status === "success" ? (
          <>
            <Leaf className="h-8 w-8 text-forest-500" />
            <h2 className="mt-3 font-display text-xl font-bold text-forest-950">
              {locale === "en" ? "You're in!" : "¡Listo!"}
            </h2>
            <p className="mt-2 text-sm text-stone-600 leading-relaxed">
              {locale === "en"
                ? "Use this code at checkout for 10% off your first order:"
                : "Usa este código al pagar para 10% de descuento en tu primer pedido:"}
            </p>
            <p className="mt-3 rounded-lg border border-dashed border-earth-400 bg-earth-50 py-2.5 font-display text-lg font-bold tracking-widest text-earth-700">
              {CODE}
            </p>
          </>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-earth-600">
              {locale === "en" ? "Welcome" : "Bienvenido"}
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-forest-950">
              {locale === "en" ? "Get 10% off your first order" : "10% de descuento en tu primer pedido"}
            </h2>
            <p className="mt-2 text-sm text-stone-600 leading-relaxed">
              {locale === "en"
                ? "Join our list — small-batch news, no spam."
                : "Únete a nuestra lista — novedades de nuestros productos, sin spam."}
            </p>
            <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={locale === "en" ? "you@email.com" : "tu@correo.com"}
                className="rounded-sm border border-stone-300 bg-white px-5 py-3 text-sm text-ink outline-none focus:border-forest-500"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="rounded-sm bg-forest-950 px-6 py-3 text-sm font-semibold text-cream transition hover:bg-forest-800 disabled:opacity-60"
              >
                {status === "loading"
                  ? locale === "en"
                    ? "Sending…"
                    : "Enviando…"
                  : locale === "en"
                    ? "Get my code"
                    : "Obtener mi código"}
              </button>
            </form>
            {status === "error" && (
              <p className="mt-3 text-xs text-earth-700">
                {locale === "en" ? "Something went wrong. Please try again." : "Algo salió mal. Inténtalo de nuevo."}
              </p>
            )}
            <button
              type="button"
              onClick={dismiss}
              className="mt-3 text-xs text-stone-400 underline hover:text-stone-600"
            >
              {locale === "en" ? "No thanks" : "No, gracias"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
