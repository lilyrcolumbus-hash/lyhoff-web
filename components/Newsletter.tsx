"use client";

import { useState } from "react";
import { t, type Locale } from "@/lib/i18n";

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
        body: JSON.stringify({ email, locale }),
      });
      setStatus(res.ok ? "success" : "error");
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
        <p
          className={`mt-5 rounded-xl px-4 py-3 text-sm font-medium ${
            dark ? "bg-forest-800 text-cream" : "bg-forest-100 text-forest-800"
          }`}
        >
          ✅ {dict.subscribed}
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={dict.emailPlaceholder}
            className="flex-1 rounded-sm border border-stone-300 bg-white px-5 py-3 text-sm text-ink outline-none focus:border-forest-500"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-sm bg-earth-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-earth-600 disabled:opacity-60"
          >
            {status === "loading" ? dict.subscribing : dict.subscribe}
          </button>
        </form>
      )}

      {status === "error" && (
        <p className={`mt-3 text-sm ${dark ? "text-earth-400" : "text-earth-700"}`}>
          {dict.newsletterError}
        </p>
      )}
    </div>
  );
}
