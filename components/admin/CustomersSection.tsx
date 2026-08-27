"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, Empty, Note, Pill, day, readCollection } from "./ui";

interface Subscriber {
  id: string;
  email: string;
  locale: string | null;
  source: string | null;
  created_at: string;
  unsubscribed_at: string | null;
}

export function CustomersSection({ reportCount }: { reportCount: (key: string, n: number) => void }) {
  const [rows, setRows] = useState<Subscriber[] | null>(null);

  const load = useCallback(async () => {
    const data = await readCollection<Subscriber>("subscribers");
    setRows(data ?? []);
    if (data) reportCount("clientes", data.filter((s) => !s.unsubscribed_at).length);
  }, [reportCount]);

  useEffect(() => {
    void load();
  }, [load]);

  if (rows === null) return <Empty>Loading…</Empty>;
  if (rows.length === 0) return <Empty>Nobody has subscribed yet.</Empty>;

  return (
    <div className="flex flex-col gap-3">
      <Card className="divide-y divide-stone-200">
        {rows.map((subscriber) => (
          <div key={subscriber.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5">
            <span className="text-[13px] text-forest-950">{subscriber.email}</span>
            {subscriber.unsubscribed_at ? <Pill tone="off">UNSUBSCRIBED</Pill> : <Pill tone="live">ACTIVE</Pill>}
            <span className="ml-auto text-[11.5px] text-stone-500">
              {subscriber.source} · {day(subscriber.created_at)}
            </span>
          </div>
        ))}
      </Card>
      <Note>
        This is your mailing list. Customers with accounts and their purchases are under Orders —
        buying doesn't create a subscription, it's asked for separately.
      </Note>
    </div>
  );
}
