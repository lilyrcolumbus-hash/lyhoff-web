"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, Empty, Note, Pill, day, money, readCollection } from "./ui";

interface Abandoned {
  id: string;
  email: string;
  customer_name: string | null;
  amount_total: number;
  currency: string;
  items: { name: string; quantity: number }[];
  locale: string | null;
  emailed_at: string | null;
  recovered_at: string | null;
  created_at: string;
}

/**
 * Checkouts that were started and never paid.
 *
 * Nothing about anyone's browser is tracked to produce this. Stripe already
 * knows the checkout expired and already holds the basket, so a row appears
 * only once a real person reached the payment page and typed an email — which
 * is also the only point at which there is anywhere to send a reminder.
 *
 * One email, automatically, and never a discount: offering money off to anyone
 * who hesitates teaches people to hesitate, and it would undercut WELCOME10 for
 * the same customer.
 */
export function AbandonedSection({ reportCount }: { reportCount: (key: string, n: number) => void }) {
  const [rows, setRows] = useState<Abandoned[] | null>(null);

  const load = useCallback(async () => {
    const data = await readCollection<Abandoned>("abandoned");
    setRows(data ?? []);
    if (data) reportCount("abandoned", data.filter((row) => !row.recovered_at).length);
  }, [reportCount]);

  useEffect(() => {
    void load();
  }, [load]);

  if (rows === null) return <Empty>Loading…</Empty>;
  if (rows.length === 0) {
    return (
      <Empty>
        Nothing abandoned yet.
        <span className="mt-2 block text-[12px]">
          A checkout lands here four hours after someone starts it and doesn&apos;t pay. They get one
          reminder with a link back to their basket, automatically.
        </span>
      </Empty>
    );
  }

  const recovered = rows.filter((row) => row.recovered_at);
  const recoveredValue = recovered.reduce((sum, row) => sum + row.amount_total, 0);

  return (
    <div className="flex flex-col gap-3">
      <Card className="flex flex-wrap items-center gap-6 px-4 py-3">
        <span className="flex flex-col">
          <span className="font-display text-[17px] font-bold text-forest-950">{rows.length}</span>
          <span className="text-[11px] text-stone-500">left without paying</span>
        </span>
        <span className="flex flex-col">
          <span className="font-display text-[17px] font-bold text-forest-950">{recovered.length}</span>
          <span className="text-[11px] text-stone-500">came back and bought</span>
        </span>
        {recoveredValue > 0 && (
          <span className="flex flex-col">
            <span className="font-display text-[17px] font-bold text-earth-700">
              {money(recoveredValue, recovered[0]?.currency ?? "usd")}
            </span>
            <span className="text-[11px] text-stone-500">recovered</span>
          </span>
        )}
      </Card>

      <Card className="divide-y divide-stone-200">
        {rows.map((row) => (
          <div key={row.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13.5px] font-medium text-forest-950">
                {row.customer_name || row.email}
              </span>
              <span className="block truncate text-[11.5px] text-stone-500">
                {(row.items ?? []).map((item) => `${item.quantity} × ${item.name}`).join(", ") || "—"}
              </span>
            </span>
            <span className="shrink-0 text-[13px] tabular-nums text-forest-950">
              {money(row.amount_total, row.currency)}
            </span>
            <span className="shrink-0 text-[11.5px] text-stone-500">{day(row.created_at)}</span>
            <span className="w-28 shrink-0 text-right">
              {row.recovered_at ? (
                <Pill tone="live">RECOVERED</Pill>
              ) : row.emailed_at ? (
                <Pill tone="warn">REMINDED</Pill>
              ) : (
                <Pill tone="off">NO EMAIL</Pill>
              )}
            </span>
          </div>
        ))}
      </Card>

      <Note>
        &quot;No email&quot; means they left before Stripe had an address to write to. There is nothing to
        send, and nothing to do about it.
      </Note>
    </div>
  );
}
