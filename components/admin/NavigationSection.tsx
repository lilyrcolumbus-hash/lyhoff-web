"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_HEADER_LINKS, type NavLink } from "@/lib/navigation";
import { Button, Card, Empty, Note, inputClass, patchRow, readCollection } from "./ui";

interface Setting {
  key: string;
  value: { header?: NavLink[] };
}

const EMPTY_LINK: NavLink = { label: { en: "", es: "" }, path: "" };

/**
 * The links across the top, in order.
 *
 * Shop is not in this list: that menu builds itself from the categories that
 * actually have products, so a category emptying out removes its own link
 * rather than leaving one that leads nowhere.
 */
export function NavigationSection() {
  const [rows, setRows] = useState<Setting[] | null>(null);
  const [links, setLinks] = useState<NavLink[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    const data = await readCollection<Setting>("settings");
    setRows(data ?? []);
    const stored = (data ?? []).find((row) => row.key === "navigation")?.value?.header;
    setLinks(structuredClone(Array.isArray(stored) && stored.length > 0 ? stored : DEFAULT_HEADER_LINKS));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const stored = rows?.find((row) => row.key === "navigation")?.value ?? {};
  const original = Array.isArray(stored.header) && stored.header.length > 0 ? stored.header : DEFAULT_HEADER_LINKS;
  const dirty = JSON.stringify(original) !== JSON.stringify(links);

  function update(index: number, patch: Partial<NavLink>) {
    setLinks((current) => current.map((link, i) => (i === index ? { ...link, ...patch } : link)));
    setMessage(null);
  }

  function move(index: number, to: number) {
    if (to < 0 || to >= links.length) return;
    setLinks((current) => {
      const next = [...current];
      const [moved] = next.splice(index, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  async function save() {
    if (saving) return;
    const cleaned = links.filter((link) => link.path.trim() && link.label.en.trim() && link.label.es.trim());
    if (cleaned.length === 0) {
      setMessage({ kind: "error", text: "A header with no links isn't something to save." });
      return;
    }
    setSaving(true);
    setMessage(null);
    const result = await patchRow("settings", "navigation", {
      value: { ...stored, header: cleaned.map((link) => ({ ...link, path: link.path.trim() })) },
    });
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
    <div className="flex max-w-3xl flex-col gap-3">
      <Card className="flex flex-wrap items-center gap-3 px-4 py-3">
        <p className="text-[12.5px] text-stone-600">The links across the top, in this order.</p>
        <div className="ml-auto flex items-center gap-3">
          {message && (
            <span className={`text-[12.5px] ${message.kind === "ok" ? "text-earth-700" : "text-clay-600"}`}>
              {message.text}
            </span>
          )}
          {dirty && (
            <Button variant="quiet" onClick={() => setLinks(structuredClone(DEFAULT_HEADER_LINKS))} disabled={saving}>
              Back to defaults
            </Button>
          )}
          <Button onClick={save} disabled={!dirty || saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </Card>

      <Card className="divide-y divide-stone-200">
        {links.map((link, index) => (
          <div key={index} className="flex flex-wrap items-end gap-3 px-4 py-3">
            <span className="flex shrink-0 flex-col pb-1.5">
              <button
                type="button"
                onClick={() => move(index, index - 1)}
                disabled={index === 0}
                aria-label="Move up"
                className="text-[12px] leading-tight text-stone-500 disabled:opacity-25 hover:text-forest-950"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => move(index, index + 1)}
                disabled={index === links.length - 1}
                aria-label="Move down"
                className="text-[12px] leading-tight text-stone-500 disabled:opacity-25 hover:text-forest-950"
              >
                ▼
              </button>
            </span>

            <label className="flex min-w-[130px] flex-1 flex-col gap-1">
              <span className="text-[9.5px] font-bold tracking-[0.14em] text-stone-400">ENGLISH</span>
              <input
                className={`${inputClass} py-1.5 text-[13px]`}
                value={link.label.en}
                onChange={(event) => update(index, { label: { ...link.label, en: event.target.value } })}
              />
            </label>
            <label className="flex min-w-[130px] flex-1 flex-col gap-1">
              <span className="text-[9.5px] font-bold tracking-[0.14em] text-stone-400">SPANISH</span>
              <input
                className={`${inputClass} py-1.5 text-[13px]`}
                value={link.label.es}
                onChange={(event) => update(index, { label: { ...link.label, es: event.target.value } })}
              />
            </label>
            <label className="flex min-w-[150px] flex-1 flex-col gap-1">
              <span className="text-[9.5px] font-bold tracking-[0.14em] text-stone-400">GOES TO</span>
              <span className="flex">
                <span className="border border-r-0 border-stone-300 bg-stone-50 px-2 py-1.5 text-[12px] text-stone-500">
                  /en/
                </span>
                <input
                  className={`${inputClass} border-l-0 py-1.5 text-[13px]`}
                  value={link.path}
                  onChange={(event) => update(index, { path: event.target.value })}
                />
              </span>
            </label>

            <button
              type="button"
              onClick={() => setLinks((current) => current.filter((_, i) => i !== index))}
              aria-label="Remove link"
              className="pb-2 text-[13px] text-stone-400 hover:text-clay-600"
            >
              ✕
            </button>
          </div>
        ))}

        <div className="px-4 py-3">
          <Button variant="quiet" onClick={() => setLinks((current) => [...current, structuredClone(EMPTY_LINK)])}>
            Add link
          </Button>
        </div>
      </Card>

      <Note>
        A link has to point at a page that exists. Shop isn't here — that menu builds itself from
        the categories that have products in them.
      </Note>
    </div>
  );
}
