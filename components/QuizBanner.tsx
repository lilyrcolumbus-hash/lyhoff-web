import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { Leaf } from "@/components/illustrations";

/** Prominent CTA to the product-finder quiz — was previously just a small text link. */
export function QuizBanner({ locale, className = "" }: { locale: Locale; className?: string }) {
  return (
    <div className={`bg-forest-950 ${className}`}>
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Leaf className="h-8 w-8 shrink-0 text-earth-400" />
          <div>
            <h2 className="font-display text-xl font-bold text-cream sm:text-2xl">
              {locale === "en" ? "Not sure where to start?" : "¿No sabes por dónde empezar?"}
            </h2>
            <p className="mt-1 text-sm text-stone-300">
              {locale === "en"
                ? "Answer 2 quick questions and we'll match you to the right product."
                : "Responde 2 preguntas rápidas y te recomendamos el producto correcto."}
            </p>
          </div>
        </div>
        <Link
          href={`/${locale}/quiz/`}
          className="inline-flex shrink-0 items-center gap-2 bg-earth-500 px-6 py-3 text-sm font-semibold text-forest-950 transition hover:bg-earth-400"
        >
          {locale === "en" ? "Take the quiz" : "Hacer el quiz"}
          <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M2.5 9.5 9.5 2.5M9.5 2.5H4M9.5 2.5V8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
