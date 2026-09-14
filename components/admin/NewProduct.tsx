"use client";

import { useState } from "react";
import { Button, Card, Note, createRow, inputClass, labelClass } from "./ui";
import { productFields, writeField, type ProductField } from "@/lib/product-fields";

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

const EMPTY = { en: "", es: "" };

const ERRORS: Record<string, string> = {
  slug_taken: "There's already a product at that web address.",
  invalid_slug: "The web address can only use lowercase letters, numbers and hyphens.",
  invalid_price: "That price isn't valid.",
  forbidden: "This account isn't allowed to create products.",
};

/**
 * The fields this form asks for beyond the name, the address and the category.
 *
 * Drawn from the declaration rather than written out, so a brand whose products
 * are measured in something other than size gets the right box here without
 * anyone editing this file. What it is comes before what it costs, which is the
 * order the form already read in.
 */
const createFields: ProductField[] = productFields
  .filter((field) => field.onCreate && (field.kind === "text" || field.kind === "price"))
  .sort((a, b) => Number(a.kind === "price") - Number(b.kind === "price"));

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
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveSlug = slugTouched ? slug : slugify(name);
  const ready = name.trim().length > 0 && effectiveSlug.length > 0 && category.length > 0;

  async function create() {
    if (!ready || saving) return;
    setSaving(true);
    setError(null);

    const row: Record<string, unknown> = {};
    for (const field of createFields) {
      const typed = (values[field.id] ?? "").trim();
      Object.assign(
        row,
        writeField(row, field, field.kind === "price" ? Number(typed) || 0 : typed),
      );
    }

    const result = await createRow("products", {
      ...row,
      slug: effectiveSlug,
      category,
      name: { en: name.trim(), es: name.trim() },
      // The three columns that cannot be null, seeded blank so the row is legal
      // before anyone has written a word. Gift and badge are pointedly NOT
      // seeded: they are nullable, and an empty `{ en: "", es: "" }` is truthy,
      // so the shop would show every new product an empty "+ Free gift" label.
      tagline: EMPTY,
      description: EMPTY,
      how_to_use: EMPTY,
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
          {createFields.map((field) => (
            <div key={field.id} className="flex flex-col gap-1.5">
              <span className={labelClass}>{field.label}</span>
              {field.kind === "price" ? (
                <div className="flex">
                  <span className="border border-r-0 border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-500">
                    $
                  </span>
                  <input
                    className={`${inputClass} border-l-0`}
                    inputMode="decimal"
                    value={values[field.id] ?? ""}
                    onChange={(event) =>
                      setValues((current) => ({ ...current, [field.id]: event.target.value }))
                    }
                  />
                </div>
              ) : (
                <input
                  className={inputClass}
                  placeholder={field.placeholder}
                  value={values[field.id] ?? ""}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, [field.id]: event.target.value }))
                  }
                />
              )}
            </div>
          ))}
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
