"use client";

import { useState } from "react";
import Image from "next/image";
import { TiltImage } from "@/components/TiltImage";

export function ProductGallery({
  images,
  alt,
  isPlaceholder,
  placeholderLabel,
}: {
  images: string[];
  alt: string;
  isPlaceholder: boolean;
  placeholderLabel: string;
}) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <TiltImage src={images[active]} alt={alt} priority className="aspect-[4/5] w-full bg-stone-50">
        {isPlaceholder && (
          <span className="absolute top-3 left-3 bg-earth-600 text-cream text-[10px] font-semibold uppercase tracking-widest px-3 py-1">
            {placeholderLabel}
          </span>
        )}
      </TiltImage>
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {images.map((src, i) =>
            i === active ? null : (
              <button
                key={src}
                type="button"
                onClick={() => setActive(i)}
                className="relative aspect-square overflow-hidden bg-stone-50 ring-1 ring-transparent transition hover:ring-forest-500"
                aria-label={`${alt} ${i + 1}`}
              >
                <Image src={src} alt={alt} fill sizes="25vw" className="object-cover" />
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
