"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type Locale } from "@/lib/i18n";
import { RETURNING_CODE, WELCOME_CODE_STORAGE_KEY } from "@/lib/checkout";
import { getProduct } from "@/lib/products";
import { LogoMark } from "@/components/illustrations";

type Status = "idle" | "loading" | "success" | "error";

// Each printed card ships with ONE specific product's own illustration, so
// the review is locked to whichever product the card names via ?p=<slug> in
// its QR URL — never a picker. Falls back to Hummingbird Nectar (the first
// card built) when the param is absent.
const DEFAULT_REVIEW_SLUG = "hummingbird-nectar";

function Stars({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
          className="text-2xl leading-none transition"
        >
          <span className={n <= value ? "text-earth-500" : "text-stone-300"}>★</span>
        </button>
      ))}
    </div>
  );
}

export function ThankYouClient({ locale }: { locale: Locale }) {
  const es = locale === "es";

  const [reviewSlug, setReviewSlug] = useState(DEFAULT_REVIEW_SLUG);
  const [rating, setRating] = useState(0);
  const [author, setAuthor] = useState("");
  const [location, setLocation] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    const fromQuery = new URLSearchParams(window.location.search).get("p");
    if (fromQuery && getProduct(fromQuery)) setReviewSlug(fromQuery);
  }, []);

  const product = getProduct(reviewSlug);
  // Some products (e.g. Sea Salt Spray) come in "For Her"/"For Him" variants
  // that share one review card/QR — the review itself isn't gendered, so
  // strip that suffix here rather than ask the customer about "your Sea Salt
  // Spray — For Her" when they may have bought the Him version.
  const productName = product
    ? product.name[locale].replace(/\s*—\s*(For (Her|Him)|Para (Ella|Él))\s*$/i, "")
    : "";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading" || rating === 0 || !author || !text) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: reviewSlug, rating, author, location, text, locale }),
      });
      if (res.ok) {
        // Only unlock + auto-apply the code once a real review has been submitted.
        localStorage.setItem(WELCOME_CODE_STORAGE_KEY, RETURNING_CODE);
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-20">
      <div className="text-center">
        <LogoMark className="mx-auto h-14 w-14 text-forest-950" textClassName="text-lg" />
        <h1 className="mt-4 font-display text-3xl font-bold text-forest-950 text-balance">
          {es
            ? "Raíces reales. Nada que esconder — ni siquiera una mala reseña."
            : "Real roots. Nothing to hide — not even a bad review."}
        </h1>
        <p className="mt-4 text-base text-stone-600 leading-relaxed">
          {es
            ? "Déjala, buena o mala — desbloquea 15% en tu próxima compra."
            : "Leave yours, good or bad — it unlocks 15% off your next order."}
        </p>
      </div>

      <div className="mt-12 border-t border-stone-200 pt-10">
        <h2 className="font-display text-xl font-bold text-forest-950">
          {es ? `¿Cómo te fue con tu ${productName}, de verdad?` : `How did your ${productName} really go?`}
        </h2>
        <p className="mt-2 text-sm text-stone-600">
          {es
            ? "Preferimos saber la verdad que juntar cinco estrellas que no nos ganamos. Buena, mala o algo intermedio — la leemos nosotros mismos, y nos ayuda a mejorar de verdad."
            : "We'd rather know the truth than collect five stars we didn't earn. Good, bad, or somewhere in between — we read every one ourselves, and it genuinely helps us improve."}
        </p>

        {status === "success" ? (
          <div className="mt-6 text-center">
            <div className="rounded-sm bg-forest-100 px-4 py-3 text-sm font-medium text-forest-800">
              ✓ {es ? "¡Gracias! La revisaremos pronto." : "Thank you! We'll review it soon."}
            </div>
            <p className="mt-6 text-sm text-stone-600">
              {es ? "Aquí está tu código — ya está aplicado:" : "Here's your code — it's already applied:"}
            </p>
            <p className="mt-3 inline-block rounded-sm border border-dashed border-earth-400 bg-earth-50 px-5 py-2 font-display text-lg font-bold tracking-widest text-earth-700">
              {RETURNING_CODE}
            </p>
            <div>
              <Link
                href={`/${locale}/products/`}
                className="mt-6 inline-flex items-center rounded-sm bg-forest-950 px-7 py-3.5 text-sm font-semibold text-cream transition hover:bg-forest-800"
              >
                {es ? "Ver productos" : "Shop now"} →
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
            <Stars value={rating} onChange={setRating} />

            <textarea
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={es ? "Cuéntanos tu experiencia" : "Tell us about your experience"}
              rows={4}
              className="rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-indigo-500"
            />

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder={es ? "Tu nombre" : "Your name"}
                className="flex-1 rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-indigo-500"
              />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={es ? "Ciudad, Estado" : "City, State"}
                className="flex-1 rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading" || rating === 0}
              className="self-start rounded-sm bg-earth-500 px-6 py-3 text-sm font-semibold text-forest-950 transition hover:bg-earth-600 disabled:opacity-60"
            >
              {status === "loading" ? (es ? "Enviando…" : "Sending…") : es ? "Enviar reseña" : "Submit review"}
            </button>

            {status === "error" && (
              <p className="text-sm text-clay-600">
                {es ? "Algo falló — inténtalo de nuevo." : "Something went wrong — please try again."}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
