"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, Empty, Note, Pill, day, inputClass, money, readCollection } from "./ui";

interface Subscriber {
  id: string;
  email: string;
  locale: string | null;
  source: string | null;
  created_at: string;
  unsubscribed_at: string | null;
}

interface Order {
  id: string;
  email: string;
  customer_name: string | null;
  amount_total: number;
  currency: string;
  items: { name: string; quantity: number }[];
  shipping_address: Record<string, string | null> | null;
  created_at: string;
  tracking_number: string | null;
}

interface Customer {
  email: string;
  name: string | null;
  orders: Order[];
  spent: number;
  currency: string;
  first: string;
  last: string;
  subscribed: boolean;
  unsubscribed: boolean;
}

/**
 * A customer is a person, assembled from what the shop already knows.
 *
 * There is no customers table and there does not need to be one: an order
 * carries an email, and the mailing list carries an email. Grouping by it is
 * the whole feature. Building a separate table would mean a third copy of the
 * same person that could disagree with the other two.
 *
 * Matched on the email as the customer typed it, lowercased. Someone who checks
 * out twice with two different addresses is genuinely two records here, and
 * pretending otherwise would merge two people who share a household.
 */
function assemble(orders: Order[], subscribers: Subscriber[]): Customer[] {
  const byEmail = new Map<string, Customer>();

  for (const order of orders) {
    const email = order.email.trim().toLowerCase();
    if (!email) continue;
    const existing = byEmail.get(email);
    if (existing) {
      existing.orders.push(order);
      existing.spent += order.amount_total;
      existing.name = existing.name ?? order.customer_name;
      if (order.created_at < existing.first) existing.first = order.created_at;
      if (order.created_at > existing.last) existing.last = order.created_at;
    } else {
      byEmail.set(email, {
        email,
        name: order.customer_name,
        orders: [order],
        spent: order.amount_total,
        currency: order.currency,
        first: order.created_at,
        last: order.created_at,
        subscribed: false,
        unsubscribed: false,
      });
    }
  }

  for (const subscriber of subscribers) {
    const email = subscriber.email.trim().toLowerCase();
    if (!email) continue;
    const existing = byEmail.get(email);
    if (existing) {
      existing.subscribed = !subscriber.unsubscribed_at;
      existing.unsubscribed = Boolean(subscriber.unsubscribed_at);
      continue;
    }
    // On the list but has never bought. Still a customer worth seeing — they
    // are the people a discount code is for.
    byEmail.set(email, {
      email,
      name: null,
      orders: [],
      spent: 0,
      currency: "usd",
      first: subscriber.created_at,
      last: subscriber.created_at,
      subscribed: !subscriber.unsubscribed_at,
      unsubscribed: Boolean(subscriber.unsubscribed_at),
    });
  }

  return [...byEmail.values()].sort((a, b) => (a.last < b.last ? 1 : -1));
}

function addressLines(address: Record<string, string | null> | null): string[] {
  if (!address) return [];
  return [
    address.line1,
    address.line2,
    [address.city, address.state, address.postal_code].filter(Boolean).join(", "),
    address.country,
  ].filter((line): line is string => Boolean(line && line.trim()));
}

type Filter = "all" | "buyers" | "repeat" | "list";

const FILTERS: { id: Filter; label: string; keep: (c: Customer) => boolean }[] = [
  { id: "all", label: "Everyone", keep: () => true },
  { id: "buyers", label: "Have bought", keep: (c) => c.orders.length > 0 },
  { id: "repeat", label: "Bought more than once", keep: (c) => c.orders.length > 1 },
  { id: "list", label: "On the mailing list", keep: (c) => c.subscribed },
];

export function CustomersSection({ reportCount }: { reportCount: (key: string, n: number) => void }) {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[] | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [openEmail, setOpenEmail] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [orderRows, subscriberRows] = await Promise.all([
      readCollection<Order>("orders"),
      readCollection<Subscriber>("subscribers"),
    ]);
    setOrders(orderRows ?? []);
    setSubscribers(subscriberRows ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const customers = useMemo(
    () => (orders && subscribers ? assemble(orders, subscribers) : []),
    [orders, subscribers],
  );

  useEffect(() => {
    if (customers.length > 0) reportCount("customers", customers.length);
  }, [customers, reportCount]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const keep = FILTERS.find((f) => f.id === filter)?.keep ?? (() => true);
    return customers
      .filter(keep)
      .filter((c) => !needle || c.email.includes(needle) || c.name?.toLowerCase().includes(needle));
  }, [customers, query, filter]);

  if (orders === null || subscribers === null) return <Empty>Loading…</Empty>;
  if (customers.length === 0) return <Empty>Nobody has bought or subscribed yet.</Empty>;

  const open = customers.find((c) => c.email === openEmail);

  // ── One person ────────────────────────────────────────────────────────────
  if (open) {
    // The address they used most recently is the one to post to.
    const latest = open.orders[0]?.shipping_address ?? null;
    const address = addressLines(latest);

    return (
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setOpenEmail(null)}
          className="self-start text-[12.5px] font-semibold text-stone-500 transition hover:text-forest-950"
        >
          ← Customers
        </button>

        <Card className="flex flex-wrap items-center gap-4 px-4 py-3">
          <div className="min-w-0">
            <h2 className="truncate font-display text-[15px] font-bold text-forest-950">
              {open.name || open.email}
            </h2>
            <span className="text-[11px] text-stone-500">{open.email}</span>
          </div>
          <div className="ml-auto flex items-center gap-5 text-right">
            <span className="flex flex-col">
              <span className="font-display text-[17px] font-bold text-forest-950">
                {money(open.spent, open.currency)}
              </span>
              <span className="text-[11px] text-stone-500">spent in total</span>
            </span>
            <span className="flex flex-col">
              <span className="font-display text-[17px] font-bold text-forest-950">
                {open.orders.length}
              </span>
              <span className="text-[11px] text-stone-500">
                {open.orders.length === 1 ? "order" : "orders"}
              </span>
            </span>
          </div>
        </Card>

        <div className="grid gap-3 lg:grid-cols-2">
          <Card className="p-4">
            <h3 className="mb-2 font-display text-[13.5px] font-bold text-forest-950">Last address</h3>
            <div className="border-t border-stone-200 pt-2 text-[13px] leading-relaxed text-stone-700">
              {address.length > 0 ? (
                address.map((line) => <p key={line}>{line}</p>)
              ) : (
                <p className="text-stone-500">No address stored yet.</p>
              )}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="mb-2 font-display text-[13.5px] font-bold text-forest-950">Mailing list</h3>
            <div className="border-t border-stone-200 pt-2 text-[13px] text-stone-700">
              {open.subscribed && <p>Subscribed — they can be emailed.</p>}
              {open.unsubscribed && <p>Unsubscribed. Don&apos;t email them.</p>}
              {!open.subscribed && !open.unsubscribed && (
                <p className="text-stone-500">
                  Not on the list. Buying doesn&apos;t subscribe anyone — it is asked for separately.
                </p>
              )}
              <p className="mt-2 text-stone-500">First seen {day(open.first)}</p>
            </div>
          </Card>
        </div>

        <Card className="divide-y divide-stone-200">
          {open.orders.length === 0 ? (
            <div className="px-4 py-6 text-center text-[13px] text-stone-500">
              On the list, but hasn&apos;t bought anything yet.
            </div>
          ) : (
            open.orders.map((order) => (
              <div key={order.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] text-forest-950">
                    {(order.items ?? []).map((item) => `${item.quantity} × ${item.name}`).join(", ")}
                  </span>
                  <span className="block text-[11.5px] text-stone-500">{day(order.created_at)}</span>
                </span>
                <span className="shrink-0 text-[13px] tabular-nums text-forest-950">
                  {money(order.amount_total, order.currency)}
                </span>
                <span className="w-24 shrink-0 text-right">
                  {order.tracking_number ? <Pill tone="live">SHIPPED</Pill> : <Pill tone="warn">TO SHIP</Pill>}
                </span>
              </div>
            ))
          )}
        </Card>
      </div>
    );
  }

  // ── The list ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((option) => (
          <Button
            key={option.id}
            variant={filter === option.id ? "primary" : "quiet"}
            onClick={() => setFilter(option.id)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      <input
        className={inputClass}
        placeholder="Search by name or email"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      <Card className="divide-y divide-stone-200">
        {visible.length === 0 ? (
          <div className="px-4 py-6 text-center text-[13px] text-stone-500">Nobody matches that.</div>
        ) : (
          visible.map((customer) => (
            <button
              key={customer.email}
              type="button"
              onClick={() => setOpenEmail(customer.email)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-stone-50"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-medium text-forest-950">
                  {customer.name || customer.email}
                </span>
                <span className="block truncate text-[11.5px] text-stone-500">
                  {customer.orders.length > 0
                    ? `${customer.orders.length} ${customer.orders.length === 1 ? "order" : "orders"} · last ${day(customer.last)}`
                    : `On the list since ${day(customer.first)}`}
                </span>
              </span>
              <span className="shrink-0 text-[13px] tabular-nums text-forest-950">
                {customer.spent > 0 ? money(customer.spent, customer.currency) : "—"}
              </span>
              <span className="w-24 shrink-0 text-right">
                {customer.unsubscribed ? (
                  <Pill tone="off">OFF LIST</Pill>
                ) : customer.subscribed ? (
                  <Pill tone="live">ON LIST</Pill>
                ) : null}
              </span>
            </button>
          ))
        )}
      </Card>

      <Note>
        Assembled from orders and the mailing list, matched on the email address. Buying doesn&apos;t
        subscribe anyone — that is asked for separately, which is why some people are on one and not
        the other.
      </Note>
    </div>
  );
}
