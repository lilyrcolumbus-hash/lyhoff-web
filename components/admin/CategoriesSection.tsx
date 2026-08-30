"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_CATEGORIES, shopCategories, type CategoryContent } from "@/lib/categories";
import { BilingualField } from "./BilingualField";
import { slugify } from "./NewProduct";
import { Button, Card, Empty, Note, Pill, inputClass, labelClass, patchRow, readCollection } from "./ui";

interface Setting {
  key: string;
  value: { list?: Entry[] };
}

interface Entry extends CategoryContent {
  key: string;
}

const EMPTY = { en: "", es: "" };

function blank(key: string): Entry {
  return {
    key,
    title: { ...EMPTY },
    headline: { ...EMPTY },
    sub: { ...EMPTY },
    why: { ...EMPTY },
    video: "",
  };
}

/**
 * The lines the shop is divided into.
 *
 * A category's address is fixed once it exists, the same as a product's — it is
 * a page people link to. Everything else about it is text.
 *
 * There is no delete. A category with products in it would orphan them, and one
 * without any already disappears from the shop and the menu on its own: both
 * build themselves from the categories that actually have something to sell. So
 * emptying a category is how you retire it, and nothing has to be cleaned up.
 */
export function CategoriesSection({ reportCount }: { reportCount: (key: string, n: number) => void }) {
  const [rows, setRows] = useState<Setting[] | null>(null);
  const [draft, setDraft] = useState<Entry[]>([]);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    const data = await readCollection<Setting>("settings");
    setRows(data ?? []);
    const stored = (data ?? []).find((row) => row.key === "categories")?.value?.list;
    const base = Array.isArray(stored) && stored.length > 0
      ? stored
      : shopCategories().map(({ key, content }) => ({ key, ...content }));
    setDraft(structuredClone(base));
    reportCount("categories", base.length);
  }, [reportCount]);

  useEffect(() => {
    void load();
  }, [load]);

  const stored = rows?.find((row) => row.key === "categories")?.value?.list;
  const original = Array.isArray(stored) && stored.length > 0
    ? stored
    : shopCategories().map(({ key, content }) => ({ key, ...content }));
  const dirty = JSON.stringify(original) !== JSON.stringify(draft);

  function set(key: string, patch: Partial<Entry>) {
    setDraft((current) => current.map((entry) => (entry.key === key ? { ...entry, ...patch } : entry)));
    setMessage(null);
  }

  function move(index: number, to: number) {
    if (to < 0 || to >= draft.length) return;
    setDraft((current) => {
      const next = [...current];
      const [moved] = next.splice(index, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  function add() {
    const key = slugify(newName);
    if (!key) return;
    if (draft.some((entry) => entry.key === key)) {
      setMessage({ kind: "error", text: "There's already a category at that address." });
      return;
    }
    const entry = blank(key);
    entry.title = { en: newName.trim(), es: newName.trim() };
    setDraft((current) => [...current, entry]);
    setNewName("");
    setAdding(false);
    setOpenKey(key);
  }

  async function save() {
    if (saving) return;
    const empty = draft.find((entry) => !entry.title.en.trim());
    if (empty) {
      setMessage({ kind: "error", text: `"${empty.key}" needs an English name.` });
      return;
    }
    setSaving(true);
    setMessage(null);
    const result = await patchRow("settings", "categories", { value: { list: draft } });
    if (!result.ok) {
      setMessage({ kind: "error", text: "Couldn't save." });
      setSaving(false);
      return;
    }
    await load();
    setMessage({ kind: "ok", text: "Saved — on the site at the next publish." });
    setSaving(false);
  }

  if (rows === null) return <Empty>Loading…</Empty>;

  return (
    <div className="flex flex-col gap-3">
      <Card className="flex flex-wrap items-center gap-3 px-4 py-3">
        <p className="text-[12.5px] text-stone-600">
          The lines your shop is divided into, in this order.
        </p>
        <div className="ml-auto flex items-center gap-3">
          {message && (
            <span className={`text-[12.5px] ${message.kind === "ok" ? "text-earth-700" : "text-clay-600"}`}>
              {message.text}
            </span>
          )}
          {dirty && !message && <span className="text-[12.5px] text-stone-500">Unsaved changes</span>}
          <Button onClick={save} disabled={!dirty || saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </Card>

      {draft.map((entry, index) => {
        const isOpen = openKey === entry.key;
        const isNew = !(entry.key in DEFAULT_CATEGORIES);
        return (
          <Card key={entry.key} className="overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 px-4 py-3">
              <span className="flex shrink-0 flex-col">
                <button
                  type="button"
                  onClick={() => move(index, index - 1)}
                  disabled={index === 0}
                  aria-label="Move up"
                  className="text-[11px] leading-tight text-stone-500 disabled:opacity-25 hover:text-forest-950"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => move(index, index + 1)}
                  disabled={index === draft.length - 1}
                  aria-label="Move down"
                  className="text-[11px] leading-tight text-stone-500 disabled:opacity-25 hover:text-forest-950"
                >
                  ▼
                </button>
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-medium text-forest-950">
                  {entry.title.en || entry.key}
                </span>
                <span className="block text-[11.5px] text-stone-500">/products/category/{entry.key}/</span>
              </span>

              {isNew && <Pill tone="warn">NEW</Pill>}

              <button
                type="button"
                onClick={() => setOpenKey(isOpen ? null : entry.key)}
                className="shrink-0 text-[12px] text-stone-500 underline underline-offset-2 hover:text-forest-950"
              >
                {isOpen ? "Hide" : "Edit"}
              </button>
            </div>

            {isOpen && (
              <div className="flex flex-col gap-5 border-t border-stone-200 bg-stone-50/60 px-4 py-4">
                <BilingualField
                  title="Name"
                  value={entry.title}
                  onChange={(title) => set(entry.key, { title })}
                  hint="What appears in the Shop menu and above the products."
                />
                <BilingualField
                  title="Headline"
                  value={entry.headline}
                  onChange={(headline) => set(entry.key, { headline })}
                  hint="The one line at the top of the category page."
                />
                <BilingualField
                  title="Short description"
                  multiline
                  value={entry.sub}
                  onChange={(sub) => set(entry.key, { sub })}
                />
                <BilingualField
                  title="Why it's different"
                  multiline
                  value={entry.why}
                  onChange={(why) => set(entry.key, { why })}
                  hint="The paragraph next to the video, further down the page."
                />
                <label className="flex flex-col gap-1.5">
                  <span className={labelClass}>Video</span>
                  <input
                    className={inputClass}
                    value={entry.video}
                    onChange={(event) => set(entry.key, { video: event.target.value })}
                    placeholder="/videos/herbs.mp4"
                  />
                  <Note>One of the clips already on the site. Leave empty for none.</Note>
                </label>
              </div>
            )}
          </Card>
        );
      })}

      {adding ? (
        <Card className="flex flex-wrap items-end gap-3 p-4">
          <label className="flex min-w-[220px] flex-1 flex-col gap-1.5">
            <span className={labelClass}>Category name</span>
            <input
              className={inputClass}
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="Candles"
            />
            <Note>Its address will be /products/category/{slugify(newName) || "…"}/ and can&apos;t change later.</Note>
          </label>
          <Button onClick={add} disabled={!newName.trim()}>
            Add
          </Button>
          <Button variant="quiet" onClick={() => setAdding(false)}>
            Cancel
          </Button>
        </Card>
      ) : (
        <div className="flex items-center gap-3">
          <Button variant="quiet" onClick={() => setAdding(true)}>
            Add category
          </Button>
          <Note>
            A new one stays invisible until a product is put in it — the shop and the menu build
            themselves from the categories that have something to sell.
          </Note>
        </div>
      )}
    </div>
  );
}
