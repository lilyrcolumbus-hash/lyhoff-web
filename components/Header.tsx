"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { otherLocale, t, type Locale } from "@/lib/i18n";

export function Header({ locale }: { locale: Locale }) {
  const dict = t(locale);
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || `/${locale}`;
  const swapped = pathname.replace(/^\/(en|es)/, `/${otherLocale(locale)}`);

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

        <Link
          href={`/${locale}/`}
          className="font-display text-2xl font-bold tracking-tight text-forest-950"
          onClick={() => setOpen(false)}
        >
          LYHOFF
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-stone-600 md:flex">
          <Link href={`/${locale}/products/`} className="hover:text-forest-900 transition-colors font-semibold text-forest-950">
            {locale === "en" ? "Shop" : "Tienda"}
          </Link>
          <Link href={`/${locale}/category/garden/`} className="hover:text-forest-900 transition-colors">
            {dict.navTopics}
          </Link>
          <Link href={`/${locale}/about/`} className="hover:text-forest-900 transition-colors">
            {dict.navAbout}
          </Link>
          <Link
            href={swapped}
            className="text-xs uppercase tracking-widest text-stone-500 hover:text-forest-900 transition-colors"
          >
            {locale === "en" ? "ES" : "EN"}
          </Link>
        </nav>

        <button
          type="button"
          aria-label="Menu"
          className="md:hidden text-forest-950 font-medium text-sm tracking-wide"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <div className="border-t border-stone-200 bg-cream px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4 text-sm font-medium text-stone-700">
            <Link
              href={`/${locale}/products/`}
              onClick={() => setOpen(false)}
              className="font-semibold text-forest-950"
            >
              {locale === "en" ? "Shop" : "Tienda"}
            </Link>
            <Link href={`/${locale}/category/garden/`} onClick={() => setOpen(false)}>
              {locale === "en" ? "The Garden" : "El Huerto"}
            </Link>
            <Link href={`/${locale}/category/food/`} onClick={() => setOpen(false)}>
              {locale === "en" ? "From the Harvest" : "De la Cosecha"}
            </Link>
            <Link href={`/${locale}/category/bodycare/`} onClick={() => setOpen(false)}>
              {locale === "en" ? "Skin & Hair" : "Piel y Cabello"}
            </Link>
            <Link href={`/${locale}/category/remedies/`} onClick={() => setOpen(false)}>
              {locale === "en" ? "Herbal Remedies" : "Remedios Herbales"}
            </Link>
            <Link href={`/${locale}/about/`} onClick={() => setOpen(false)}>
              {dict.navAbout}
            </Link>
            <Link
              href={swapped}
              className="text-xs uppercase tracking-widest text-stone-500"
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
