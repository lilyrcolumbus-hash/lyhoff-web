"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Card, Empty, Note, inputClass, labelClass, patchRow, readCollection } from "./ui";

interface Setting {
  key: string;
  value: Record<string, unknown>;
}

/**
 * The numbers the shop runs on.
 *
 * They are read when the site is built, not when a customer checks out — the
 * same rule the catalogue follows, and for the same reason: a shipping rate
 * that could change between the page being rendered and the payment being taken
 * is the one drift worth designing against. So a change here needs a publish,
 * and the screen says so rather than letting her wonder.
 */
export function PreferencesSection() {
  const [rows, setRows] = useState<Setting[] | null>(null);
  const [draft, setDraft] = useState<Record<string, Record<string, unknown>>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    const data = await readCollection<Setting>("settings");
    setRows(data ?? []);
    setDraft(Object.fromEntries((data ?? []).map((row) => [row.key, { ...row.value }])));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const dirty =
    rows !== null &&
    rows.some((row) => JSON.stringify(row.value) !== JSON.stringify(draft[row.key] ?? {}));

  function set(key: string, field: string, value: unknown) {
    setDraft((current) => ({ ...current, [key]: { ...(current[key] ?? {}), [field]: value } }));
    setMessage(null);
  }

  function get<T>(key: string, field: string, fallback: T): T {
    const value = draft[key]?.[field];
    return value === undefined || value === null ? fallback : (value as T);
  }

  async function save() {
    if (!rows || saving) return;
    setSaving(true);
    setMessage(null);

    for (const row of rows) {
      const next = draft[row.key] ?? {};
      if (JSON.stringify(row.value) === JSON.stringify(next)) continue;
      const result = await patchRow("settings", row.key, { value: next });
      if (!result.ok) {
        setMessage({ kind: "error", text: `Couldn't save ${row.key}.` });
        setSaving(false);
        await load();
        return;
      }
    }

    await load();
    setMessage({ kind: "ok", text: "Saved — live on the site once you publish." });
    setSaving(false);
  }

  if (rows === null) return <Empty>Loading…</Empty>;
  if (rows.length === 0) return <Empty>No settings stored.</Empty>;

  // Cents in the database, dollars on screen: nobody types 999 meaning $9.99.
  const flatDollars = (get("shipping", "flatCents", 0) / 100).toFixed(2);

  return (
    <div className="flex flex-col gap-3">
      <Card className="flex flex-wrap items-center gap-3 px-4 py-3">
        <p className="text-[12.5px] text-stone-600">
          These reach the site at the next publish, not immediately.
        </p>
        <div className="ml-auto flex items-center gap-3">
          {message && (
            <span className={`text-[12.5px] ${message.kind === "ok" ? "text-earth-700" : "text-clay-600"}`}>
              {message.text}
            </span>
          )}
          <Button onClick={save} disabled={!dirty || saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </Card>

      <Card className="flex flex-col gap-5 p-5">
        <h2 className="font-display text-[14px] font-bold text-forest-950">Shipping</h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <span className={labelClass}>Flat rate</span>
            <div className="flex">
              <span className="border border-r-0 border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-500">
                $
              </span>
              <input
                className={`${inputClass} border-l-0`}
                inputMode="decimal"
                value={flatDollars}
                onChange={(event) =>
                  set("shipping", "flatCents", Math.max(0, Math.round(Number(event.target.value) * 100) || 0))
                }
              />
            </div>
            <Note>Charged once per order, whatever is in it.</Note>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className={labelClass}>Delivery, fastest</span>
            <input
              className={inputClass}
              inputMode="numeric"
              value={get("shipping", "minDays", 2)}
              onChange={(event) => set("shipping", "minDays", Math.max(1, Number(event.target.value) || 1))}
            />
            <Note>Business days, shown at checkout.</Note>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className={labelClass}>Delivery, slowest</span>
            <input
              className={inputClass}
              inputMode="numeric"
              value={get("shipping", "maxDays", 5)}
              onChange={(event) => set("shipping", "maxDays", Math.max(1, Number(event.target.value) || 1))}
            />
            <Note>Promise the slower end, not the hopeful one.</Note>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className={labelClass}>Ships to</span>
          <input
            className={inputClass}
            value={get<string[]>("shipping", "countries", []).join(", ")}
            onChange={(event) =>
              set(
                "shipping",
                "countries",
                event.target.value
                  .split(",")
                  .map((code) => code.trim().toUpperCase())
                  .filter(Boolean),
              )
            }
          />
          <Note>Two-letter country codes, separated by commas. US only today.</Note>
        </div>
      </Card>

      <Card className="flex flex-col gap-5 p-5">
        <h2 className="font-display text-[14px] font-bold text-forest-950">Business</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <span className={labelClass}>Contact email</span>
            <input
              className={inputClass}
              type="email"
              value={get("business", "email", "")}
              onChange={(event) => set("business", "email", event.target.value)}
            />
            <Note>What customers write to. Shown on the site and used as the reply address.</Note>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className={labelClass}>Legal name</span>
            <input
              className={inputClass}
              value={get("business", "legalName", "")}
              onChange={(event) => set("business", "legalName", event.target.value)}
            />
            <Note>The registered name, for the terms and privacy pages.</Note>
          </div>
        </div>

        <label className="flex items-center gap-2.5 text-sm text-ink">
          <input
            type="checkbox"
            checked={get("business", "notifyOnNewReview", false)}
            onChange={(event) => set("business", "notifyOnNewReview", event.target.checked)}
          />
          Email me at the contact email above when a new review comes in
        </label>
        <Note>
          Optional — off by default. This one takes effect right away, no publish needed.
        </Note>
      </Card>
    </div>
  );
}
