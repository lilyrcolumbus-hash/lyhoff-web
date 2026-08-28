/**
 * Pulls the composed pages out of Supabase and freezes them into
 * lib/pages.generated.json, which lib/pages.ts imports.
 *
 * Build time, like the catalogue and the settings. An empty result is fine —
 * a site with no pages of its own is the normal starting state, unlike a
 * catalogue, where empty means something has gone wrong.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

const config = readFileSync(join(root, "site.config.ts"), "utf8");
const dataBlock = config.slice(config.indexOf("  data: {", config.indexOf("export const site")));
const SUPABASE_URL = dataBlock.match(/supabaseUrl:\s*"([^"]+)"/)?.[1];
const SUPABASE_ANON_KEY = dataBlock.match(/supabaseAnonKey:\s*\n?\s*"([^"]+)"/)?.[1];
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("fetch-pages: site.config.ts is missing data.supabaseUrl / data.supabaseAnonKey");
}

const OUT = join(root, "lib", "pages.generated.json");

const res = await fetch(
  `${SUPABASE_URL}/rest/v1/pages?select=slug,title,blocks,seo,active&order=position.asc,slug.asc`,
  { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } },
);

let rows = [];
if (res.ok) {
  rows = await res.json();
} else if (res.status === 404) {
  console.warn("fetch-pages: no pages table yet");
} else {
  throw new Error(`fetch-pages: Supabase returned ${res.status} ${await res.text()}`);
}

// Only published pages are built. A draft that reached the CDN would be public
// however unlinked it is, so it never leaves the database.
const pages = rows.filter((page) => page.active);

const next = JSON.stringify(pages, null, 2) + "\n";
let previous = "";
try {
  previous = readFileSync(OUT, "utf8");
} catch {
  previous = "";
}
if (next !== previous) writeFileSync(OUT, next);

console.log(`fetch-pages: ${pages.length} published${next === previous ? " — unchanged" : ""}`);
