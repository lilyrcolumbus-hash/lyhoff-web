import Link from "next/link";
import { categories, t, type Locale } from "@/lib/i18n";
import {
  TikTokIcon,
  FacebookIcon,
  InstagramIcon,
  YouTubeIcon,
  PinterestIcon,
  ThreadsIcon,
  XIcon,
} from "@/components/illustrations";

const SOCIAL_LINKS = [
  { name: "TikTok", href: "https://www.tiktok.com/@lyhoff.com", Icon: TikTokIcon },
  { name: "Facebook", href: "https://www.facebook.com/share/1Bw3Xr3chz/?mibextid=wwXIfr", Icon: FacebookIcon },
  { name: "YouTube", href: "https://youtube.com/@lyhoff?si=ql49F2_AZV63O3Td", Icon: YouTubeIcon },
  { name: "Instagram", href: "https://www.instagram.com/lyhoff.greencore", Icon: InstagramIcon },
  { name: "Pinterest", href: "https://pin.it/5qmmHWTGn", Icon: PinterestIcon },
  { name: "Threads", href: "https://www.threads.com/@lyhoff.greencore", Icon: ThreadsIcon },
  { name: "X", href: "https://x.com/lyhoff32879?s=11", Icon: XIcon },
];

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
            <div className="mt-5 flex flex-wrap gap-2">
              {SOCIAL_LINKS.map(({ name, href, Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="group relative flex h-9 w-9 items-center justify-center border border-white/10 bg-cream/5 text-stone-300 backdrop-blur-sm transition-colors hover:border-white/25 hover:bg-cream/10 hover:text-cream"
                >
                  <Icon className="h-4 w-4" />
                  <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap border border-white/10 bg-forest-950 px-2 py-1 text-[10px] font-medium text-cream opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    {name}
                  </span>
                </a>
              ))}
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
              <li>
                <a
                  href="https://www.amazon.com/s?me=A3QMAV0EEV748Q&marketplaceID=ATVPDKIKX0DER"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-400 hover:text-cream transition-colors"
                >
                  Amazon
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
