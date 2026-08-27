"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Card, Empty, Note, Pill, day, inputClass, money, patchRow, readCollection } from "./ui";

interface Order {
  id: string;
  email: string;
  amount_total: number;
  currency: string;
  items: { name: string; quantity: number; amount_total: number }[];
  created_at: string;
  tracking_number: string | null;
}

/**
 * Orders, and the field that makes them worth having here: a tracking number.
 * "Where is my order?" is the most common message any store gets — once the
 * customer can read it on their own account page, the question stops arriving.
 */
export function OrdersSection({ reportCount }: { reportCount: (key: string, n: number) => void }) {
  const [rows, setRows] = useState<Order[] | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [tracking, setTracking] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const data = await readCollection<Order>("orders");
    setRows(data ?? []);
    if (data) reportCount("pedidos", data.length);
  }, [reportCount]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveTracking(id: string) {
    setSaving(true);
    const result = await patchRow("orders", id, {
      tracking_number: tracking.trim() || null,
      shipped_at: tracking.trim() ? new Date().toISOString() : null,
    });
    if (result.ok) {
      const saved = result.row as Order;
      setRows((list) => (list ?? []).map((o) => (o.id === saved.id ? saved : o)));
      setEditing(null);
    }
    setSaving(false);
  }

  if (rows === null) return <Empty>Loading orders…</Empty>;
  if (rows.length === 0) {
    return (
      <Empty>
        No orders stored yet.
        <span className="mt-2 block text-[12px]">
          Solo aparecen las compras hechas desde que se conectó Stripe a tu base de datos. Las
          anteriores siguen en Stripe.
        </span>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {rows.map((order) => (
        <Card key={order.id} className="p-4">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-[13px] font-semibold text-forest-950">{order.email}</span>
            <span className="text-[12px] text-stone-500">{day(order.created_at)}</span>
            <span className="ml-auto font-display text-[15px] font-bold text-forest-950">
              {money(order.amount_total, order.currency)}
            </span>
          </div>

          {order.items?.length > 0 && (
            <ul className="mt-2 flex flex-col gap-0.5 border-t border-stone-200 pt-2">
              {order.items.map((item, index) => (
                <li key={index} className="flex justify-between gap-4 text-[12.5px] text-stone-600">
                  <span>{item.quantity} × {item.name}</span>
                  <span className="shrink-0">{money(item.amount_total, order.currency)}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-stone-200 pt-3">
            {editing === order.id ? (
              <>
                <input
                  className={`${inputClass} max-w-[260px]`}
                  placeholder="Tracking number"
                  value={tracking}
                  onChange={(event) => setTracking(event.target.value)}
                />
                <Button onClick={() => saveTracking(order.id)} disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </Button>
                <Button variant="quiet" onClick={() => setEditing(null)}>Cancel</Button>
              </>
            ) : order.tracking_number ? (
              <>
                <Pill tone="live">SHIPPED</Pill>
                <span className="text-[12.5px] tabular-nums text-stone-600">{order.tracking_number}</span>
                <Button
                  variant="quiet"
                  onClick={() => {
                    setEditing(order.id);
                    setTracking(order.tracking_number ?? "");
                  }}
                >
                  Change
                </Button>
              </>
            ) : (
              <>
                <Pill tone="warn">NOT SHIPPED</Pill>
                <Button
                  variant="quiet"
                  onClick={() => {
                    setEditing(order.id);
                    setTracking("");
                  }}
                >
                  Add tracking
                </Button>
              </>
            )}
          </div>
        </Card>
      ))}
      <Note>The customer sees the tracking number on their account as soon as you save it.</Note>
    </div>
  );
}
