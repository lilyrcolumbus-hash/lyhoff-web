import { type CategorySlug } from "@/lib/i18n";
import { CategoryIcon } from "@/components/CategoryIcon";

/**
 * Article cover image. When a real image path is provided it renders it;
 * otherwise it shows a branded, honest "photo coming" placeholder so the
 * layout is complete without faking a photo. Swap in real photos by adding
 * `heroImage` / `pinImage` to the article frontmatter.
 */
export function CoverImage({
  src,
  alt,
  category,
  ratio = "wide",
  className = "",
}: {
  src?: string;
  alt: string;
  category: CategorySlug;
  ratio?: "wide" | "pin" | "square";
  className?: string;
}) {
  const aspect =
    ratio === "pin"
      ? "aspect-[2/3]"
      : ratio === "square"
        ? "aspect-square"
        : "aspect-[16/9]";

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
      className={`${aspect} ${className} flex w-full flex-col items-center justify-center bg-gradient-to-br from-forest-700 via-forest-600 to-earth-600 text-center`}
      role="img"
      aria-label={alt}
    >
      <CategoryIcon slug={category} className="h-9 w-9 text-cream/90" />
      <span className="mt-2 px-4 font-display text-sm font-medium text-cream/90">
        {alt}
      </span>
    </div>
  );
}
