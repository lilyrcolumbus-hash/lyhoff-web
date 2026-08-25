"use client";

import { useState } from "react";

/**
 * Password input with a show/hide toggle.
 *
 * Deliberately used instead of a second "confirm password" field: re-typing
 * catches fewer mistakes than simply being able to read what you typed (people
 * paste into both boxes, or make the same typo twice), and a mismatch only ever
 * says "these don't match" without showing which one is wrong. On a password
 * RESET that matters — a typo locks the customer out and forces the whole email
 * round-trip again.
 */
export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  hint,
  locale,
  minLength,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  hint?: string;
  locale: "en" | "es";
  minLength?: number;
}) {
  const [visible, setVisible] = useState(false);
  const es = locale === "es";

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-forest-950" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          required
          minLength={minLength}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-sm border border-stone-300 bg-white py-3 pl-4 pr-12 text-sm text-ink outline-none focus:border-indigo-500"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          aria-label={
            visible
              ? es
                ? "Ocultar contraseña"
                : "Hide password"
              : es
                ? "Mostrar contraseña"
                : "Show password"
          }
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-stone-500 transition-colors hover:text-forest-950 focus-visible:text-forest-950 focus-visible:outline-none"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
            <path
              d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.3" />
            {visible && (
              <path d="M4 20 20 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>
      {hint && <p className="text-xs text-stone-500">{hint}</p>}
    </div>
  );
}
