import type { ReactNode } from "react";

/**
 * Generic stock video used purely for visual/process storytelling — same
 * "swappable, not final" contract as StockPhoto (see that file). Autoplays
 * muted + looped + inline so it behaves like a moving photo, not a media
 * player (no controls, no sound).
 */
export function StockVideo({
  src,
  poster,
  ratio = "square",
  rounded = false,
  className = "",
  children,
}: {
  src: string;
  poster?: string;
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
    <div className={`relative overflow-hidden ${rounded ? "rounded-sm" : ""} ${aspect} ${className}`}>
      <video
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <span className="absolute bottom-2 right-2 rounded-sm bg-black/40 px-2 py-0.5 text-[9px] font-medium text-white/90 backdrop-blur-sm">
        Stock footage
      </span>
      {children}
    </div>
  );
}
