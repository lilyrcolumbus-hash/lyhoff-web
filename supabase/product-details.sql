-- Room for a brand's own product fields.
--
-- LYHOFF does not need this: every field it declares in product-fields.config.ts
-- points at a column that already exists, which is why nothing had to move when
-- the editor became declarative.
--
-- A brand selling something else — roast level, wattage, fabric — declares its
-- fields with `storage: { in: "json", column: "details", key: "…" }` and they
-- all live in this one column, so adding a field never needs a schema change
-- again. Same mechanism the two search fields already use with `seo`.
--
-- Run this once when standing up a brand that needs it. Running it on LYHOFF is
-- harmless and changes nothing: the column stays null on every row, and
-- scripts/fetch-products.mjs drops null columns from the build bundle.

alter table public.products
  add column if not exists details jsonb;
