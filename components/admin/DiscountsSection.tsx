"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Card, Empty, Note, Pill, inputClass, labelClass } from "./ui";

interface Code {
  id: string;
  code: string;
  active: boolean;
  redeemed: number;
  maxRedemptions: number | null;
  firstOrderOnly: boolean;
  percentOff: number | null;
  amountOff: number | null;
  minimumCents: number | null;
  expiresAt: number | null;
}

const ERRORS: Record<string, string> = {
  code_taken: "That code already exists in Stripe.",
  invalid_code: "Use 3–32 letters and numbers, no spaces.",
  invalid_percent: "The discount has to be between 1 and 100 percent.",
  not_configured: "Stripe isn't connected.",
};

/**
 * Discount codes, read and written straight in Stripe.
 *
 * They are not copied into this database on purpose. Stripe is what enforces
 * "once per customer" and what records every redemption; a second copy here
 * would be a second answer to the same question, and the two would drift.
 *
 * Turning a code off rather than deleting it keeps the record of what was
 * redeemed under it, which is the part that matters afterwards.
 */
export function DiscountsSection() {
  const [codes, setCodes] = useState<Code[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [adding, setAdding] = useState(false);
  const [code, setCode] = useState("");
  const [percent, setPercent] = useState("10");
  const [firstOrderOnly, setFirstOrderOnly] = useState(true);
  const [minimum, setMinimum] = useState("");
  const [limit, setLimit] = useState("");
  const [days, setDays] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/discounts", { credentials: "same-origin" }).catch(() => null);
    if (!res?.ok) {
      setFailed(true);
      setCodes([]);
      return;
    }
    const data = (await res.json()) as { codes?: Code[] };
    setCodes(data.codes ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function create() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/discounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        code,
        percentOff: Number(percent),
        firstOrderOnly,
        minimumCents: minimum.trim() ? Math.round(Number(minimum) * 100) : undefined,
        maxRedemptions: limit.trim() ? Math.round(Number(limit)) : undefined,
        expiresInDays: days.trim() ? Math.round(Number(days)) : undefined,
      }),
    }).catch(() => null);

    const body = (await res?.json().catch(() => ({}))) as { error?: string };
    if (!res?.ok) {
      setError(ERRORS[body.error ?? ""] ?? "Stripe wouldn't create it.");
      setBusy(false);
      return;
    }
    setCode("");
    setMinimum("");
    setLimit("");
    setDays("");
    setAdding(false);
    setBusy(false);
    await load();
  }

  async function toggle(row: Code) {
    setBusy(true);
    await fetch("/api/admin/discounts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ id: row.id, active: !row.active }),
    }).catch(() => null);
    setBusy(false);
    await load();
  }

  if (codes === null) return <Empty>Loading from Stripe…</Empty>;
  if (failed) return <Empty>Couldn't reach Stripe. Nothing has changed there.</Empty>;

  return (
    <div className="flex flex-col gap-3">
      {adding ? (
        <Card className="flex flex-col gap-4 p-5">
          <h2 className="font-display text-[14px] font-bold text-forest-950">New code</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <span className={labelClass}>Code</span>
              <input
                className={`${inputClass} uppercase`}
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                placeholder="SPRING20"
              />
              <Note>What the customer types. Letters and numbers only.</Note>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className={labelClass}>Discount</span>
              <div className="flex">
                <input
                  className={`${inputClass} border-r-0`}
                  inputMode="numeric"
                  value={percent}
                  onChange={(event) => setPercent(event.target.value)}
                />
                <span className="border border-l-0 border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-500">
                  %
                </span>
              </div>
              <Note>Off the whole order, once per customer.</Note>
            </div>
          </div>

          <div className="grid gap-4 border-t border-stone-200 pt-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <span className={labelClass}>Minimum order</span>
              <div className="flex">
                <span className="border border-r-0 border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-500">
                  $
                </span>
                <input
                  className={`${inputClass} border-l-0`}
                  inputMode="decimal"
                  value={minimum}
                  onChange={(event) => setMinimum(event.target.value)}
                  placeholder="Any"
                />
              </div>
              <Note>Before shipping. Leave empty for no minimum.</Note>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className={labelClass}>Times it can be used</span>
              <input
                className={inputClass}
                inputMode="numeric"
                value={limit}
                onChange={(event) => setLimit(event.target.value)}
                placeholder="Unlimited"
              />
              <Note>Across everyone, not per person.</Note>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className={labelClass}>Expires in</span>
              <div className="flex">
                <input
                  className={`${inputClass} border-r-0`}
                  inputMode="numeric"
                  value={days}
                  onChange={(event) => setDays(event.target.value)}
                  placeholder="Never"
                />
                <span className="border border-l-0 border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-500">
                  days
                </span>
              </div>
              <Note>A deadline is what makes a code get used.</Note>
            </div>
          </div>

          <label className="flex items-start justify-between gap-4 border-t border-stone-200 pt-4">
            <span>
              <span className={labelClass}>First order only</span>
              <span className="mt-0.5 block text-[11.5px] text-stone-500">
                Stripe only counts orders paid on this site, so someone who bought on Etsy still
                counts as new here.
              </span>
            </span>
            <input
              type="checkbox"
              checked={firstOrderOnly}
              onChange={(event) => setFirstOrderOnly(event.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 accent-[#93906d]"
            />
          </label>

          <div className="flex items-center gap-3 border-t border-stone-200 pt-4">
            <Button onClick={create} disabled={busy || !code.trim()}>
              {busy ? "Creating…" : "Create in Stripe"}
            </Button>
            <Button variant="quiet" onClick={() => setAdding(false)} disabled={busy}>
              Cancel
            </Button>
            {error && <span className="ml-auto text-[12.5px] text-clay-600">{error}</span>}
          </div>
        </Card>
      ) : (
        <div className="flex items-center gap-3">
          <Button onClick={() => setAdding(true)}>Add code</Button>
          <Note>Codes live in Stripe. This reads and writes them there directly.</Note>
        </div>
      )}

      <Card className="divide-y divide-stone-200">
        {codes.length === 0 ? (
          <div className="px-4 py-6 text-center text-[13px] text-stone-500">No codes in Stripe yet.</div>
        ) : (
          codes.map((row) => (
            <div key={row.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <span className="min-w-0 flex-1">
                <span className="block truncate font-mono text-[13.5px] font-semibold text-forest-950">
                  {row.code}
                </span>
                <span className="block text-[11.5px] text-stone-500">
                  {row.percentOff ? `${row.percentOff}% off` : `$${((row.amountOff ?? 0) / 100).toFixed(2)} off`}
                  {row.firstOrderOnly && " · first order only"}
                  {row.minimumCents ? ` · over $${(row.minimumCents / 100).toFixed(2)}` : ""}
                  {row.maxRedemptions ? ` · ${row.maxRedemptions} max` : ""}
                  {row.expiresAt
                    ? ` · ${row.expiresAt * 1000 < Date.now() ? "expired" : `until ${new Date(row.expiresAt * 1000).toLocaleDateString()}`}`
                    : ""}
                </span>
              </span>
              <span className="shrink-0 text-[12.5px] tabular-nums text-stone-600">
                {row.redeemed} used
              </span>
              <span className="w-20 shrink-0 text-right">
                {row.active ? <Pill tone="live">ON</Pill> : <Pill tone="off">OFF</Pill>}
              </span>
              <Button variant="quiet" onClick={() => toggle(row)} disabled={busy}>
                {row.active ? "Turn off" : "Turn on"}
              </Button>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
