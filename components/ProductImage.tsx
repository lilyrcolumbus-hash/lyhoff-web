import { getProductLine, type ProductLine } from "@/lib/products";

/**
 * Product photo. Renders the real image when provided; otherwise a warm,
 * branded "photo coming" placeholder so layouts stay complete without faking
 * a product shot. Swap in real photos at /public/images/products/<slug>.jpg
 * and set `image` on the product.
 */
export function ProductImage({
  src,
  alt,
  line,
  ratio = "square",
  className = "",
}: {
  src?: string;
  alt: string;
  line: ProductLine;
  ratio?: "square" | "portrait";
  className?: string;
}) {
  const aspect = ratio === "portrait" ? "aspect-[4/5]" : "aspect-square";
  const meta = getProductLine(line);

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={`${aspect} w-full object-cover ${className}`}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`${aspect} ${className} flex w-full flex-col items-center justify-center bg-gradient-to-br from-clay-200 via-clay-100 to-cream text-center`}
      role="img"
      aria-label={alt}
    >
      <span aria-hidden className="text-4xl drop-shadow-sm">
        {meta?.emoji ?? "🧴"}
      </span>
      <span className="mt-2 px-4 font-display text-sm font-medium text-clay-800/80">
        {alt}
      </span>
    </div>
  );
}
