// Writes out/index.html: a language-aware redirect for the bare "/" root.
// Detects the browser language and sends visitors to /es/ or /en/.
// Runs after `next build` (output: export) so it lands in the static `out` dir.
import { writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const outDir = join(process.cwd(), "out");
if (!existsSync(outDir)) {
  console.error("postbuild: out/ not found — did `next build` run?");
  process.exit(0);
}

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>SmartGrowth</title>
    <link rel="canonical" href="/en/" />
    <meta name="robots" content="noindex" />
    <meta http-equiv="refresh" content="0; url=/en/" />
    <script>
      // English is the default; visitors can switch to Spanish via the top banner.
      location.replace("/en/");
    </script>
  </head>
  <body>
    <p>Redirecting… <a href="/en/">English</a> · <a href="/es/">Español</a></p>
  </body>
</html>
`;

writeFileSync(join(outDir, "index.html"), html);
console.log("postbuild: wrote out/index.html (language-aware root redirect)");
