"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

export function ProductGallery({
  images,
  alt,
  isPlaceholder,
  placeholderLabel,
  scentBadge,
}: {
  images: string[];
  alt: string;
  isPlaceholder: boolean;
  placeholderLabel: string;
  /** Current scent name, shown as a corner chip so switching scent is visibly
   * reflected on the gallery even when there's no scent-specific photo yet. */
  scentBadge?: string;
}) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-50">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={images[active]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <Image
              src={images[active]}
              alt={alt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </motion.div>
        </AnimatePresence>
        {isPlaceholder && (
          <span className="absolute top-3 left-3 z-10 bg-earth-600 text-cream text-[10px] font-semibold uppercase tracking-widest px-3 py-1">
            {placeholderLabel}
          </span>
        )}
        {scentBadge && (
          <AnimatePresence mode="wait">
            <motion.span
              key={scentBadge}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="absolute top-3 right-3 z-10 bg-cream/90 backdrop-blur-sm text-forest-950 text-[10px] font-semibold uppercase tracking-widest px-3 py-1 shadow-sm"
            >
              {scentBadge}
            </motion.span>
          </AnimatePresence>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              className={`relative aspect-square overflow-hidden bg-stone-50 ring-1 transition ${
                i === active ? "ring-forest-950" : "ring-transparent hover:ring-forest-500"
              }`}
              aria-label={`${alt} ${i + 1}`}
              aria-current={i === active}
            >
              <Image src={src} alt={alt} fill sizes="25vw" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
