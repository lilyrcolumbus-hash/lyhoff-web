"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { categories, otherLocale, t, type Locale } from "@/lib/i18n";

export function Header({ locale }: { locale: Locale }) {
  const dict = t(locale);
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || `/${locale}`;
  const swapped = pathname.replace(/^\/(en|es)/, `/${otherLocale(locale)}`);

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-cream/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link
          href={`/${locale}/`}
          className="flex items-center gap-2 font-display text-xl font-semibold text-forest-900"
          onClick={() => setOpen(false)}
        >
          <span aria-hidden className="text-2xl">🌱</span>
          SmartGrowth
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-stone-700 md:flex">
          <Link href={`/${locale}/topics/`} className="hover:text-forest-700">
            {dict.navTopics}
          </Link>
          <Link href={`/${locale}/about/`} className="hover:text-forest-700">
            {dict.navAbout}
          </Link>
          <Link
            href={swapped}
            className="rounded-full border border-forest-300 px-3 py-1 text-forest-800 hover:bg-forest-50"
          >
            {locale === "en" ? "Español" : "English"}
          </Link>
        </nav>

        <button
          type="button"
          aria-label="Menu"
          className="md:hidden text-2xl text-forest-900"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <div className="border-t border-stone-200 bg-cream px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1 text-sm font-medium text-stone-700">
            <Link
              href={`/${locale}/topics/`}
              className="rounded-lg px-2 py-2 hover:bg-forest-50"
              onClick={() => setOpen(false)}
            >
              {dict.navTopics}
            </Link>
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/${locale}/category/${c.slug}/`}
                className="rounded-lg px-2 py-2 pl-5 text-stone-600 hover:bg-forest-50"
                onClick={() => setOpen(false)}
              >
                {c.emoji} {c.label[locale]}
              </Link>
            ))}
            <Link
              href={`/${locale}/about/`}
              className="rounded-lg px-2 py-2 hover:bg-forest-50"
              onClick={() => setOpen(false)}
            >
              {dict.navAbout}
            </Link>
            <Link
              href={swapped}
              className="mt-1 rounded-lg border border-forest-300 px-2 py-2 text-forest-800"
              onClick={() => setOpen(false)}
            >
              {locale === "en" ? "Ver en Español" : "View in English"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
