"use client";

import { useCallback, useEffect, useState } from "react";
import { LogoMark } from "@/components/illustrations";
import { Button, Card, Empty, Note, patchRow, readCollection } from "./ui";
import { site } from "@/site.config";

interface Setting {
  key: string;
  value: Record<string, unknown>;
}

/**
 * The six colours worth putting in reach.
 *
 * The full palette is twenty-seven tokens, most of them shades derived to sit
 * around these. Exposing all of them would be a way to make the site unreadable
 * by accident; these are the ones that actually change how it looks, and each
 * says what it is for — the split by JOB is what keeps two accents from
 * competing, and it survives a change of hue.
 */
const EDITABLE = [
  { token: "cream", label: "Background", job: "The ground everything sits on", fallback: "#fbfaf7" },
  { token: "ink", label: "Text", job: "Body copy", fallback: "#2b2a25" },
  { token: "forest-950", label: "Primary", job: "Headings and the buttons that matter", fallback: "#1c1b17" },
  { token: "earth-600", label: "Brand", job: "Wordmark, promo codes, gift bars", fallback: "#7a7757" },
  { token: "indigo-500", label: "Interaction", job: "Focus rings, hover edges, links", fallback: "#5f6f80" },
  { token: "clay-600", label: "Errors", job: "Errors only — never decoration", fallback: "#8a4f3d" },
];

/** Relative luminance, per WCAG. */
function luminance(hex: string): number {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? value.split("").map((c) => c + c).join("") : value;
  const channels = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

const HEX = /^#[0-9a-fA-F]{6}$/;

export function BrandSection() {
  const [rows, setRows] = useState<Setting[] | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    const data = await readCollection<Setting>("settings");
    setRows(data ?? []);
    const stored = (data ?? []).find((row) => row.key === "palette")?.value ?? {};
    setDraft(
      Object.fromEntries(
        EDITABLE.map((colour) => [
          colour.token,
          typeof stored[colour.token] === "string" ? (stored[colour.token] as string) : colour.fallback,
        ]),
      ),
    );
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const stored = (rows?.find((row) => row.key === "palette")?.value ?? {}) as Record<string, string>;
  const dirty = EDITABLE.some(
    (colour) => draft[colour.token] !== (stored[colour.token] ?? colour.fallback),
  );

  async function save() {
    if (saving) return;
    const invalid = EDITABLE.filter((colour) => !HEX.test(draft[colour.token] ?? ""));
    if (invalid.length > 0) {
      setMessage({ kind: "error", text: `${invalid[0].label} isn't a valid colour.` });
      return;
    }

    setSaving(true);
    setMessage(null);
    // Only what differs from the compiled palette is stored, so a site that has
    // never been re-coloured keeps an empty row and its config stays the truth.
    const value = Object.fromEntries(
      EDITABLE.filter((colour) => draft[colour.token] !== colour.fallback).map((colour) => [
        colour.token,
        draft[colour.token],
      ]),
    );
    const result = await patchRow("settings", "palette", { value });
    if (!result.ok) {
      setMessage({ kind: "error", text: "Couldn't save." });
      setSaving(false);
      return;
    }
    await load();
    setMessage({ kind: "ok", text: "Saved — the site changes colour at the next publish." });
    setSaving(false);
  }

  function reset() {
    setDraft(Object.fromEntries(EDITABLE.map((colour) => [colour.token, colour.fallback])));
    setMessage(null);
  }

  if (rows === null) return <Empty>Loading…</Empty>;

  const background = draft.cream ?? "#fbfaf7";
  const textContrast = contrast(draft.ink ?? "#2b2a25", background);
  const buttonContrast = contrast(background, draft["forest-950"] ?? "#1c1b17");

  return (
    <div className="flex max-w-3xl flex-col gap-3">
      <Card className="flex flex-wrap items-center gap-3 px-4 py-3">
        <p className="text-[12.5px] text-stone-600">
          Colour changes reach the site at the next publish.
        </p>
        <div className="ml-auto flex items-center gap-3">
          {message && (
            <span className={`text-[12.5px] ${message.kind === "ok" ? "text-earth-700" : "text-clay-600"}`}>
              {message.text}
            </span>
          )}
          {dirty && (
            <Button variant="quiet" onClick={reset} disabled={saving}>
              Back to defaults
            </Button>
          )}
          <Button onClick={save} disabled={!dirty || saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </Card>

      <Card className="flex flex-wrap items-center gap-6 p-5">
        <div className="flex flex-col items-center gap-2">
          <LogoMark className="h-16 w-16 text-forest-950" textClassName="text-lg" />
          <span className="text-[11px] text-stone-500">Monogram</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="font-display text-2xl text-forest-950" style={{ letterSpacing: "0.18em" }}>
            {site.name}
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
          {EDITABLE.map((colour) => (
            <div key={colour.token} className="flex flex-wrap items-center gap-3 px-3 py-2.5">
              <input
                type="color"
                aria-label={colour.label}
                value={HEX.test(draft[colour.token] ?? "") ? draft[colour.token] : colour.fallback}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, [colour.token]: event.target.value }))
                }
                className="h-8 w-8 shrink-0 cursor-pointer border border-stone-300 bg-transparent p-0"
              />
              <span className="w-24 shrink-0 text-[13px] font-medium text-forest-950">{colour.label}</span>
              <input
                value={draft[colour.token] ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, [colour.token]: event.target.value }))
                }
                className="w-24 shrink-0 border border-stone-300 px-2 py-1 font-mono text-[12px] uppercase text-stone-700"
              />
              <span className="min-w-0 flex-1 text-[12px] text-stone-500">{colour.job}</span>
              {draft[colour.token] !== colour.fallback && (
                <span className="shrink-0 text-[11px] text-stone-400">changed</span>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-display text-[15px] font-bold text-forest-950">How it reads</h2>
        <p className="mt-1 text-[12.5px] text-stone-600">
          Text needs 4.5 to 1 against its background to stay readable. This is the check that stops
          a nice-looking colour from making the shop unreadable for someone.
        </p>

        <div className="mt-4 border border-stone-200 p-5" style={{ background }}>
          <p className="font-display text-lg font-bold" style={{ color: draft["forest-950"] }}>
            Nothing synthetic. Nothing to hide.
          </p>
          <p className="mt-1.5 text-[13px]" style={{ color: draft.ink }}>
            The confidence of knowing exactly what's in every jar.
          </p>
          <span
            className="mt-3 inline-block px-4 py-2 text-[12px] font-semibold"
            style={{ background: draft["forest-950"], color: background }}
          >
            Add to bag
          </span>
          <span
            className="ml-2 inline-block px-3 py-2 text-[12px] font-semibold"
            style={{ color: draft["earth-600"] }}
          >
            WELCOME10
          </span>
        </div>

        <ul className="mt-3 flex flex-col gap-1 text-[12.5px]">
          {[
            { label: "Body text on the background", ratio: textContrast },
            { label: "Button text on the button", ratio: buttonContrast },
          ].map((check) => (
            <li key={check.label} className="flex items-center gap-2">
              <span className={check.ratio >= 4.5 ? "text-earth-700" : "text-clay-600"}>
                {check.ratio >= 4.5 ? "✓" : "✕"}
              </span>
              <span className="text-stone-600">{check.label}</span>
              <span className="tabular-nums text-stone-500">{check.ratio.toFixed(1)} : 1</span>
              {check.ratio < 4.5 && <span className="text-clay-600">too low</span>}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
