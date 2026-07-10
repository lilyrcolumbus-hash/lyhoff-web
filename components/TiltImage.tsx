import type { ReactNode } from "react";
import Image from "next/image";

/** Product image with a simple, predictable zoom-on-hover — no movement, no surprises. */
export function TiltImage({
  src,
  alt,
  className = "",
  children,
  priority = false,
  sizes = "(max-width: 1024px) 100vw, 50vw",
}: {
  src: string;
  alt: string;
  className?: string;
  children?: ReactNode;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <div className={`group/img relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-500 ease-out group-hover/img:scale-105"
        priority={priority}
      />
      {children}
    </div>
  );
}
