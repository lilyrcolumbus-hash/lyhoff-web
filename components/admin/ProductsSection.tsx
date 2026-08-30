"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BilingualField, type Bilingual } from "./BilingualField";
import { BilingualList } from "./BilingualList";
import { NewProduct, slugify } from "./NewProduct";
import { PhotoManager, isUploaded, photoSrc } from "./PhotoManager";
import {
  Button,
  Card,
  Empty,
  Note,
  Pill,
  createRow,
  inputClass,
  labelClass,
  patchRow,
  price,
  readCollection,
} from "./ui";

interface Product {
  slug: string;
  category: string;
  name: Bilingual;
  tagline: Bilingual;
  description: Bilingual;
  how_to_use: Bilingual | null;
  gift: Bilingual | null;
  size: string | null;
  scent: string | null;
  variant_group: string | null;
  scent_group: string | null;
  ingredients: Bilingual[];
  benefits: Bilingual[];
  badge: Bilingual | null;
  position: number | null;
  price: number;
  stock: number | null;
  active: boolean;
  photos: string[];
  seo: { title?: Bilingual; description?: Bilingual } | null;
}

const EMPTY: Bilingual = { en: "", es: "" };

// Fields that are the same on every variant of a product. Checked against the
// real catalogue before choosing them: tagline, how to use and the gift are
// identical across all six tallow cream rows and all six comfrey rows, while
// name, description and price genuinely differ per scent and per size. So
// these three are edited once for the whole product, and the rest per variant.
const SHARED = ["tagline", "how_to_use", "gift"] as const;

/** A product is its variants. One row with no variant_group is a group of one. */
interface Group {
  id: string;
  name: string;
  variants: Product[];
}

function groupOf(product: Product): string {
  return product.variant_group ?? product.slug;
}

/**
 * The product's own name, without the part that names the variant.
 * "Whipped Tallow Cream — Vanilla" and "Whipped Tallow Cream" share a prefix;
 * that prefix is the product. Falls back to the first name when there is
 * nothing in common, which is better than inventing one from the slug.
 */
function baseName(variants: Product[]): string {
  const names = variants.map((v) => v.name?.en ?? "").filter(Boolean);
  if (names.length === 0) return variants[0]?.slug ?? "";
  let prefix = names[0];
  for (const name of names.slice(1)) {
    let i = 0;
    while (i < prefix.length && i < name.length && prefix[i] === name[i]) i += 1;
    prefix = prefix.slice(0, i);
  }
  const trimmed = prefix.replace(/[\s—–-]+$/, "").trim();
  return trimmed.length > 2 ? trimmed : names[0];
}

function toGroups(rows: Product[]): Group[] {
  const byId = new Map<string, Product[]>();
  for (const row of rows) {
    const id = groupOf(row);
    byId.set(id, [...(byId.get(id) ?? []), row]);
  }
  return [...byId.entries()].map(([id, variants]) => ({ id, name: baseName(variants), variants }));
}

function priceRange(variants: Product[]): string {
  const live = variants.filter((v) => v.active);
  const values = (live.length > 0 ? live : variants).map((v) => Number(v.price));
  const low = Math.min(...values);
  const high = Math.max(...values);
  return low === high ? price(low) : `${price(low)} – ${price(high)}`;
}

/** What tells this variant apart from its siblings, for the table's first column. */
function variantLabel(variant: Product): string {
  return [variant.size, variant.scent].filter(Boolean).join(" · ") || variant.slug;
}

export function ProductsSection({ reportCount }: { reportCount: (key: string, n: number) => void }) {
  const [rows, setRows] = useState<Product[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Product[] | null>(null);
  const [expanded, setExpanded] = useState<{ slug: string; tab: "text" | "photos" } | null>(null);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [addingVariant, setAddingVariant] = useState(false);
  // Non-null while she is rearranging the shop: a list of group ids in the
  // order she wants, held apart from the rows until she saves it.
  const [order, setOrder] = useState<string[] | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    const data = await readCollection<Product>("products");
    setRows(data ?? []);
    if (data) reportCount("products", toGroups(data).length);
  }, [reportCount]);

  useEffect(() => {
    void load();
  }, [load]);

  const groups = useMemo(() => (rows ? toGroups(rows) : []), [rows]);
  const original = useMemo(
    () => (openId ? (groups.find((g) => g.id === openId)?.variants ?? null) : null),
    [groups, openId],
  );
  const dirty = draft !== null && JSON.stringify(draft) !== JSON.stringify(original);

  function open(group: Group) {
    setOpenId(group.id);
    setDraft(structuredClone(group.variants));
    setExpanded(null);
    setAddingVariant(false);
    setMessage(null);
    // The editor takes over the whole pane, so this is a different screen now —
    // start it at the top rather than wherever the list happened to be scrolled.
    window.scrollTo({ top: 0 });
  }

  function close() {
    if (dirty && !window.confirm("You have unsaved changes. Leave without saving?")) return;
    setOpenId(null);
    setDraft(null);
    setMessage(null);
  }

  function discard() {
    if (!original) return;
    setDraft(structuredClone(original));
    setMessage(null);
  }

  /** A shared field is written onto every variant, so one edit covers the product. */
  function setShared(field: (typeof SHARED)[number], value: Bilingual) {
    setDraft((current) => (current ?? []).map((variant) => ({ ...variant, [field]: value })));
  }

  function setVariant(slug: string, patch: Partial<Product>) {
    setDraft((current) => (current ?? []).map((v) => (v.slug === slug ? { ...v, ...patch } : v)));
  }

  /**
   * A new variant inherits everything the product shares and differs only in
   * what makes it a variant. Copying rather than linking keeps one row per
   * sellable thing, which is what the cart, Stripe and the URLs are keyed on.
   */
  async function addVariant(size: string, scent: string, priceValue: string) {
    if (!draft || saving) return;
    const parent = draft[0];
    const group = parent.variant_group ?? parent.slug;
    const suffix = slugify([size, scent].filter(Boolean).join("-"));
    const slug = slugify(`${group}-${suffix}`);

    if (draft.some((v) => v.slug === slug)) {
      setMessage({ kind: "error", text: "That size and scent already exist." });
      return;
    }

    setSaving(true);
    setMessage(null);

    // Scent siblings are the rows that share a size, so the new row joins the
    // group of whichever variant is already that size.
    const sameSize = draft.find((v) => v.size === size);

    const result = await createRow("products", {
      slug,
      category: parent.category,
      name: { en: parent.name.en, es: parent.name.es },
      tagline: parent.tagline,
      description: parent.description,
      how_to_use: parent.how_to_use ?? { en: "", es: "" },
      gift: parent.gift,
      size,
      price: Number(priceValue) || 0,
      active: false,
      variant_group: group,
      scent: scent || null,
      scent_group: scent ? (sameSize?.scent_group ?? sameSize?.slug ?? slug) : null,
    });

    if (!result.ok) {
      setMessage({
        kind: "error",
        text: result.error === "slug_taken" ? "That variant already exists." : "Couldn't add it.",
      });
      setSaving(false);
      return;
    }

    const created = result.row as Product;
    setRows((list) => [...(list ?? []), created]);
    setDraft((current) => [...(current ?? []), created]);
    setAddingVariant(false);
    setExpanded({ slug: created.slug, tab: "text" });
    setMessage({ kind: "ok", text: "Variant added, hidden until you turn it on." });
    setSaving(false);
  }

  /**
   * The order products appear in the shop.
   *
   * Positions are rewritten from scratch as multiples of ten rather than
   * swapped: gaps leave room to slot something in later without touching
   * everything, and every variant of a product gets its group's position so
   * variants can never drift apart in the listing.
   */
  async function saveOrder() {
    if (!order || !rows || saving) return;
    setSaving(true);
    setMessage(null);

    for (const [index, id] of order.entries()) {
      const variants = groups.find((group) => group.id === id)?.variants ?? [];
      for (const variant of variants) {
        const position = index * 10;
        if (variant.position === position) continue;
        const result = await patchRow("products", variant.slug, { position });
        if (!result.ok) {
          setMessage({ kind: "error", text: "Couldn't save the order." });
          setSaving(false);
          await load();
          return;
        }
      }
    }

    setOrder(null);
    await load();
    setMessage({ kind: "ok", text: "Order saved — the shop follows it at the next publish." });
    setSaving(false);
  }

  async function save() {
    if (!draft || !original || saving) return;
    setSaving(true);
    setMessage(null);

    // One request per variant that actually changed, carrying only its changed
    // fields: a whole-row write would stamp over anything edited elsewhere
    // since this page loaded.
    const saved: Product[] = [];
    for (const variant of draft) {
      const before = original.find((v) => v.slug === variant.slug);
      if (!before) continue;

      const patch: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(variant)) {
        // Identity, not content: these are set once at creation and are not in
        // the server's editable allowlist, so sending them would fail the write.
        if (key === "slug" || key === "variant_group" || key === "scent" || key === "scent_group") continue;
        if (JSON.stringify(value) !== JSON.stringify(before[key as keyof Product])) patch[key] = value;
      }
      if (Object.keys(patch).length === 0) continue;

      const result = await patchRow("products", variant.slug, patch);
      if (!result.ok) {
        setMessage({
          kind: "error",
          text:
            result.error === "invalid_price"
              ? `${variantLabel(variant)}: that price isn't valid.`
              : `Couldn't save ${variantLabel(variant)}.`,
        });
        setSaving(false);
        // Keep whatever did save — reload so the screen matches the database
        // rather than showing a half-applied edit as if it were still pending.
        if (saved.length > 0) await load();
        return;
      }
      saved.push(result.row as Product);

      // Only now that the row is written do the removed files go. Doing it when
      // the ✕ was clicked would destroy a photo that Discard was about to bring
      // back. Failures here are silent on purpose: the photo is already off the
      // product, and an orphan in the bucket is not worth an error in her face.
      const dropped = (before.photos ?? []).filter(
        (entry) => isUploaded(entry) && !(variant.photos ?? []).includes(entry),
      );
      for (const entry of dropped) {
        await fetch(`/api/admin/photo?path=${encodeURIComponent(entry)}`, {
          method: "DELETE",
          credentials: "same-origin",
        }).catch(() => null);
      }
    }

    if (saved.length > 0) {
      setRows((list) =>
        (list ?? []).map((row) => saved.find((s) => s.slug === row.slug) ?? row),
      );
      setDraft((current) =>
        (current ?? []).map((row) => saved.find((s) => s.slug === row.slug) ?? row),
      );
    }
    setMessage({ kind: "ok", text: "Saved — not on the site until you publish." });
    setSaving(false);
  }

  function moveGroup(index: number, to: number) {
    setOrder((current) => {
      if (!current || to < 0 || to >= current.length) return current;
      const next = [...current];
      const [moved] = next.splice(index, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  const arranged = useMemo(() => {
    if (!order) return groups;
    // Anything created while she was rearranging still has to appear.
    const known = new Set(order);
    return [
      ...order.map((id) => groups.find((group) => group.id === id)).filter((g) => g !== undefined),
      ...groups.filter((group) => !known.has(group.id)),
    ];
  }, [groups, order]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return arranged;
    return arranged.filter((group) =>
      [group.name, group.id, ...group.variants.flatMap((v) => [v.name?.es, v.slug, v.size, v.scent])].some(
        (field) => field?.toLowerCase().includes(needle),
      ),
    );
  }, [arranged, query]);

  if (rows === null) return <Empty>Loading products…</Empty>;

  // Offered rather than hardcoded, so this screen works on a catalogue that
  // isn't LYHOFF's.
  const categories = [...new Set(rows.map((r) => r.category))].sort();

  if (creating) {
    return (
      <NewProduct
        categories={categories}
        onCancel={() => setCreating(false)}
        onCreated={async (slug) => {
          setCreating(false);
          const data = await readCollection<Product>("products");
          if (!data) return;
          setRows(data);
          reportCount("products", toGroups(data).length);
          const group = toGroups(data).find((g) => g.variants.some((v) => v.slug === slug));
          if (group) open(group);
        }}
      />
    );
  }

  // ── The editor, once a product is open ────────────────────────────────────
  // It replaces the list rather than sitting beside it. Side by side only fits
  // above 1280px, and below that the editor landed underneath the list — off
  // screen, so opening a product looked like nothing had happened at all.
  if (draft && draft.length > 0) {
    const shared = draft[0];
    const multi = draft.length > 1;

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
            <h2 className="truncate font-display text-[15px] font-bold text-forest-950">{baseName(draft)}</h2>
            <span className="text-[11px] text-stone-500">
              {multi ? `${draft.length} variants` : shared.slug}
            </span>
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
          {multi && (
            <p className="-mb-1 text-[11.5px] text-stone-500">
              These are the same on every variant. Changing one changes all {draft.length}.
            </p>
          )}
          <BilingualField title="Tagline" value={shared.tagline} onChange={(v) => setShared("tagline", v)} />
          <BilingualField
            title="How to use"
            multiline
            value={shared.how_to_use ?? EMPTY}
            onChange={(v) => setShared("how_to_use", v)}
          />
          <BilingualField
            title="Free gift"
            value={shared.gift ?? EMPTY}
            onChange={(v) => setShared("gift", v)}
            hint="Leave empty if this product has no gift."
          />
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-baseline justify-between border-b border-stone-200 px-4 py-3">
            <h3 className="font-display text-[13.5px] font-bold text-forest-950">
              {multi ? "Variants" : "Price and availability"}
            </h3>
            <Note>Price, then units in stock. Leave stock blank to not count it.</Note>
          </div>

          <div className="divide-y divide-stone-200">
            {draft.map((variant) => {
              const openTab = expanded?.slug === variant.slug ? expanded.tab : null;
              return (
                <div key={variant.slug}>
                  <div className="flex flex-wrap items-center gap-3 px-4 py-3">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-medium text-forest-950">
                        {multi ? variantLabel(variant) : variant.name?.en}
                      </span>
                      <span className="block truncate text-[11px] text-stone-500">{variant.slug}</span>
                    </span>

                    <span className="flex shrink-0 items-center">
                      <span className="border border-r-0 border-stone-300 bg-stone-50 px-2 py-1.5 text-[13px] text-stone-500">
                        $
                      </span>
                      <input
                        className={`${inputClass} w-24 border-l-0 py-1.5 text-[13px] tabular-nums`}
                        inputMode="decimal"
                        aria-label={`Price, ${variantLabel(variant)}`}
                        value={variant.price}
                        onChange={(event) =>
                          setVariant(variant.slug, { price: event.target.value as unknown as number })
                        }
                      />
                    </span>

                    <span className="flex shrink-0 flex-col">
                      <input
                        className={`${inputClass} w-24 py-1.5 text-[13px] tabular-nums`}
                        inputMode="numeric"
                        aria-label={`Units in stock, ${variantLabel(variant)}`}
                        placeholder="Untracked"
                        value={variant.stock ?? ""}
                        onChange={(event) => {
                          const raw = event.target.value.trim();
                          // Blank means "don't count this one" — the state every
                          // product is in until she decides to track it.
                          setVariant(variant.slug, {
                            stock: raw === "" ? null : Math.max(0, Math.floor(Number(raw) || 0)),
                          });
                        }}
                      />
                    </span>

                    <label className="flex shrink-0 items-center gap-1.5 text-[12px] text-stone-600">
                      <input
                        type="checkbox"
                        checked={variant.active}
                        onChange={(event) => setVariant(variant.slug, { active: event.target.checked })}
                        className="h-4 w-4 accent-[#93906d]"
                      />
                      Visible
                    </label>

                    <span className="flex shrink-0 items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setExpanded(openTab === "photos" ? null : { slug: variant.slug, tab: "photos" })
                        }
                        className={`text-[12px] underline underline-offset-2 hover:text-forest-950 ${
                          openTab === "photos" ? "font-semibold text-forest-950" : "text-stone-500"
                        }`}
                      >
                        Photos ({(variant.photos ?? []).length})
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setExpanded(openTab === "text" ? null : { slug: variant.slug, tab: "text" })
                        }
                        className={`text-[12px] underline underline-offset-2 hover:text-forest-950 ${
                          openTab === "text" ? "font-semibold text-forest-950" : "text-stone-500"
                        }`}
                      >
                        Text
                      </button>
                    </span>
                  </div>

                  {openTab === "photos" && (
                    <div className="border-t border-stone-200 bg-stone-50/60 px-4 py-4">
                      <PhotoManager
                        slug={variant.slug}
                        photos={variant.photos ?? []}
                        onChange={(photos) => setVariant(variant.slug, { photos })}
                      />
                    </div>
                  )}

                  {openTab === "text" && (
                    <div className="flex flex-col gap-5 border-t border-stone-200 bg-stone-50/60 px-4 py-4">
                      <BilingualField
                        title="Name"
                        value={variant.name}
                        onChange={(name) => setVariant(variant.slug, { name })}
                      />
                      <BilingualField
                        title="Description"
                        multiline
                        value={variant.description}
                        onChange={(description) => setVariant(variant.slug, { description })}
                      />
                      <div className="flex flex-col gap-1.5">
                        <span className={labelClass}>Size</span>
                        <input
                          className={inputClass}
                          value={variant.size ?? ""}
                          onChange={(event) => setVariant(variant.slug, { size: event.target.value })}
                        />
                      </div>

                      <BilingualList
                        title="Ingredients"
                        hint="Shown as chips on the product page, in this order."
                        items={variant.ingredients ?? []}
                        onChange={(ingredients) => setVariant(variant.slug, { ingredients })}
                      />

                      <BilingualList
                        title="Benefits"
                        hint="The short bullets under the description."
                        items={variant.benefits ?? []}
                        onChange={(benefits) => setVariant(variant.slug, { benefits })}
                      />

                      <BilingualField
                        title="Badge"
                        value={variant.badge ?? EMPTY}
                        onChange={(badge) => setVariant(variant.slug, { badge })}
                        hint="The small label over the photo. Leave empty for none."
                      />

                      <div className="flex flex-col gap-5 border-t border-stone-200 pt-4">
                        <p className="-mb-2 text-[11.5px] text-stone-500">
                          Search results and shared links. Leave both empty and the name and
                          description above are used, which is usually right.
                        </p>
                        <BilingualField
                          title="Search title"
                          value={variant.seo?.title ?? EMPTY}
                          onChange={(title) =>
                            setVariant(variant.slug, { seo: { ...(variant.seo ?? {}), title } })
                          }
                        />
                        <BilingualField
                          title="Search description"
                          multiline
                          value={variant.seo?.description ?? EMPTY}
                          onChange={(description) =>
                            setVariant(variant.slug, { seo: { ...(variant.seo ?? {}), description } })
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t border-stone-200 px-4 py-3">
            {addingVariant ? (
              <VariantForm
                sizes={[...new Set(draft.map((v) => v.size ?? ""))].filter(Boolean)}
                onCancel={() => setAddingVariant(false)}
                onAdd={addVariant}
                busy={saving}
              />
            ) : (
              <Button variant="quiet" onClick={() => setAddingVariant(true)}>
                Add variant
              </Button>
            )}
          </div>

          <p className="border-t border-stone-200 px-4 py-2.5 text-[11.5px] text-stone-500">
            Turning a variant off doesn't delete it — it stops showing in the store. Stock counts
            itself down as orders come in. Checkout refuses to oversell immediately; the "sold out"
            label on the shop appears at the next publish.
          </p>
        </Card>
      </div>
    );
  }

  // ── The list ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        {order ? (
          <>
            <p className="flex-1 self-center text-[12.5px] text-stone-600">
              Drag isn't needed — use the arrows. This is the order the shop lists them in.
            </p>
            {message && (
              <span className={`self-center text-[12.5px] ${message.kind === "ok" ? "text-earth-700" : "text-clay-600"}`}>
                {message.text}
              </span>
            )}
            <Button onClick={saveOrder} disabled={saving}>
              {saving ? "Saving…" : "Save order"}
            </Button>
            <Button variant="quiet" onClick={() => setOrder(null)} disabled={saving}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <input
              className={inputClass}
              placeholder="Search products"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Button
              variant="quiet"
              onClick={() => {
                // A filtered list would make the arrows move the wrong rows —
                // the positions written out are the positions on screen.
                setQuery("");
                setOrder(groups.map((group) => group.id));
              }}
            >
              Reorder
            </Button>
            <Button onClick={() => setCreating(true)}>Add product</Button>
          </>
        )}
      </div>

      <Card className="divide-y divide-stone-200">
        {filtered.length === 0 ? (
          <div className="px-4 py-6 text-center text-[13px] text-stone-500">
            {rows.length === 0 ? "No products yet." : "Nothing matches that search."}
          </div>
        ) : (
          filtered.map((group, index) => {
            const live = group.variants.filter((v) => v.active).length;
            // Whichever variant is actually on sale is the one worth showing.
            const thumb = (group.variants.find((v) => v.active) ?? group.variants[0]).photos?.[0];
            return (
              <div
                key={group.id}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left ${
                  order ? "" : "cursor-pointer transition hover:bg-stone-50"
                }`}
                onClick={order ? undefined : () => open(group)}
                role={order ? undefined : "button"}
                tabIndex={order ? undefined : 0}
                onKeyDown={
                  order
                    ? undefined
                    : (event) => {
                        if (event.key === "Enter" || event.key === " ") open(group);
                      }
                }
              >
                {order && (
                  <span className="flex shrink-0 flex-col">
                    <button
                      type="button"
                      onClick={() => moveGroup(index, index - 1)}
                      disabled={index === 0}
                      aria-label="Move up"
                      className="text-[11px] leading-tight text-stone-500 disabled:opacity-25 hover:text-forest-950"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => moveGroup(index, index + 1)}
                      disabled={index === filtered.length - 1}
                      aria-label="Move down"
                      className="text-[11px] leading-tight text-stone-500 disabled:opacity-25 hover:text-forest-950"
                    >
                      ▼
                    </button>
                  </span>
                )}
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoSrc(thumb)}
                    alt=""
                    loading="lazy"
                    className="h-10 w-10 shrink-0 border border-stone-200 bg-stone-50 object-cover"
                  />
                ) : (
                  <span className="h-10 w-10 shrink-0 border border-dashed border-stone-300" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-medium text-forest-950">{group.name}</span>
                  <span className="block text-[11.5px] text-stone-500">
                    {group.variants.length > 1
                      ? `${group.variants.length} variants · ${live} live`
                      : group.variants[0].size}
                  </span>
                </span>
                <span className="shrink-0 text-[13px] tabular-nums text-forest-950">
                  {priceRange(group.variants)}
                </span>
                <span className="w-16 shrink-0 text-right">
                  {live > 0 ? <Pill tone="live">LIVE</Pill> : <Pill tone="off">HIDDEN</Pill>}
                </span>
              </div>
            );
          })
        )}
      </Card>
    </div>
  );
}

/** Only what makes a variant a variant: everything else is inherited. */
function VariantForm({
  sizes,
  onAdd,
  onCancel,
  busy,
}: {
  sizes: string[];
  onAdd: (size: string, scent: string, price: string) => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const [size, setSize] = useState(sizes[0] ?? "");
  const [scent, setScent] = useState("");
  const [value, setValue] = useState("");

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1">
        <span className={labelClass}>Size</span>
        <input
          className={`${inputClass} w-32 py-1.5 text-[13px]`}
          list="variant-sizes"
          value={size}
          onChange={(event) => setSize(event.target.value)}
        />
        <datalist id="variant-sizes">
          {sizes.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      </label>
      <label className="flex flex-col gap-1">
        <span className={labelClass}>Scent</span>
        <input
          className={`${inputClass} w-32 py-1.5 text-[13px]`}
          value={scent}
          onChange={(event) => setScent(event.target.value)}
          placeholder="Optional"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className={labelClass}>Price</span>
        <span className="flex">
          <span className="border border-r-0 border-stone-300 bg-stone-50 px-2 py-1.5 text-[13px] text-stone-500">
            $
          </span>
          <input
            className={`${inputClass} w-24 border-l-0 py-1.5 text-[13px] tabular-nums`}
            inputMode="decimal"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </span>
      </label>
      <Button onClick={() => onAdd(size.trim(), scent.trim(), value)} disabled={busy || !size.trim()}>
        {busy ? "Adding…" : "Add"}
      </Button>
      <Button variant="quiet" onClick={onCancel} disabled={busy}>
        Cancel
      </Button>
    </div>
  );
}
