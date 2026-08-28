"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { dictionary } from "@/lib/i18n";
import { Button, Card, Empty, Note, inputClass, patchRow, readCollection } from "./ui";

interface Setting {
  key: string;
  value: Record<string, { en?: string; es?: string }>;
}

/**
 * Grouped the way the site is read, not the way the file is ordered.
 *
 * A flat list of a hundred keys is a wall. Anything not claimed by a group
 * falls into "Everywhere else", so adding a string to the dictionary can never
 * make it disappear from this screen.
 */
const GROUPS: { title: string; match: (key: string) => boolean }[] = [
  { title: "Home", match: (k) => k.startsWith("hero") || ["tagline", "featured", "featuredProducts", "ourProcess"].includes(k) },
  { title: "Shop and cart", match: (k) => k.startsWith("cart") || ["addToBag", "soldOut", "lastOne", "onlyLeft", "viewCart", "shopAll", "freeShippingUnlocked"].includes(k) },
  { title: "Newsletter", match: (k) => k.startsWith("newsletter") || ["subscribe", "subscribing", "subscribed", "emailPlaceholder"].includes(k) },
  { title: "Guides", match: (k) => ["latest", "readMore", "minRead", "allArticles", "inCategory", "noArticles", "browseByTopic", "relatedTitle", "publishedOn", "saveToPinterest", "draftBadge"].includes(k) },
  { title: "Navigation and footer", match: (k) => k.startsWith("nav") || ["footerTagline", "backHome", "aboutTitle"].includes(k) },
];

const KEYS = Object.keys(dictionary.en) as (keyof typeof dictionary.en)[];

export function ContentSection() {
  const [rows, setRows] = useState<Setting[] | null>(null);
  const [draft, setDraft] = useState<Record<string, { en?: string; es?: string }>>({});
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    const data = await readCollection<Setting>("settings");
    setRows(data ?? []);
    setDraft({ ...((data ?? []).find((row) => row.key === "content")?.value ?? {}) });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const stored = rows?.find((row) => row.key === "content")?.value ?? {};
  const dirty = JSON.stringify(stored) !== JSON.stringify(draft);

  function set(key: string, locale: "en" | "es", value: string) {
    setDraft((current) => {
      const next = { ...current, [key]: { ...(current[key] ?? {}), [locale]: value } };
      // An empty box means "use the original", not "show nothing". Dropping the
      // key keeps the stored overrides to only what she actually changed.
      if (!next[key].en?.trim() && !next[key].es?.trim()) delete next[key];
      return next;
    });
    setMessage(null);
  }

  async function save() {
    if (saving) return;
    setSaving(true);
    setMessage(null);
    const result = await patchRow("settings", "content", { value: draft });
    if (!result.ok) {
      setMessage({ kind: "error", text: "Couldn't save." });
      setSaving(false);
      return;
    }
    await load();
    setMessage({ kind: "ok", text: "Saved — on the site at the next publish." });
    setSaving(false);
  }

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return KEYS;
    return KEYS.filter((key) =>
      [key, dictionary.en[key], dictionary.es[key], draft[key]?.en, draft[key]?.es].some((field) =>
        field?.toLowerCase().includes(needle),
      ),
    );
  }, [query, draft]);

  if (rows === null) return <Empty>Loading…</Empty>;

  const grouped = GROUPS.map((group) => ({
    title: group.title,
    keys: visible.filter((key) => group.match(key)),
  })).concat({
    title: "Everywhere else",
    keys: visible.filter((key) => !GROUPS.some((group) => group.match(key))),
  }).filter((group) => group.keys.length > 0);

  const changed = Object.keys(draft).length;

  return (
    <div className="flex flex-col gap-3">
      <Card className="flex flex-wrap items-center gap-3 px-4 py-3">
        <p className="text-[12.5px] text-stone-600">
          Every word the storefront is written in. {changed > 0 ? `${changed} reworded.` : "None changed yet."}
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

      <input
        className={inputClass}
        placeholder="Search the wording"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      {grouped.length === 0 && (
        <Card className="px-4 py-6 text-center text-[13px] text-stone-500">Nothing matches that search.</Card>
      )}

      {grouped.map((group) => (
        <Card key={group.title} className="overflow-hidden">
          <h2 className="border-b border-stone-200 px-4 py-2.5 font-display text-[13.5px] font-bold text-forest-950">
            {group.title}
          </h2>
          <div className="divide-y divide-stone-200">
            {group.keys.map((key) => (
              <div key={key} className="grid gap-2 px-4 py-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="text-[9.5px] font-bold tracking-[0.14em] text-stone-400">ENGLISH</span>
                  <input
                    className={`${inputClass} py-1.5 text-[13px]`}
                    value={draft[key]?.en ?? ""}
                    placeholder={dictionary.en[key]}
                    onChange={(event) => set(key, "en", event.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[9.5px] font-bold tracking-[0.14em] text-stone-400">SPANISH</span>
                  <input
                    className={`${inputClass} py-1.5 text-[13px]`}
                    value={draft[key]?.es ?? ""}
                    placeholder={dictionary.es[key]}
                    onChange={(event) => set(key, "es", event.target.value)}
                  />
                </label>
              </div>
            ))}
          </div>
        </Card>
      ))}

      <Note>Leave a box empty and the original wording is used. The grey text is the original.</Note>
    </div>
  );
}
