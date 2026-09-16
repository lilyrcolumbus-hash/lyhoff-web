/**
 * Reading and writing the fields declared in product-fields.config.ts.
 *
 * The config file is kept purely declarative — someone standing up a new brand
 * edits a list, not code — so the small amount of logic that list implies lives
 * here: how to pull a field's current value off a database row, how to turn an
 * edit back into a patch, and which columns the Worker will accept.
 */
import { productFields, type ProductField } from "@/product-fields.config";

export type { ProductField } from "@/product-fields.config";
export { productFields } from "@/product-fields.config";

export type Bilingual = { en: string; es: string };

/** A product row as it comes back from the database. */
export type ProductRow = Record<string, unknown>;

const EMPTY_BILINGUAL: Bilingual = { en: "", es: "" };

/** A field is shared when it is drawn in the shared card. Nothing else decides it. */
export function isShared(field: ProductField): boolean {
  return field.section === "shared";
}

export function fieldsIn(section: ProductField["section"]): ProductField[] {
  return productFields.filter((field) => field.section === section);
}

/**
 * What an empty field holds.
 *
 * Chosen per kind rather than using null everywhere, because the inputs are
 * controlled: a bilingual box handed `null` becomes an uncontrolled input and
 * React warns on the first keystroke.
 */
export function emptyValue(field: ProductField): unknown {
  switch (field.kind) {
    case "bilingual":
    case "bilingualText":
      return EMPTY_BILINGUAL;
    case "bilingualList":
    case "photos":
      return [];
    case "text":
      return "";
    case "price":
      return 0;
    case "stock":
      return null;
    case "toggle":
      return false;
  }
}

/** The field's current value on this row, or its empty value if it has none. */
export function readField(row: ProductRow, field: ProductField): unknown {
  const stored =
    field.storage.in === "column"
      ? row[field.storage.column]
      : (row[field.storage.column] as Record<string, unknown> | null | undefined)?.[field.storage.key];

  // `stock` is the one field where null is a real answer — it means "don't
  // count this one" — so it is never replaced by an empty value.
  if (field.kind === "stock") return stored ?? null;
  return stored ?? emptyValue(field);
}

/**
 * The field's stored value, with nothing substituted for a missing one.
 *
 * `readField` exists to feed a controlled input, so it turns null into an empty
 * string or an empty pair. That is right on screen and wrong when copying a
 * value from one row onto another: a product with no gift would hand its new
 * variant `{ en: "", es: "" }`, which is not null, survives the build — only
 * nulls are dropped — and is truthy, so the shop would advertise a free gift
 * that is never going to ship.
 */
export function rawField(row: ProductRow, field: ProductField): unknown {
  return field.storage.in === "column"
    ? row[field.storage.column]
    : (row[field.storage.column] as Record<string, unknown> | null | undefined)?.[field.storage.key];
}

/**
 * The change to apply to the row for this edit.
 *
 * A field inside a json column has to carry the whole column, merged onto what
 * is already there — writing `{ seo: { title } }` on its own would drop the
 * description sitting beside it.
 */
export function writeField(row: ProductRow, field: ProductField, value: unknown): ProductRow {
  if (field.storage.in === "column") return { [field.storage.column]: value };
  const current = (row[field.storage.column] as Record<string, unknown> | null) ?? {};
  return { [field.storage.column]: { ...current, [field.storage.key]: value } };
}

/** Every database column the declared fields touch, each named once. */
export const fieldColumns: string[] = [
  ...new Set(productFields.map((field) => field.storage.column)),
];

/**
 * Columns the panel may write that are not fields anyone edits in a box.
 *
 * `category` and `position` are set by the create form and by Reorder mode;
 * `reviews` is written by the build when an approved review is merged onto its
 * product. They are listed rather than declared because there is no field to
 * draw for them.
 */
const STRUCTURAL_EDITABLE = ["category", "position", "reviews"];

/**
 * Columns that may be set when a row is created, and never again.
 *
 * A product's slug is its URL — already circulating on Pinterest — and the two
 * grouping columns are what keep variants together. Settable exactly once, at
 * birth, which is why this list is separate rather than derived from the one
 * above.
 */
const STRUCTURAL_CREATABLE = ["slug", "category", "variant_group", "scent", "scent_group", "position"];

/**
 * The Worker's allowlists, derived rather than repeated.
 *
 * Keeping these in step with the editor by hand is what let the two search
 * fields ship in the panel without `seo` ever being writable: every save that
 * touched them was rejected whole, and the screen said "Couldn't save".
 */
export const productColumns = {
  editable: [...new Set([...fieldColumns, ...STRUCTURAL_EDITABLE])],
  creatable: [
    ...new Set([
      ...STRUCTURAL_CREATABLE,
      ...productFields.filter((field) => field.onCreate).map((field) => field.storage.column),
    ]),
  ],
};
