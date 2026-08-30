"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Card, Empty, Note, Pill, day, inputClass, labelClass, patchRow, readCollection } from "./ui";

interface Review {
  id: string;
  slug: string | null;
  rating: number;
  author: string;
  location: string | null;
  text: string;
  locale: string | null;
  translation: string | null;
  approved: boolean;
  created_at: string;
}

export function ReviewsSection({ reportCount }: { reportCount: (key: string, n: number) => void }) {
  const [rows, setRows] = useState<Review[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [translations, setTranslations] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const data = await readCollection<Review>("reviews");
    setRows(data ?? []);
    setTranslations(Object.fromEntries((data ?? []).map((r) => [r.id, r.translation ?? ""])));
    // The count that matters in the sidebar is what still needs a decision.
    if (data) reportCount("reviews", data.filter((r) => !r.approved).length);
  }, [reportCount]);

  useEffect(() => {
    void load();
  }, [load]);

  async function decide(id: string, approved: boolean) {
    setBusy(id);
    const result = await patchRow("reviews", id, { approved });
    if (result.ok) {
      const saved = result.row as Review;
      setRows((list) => (list ?? []).map((r) => (r.id === saved.id ? saved : r)));
      reportCount("reviews", (rows ?? []).filter((r) => (r.id === id ? !approved : !r.approved)).length);
    }
    setBusy(null);
  }

  async function saveTranslation(id: string) {
    setBusy(id);
    const result = await patchRow("reviews", id, { translation: translations[id] ?? "" });
    if (result.ok) {
      const saved = result.row as Review;
      setRows((list) => (list ?? []).map((r) => (r.id === saved.id ? saved : r)));
    }
    setBusy(null);
  }

  if (rows === null) return <Empty>Loading reviews…</Empty>;
  if (rows.length === 0) return <Empty>No reviews have come in yet.</Empty>;

  return (
    <div className="flex flex-col gap-3">
      {rows.map((review) => (
        <Card key={review.id} className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[15px] text-earth-500" aria-label={`${review.rating} of 5`}>
              {"★".repeat(review.rating)}
              <span className="text-stone-300">{"★".repeat(5 - review.rating)}</span>
            </span>
            {review.approved ? <Pill tone="live">PUBLISHED</Pill> : <Pill tone="warn">NEEDS REVIEW</Pill>}
            <span className="ml-auto text-[12px] text-stone-500">{day(review.created_at)}</span>
          </div>

          <p className="mt-2 text-sm leading-relaxed text-ink">{review.text}</p>
          <p className="mt-1.5 text-[12px] text-stone-500">
            {review.author}
            {review.location ? ` · ${review.location}` : ""}
            {review.slug ? ` · ${review.slug}` : ""}
          </p>

          <div className="mt-3 flex flex-col gap-1.5 border-t border-stone-200 pt-3">
            <span className={labelClass}>
              {wroteIn(review) === "es" ? "In English" : "En español"}
            </span>
            <textarea
              className={`${inputClass} min-h-[60px] resize-y text-[13px] leading-relaxed`}
              value={translations[review.id] ?? ""}
              onChange={(event) =>
                setTranslations((current) => ({ ...current, [review.id]: event.target.value }))
              }
              placeholder="Translate it here, in your own words."
            />
            <span className="flex items-center gap-3">
              <Button
                variant="quiet"
                disabled={busy === review.id || (translations[review.id] ?? "") === (review.translation ?? "")}
                onClick={() => saveTranslation(review.id)}
              >
                Save translation
              </Button>
              <span className="text-[11.5px] text-stone-500">
                {review.translation?.trim()
                  ? "Shows in both languages."
                  : `Only shows on the ${wroteIn(review) === "es" ? "Spanish" : "English"} page until this is filled.`}
              </span>
            </span>
          </div>

          <div className="mt-3 flex gap-2 border-t border-stone-200 pt-3">
            {review.approved ? (
              <Button variant="quiet" disabled={busy === review.id} onClick={() => decide(review.id, false)}>
                Unpublish
              </Button>
            ) : (
              <Button disabled={busy === review.id} onClick={() => decide(review.id, true)}>
                Publish
              </Button>
            )}
          </div>
        </Card>
      ))}
      <Note>
        A published review appears on its product page at the next publish. A customer writes in
        one language and this site never mixes the two, so it only appears on the other language's
        page once you have translated it.
      </Note>
    </div>
  );
}

/** Which language the customer actually wrote in. */
function wroteIn(review: Review): "en" | "es" {
  return review.locale === "es" ? "es" : "en";
}
