"use client";

import { t, type Locale } from "@/lib/i18n";

/**
 * "Save to Pinterest" button. Opens the Pinterest Pin-it create dialog with the
 * current page URL, the pin image (2:3 preferred) and the article title as the
 * default pin description — turning every reader into a distributor.
 */
export function SaveToPinterest({
  locale,
  title,
  imageUrl,
}: {
  locale: Locale;
  title: string;
  imageUrl?: string;
}) {
  const dict = t(locale);

  function onClick() {
    if (typeof window === "undefined") return;
    const pageUrl = window.location.href;
    const params = new URLSearchParams({
      url: pageUrl,
      description: title,
    });
    if (imageUrl) {
      const absolute = imageUrl.startsWith("http")
        ? imageUrl
        : `${window.location.origin}${imageUrl}`;
      params.set("media", absolute);
    }
    window.open(
      `https://www.pinterest.com/pin/create/button/?${params.toString()}`,
      "_blank",
      "noopener,noreferrer,width=750,height=650",
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full bg-[#e60023] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#c8001e]"
    >
      <span aria-hidden>📌</span>
      {dict.saveToPinterest}
    </button>
  );
}
