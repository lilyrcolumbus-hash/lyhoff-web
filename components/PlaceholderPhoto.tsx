import type { Locale } from "@/lib/i18n";

/**
 * Honest stand-in for a real photo that doesn't exist yet. Shows a soft,
 * on-brand box with a visible "Photo needed" note instead of a fake/stock
 * photo, so it's obvious at a glance what still needs to be shot.
 */
export function PlaceholderPhoto({
  note,
  locale,
  ratio = "square",
  className = "",
}: {
  note: Record<Locale, string>;
  locale: Locale;
  ratio?: "square" | "portrait" | "wide";
  className?: string;
}) {
  const aspect =
    ratio === "portrait"
      ? "aspect-[4/5]"
      : ratio === "wide"
        ? "aspect-[16/9]"
        : "aspect-square";

  return (
    <div
      className={`${aspect} ${className} flex w-full flex-col items-center justify-center gap-3 border-2 border-dashed border-earth-400/50 bg-gradient-to-br from-forest-50 to-earth-50 px-6 text-center`}
      role="img"
      aria-label={note[locale]}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-8 w-8 text-earth-500/60"
        aria-hidden
      >
        <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
        <circle cx="12" cy="13" r="3.5" />
      </svg>
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-earth-600">
        {locale === "en" ? "Photo needed" : "Foto pendiente"}
      </p>
      <p className="max-w-[220px] text-xs leading-relaxed text-stone-500">
        {note[locale]}
      </p>
    </div>
  );
}
