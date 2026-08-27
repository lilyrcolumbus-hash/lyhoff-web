/**
 * Pulls the catalogue out of Supabase and freezes it into
 * lib/products.generated.json, which lib/products.ts imports.
 *
 * The whole point is that this happens at BUILD time, never at request time.
 * worker.ts prices a Stripe checkout from the same frozen bundle the pages were
 * rendered from, so the price a customer reads and the price they are charged
 * come from one snapshot and cannot drift apart mid-session — which is exactly
 * what a live database read in the payment path would allow.
 *
 * Fails the build loudly on any problem. A catalogue that silently comes back
 * empty would publish a store with nothing in it.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

// Read straight out of site.config.ts — see the note there on why ambient
// SUPABASE_URL/SUPABASE_ANON_KEY are deliberately ignored.
const config = readFileSync(join(root, "site.config.ts"), "utf8");
const dataBlock = config.slice(config.indexOf("  data: {", config.indexOf("export const site")));
const SUPABASE_URL = dataBlock.match(/supabaseUrl:\s*"([^"]+)"/)?.[1];
const SUPABASE_ANON_KEY = dataBlock.match(/supabaseAnonKey:\s*\n?\s*"([^"]+)"/)?.[1];
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("fetch-products: site.config.ts is missing data.supabaseUrl / data.supabaseAnonKey");
}

const OUT = join(root, "lib", "products.generated.json");

// Column names are snake_case in Postgres and camelCase in the Product type.
const CAMEL = {
  variant_group: "variantGroup",
  scent_group: "scentGroup",
  how_to_use: "howToUse",
};

function toProduct(row) {
  const out = {};
  for (const [key, value] of Object.entries(row)) {
    if (key === "created_at" || key === "updated_at" || key === "position") continue;
    // Optional fields are absent in the hand-written catalogue and null in the
    // table; keep them absent so the generated file stays comparable to it.
    if (value === null) continue;
    out[CAMEL[key] ?? key] = key === "price" ? Number(value) : value;
  }
  return out;
}

const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&order=position.asc,slug.asc`, {
  headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
});

if (!res.ok) {
  throw new Error(`fetch-products: Supabase returned ${res.status} ${await res.text()}`);
}

const rows = await res.json();
if (!Array.isArray(rows) || rows.length === 0) {
  throw new Error("fetch-products: the products table came back empty — refusing to build an empty store");
}

const products = rows.map(toProduct);

for (const p of products) {
  if (!p.slug || !p.category || typeof p.price !== "number" || !p.name?.en || !p.name?.es) {
    throw new Error(`fetch-products: product "${p.slug ?? "(no slug)"}" is missing required fields`);
  }
}

// Only rewrite when something actually changed, so an unchanged catalogue
// doesn't churn the file and produce a pointless diff on every build.
const next = JSON.stringify(products, null, 2) + "\n";
let previous = "";
try {
  previous = readFileSync(OUT, "utf8");
} catch {
  previous = "";
}
if (next !== previous) writeFileSync(OUT, next);

const active = products.filter((p) => p.active !== false).length;
console.log(
  `fetch-products: ${products.length} products (${active} active)${next === previous ? " — unchanged" : ""}`,
);
