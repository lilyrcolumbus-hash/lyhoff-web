/**
 * What a product is, for this brand.
 *
 * The product editor used to have LYHOFF's own fields written into it —
 * tagline, scent, ingredients — so a brand selling something else needed a
 * developer to edit a React component. Everything the editor shows is declared
 * here instead, and the panel, the write allowlist and the create form are all
 * drawn from this list.
 *
 * ── Nothing moves ─────────────────────────────────────────────────────────
 * Every field below says where its value is stored, and for LYHOFF every one
 * of them points at the column it already lives in. No data is copied,
 * converted or migrated: the editor reads and writes exactly where it did
 * before, so every product opens with its current values already in place.
 *
 * ── Adding a field for another brand ──────────────────────────────────────
 * A brand that needs something LYHOFF doesn't have — roast level, wattage,
 * fabric — adds an entry with `storage: { in: "json", column: "details", key:
 * "roast" }`. That is not new machinery: the two search fields below already
 * store themselves inside the `seo` json column the same way. Run
 * `supabase/product-details.sql` once to add the column.
 *
 * ── Order matters ─────────────────────────────────────────────────────────
 * Fields appear in the editor in the order they are listed here, within their
 * section. Reordering this array reorders the screen.
 */

/** How a field is edited, which also fixes how it is stored and validated. */
export type ProductFieldKind =
  /** One line, both languages. `{ en, es }` */
  | "bilingual"
  /** A paragraph, both languages. `{ en, es }` */
  | "bilingualText"
  /** An ordered list of short bilingual phrases. `[{ en, es }]` */
  | "bilingualList"
  /** One line, not translated — a size, a code. `string` */
  | "text"
  /** Money, edited with a currency prefix. `number` */
  | "price"
  /** Whole units, or blank for untracked. `number | null` */
  | "stock"
  /** A checkbox. `boolean` */
  | "toggle"
  /** The photo manager. `string[]` */
  | "photos";

/**
 * Where the value lives on the row.
 *
 * `column` is its own database column — what every LYHOFF field uses, which is
 * why none of them have to move. `json` is a key inside a json column, which
 * is how a brand adds a field without a schema change.
 */
export type ProductFieldStorage =
  | { in: "column"; column: string }
  | { in: "json"; column: string; key: string };

/**
 * Which part of the editor the field is drawn in. These are the panel as it
 * stands today, named — not a new layout.
 *
 * - `shared` — the card at the top. One value for the whole product; editing
 *   it changes every variant at once.
 * - `row`    — inline on the variant's own line, next to Save. For the two or
 *   three things read at a glance across every variant.
 * - `text`   — behind the variant's "Text" link.
 * - `seo`    — the search-engine block at the bottom of "Text".
 * - `photos` — behind the variant's "Photos" link.
 */
export type ProductFieldSection = "shared" | "row" | "text" | "seo" | "photos";

export interface ProductField {
  /** Stable identity. Not shown to anyone; used as the React key. */
  id: string;
  /** The label above the box. English, like the rest of the panel. */
  label: string;
  kind: ProductFieldKind;
  section: ProductFieldSection;
  storage: ProductFieldStorage;
  /** The grey line under the box, for a field people get wrong. */
  hint?: string;
  /** Grey text inside an empty box. */
  placeholder?: string;
  /**
   * Offered when a product or variant is first created.
   *
   * Separate from everything else on purpose: creation is the one write that
   * can set a product's permanent identity, so what it accepts is kept as
   * narrow as it already is rather than opened up to every field here.
   */
  onCreate?: boolean;
}

/**
 * LYHOFF's product.
 *
 * Shared-versus-per-variant was decided from the real catalogue, not from
 * taste: `count(distinct …)` per variant group showed tagline, how-to-use and
 * the gift identical across every variant of a product, while name,
 * description and price genuinely differ. Run that same query before choosing
 * for another catalogue.
 */
export const productFields: ProductField[] = [
  // ── Shared across every variant ─────────────────────────────────────────
  {
    id: "tagline",
    label: "Tagline",
    kind: "bilingual",
    section: "shared",
    storage: { in: "column", column: "tagline" },
    onCreate: true,
  },
  {
    id: "how_to_use",
    label: "How to use",
    kind: "bilingualText",
    section: "shared",
    storage: { in: "column", column: "how_to_use" },
    onCreate: true,
  },
  {
    id: "gift",
    label: "Free gift",
    kind: "bilingual",
    section: "shared",
    storage: { in: "column", column: "gift" },
    hint: "Leave empty if this product has no gift.",
    onCreate: true,
  },

  // ── On the variant's own line ───────────────────────────────────────────
  {
    id: "price",
    label: "Price",
    kind: "price",
    section: "row",
    storage: { in: "column", column: "price" },
    onCreate: true,
  },
  {
    id: "stock",
    label: "Units in stock",
    kind: "stock",
    section: "row",
    storage: { in: "column", column: "stock" },
    placeholder: "Untracked",
    onCreate: true,
  },
  {
    id: "active",
    label: "Visible",
    kind: "toggle",
    section: "row",
    storage: { in: "column", column: "active" },
    onCreate: true,
  },

  // ── Behind "Photos" ─────────────────────────────────────────────────────
  {
    id: "photos",
    label: "Photos",
    kind: "photos",
    section: "photos",
    storage: { in: "column", column: "photos" },
  },

  // ── Behind "Text" ───────────────────────────────────────────────────────
  {
    id: "name",
    label: "Name",
    kind: "bilingual",
    section: "text",
    storage: { in: "column", column: "name" },
    onCreate: true,
  },
  {
    id: "description",
    label: "Description",
    kind: "bilingualText",
    section: "text",
    storage: { in: "column", column: "description" },
    onCreate: true,
  },
  {
    id: "size",
    label: "Size",
    kind: "text",
    section: "text",
    storage: { in: "column", column: "size" },
    placeholder: "2 oz",
    onCreate: true,
  },
  {
    id: "ingredients",
    label: "Ingredients",
    kind: "bilingualList",
    section: "text",
    storage: { in: "column", column: "ingredients" },
    hint: "Shown as chips on the product page, in this order.",
  },
  {
    id: "benefits",
    label: "Benefits",
    kind: "bilingualList",
    section: "text",
    storage: { in: "column", column: "benefits" },
    hint: "The short bullets under the description.",
  },
  {
    id: "badge",
    label: "Badge",
    kind: "bilingual",
    section: "text",
    storage: { in: "column", column: "badge" },
    hint: "The small label over the photo. Leave empty for none.",
  },

  // ── Search engines ──────────────────────────────────────────────────────
  // Stored inside one json column rather than as two more columns, which is
  // the same mechanism a second brand's own extra fields use.
  {
    id: "seo_title",
    label: "Search title",
    kind: "bilingual",
    section: "seo",
    storage: { in: "json", column: "seo", key: "title" },
  },
  {
    id: "seo_description",
    label: "Search description",
    kind: "bilingualText",
    section: "seo",
    storage: { in: "json", column: "seo", key: "description" },
  },
];
