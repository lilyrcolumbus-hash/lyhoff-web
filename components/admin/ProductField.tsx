"use client";

import { BilingualField, type Bilingual } from "./BilingualField";
import { BilingualList } from "./BilingualList";
import { inputClass, labelClass } from "./ui";
import type { ProductField } from "@/lib/product-fields";

/**
 * One declared field, drawn.
 *
 * The markup here is the markup the editor already had — the same components,
 * labels, hints and spacing. What changed is where the list of fields comes
 * from, not how any one of them looks, which is deliberate: this screen is the
 * thing being sold, and it has to keep looking like the screen she uses.
 *
 * Only the stacked, labelled kinds are drawn here. Price, stock and the
 * visibility checkbox sit inline on the variant's own line and are drawn where
 * that line is built, and photos have their own manager.
 */
export function ProductFieldInput({
  field,
  value,
  onChange,
}: {
  field: ProductField;
  value: unknown;
  onChange: (next: unknown) => void;
}) {
  switch (field.kind) {
    case "bilingual":
    case "bilingualText":
      return (
        <BilingualField
          title={field.label}
          multiline={field.kind === "bilingualText"}
          hint={field.hint}
          value={value as Bilingual}
          onChange={onChange}
        />
      );

    case "bilingualList":
      return (
        <BilingualList
          title={field.label}
          hint={field.hint}
          items={value as Bilingual[]}
          onChange={onChange}
        />
      );

    case "text":
      return (
        <div className="flex flex-col gap-1.5">
          <span className={labelClass}>{field.label}</span>
          <input
            className={inputClass}
            placeholder={field.placeholder}
            value={(value as string) ?? ""}
            onChange={(event) => onChange(event.target.value)}
          />
          {field.hint && <span className="text-[11.5px] text-stone-500">{field.hint}</span>}
        </div>
      );

    default:
      return null;
  }
}
