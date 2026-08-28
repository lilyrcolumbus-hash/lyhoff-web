"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BilingualField, type Bilingual } from "./BilingualField";
import { Button, Card, Empty, Note, Pill, inputClass, labelClass, patchRow, price, readCollection } from "./ui";

interface Product {
  slug: string;
  category: string;
  name: Bilingual;
  tagline: Bilingual;
  description: Bilingual;
  how_to_use: Bilingual | null;
  gift: Bilingual | null;
  size: string | null;
  price: number;
  active: boolean;
}

const EMPTY: Bilingual = { en: "", es: "" };

export function ProductsSection({ reportCount }: { reportCount: (key: string, n: number) => void }) {
  const [rows, setRows] = useState<Product[] | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [draft, setDraft] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    const data = await readCollection<Product>("products");
    setRows(data ?? []);
    if (data) reportCount("products", data.length);
  }, [reportCount]);

  useEffect(() => {
    void load();
  }, [load]);

  const original = rows?.find((r) => r.slug === slug);
  const dirty = draft !== null && JSON.stringify(draft) !== JSON.stringify(original);

  function open(product: Product) {
    setSlug(product.slug);
    setDraft(structuredClone(product));
    setMessage(null);
    // The editor takes over the whole pane, so this is a different screen now —
    // start it at the top rather than wherever the list happened to be scrolled.
    window.scrollTo({ top: 0 });
  }

  function close() {
    if (dirty && !window.confirm("You have unsaved changes. Leave without saving?")) return;
    setSlug(null);
    setDraft(null);
    setMessage(null);
  }

  function discard() {
    if (!original) return;
    setDraft(structuredClone(original));
    setMessage(null);
  }

  async function save() {
    if (!draft || !original || saving) return;
    setSaving(true);
    setMessage(null);

    // Send only what changed: a whole-row write would stamp over anything
    // edited elsewhere since this page loaded.
    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(draft)) {
      if (key === "slug") continue;
      if (JSON.stringify(value) !== JSON.stringify(original[key as keyof Product])) patch[key] = value;
    }

    const result = await patchRow("products", draft.slug, patch);
    if (!result.ok) {
      setMessage({
        kind: "error",
        text: result.error === "invalid_price" ? "That price isn't valid." : "Couldn't save.",
      });
      setSaving(false);
      return;
    }

    const saved = result.row as Product;
    setRows((list) => (list ?? []).map((r) => (r.slug === saved.slug ? saved : r)));
    setDraft(structuredClone(saved));
    setMessage({ kind: "ok", text: "Saved — not on the site until you publish." });
    setSaving(false);
  }

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!rows) return [];
    if (!needle) return rows;
    return rows.filter((r) =>
      [r.name?.en, r.name?.es, r.slug, r.size].some((field) => field?.toLowerCase().includes(needle)),
    );
  }, [rows, query]);

  if (rows === null) return <Empty>Loading products…</Empty>;
  if (rows.length === 0) return <Empty>No products.</Empty>;

  // ── The editor, once a product is open ────────────────────────────────────
  // It replaces the list rather than sitting beside it. Side by side only fits
  // above 1280px, and below that the editor landed underneath a 17-row list —
  // off screen, so opening a product looked like nothing had happened at all.
  if (draft) {
    return (
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={close}
          className="self-start text-[12.5px] font-semibold text-stone-500 transition hover:text-forest-950"
        >
          ← Products
        </button>

        <Card className="flex flex-wrap items-center gap-3 px-4 py-3">
          <div className="min-w-0">
            <h2 className="truncate font-display text-[15px] font-bold text-forest-950">{draft.name?.en}</h2>
            <span className="text-[11px] text-stone-500">{draft.slug}</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {message && (
              <span className={`text-[12.5px] ${message.kind === "ok" ? "text-earth-700" : "text-clay-600"}`}>
                {message.text}
              </span>
            )}
            {dirty && !message && <span className="text-[12.5px] text-stone-500">Unsaved changes</span>}
            {dirty && (
              <Button variant="quiet" onClick={discard} disabled={saving}>
                Discard
              </Button>
            )}
            <Button onClick={save} disabled={!dirty || saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </Card>

        <Card className="flex flex-col gap-5 p-5">
          <BilingualField title="Name" value={draft.name} onChange={(name) => setDraft({ ...draft, name })} />
          <BilingualField title="Tagline" value={draft.tagline} onChange={(tagline) => setDraft({ ...draft, tagline })} />
          <BilingualField title="Description" multiline value={draft.description} onChange={(description) => setDraft({ ...draft, description })} />
          <BilingualField title="How to use" multiline value={draft.how_to_use ?? EMPTY} onChange={(how_to_use) => setDraft({ ...draft, how_to_use })} />
          <BilingualField title="Free gift" value={draft.gift ?? EMPTY} onChange={(gift) => setDraft({ ...draft, gift })} hint="Leave empty if this product has no gift." />

          <div className="grid gap-4 sm:grid-cols-[150px_1fr]">
            <div className="flex flex-col gap-1.5">
              <span className={labelClass}>Price</span>
              <div className="flex">
                <span className="border border-r-0 border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-500">$</span>
                <input
                  className={`${inputClass} border-l-0`}
                  inputMode="decimal"
                  value={draft.price}
                  onChange={(event) => setDraft({ ...draft, price: event.target.value as unknown as number })}
                />
              </div>
              <Note>+ $9.99 shipping at checkout</Note>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className={labelClass}>Size</span>
              <input className={inputClass} value={draft.size ?? ""} onChange={(event) => setDraft({ ...draft, size: event.target.value })} />
            </div>
          </div>

          <label className="flex items-start justify-between gap-4 border-t border-stone-200 pt-4">
            <span>
              <span className={labelClass}>Visible in the store</span>
              <span className="mt-0.5 block text-[11.5px] text-stone-500">
                Turn it off when you run out. Nothing is deleted, it just stops showing.
              </span>
            </span>
            <input
              type="checkbox"
              checked={draft.active}
              onChange={(event) => setDraft({ ...draft, active: event.target.checked })}
              className="mt-1 h-4 w-4 shrink-0 accent-[#93906d]"
            />
          </label>
        </Card>
      </div>
    );
  }

  // ── The list ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3">
      <input
        className={inputClass}
        placeholder="Search products"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      <Card className="divide-y divide-stone-200">
        {filtered.length === 0 ? (
          <div className="px-4 py-6 text-center text-[13px] text-stone-500">Nothing matches that search.</div>
        ) : (
          filtered.map((product) => (
            <button
              key={product.slug}
              type="button"
              onClick={() => open(product)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-stone-50"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-medium text-forest-950">
                  {product.name?.en}
                </span>
                <span className="block text-[11.5px] text-stone-500">{product.size}</span>
              </span>
              <span className="shrink-0 text-[13px] tabular-nums text-forest-950">{price(product.price)}</span>
              <span className="w-16 shrink-0 text-right">
                {product.active ? <Pill tone="live">LIVE</Pill> : <Pill tone="off">HIDDEN</Pill>}
              </span>
            </button>
          ))
        )}
      </Card>
    </div>
  );
}
