"use client";

import { useCallback, useEffect, useState } from "react";
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
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    const data = await readCollection<Product>("products");
    setRows(data ?? []);
    if (data) reportCount("productos", data.length);
  }, [reportCount]);

  useEffect(() => {
    void load();
  }, [load]);

  function open(product: Product) {
    setSlug(product.slug);
    setDraft(structuredClone(product));
    setMessage(null);
  }

  const original = rows?.find((r) => r.slug === slug);
  const dirty = draft !== null && JSON.stringify(draft) !== JSON.stringify(original);

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

  if (rows === null) return <Empty>Loading products…</Empty>;
  if (rows.length === 0) return <Empty>No products.</Empty>;

  return (
    <div className="grid gap-4 xl:grid-cols-[300px_1fr]">
      <Card className="max-h-[70vh] divide-y divide-stone-200 overflow-y-auto">
        {rows.map((product) => (
          <button
            key={product.slug}
            type="button"
            onClick={() => open(product)}
            aria-current={slug === product.slug}
            className={`flex w-full items-center gap-2 px-3 py-2.5 text-left transition ${
              slug === product.slug ? "bg-earth-50" : "hover:bg-stone-50"
            }`}
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium text-forest-950">
                {product.name?.es}
              </span>
              <span className="block text-[11px] text-stone-500">
                {product.size} · {price(product.price)}
              </span>
            </span>
            {!product.active && <Pill tone="off">HIDDEN</Pill>}
          </button>
        ))}
      </Card>

      {!draft ? (
        <Empty>Pick a product to edit it.</Empty>
      ) : (
        <div className="flex min-w-0 flex-col gap-3">
          <Card className="flex flex-wrap items-center gap-3 px-4 py-3">
            <h2 className="font-display text-[15px] font-bold text-forest-950">{draft.name?.es}</h2>
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
      )}
    </div>
  );
}
