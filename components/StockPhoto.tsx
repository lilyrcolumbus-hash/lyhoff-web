import Image from "next/image";
import type { ReactNode } from "react";

/**
 * Generic stock photo used purely for visual completeness where the exact
 * subject doesn't need to be real/specific (process shots, mood imagery) —
 * unlike PlaceholderPhoto, which marks slots that need a REAL photo (product
 * shots, anything depicting the actual founders). Small corner tag so the
 * owner remembers these are swappable, not final brand photography.
 */
export function StockPhoto({
  src,
  alt,
  ratio = "square",
  rounded = false,
  className = "",
  children,
}: {
  src: string;
  alt: string;
  ratio?: "square" | "portrait" | "wide";
  rounded?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const aspect =
    ratio === "portrait"
      ? "aspect-[4/5]"
      : ratio === "wide"
        ? "aspect-[16/9]"
        : "aspect-square";

  return (
    <div className={`relative overflow-hidden ${rounded ? "rounded-[2.5rem]" : ""} ${aspect} ${className}`}>
      <Image src={src} alt={alt} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover" />
      <span className="absolute bottom-2 right-2 rounded-full bg-black/40 px-2 py-0.5 text-[9px] font-medium text-white/90 backdrop-blur-sm">
        Stock photo
      </span>
      {children}
    </div>
  );
}
