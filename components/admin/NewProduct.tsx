"use client";

import { useState } from "react";
import { Button, Card, Note, createRow, inputClass, labelClass } from "./ui";

/**
 * A URL, derived from the name but editable, because it is the one field here
 * that can never be changed afterwards — it is the address customers link to.
 */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const ERRORS: Record<string, string> = {
  slug_taken: "There's already a product at that web address.",
  invalid_slug: "The web address can only use lowercase letters, numbers and hyphens.",
  invalid_price: "That price isn't valid.",
  forbidden: "This account isn't allowed to create products.",
};

const EMPTY = { en: "", es: "" };

/**
 * Creating a product asks for the few things a person actually knows at that
 * moment — what it's called, what kind of thing it is, how big, how much. It is
 * created hidden, so an unfinished product can never appear in the shop; the
 * rest of the copy and its photos are filled in on the editor that opens next.
 */
export function NewProduct({
  categories,
  onCancel,
  onCreated,
}: {
  categories: string[];
  onCancel: () => void;
  onCreated: (slug: string) => void;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [category, setCategory] = useState(categories[0] ?? "");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveSlug = slugTouched ? slug : slugify(name);
  const ready = name.trim().length > 0 && effectiveSlug.length > 0 && category.length > 0;

  async function create() {
    if (!ready || saving) return;
    setSaving(true);
    setError(null);

    const result = await createRow("products", {
      slug: effectiveSlug,
      category,
      name: { en: name.trim(), es: name.trim() },
      tagline: EMPTY,
      description: EMPTY,
      how_to_use: EMPTY,
      size: size.trim(),
      price: Number(price) || 0,
      // Hidden until she says otherwise: a product with no photos and no
      // description should never be one refresh away from the shop.
      active: false,
    });

    if (!result.ok) {
      setError(ERRORS[result.error ?? ""] ?? "Couldn't create it.");
      setSaving(false);
      return;
    }
    onCreated(effectiveSlug);
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={onCancel}
        className="self-start text-[12.5px] font-semibold text-stone-500 transition hover:text-forest-950"
      >
        ← Products
      </button>

      <Card className="flex flex-col gap-5 p-5">
        <h2 className="font-display text-[15px] font-bold text-forest-950">New product</h2>

        <div className="flex flex-col gap-1.5">
          <span className={labelClass}>Name</span>
          <input
            className={inputClass}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Whipped Tallow Cream"
          />
          <Note>Spanish, description and the rest come next, on the product's own screen.</Note>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className={labelClass}>Web address</span>
          <div className="flex items-center">
            <span className="border border-r-0 border-stone-300 bg-stone-50 px-2 py-2 text-[13px] text-stone-500">
              /products/
            </span>
            <input
              className={`${inputClass} border-l-0`}
              value={effectiveSlug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(slugify(event.target.value));
              }}
            />
          </div>
          <Note>This one is permanent. Once a customer or a pin links to it, it can't change.</Note>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <span className={labelClass}>Category</span>
            <select
              className={inputClass}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categories.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className={labelClass}>Size</span>
            <input
              className={inputClass}
              value={size}
              onChange={(event) => setSize(event.target.value)}
              placeholder="2 oz"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className={labelClass}>Price</span>
            <div className="flex">
              <span className="border border-r-0 border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-500">
                $
              </span>
              <input
                className={`${inputClass} border-l-0`}
                inputMode="decimal"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-stone-200 pt-4">
          <Button onClick={create} disabled={!ready || saving}>
            {saving ? "Creating…" : "Create product"}
          </Button>
          <Note>It starts hidden. Turn it on when it's ready.</Note>
          {error && <span className="ml-auto text-[12.5px] text-clay-600">{error}</span>}
        </div>
      </Card>
    </div>
  );
}
