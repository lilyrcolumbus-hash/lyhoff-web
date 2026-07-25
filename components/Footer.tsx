import Link from "next/link";
import { categories, t, type Locale } from "@/lib/i18n";

export function Footer({ locale }: { locale: Locale }) {
  const dict = t(locale);
  return (
    <footer className="mt-24 border-t border-stone-200 bg-forest-950 text-stone-300">
      <div className="mx-auto max-w-6xl px-6 pt-14 pb-28">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <div className="font-display text-2xl font-bold tracking-tight text-cream">
              LYHOFF
            </div>
            <p className="mt-3 text-sm text-stone-400 leading-relaxed">
              {dict.footerTagline}
            </p>
            <a
              href="mailto:lyhoffllc.info@gmail.com"
              className="mt-3 inline-block text-sm text-stone-400 hover:text-cream transition-colors"
            >
              lyhoffllc.info@gmail.com
            </a>
            <div className="mt-4 flex gap-4 text-sm">
              <a
                href="https://www.tiktok.com/@lyhoff.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-400 hover:text-cream transition-colors"
              >
                TikTok
              </a>
              <a
                href="https://www.facebook.com/share/1Bw3Xr3chz/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-400 hover:text-cream transition-colors"
              >
                Facebook
              </a>
              <a
                href="https://youtube.com/@lyhoff?si=ql49F2_AZV63O3Td"
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-400 hover:text-cream transition-colors"
              >
                YouTube
              </a>
              <a
                href="https://www.instagram.com/lyhoff.greencore"
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-400 hover:text-cream transition-colors"
              >
                Instagram
              </a>
              <a
                href="https://pin.it/5qmmHWTGn"
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-400 hover:text-cream transition-colors"
              >
                Pinterest
              </a>
              <a
                href="https://www.threads.com/@lyhoff.greencore"
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-400 hover:text-cream transition-colors"
              >
                Threads
              </a>
              <a
                href="https://x.com/lyhoff32879?s=11"
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-400 hover:text-cream transition-colors"
              >
                X
              </a>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-4">
              {dict.browseByTopic}
            </h2>
            <ul className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/${locale}/category/${c.slug}/`}
                    className="text-stone-400 hover:text-cream transition-colors"
                  >
                    {c.label[locale]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-4">
              {locale === "en" ? "Shop" : "Tienda"}
            </h2>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link
                  href={`/${locale}/products/`}
                  className="text-stone-400 hover:text-cream transition-colors"
                >
                  {locale === "en" ? "All products" : "Todos los productos"}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/cart/`}
                  className="text-stone-400 hover:text-cream transition-colors"
                >
                  {dict.viewCart}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/ingredients/`}
                  className="text-stone-400 hover:text-cream transition-colors"
                >
                  {locale === "en" ? "Ingredients" : "Ingredientes"}
                </Link>
              </li>
              <li>
                <a
                  href="https://www.etsy.com/shop/LaPappa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-400 hover:text-cream transition-colors"
                >
                  Etsy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-4">
              {locale === "en" ? "Legal" : "Legal"}
            </h2>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link
                  href={`/${locale}/shipping-returns/`}
                  className="text-stone-400 hover:text-cream transition-colors"
                >
                  {locale === "en" ? "Shipping & Returns" : "Envíos y Devoluciones"}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/privacy/`}
                  className="text-stone-400 hover:text-cream transition-colors"
                >
                  {locale === "en" ? "Privacy Policy" : "Política de Privacidad"}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/terms/`}
                  className="text-stone-400 hover:text-cream transition-colors"
                >
                  {locale === "en" ? "Terms of Service" : "Términos de Servicio"}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-forest-800 pt-6 text-xs text-stone-600 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} LYHOFF. All rights reserved.</span>
          <Link href={`/${locale}/about/`} className="hover:text-stone-400 transition-colors">
            {dict.navAbout}
          </Link>
        </div>
      </div>
    </footer>
  );
}
