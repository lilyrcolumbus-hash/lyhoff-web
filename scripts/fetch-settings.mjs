/**
 * Pulls the site settings out of Supabase and freezes them into
 * lib/settings.generated.json, which lib/settings.ts imports.
 *
 * Same rule as the catalogue: read at BUILD time, never at request time. A
 * shipping rate that could change between the page being rendered and the
 * payment being taken is precisely the drift this architecture exists to stop.
 *
 * Unlike the catalogue, an empty result is fine — every setting has a compiled
 * default, and a site standing this up for the first time has no rows at all.
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
  throw new Error("fetch-settings: site.config.ts is missing data.supabaseUrl / data.supabaseAnonKey");
}

const OUT = join(root, "lib", "settings.generated.json");

const res = await fetch(`${SUPABASE_URL}/rest/v1/site_settings?select=key,value`, {
  headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
});

// A missing table is not a broken build — it is a site that hasn't run this
// migration yet. Anything else is a real failure and should be loud.
let rows = [];
if (res.ok) {
  rows = await res.json();
} else if (res.status === 404) {
  console.warn("fetch-settings: no site_settings table, using compiled defaults");
} else {
  throw new Error(`fetch-settings: Supabase returned ${res.status} ${await res.text()}`);
}

const settings = Object.fromEntries(rows.map((row) => [row.key, row.value]));

const next = JSON.stringify(settings, null, 2) + "\n";
let previous = "";
try {
  previous = readFileSync(OUT, "utf8");
} catch {
  previous = "";
}
if (next !== previous) writeFileSync(OUT, next);

console.log(
  `fetch-settings: ${Object.keys(settings).length} keys${next === previous ? " — unchanged" : ""}`,
);
