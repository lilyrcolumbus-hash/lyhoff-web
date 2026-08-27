"use client";

import { Card, Note } from "./ui";
import { LogoMark } from "@/components/illustrations";

const PALETTE = [
  { name: "Cream", hex: "#fbfaf7", job: "The ground everything sits on" },
  { name: "Near-black", hex: "#1c1b17", job: "Headings and primary buttons" },
  { name: "Dark grey", hex: "#57534d", job: "Body copy" },
  { name: "Mid grey", hex: "#79716b", job: "Secondary text" },
  { name: "Olive", hex: "#93906d", job: "The brand — wordmark, promo codes, leaf marks" },
  { name: "Indigo", hex: "#5f6f80", job: "Interaction — focus rings, hover edges" },
  { name: "Clay", hex: "#8a4f3d", job: "Errors only" },
  { name: "Border", hex: "#e7e5e4", job: "Lines and frames" },
];

/**
 * Read-only for now, on purpose.
 *
 * The palette already lives in site.config.ts and compiles into the stylesheet
 * at build time, which is what lets a whole site re-skin from one file. Wiring
 * the editing here means moving those values into the database and
 * regenerating the theme on publish — worth doing, but only once Publish
 * exists, or a colour change would save with no way to reach the site.
 */
export function BrandSection() {
  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <Card className="flex flex-wrap items-center gap-6 p-5">
        <div className="flex flex-col items-center gap-2">
          <LogoMark className="h-16 w-16 text-forest-950" textClassName="text-lg" />
          <span className="text-[11px] text-stone-500">Monogram</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="font-display text-2xl text-forest-950" style={{ letterSpacing: "0.18em" }}>
            LYHOFF
          </span>
          <span className="text-[11px] text-stone-500">Wordmark</span>
        </div>
        <div className="ml-auto max-w-xs">
          <Note>
            The monogram is drawn in code rather than being an image, which is why it stays sharp in
            the favicon, in emails and in the footer without uploading a file.
          </Note>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-display text-[15px] font-bold text-forest-950">Palette</h2>
        <p className="mt-1 text-[12.5px] text-stone-600">
          Every colour has a job. That split is what keeps two accents from competing.
        </p>
        <div className="mt-4 divide-y divide-stone-200 border border-stone-200">
          {PALETTE.map((colour) => (
            <div key={colour.hex} className="flex items-center gap-3 px-3 py-2">
              <span
                className="h-6 w-6 shrink-0 border border-stone-300"
                style={{ background: colour.hex }}
              />
              <span className="w-28 shrink-0 text-[13px] font-medium text-forest-950">{colour.name}</span>
              <span className="w-20 shrink-0 text-[12px] tabular-nums text-stone-500">{colour.hex}</span>
              <span className="text-[12px] text-stone-600">{colour.job}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <span className="border border-indigo-500 bg-indigo-50 px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-indigo-600">
          Not built yet
        </span>
        <h2 className="mt-3 font-display text-[15px] font-bold text-forest-950">Change los colores</h2>
        <Note>
          The palette lives in site.config.ts and compiles into the stylesheet at build time — that is
          what lets one file re-skin the whole site, and what will let another site reuse this.
          Editing it from here means moving those values into the database and regenerating the
          theme on publish, so it lands right after Publish: without that, a colour change would
          save with no way to reach the site. It will carry a contrast warning, so you can't leave
          text unreadable without being told.
        </Note>
      </Card>
    </div>
  );
}
