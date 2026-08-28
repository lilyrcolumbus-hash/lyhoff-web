"use client";

import { useCallback, useEffect, useState } from "react";
import type { Block, Page } from "@/lib/pages";
import { BilingualField, type Bilingual } from "./BilingualField";
import { slugify } from "./NewProduct";
import { Button, Card, Empty, Note, Pill, createRow, inputClass, labelClass, patchRow, readCollection } from "./ui";

interface Row extends Page {
  active: boolean;
}

const EMPTY: Bilingual = { en: "", es: "" };

/**
 * What a page can be built from, and what each is for.
 *
 * A fixed menu rather than a code editor: a syntax error in a template here
 * would fail the whole build and publish nothing, where Shopify can afford one
 * because a broken template there ruins a single page.
 */
const BLOCK_TYPES: { type: Block["type"]; label: string; hint: string; make: () => Block }[] = [
  { type: "heading", label: "Heading", hint: "A section title", make: () => ({ type: "heading", text: { ...EMPTY } }) },
  { type: "text", label: "Text", hint: "Paragraphs — one per line", make: () => ({ type: "text", text: { ...EMPTY } }) },
  { type: "image", label: "Image", hint: "A photo, full width", make: () => ({ type: "image", src: "", alt: { ...EMPTY } }) },
  { type: "video", label: "Video", hint: "A clip already in /videos/", make: () => ({ type: "video", src: "", heading: { ...EMPTY } }) },
  { type: "products", label: "Products", hint: "A grid of chosen products", make: () => ({ type: "products", slugs: [], heading: { ...EMPTY } }) },
  { type: "faq", label: "Questions", hint: "Question and answer pairs", make: () => ({ type: "faq", items: [] }) },
  { type: "button", label: "Button", hint: "One link, styled as a button", make: () => ({ type: "button", label: { ...EMPTY }, path: "" }) },
];

export function PagesSection({ reportCount }: { reportCount: (key: string, n: number) => void }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [draft, setDraft] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    const data = await readCollection<Row>("pages");
    setRows(data ?? []);
    if (data) reportCount("pages", data.length);
  }, [reportCount]);

  useEffect(() => {
    void load();
  }, [load]);

  const original = rows?.find((row) => row.slug === slug);
  const dirty = draft !== null && JSON.stringify(draft) !== JSON.stringify(original);

  function open(page: Row) {
    setSlug(page.slug);
    setDraft(structuredClone(page));
    setMessage(null);
    window.scrollTo({ top: 0 });
  }

  function close() {
    if (dirty && !window.confirm("You have unsaved changes. Leave without saving?")) return;
    setSlug(null);
    setDraft(null);
    setMessage(null);
  }

  function setBlock(index: number, block: Block) {
    setDraft((current) =>
      current ? { ...current, blocks: current.blocks.map((b, i) => (i === index ? block : b)) } : current,
    );
  }

  function moveBlock(index: number, to: number) {
    setDraft((current) => {
      if (!current || to < 0 || to >= current.blocks.length) return current;
      const blocks = [...current.blocks];
      const [moved] = blocks.splice(index, 1);
      blocks.splice(to, 0, moved);
      return { ...current, blocks };
    });
  }

  async function create() {
    const title = newTitle.trim();
    const pageSlug = slugify(title);
    if (!title || !pageSlug || saving) return;
    setSaving(true);
    setMessage(null);

    const result = await createRow("pages", {
      slug: pageSlug,
      title: { en: title, es: title },
      blocks: [],
      // Hidden until she publishes it: an unfinished page on a public CDN is
      // public however unlinked it is.
      active: false,
    });
    if (!result.ok) {
      setMessage({
        kind: "error",
        text: result.error === "slug_taken" ? "There's already a page at that address." : "Couldn't create it.",
      });
      setSaving(false);
      return;
    }
    setCreating(false);
    setNewTitle("");
    setSaving(false);
    const data = await readCollection<Row>("pages");
    if (data) {
      setRows(data);
      const created = data.find((page) => page.slug === pageSlug);
      if (created) open(created);
    }
  }

  async function save() {
    if (!draft || !original || saving) return;
    setSaving(true);
    setMessage(null);

    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(draft)) {
      if (key === "slug") continue;
      if (JSON.stringify(value) !== JSON.stringify(original[key as keyof Row])) patch[key] = value;
    }
    if (Object.keys(patch).length === 0) {
      setSaving(false);
      return;
    }

    const result = await patchRow("pages", draft.slug, patch);
    if (!result.ok) {
      setMessage({ kind: "error", text: "Couldn't save." });
      setSaving(false);
      return;
    }
    const saved = result.row as Row;
    setRows((list) => (list ?? []).map((row) => (row.slug === saved.slug ? saved : row)));
    setDraft(structuredClone(saved));
    setMessage({ kind: "ok", text: "Saved — on the site once you publish." });
    setSaving(false);
  }

  if (rows === null) return <Empty>Loading pages…</Empty>;

  // ── The editor ────────────────────────────────────────────────────────────
  if (draft) {
    return (
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={close}
          className="self-start text-[12.5px] font-semibold text-stone-500 transition hover:text-forest-950"
        >
          ← Pages
        </button>

        <Card className="flex flex-wrap items-center gap-3 px-4 py-3">
          <div className="min-w-0">
            <h2 className="truncate font-display text-[15px] font-bold text-forest-950">
              {draft.title.en || draft.slug}
            </h2>
            <span className="text-[11px] text-stone-500">/pages/{draft.slug}/</span>
          </div>
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

        <Card className="flex flex-col gap-5 p-5">
          <BilingualField title="Title" value={draft.title} onChange={(title) => setDraft({ ...draft, title })} />
          <label className="flex items-start justify-between gap-4 border-t border-stone-200 pt-4">
            <span>
              <span className={labelClass}>Published</span>
              <span className="mt-0.5 block text-[11.5px] text-stone-500">
                A page that isn't published is never built, so it can't be found by anyone.
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

        {draft.blocks.map((block, index) => (
          <Card key={index} className="flex flex-col gap-4 p-4">
            <div className="flex items-center gap-3 border-b border-stone-200 pb-2">
              <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-stone-400">
                {BLOCK_TYPES.find((option) => option.type === block.type)?.label ?? block.type}
              </span>
              <span className="ml-auto flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveBlock(index, index - 1)}
                  disabled={index === 0}
                  aria-label="Move up"
                  className="px-1 text-[13px] text-stone-500 disabled:opacity-25 hover:text-forest-950"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => moveBlock(index, index + 1)}
                  disabled={index === draft.blocks.length - 1}
                  aria-label="Move down"
                  className="px-1 text-[13px] text-stone-500 disabled:opacity-25 hover:text-forest-950"
                >
                  ▼
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDraft({ ...draft, blocks: draft.blocks.filter((_, i) => i !== index) })
                  }
                  aria-label="Remove block"
                  className="px-1 text-[13px] text-stone-400 hover:text-clay-600"
                >
                  ✕
                </button>
              </span>
            </div>

            <BlockEditor block={block} onChange={(next) => setBlock(index, next)} />
          </Card>
        ))}

        <Card className="flex flex-wrap items-center gap-2 p-4">
          <span className={labelClass}>Add</span>
          {BLOCK_TYPES.map((option) => (
            <button
              key={option.type}
              type="button"
              title={option.hint}
              onClick={() => setDraft({ ...draft, blocks: [...draft.blocks, option.make()] })}
              className="border border-stone-300 px-3 py-1.5 text-[12.5px] text-stone-700 transition hover:border-forest-950 hover:text-forest-950"
            >
              {option.label}
            </button>
          ))}
        </Card>
      </div>
    );
  }

  // ── The list ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3">
      {creating ? (
        <Card className="flex flex-wrap items-end gap-3 p-4">
          <label className="flex min-w-[220px] flex-1 flex-col gap-1.5">
            <span className={labelClass}>Page title</span>
            <input
              className={inputClass}
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              placeholder="Frequently asked questions"
            />
            <Note>The address will be /pages/{slugify(newTitle) || "…"}/ and can't change later.</Note>
          </label>
          <Button onClick={create} disabled={saving || !newTitle.trim()}>
            {saving ? "Creating…" : "Create"}
          </Button>
          <Button variant="quiet" onClick={() => setCreating(false)} disabled={saving}>
            Cancel
          </Button>
          {message && <span className="text-[12.5px] text-clay-600">{message.text}</span>}
        </Card>
      ) : (
        <div className="flex items-center gap-3">
          <Button onClick={() => setCreating(true)}>Add page</Button>
          <Note>Pages you compose from blocks. The shop's own pages aren't here.</Note>
        </div>
      )}

      <Card className="divide-y divide-stone-200">
        {rows.length === 0 ? (
          <div className="px-4 py-6 text-center text-[13px] text-stone-500">No pages yet.</div>
        ) : (
          rows.map((page) => (
            <button
              key={page.slug}
              type="button"
              onClick={() => open(page)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-stone-50"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-medium text-forest-950">
                  {page.title.en || page.slug}
                </span>
                <span className="block text-[11.5px] text-stone-500">
                  /pages/{page.slug}/ · {page.blocks.length} blocks
                </span>
              </span>
              <span className="w-20 shrink-0 text-right">
                {page.active ? <Pill tone="live">LIVE</Pill> : <Pill tone="off">DRAFT</Pill>}
              </span>
            </button>
          ))
        )}
      </Card>
    </div>
  );
}

/** One block's fields. Every branch edits a copy, never the stored object. */
function BlockEditor({ block, onChange }: { block: Block; onChange: (next: Block) => void }) {
  switch (block.type) {
    case "heading":
      return <BilingualField title="Heading" value={block.text} onChange={(text) => onChange({ ...block, text })} />;

    case "text":
      return (
        <BilingualField
          title="Text"
          multiline
          value={block.text}
          onChange={(text) => onChange({ ...block, text })}
          hint="One paragraph per line."
        />
      );

    case "image":
      return (
        <>
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Image address</span>
            <input
              className={inputClass}
              value={block.src}
              onChange={(event) => onChange({ ...block, src: event.target.value })}
              placeholder="/images/products/tallow-cream-2oz/MAIN.png"
            />
            <Note>Any photo already on the site, or one uploaded on a product.</Note>
          </label>
          <BilingualField
            title="Describe it"
            value={block.alt}
            onChange={(alt) => onChange({ ...block, alt })}
            hint="Read aloud to people who can't see it, and by search engines."
          />
        </>
      );

    case "video":
      return (
        <>
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Video address</span>
            <input
              className={inputClass}
              value={block.src}
              onChange={(event) => onChange({ ...block, src: event.target.value })}
              placeholder="/videos/herbs.mp4"
            />
          </label>
          <BilingualField title="Caption" value={block.heading} onChange={(heading) => onChange({ ...block, heading })} />
        </>
      );

    case "products":
      return (
        <>
          <BilingualField title="Heading" value={block.heading} onChange={(heading) => onChange({ ...block, heading })} />
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Products</span>
            <input
              className={inputClass}
              value={block.slugs.join(", ")}
              onChange={(event) =>
                onChange({
                  ...block,
                  slugs: event.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                })
              }
              placeholder="tallow-cream-2oz, comfrey-salve-2oz"
            />
            <Note>Web addresses from the Products screen, separated by commas.</Note>
          </label>
        </>
      );

    case "button":
      return (
        <>
          <BilingualField title="Label" value={block.label} onChange={(label) => onChange({ ...block, label })} />
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Goes to</span>
            <span className="flex">
              <span className="border border-r-0 border-stone-300 bg-stone-50 px-2 py-2 text-[13px] text-stone-500">
                /en/
              </span>
              <input
                className={`${inputClass} border-l-0`}
                value={block.path}
                onChange={(event) => onChange({ ...block, path: event.target.value })}
                placeholder="products"
              />
            </span>
          </label>
        </>
      );

    case "faq":
      return (
        <div className="flex flex-col gap-4">
          {block.items.map((item, index) => (
            <div key={index} className="flex flex-col gap-3 border-l-2 border-stone-200 pl-3">
              <BilingualField
                title="Question"
                value={item.q}
                onChange={(q) =>
                  onChange({ ...block, items: block.items.map((it, i) => (i === index ? { ...it, q } : it)) })
                }
              />
              <BilingualField
                title="Answer"
                multiline
                value={item.a}
                onChange={(a) =>
                  onChange({ ...block, items: block.items.map((it, i) => (i === index ? { ...it, a } : it)) })
                }
              />
              <button
                type="button"
                onClick={() => onChange({ ...block, items: block.items.filter((_, i) => i !== index) })}
                className="self-start text-[12px] text-stone-500 underline underline-offset-2 hover:text-clay-600"
              >
                Remove this question
              </button>
            </div>
          ))}
          <Button
            variant="quiet"
            onClick={() =>
              onChange({ ...block, items: [...block.items, { q: { ...EMPTY }, a: { ...EMPTY } }] })
            }
          >
            Add a question
          </Button>
        </div>
      );

    default:
      return null;
  }
}
