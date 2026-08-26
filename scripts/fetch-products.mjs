// Prebuild step (see package.json's "prebuild"): fetches the product catalog
// from the Supabase `products` table and writes lib/products.generated.json,
// which lib/products.ts imports instead of a hardcoded array. Same pattern
// lib/content.ts already uses for MDX articles, just from an API instead of
// the filesystem.
//
// Fails the build loudly on any error — a stale or empty catalog silently
// shipping to a live store (wrong prices, missing products) is worse than a
// failed deploy. Same reasoning as this project's "never fake data" rule.
//
// Run: node scripts/fetch-products.mjs

import fs from "node:fs";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "https://egxtilwjhfhohrhcjgbe.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVneHRpbHdqaGZob2hyaGNqZ2JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxODYzODgsImV4cCI6MjEwMDc2MjM4OH0.Q9SATTl0QmaAX0NrpxntyD3rWSu8tZ258b492v0Sp9w";

// snake_case DB columns -> the camelCase Product interface in lib/products.ts
function rowToProduct(row) {
  return {
    asin: row.asin,
    slug: row.slug,
    category: row.category,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    ingredients: row.ingredients ?? [],
    price: Number(row.price),
    size: row.size,
    image: row.image,
    ...(row.badge ? { badge: row.badge } : {}),
    active: row.active,
    ...(row.variant_group ? { variantGroup: row.variant_group } : {}),
    ...(row.scent ? { scent: row.scent } : {}),
    ...(row.scent_group ? { scentGroup: row.scent_group } : {}),
    benefits: row.benefits ?? [],
    howToUse: row.how_to_use,
    ...(row.reviews?.length ? { reviews: row.reviews } : {}),
    ...(row.gift ? { gift: row.gift } : {}),
  };
}

async function main() {
  const url = `${SUPABASE_URL}/rest/v1/products?select=*&order=sort_order.asc`;
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  });
  if (!res.ok) {
    throw new Error(`Fetching products from Supabase failed: ${res.status} ${await res.text()}`);
  }
  const rows = await res.json();
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("Supabase returned zero products — refusing to write an empty catalog.");
  }

  const products = rows.map(rowToProduct);
  const outPath = new URL("../lib/products.generated.json", import.meta.url);
  fs.writeFileSync(outPath, JSON.stringify(products, null, 2) + "\n");
  console.log(`Wrote lib/products.generated.json — ${products.length} products.`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
