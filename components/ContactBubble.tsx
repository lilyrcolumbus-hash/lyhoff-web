"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";

/** Honest alternative to a "live chat" widget — direct email, no fake staffing promise. */
export function ContactBubble({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <div className="w-64 rounded-2xl border border-stone-200 bg-white p-4 shadow-xl">
          <p className="font-display text-sm font-semibold text-forest-950">
            {locale === "en" ? "Questions before you buy?" : "¿Dudas antes de comprar?"}
          </p>
          <p className="mt-1 text-xs text-stone-500 leading-relaxed">
            {locale === "en"
              ? "Email us directly — a real person (us) replies, usually within a day."
              : "Escríbenos directo — te responde una persona real (nosotros), normalmente en un día."}
          </p>
          <a
            href="mailto:lyhoffllc.info@gmail.com"
            className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-forest-950 px-4 py-2.5 text-xs font-semibold text-cream hover:bg-forest-800"
          >
            {locale === "en" ? "Email us" : "Escribinos"}
          </a>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={locale === "en" ? "Contact us" : "Contáctanos"}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-forest-950 text-cream shadow-lg transition hover:bg-forest-800 active:scale-95"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-4 4v-4H6a2 2 0 0 1-2-2V6z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
