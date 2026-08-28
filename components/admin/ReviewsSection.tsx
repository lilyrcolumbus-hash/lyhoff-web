"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Card, Empty, Note, Pill, day, patchRow, readCollection } from "./ui";

interface Review {
  id: string;
  slug: string | null;
  rating: number;
  author: string;
  location: string | null;
  text: string;
  approved: boolean;
  created_at: string;
}

export function ReviewsSection({ reportCount }: { reportCount: (key: string, n: number) => void }) {
  const [rows, setRows] = useState<Review[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await readCollection<Review>("reviews");
    setRows(data ?? []);
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
        Publishing marks a review approved. It appears on the product page at the next publish.
      </Note>
    </div>
  );
}
