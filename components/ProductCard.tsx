import Link from "next/link";
import { type Product } from "@/lib/products";
import { type Locale } from "@/lib/i18n";
import { ProductImage } from "@/components/ProductImage";

export function ProductCard({
  product,
  locale,
}: {
  product: Product;
  locale: Locale;
}) {
  return (
    <Link
      href={`/${locale}/shop/${product.slug}/`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-clay-100 bg-white transition hover:-translate-y-1 hover:border-clay-300 hover:shadow-md"
    >
      <div className="overflow-hidden">
        <ProductImage
          src={product.image}
          alt={product.name[locale]}
          line={product.line}
          ratio="square"
          className="transition duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold text-clay-900 group-hover:text-clay-700">
          {product.name[locale]}
        </h3>
        <p className="mt-1 flex-1 text-sm text-stone-600">
          {product.tagline[locale]}
        </p>
        <div className="mt-4 flex items-center justify-between">
          {product.price ? (
            <span className="font-display text-base font-semibold text-clay-800">
              {product.price}
            </span>
          ) : (
            <span />
          )}
          <span className="text-sm font-medium text-clay-600 group-hover:underline">
            {locale === "en" ? "View" : "Ver"} →
          </span>
        </div>
      </div>
    </Link>
  );
}
