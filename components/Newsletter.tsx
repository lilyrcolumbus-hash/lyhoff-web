"use client";

import { useState } from "react";
import { t, type Locale } from "@/lib/i18n";
import { WELCOME_CODE, WELCOME_CODE_STORAGE_KEY } from "@/lib/checkout";

type Status = "idle" | "loading" | "success" | "error";

export function Newsletter({
  locale,
  variant = "panel",
}: {
  locale: Locale;
  variant?: "panel" | "inline";
}) {
  const dict = t(locale);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || status === "loading") return;
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale, source: "footer" }),
      });
      setStatus(res.ok ? "success" : "error");
      if (res.ok) localStorage.setItem(WELCOME_CODE_STORAGE_KEY, WELCOME_CODE);
    } catch {
      setStatus("error");
    }
  }

  const dark = variant === "panel";

  return (
    <div
      className={
        dark
          ? "rounded-sm bg-forest-900 px-6 py-10 text-cream sm:px-10"
          : "rounded-sm border border-forest-200 bg-forest-50 p-6"
      }
    >
      <h2
        className={`font-display text-2xl font-semibold ${dark ? "text-cream" : "text-forest-900"}`}
      >
        {dict.newsletterTitle}
      </h2>
      <p className={`mt-2 text-sm ${dark ? "text-stone-300" : "text-stone-600"}`}>
        {dict.newsletterBody}
      </p>

      {status === "success" ? (
        <div
          className={`mt-5 rounded-sm px-4 py-3 text-sm font-medium ${
            dark ? "bg-forest-800 text-cream" : "bg-forest-100 text-forest-800"
          }`}
        >
          <p>✓ {dict.subscribed}</p>
          <p className={`mt-2 text-xs font-normal ${dark ? "text-stone-300" : "text-stone-600"}`}>
            {locale === "en"
              ? "Here's 10% off your first order:"
              : "Aquí tienes 10% de descuento en tu primer pedido:"}
          </p>
          <p
            className={`mt-2 inline-block rounded-sm border border-dashed px-4 py-1.5 font-display text-base font-bold tracking-widest ${
              dark ? "border-earth-400 text-earth-300" : "border-earth-400 bg-earth-50 text-earth-700"
            }`}
          >
            {WELCOME_CODE}
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={dict.emailPlaceholder}
            className="flex-1 rounded-sm border border-stone-300 bg-white px-5 py-3 text-sm text-ink outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-sm bg-earth-500 px-6 py-3 text-sm font-semibold text-forest-950 transition hover:bg-earth-600 disabled:opacity-60"
          >
            {status === "loading" ? dict.subscribing : dict.subscribe}
          </button>
        </form>
      )}

      {status === "error" && (
        <p className={`mt-3 text-sm ${dark ? "text-clay-500" : "text-clay-600"}`}>
          {dict.newsletterError}
        </p>
      )}
    </div>
  );
}
