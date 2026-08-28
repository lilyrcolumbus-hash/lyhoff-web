/**
 * Turns site.config.ts's palette into the CSS variables Tailwind reads.
 *
 * Runs before `next build` (see package.json). The generated file is committed
 * output, not a source of truth — edit site.config.ts, never theme.generated.css.
 *
 * This is the seam that makes the system reusable: a different site changes one
 * config file and every component re-skins, because no component names a colour.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const file = readFileSync(join(root, "site.config.ts"), "utf8");
// Skip the interface declarations above `export const site` — they contain the
// same key names with TypeScript types, which otherwise match first.
const source = file.slice(file.indexOf("export const site"));

// site.config.ts is TypeScript and this script is plain node, so the palette is
// read out of the source rather than imported. Deliberately strict: an
// unparseable config should fail the build loudly, not silently ship the old theme.
const paletteMatch = source.match(/palette:\s*\{([\s\S]*?)\n  \},\n\n  fonts:/);
if (!paletteMatch) {
  throw new Error("generate-theme: could not find `palette` in site.config.ts");
}

const lines = [];
let group = null;

for (const raw of paletteMatch[1].split("\n")) {
  const line = raw.trim();
  if (!line || line.startsWith("//")) continue;

  const flat = line.match(/^(\w+):\s*"(#[0-9a-fA-F]{3,8})"/);
  if (flat) {
    lines.push(`  --color-${flat[1]}: ${flat[2]};`);
    continue;
  }

  const groupStart = line.match(/^(\w+):\s*\{$/);
  if (groupStart) {
    group = groupStart[1];
    continue;
  }

  if (line === "}," || line === "}") {
    group = null;
    continue;
  }

  const shade = line.match(/^"(\w+)":\s*"(#[0-9a-fA-F]{3,8})"/);
  if (shade && group) lines.push(`  --color-${group}-${shade[1]}: ${shade[2]};`);
}

if (lines.length === 0) throw new Error("generate-theme: palette parsed but produced no colours");

// Colours the owner has changed from the panel win over the compiled ones.
// Only tokens that already exist are replaced — a stray key cannot invent a
// variable no component reads, and a malformed value is ignored rather than
// emitted, because a broken colour here would ship site-wide.
let overrides = {};
try {
  overrides = JSON.parse(readFileSync(join(root, "lib", "settings.generated.json"), "utf8")).palette ?? {};
} catch {
  overrides = {};
}

let overridden = 0;
for (const [token, value] of Object.entries(overrides)) {
  if (typeof value !== "string" || !/^#[0-9a-fA-F]{3,8}$/.test(value)) continue;
  const index = lines.findIndex((line) => line.startsWith(`  --color-${token}:`));
  if (index === -1) continue;
  lines[index] = `  --color-${token}: ${value};`;
  overridden += 1;
}

const fonts = source.match(/fonts:\s*\{([\s\S]*?)\},/);
const display = fonts?.[1].match(/display:\s*"([^"]+)"/)?.[1];
const body = fonts?.[1].match(/body:\s*"([^"]+)"/)?.[1];

const block = `/* THEME:START — generated from site.config.ts, do not edit by hand */
@theme {
${display ? `  --font-display: ${display};\n` : ""}${body ? `  --font-sans: ${body};\n` : ""}
${lines.join("\n")}
}
/* THEME:END */`;

const globalsPath = join(root, "app", "globals.css");
const globals = readFileSync(globalsPath, "utf8");
const start = globals.indexOf("/* THEME:START");
const end = globals.indexOf("/* THEME:END */");
if (start === -1 || end === -1) {
  throw new Error("generate-theme: THEME:START/THEME:END markers missing from app/globals.css");
}

writeFileSync(
  globalsPath,
  globals.slice(0, start) + block + globals.slice(end + "/* THEME:END */".length),
);
console.log(
  `generate-theme: wrote ${lines.length} colour tokens into app/globals.css` +
    (overridden > 0 ? ` (${overridden} from the panel)` : ""),
);
