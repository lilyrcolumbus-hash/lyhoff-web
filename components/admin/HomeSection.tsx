"use client";

import { useEffect, useState } from "react";
import type { SectionId } from "./AdminApp";
import { Card, Note, money, readCollection } from "./ui";

interface Order { amount_total: number; currency: string; tracking_number: string | null }
interface Review { approved: boolean }
interface Product { active: boolean }

export function HomeSection({ onGo }: { onGo: (section: SectionId) => void }) {
  const [stats, setStats] = useState<{
    revenue: number; orders: number; unshipped: number; pending: number; live: number; hidden: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [orders, reviews, products] = await Promise.all([
        readCollection<Order>("orders"),
        readCollection<Review>("reviews"),
        readCollection<Product>("products"),
      ]);
      if (cancelled) return;
      setStats({
        revenue: (orders ?? []).reduce((sum, o) => sum + (o.amount_total ?? 0), 0),
        orders: (orders ?? []).length,
        unshipped: (orders ?? []).filter((o) => !o.tracking_number).length,
        pending: (reviews ?? []).filter((r) => !r.approved).length,
        live: (products ?? []).filter((p) => p.active).length,
        hidden: (products ?? []).filter((p) => !p.active).length,
      });
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  if (!stats) return <Card className="p-8 text-center text-sm text-stone-500">Loading…</Card>;

  // Ordered by what needs a decision, not by what looks impressive.
  const tiles: { label: string; value: string; hint?: string; go?: SectionId }[] = [
    { label: "Orders to ship", value: String(stats.unshipped), hint: "no tracking number yet", go: "orders" },
    { label: "Reviews to review", value: String(stats.pending), hint: "waiting on your decision", go: "reviews" },
    { label: "Products live", value: String(stats.live), hint: `${stats.hidden} hidden`, go: "products" },
    { label: "Sold", value: money(stats.revenue), hint: `${stats.orders} orders in total` },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((tile) => (
          <Card key={tile.label} className="p-4">
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-stone-400">
              {tile.label}
            </p>
            <p className="mt-1.5 font-display text-2xl font-bold tabular-nums text-forest-950">
              {tile.value}
            </p>
            {tile.hint && <p className="text-[12px] text-stone-500">{tile.hint}</p>}
            {tile.go && (
              <button
                type="button"
                onClick={() => onGo(tile.go as SectionId)}
                className="mt-2 text-[12px] text-indigo-600 underline underline-offset-2 hover:text-forest-950"
              >
                View
              </button>
            )}
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <h2 className="font-display text-[15px] font-bold text-forest-950">
          Saving and publishing are two things
        </h2>
        <div className="mt-2">
          <Note>
            Saving records a change in your database straight away. The site itself is rebuilt only
            when you press Publish, which takes one to three minutes — that gap is deliberate, so
            the price a customer is reading is always the price they get charged.
          </Note>
        </div>
      </Card>
    </div>
  );
}
