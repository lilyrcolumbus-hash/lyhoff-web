"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Empty,
  Note,
  Pill,
  createRow,
  day,
  inputClass,
  labelClass,
  money,
  patchRow,
  readCollection,
} from "./ui";

interface Order {
  id: string;
  email: string;
  customer_name: string | null;
  amount_total: number;
  currency: string;
  items: { name: string; quantity: number; amount_total: number }[];
  shipping_address: Record<string, string | null> | null;
  created_at: string;
  tracking_number: string | null;
  shipped_at: string | null;
}

interface OrderNote {
  order_id: string;
  note: string;
}

/** Stripe's own address shape, written out the way an envelope is. */
function addressLines(address: Record<string, string | null> | null): string[] {
  if (!address) return [];
  return [
    address.line1,
    address.line2,
    [address.city, address.state, address.postal_code].filter(Boolean).join(", "),
    address.country,
  ].filter((line): line is string => Boolean(line && line.trim()));
}

/**
 * Orders: the list is for scanning, the detail is for packing one.
 *
 * Everything needed to put a parcel in the post is here — what to put in it,
 * who it goes to, where — so the answer is never "open Stripe and look". The
 * tracking number is the field that earns the screen: "where is my order?" is
 * the message every shop gets most, and it stops arriving once the customer can
 * read the answer on their own account page.
 *
 * Refunds stay in Stripe on purpose. Stripe holds the card, the dispute
 * evidence and the audit trail, and moving money is not an action that belongs
 * one stray click away in a panel wired straight to production.
 */
export function OrdersSection({ reportCount }: { reportCount: (key: string, n: number) => void }) {
  const [rows, setRows] = useState<Order[] | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [tracking, setTracking] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    const [orders, storedNotes] = await Promise.all([
      readCollection<Order>("orders"),
      readCollection<OrderNote>("order_notes"),
    ]);
    setRows(orders ?? []);
    if (orders) reportCount("orders", orders.length);
    if (storedNotes) {
      setNotes(Object.fromEntries(storedNotes.map((row) => [row.order_id, row.note])));
    }
  }, [reportCount]);

  useEffect(() => {
    void load();
  }, [load]);

  const open = rows?.find((order) => order.id === openId) ?? null;

  function openOrder(order: Order) {
    setOpenId(order.id);
    setTracking(order.tracking_number ?? "");
    setNote(notes[order.id] ?? "");
    setMessage(null);
    window.scrollTo({ top: 0 });
  }

  async function save() {
    if (!open || saving) return;
    setSaving(true);
    setMessage(null);

    const trimmed = tracking.trim();
    if (trimmed !== (open.tracking_number ?? "")) {
      const result = await patchRow("orders", open.id, {
        tracking_number: trimmed || null,
        // Marking it shipped is the same act as entering the tracking number —
        // asking for both would only create orders that disagree with themselves.
        shipped_at: trimmed ? new Date().toISOString() : null,
      });
      if (!result.ok) {
        setMessage({ kind: "error", text: "Couldn't save the tracking number." });
        setSaving(false);
        return;
      }
      const saved = result.row as Order;
      setRows((list) => (list ?? []).map((o) => (o.id === saved.id ? saved : o)));
    }

    if (note !== (notes[open.id] ?? "")) {
      // The note row is created the first time one is written, so an order that
      // never needed a note never gets an empty row.
      const existing = open.id in notes;
      const result = existing
        ? await patchRow("order_notes", open.id, { note })
        : await createRow("order_notes", { order_id: open.id, note });
      if (!result.ok) {
        setMessage({ kind: "error", text: "Couldn't save the note." });
        setSaving(false);
        return;
      }
      setNotes((current) => ({ ...current, [open.id]: note }));
    }

    setMessage({ kind: "ok", text: "Saved." });
    setSaving(false);
  }

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!rows) return [];
    if (!needle) return rows;
    return rows.filter((order) =>
      [order.email, order.customer_name, order.id, order.tracking_number].some((field) =>
        field?.toLowerCase().includes(needle),
      ),
    );
  }, [rows, query]);

  if (rows === null) return <Empty>Loading orders…</Empty>;
  if (rows.length === 0) {
    return (
      <Empty>
        No orders yet.
        <span className="mt-2 block text-[12px]">
          Only purchases made since Stripe was connected to this database appear here. Earlier ones
          are still in Stripe.
        </span>
      </Empty>
    );
  }

  // ── One order, ready to pack ──────────────────────────────────────────────
  if (open) {
    const address = addressLines(open.shipping_address);
    const dirty = tracking.trim() !== (open.tracking_number ?? "") || note !== (notes[open.id] ?? "");

    return (
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setOpenId(null)}
          className="self-start text-[12.5px] font-semibold text-stone-500 transition hover:text-forest-950"
        >
          ← Orders
        </button>

        <Card className="flex flex-wrap items-center gap-3 px-4 py-3">
          <div className="min-w-0">
            <h2 className="truncate font-display text-[15px] font-bold text-forest-950">
              {open.customer_name || open.email}
            </h2>
            <span className="text-[11px] text-stone-500">{day(open.created_at)}</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {message && (
              <span className={`text-[12.5px] ${message.kind === "ok" ? "text-earth-700" : "text-clay-600"}`}>
                {message.text}
              </span>
            )}
            <span className="font-display text-[17px] font-bold text-forest-950">
              {money(open.amount_total, open.currency)}
            </span>
            <Button onClick={save} disabled={!dirty || saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </Card>

        <div className="grid gap-3 lg:grid-cols-2">
          <Card className="p-4">
            <h3 className="mb-2 font-display text-[13.5px] font-bold text-forest-950">In the box</h3>
            <ul className="flex flex-col gap-1 border-t border-stone-200 pt-2">
              {(open.items ?? []).map((item, index) => (
                <li key={index} className="flex justify-between gap-4 text-[13px] text-stone-700">
                  <span>
                    {item.quantity} × {item.name}
                  </span>
                  <span className="shrink-0 tabular-nums">{money(item.amount_total, open.currency)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 border-t border-stone-200 pt-2 text-right text-[13px] font-semibold tabular-nums text-forest-950">
              {money(open.amount_total, open.currency)} paid, shipping included
            </p>
          </Card>

          <Card className="p-4">
            <h3 className="mb-2 font-display text-[13.5px] font-bold text-forest-950">Ships to</h3>
            <div className="border-t border-stone-200 pt-2 text-[13px] leading-relaxed text-stone-700">
              {open.customer_name && <p className="font-medium text-forest-950">{open.customer_name}</p>}
              {address.length > 0 ? (
                address.map((line) => <p key={line}>{line}</p>)
              ) : (
                <p className="text-stone-500">
                  No address stored. Orders placed before this screen existed only have theirs in
                  Stripe.
                </p>
              )}
              <p className="mt-2 text-stone-500">{open.email}</p>
            </div>
          </Card>
        </div>

        <Card className="flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-1.5">
            <span className={labelClass}>Tracking number</span>
            <input
              className={`${inputClass} max-w-[320px]`}
              value={tracking}
              onChange={(event) => setTracking(event.target.value)}
              placeholder="Not shipped yet"
            />
            <Note>The customer sees this on their account as soon as you save it.</Note>
          </div>

          <div className="flex flex-col gap-1.5 border-t border-stone-200 pt-4">
            <span className={labelClass}>Private note</span>
            <textarea
              className={`${inputClass} min-h-[70px] resize-y leading-relaxed`}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Gift wrap, a replacement, whatever you need to remember."
            />
            <Note>Only you see this. It is stored apart from the order so it can't reach the customer.</Note>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-stone-200 pt-4">
            <a
              className="text-[12.5px] font-semibold text-indigo-700 underline underline-offset-2"
              href={`https://dashboard.stripe.com/payments?query=${encodeURIComponent(open.id)}`}
              target="_blank"
              rel="noreferrer"
            >
              Open in Stripe ↗
            </a>
            <Note>Refunds and the invoice live there — that's where the payment and its record are.</Note>
          </div>
        </Card>
      </div>
    );
  }

  // ── The list ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3">
      <input
        className={inputClass}
        placeholder="Search by name, email or tracking number"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      <Card className="divide-y divide-stone-200">
        {filtered.length === 0 ? (
          <div className="px-4 py-6 text-center text-[13px] text-stone-500">Nothing matches that search.</div>
        ) : (
          filtered.map((order) => (
            <button
              key={order.id}
              type="button"
              onClick={() => openOrder(order)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-stone-50"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-medium text-forest-950">
                  {order.customer_name || order.email}
                </span>
                <span className="block text-[11.5px] text-stone-500">
                  {day(order.created_at)} · {(order.items ?? []).reduce((n, i) => n + i.quantity, 0)} items
                </span>
              </span>
              <span className="shrink-0 text-[13px] tabular-nums text-forest-950">
                {money(order.amount_total, order.currency)}
              </span>
              <span className="w-28 shrink-0 text-right">
                {order.tracking_number ? <Pill tone="live">SHIPPED</Pill> : <Pill tone="warn">TO SHIP</Pill>}
              </span>
            </button>
          ))
        )}
      </Card>
    </div>
  );
}
