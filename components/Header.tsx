"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { otherLocale, t, type Locale } from "@/lib/i18n";
import { useCartStore } from "@/lib/cart-store";

function CartButton() {
  const { count, openCart } = useCartStore();
  const itemCount = count();
  const prevCount = useRef(itemCount);
  const [bumpId, setBumpId] = useState(0);

  useEffect(() => {
    if (itemCount > prevCount.current) {
      setBumpId((id) => id + 1);
    }
    prevCount.current = itemCount;
  }, [itemCount]);

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label="Cart"
      className="relative text-forest-950 hover:text-forest-700 transition-colors"
    >
      <motion.svg
        key={bumpId}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        animate={bumpId > 0 ? { scale: [1, 1.35, 0.9, 1], rotate: [0, -8, 8, 0] } : undefined}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <path
          d="M6 8h12l-1.2 10.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 8z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 8V6a3 3 0 0 1 6 0v2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.svg>
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-earth-600 text-[9px] font-bold text-cream">
          {itemCount}
        </span>
      )}
      <AnimatePresence>
        {bumpId > 0 && (
          <motion.span
            key={bumpId}
            initial={{ opacity: 1, y: 0, scale: 0.8 }}
            animate={{ opacity: 0, y: -28, scale: 1.1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="pointer-events-none absolute -top-3 right-0 text-xs font-bold text-earth-600"
          >
            +1
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

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
          <Link href={`/${locale}/topics/`} className="hover:text-forest-900 transition-colors">
            {dict.navTopics}
          </Link>
          <Link href={`/${locale}/ingredients/`} className="hover:text-forest-900 transition-colors">
            {locale === "en" ? "Ingredients" : "Ingredientes"}
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
          <CartButton />
        </nav>

        <div className="flex items-center gap-5 md:hidden">
          <CartButton />
          <button
            type="button"
            aria-label="Menu"
            className="text-forest-950 font-medium text-sm tracking-wide"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
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
            <Link href={`/${locale}/ingredients/`} onClick={() => setOpen(false)}>
              {locale === "en" ? "Ingredients" : "Ingredientes"}
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
