import { amazonLink, etsyLink, type Product } from "@/lib/products";
import { t, type Locale } from "@/lib/i18n";

/**
 * The Amazon/Etsy connection. On a static site with no checkout, "buying"
 * means linking out to the real marketplace listing. Amazon is the primary
 * CTA (warm clay), Etsy the secondary. Links always resolve to a real
 * destination via amazonLink()/etsyLink() (listing → storefront → search).
 */
export function BuyButtons({
  product,
  locale,
  size = "default",
}: {
  product: Product;
  locale: Locale;
  size?: "default" | "compact";
}) {
  const dict = t(locale);
  const amazon = amazonLink(product);
  const etsy = etsyLink(product);
  const pad = size === "compact" ? "px-4 py-2 text-sm" : "px-6 py-3 text-sm";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <a
        href={amazon}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`inline-flex items-center gap-2 rounded-full bg-clay-600 ${pad} font-semibold text-cream shadow-sm transition hover:bg-clay-700`}
      >
        {dict.shopBuyAmazon}
        <span aria-hidden>↗</span>
      </a>
      {etsy && (
        <a
          href={etsy}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className={`inline-flex items-center gap-2 rounded-full border border-clay-300 ${pad} font-semibold text-clay-800 transition hover:bg-clay-50`}
        >
          {dict.shopBuyEtsy}
          <span aria-hidden>↗</span>
        </a>
      )}
    </div>
  );
}
