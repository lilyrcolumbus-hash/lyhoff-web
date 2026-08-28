"use client";

import { useState } from "react";
import { inputClass, labelClass } from "./ui";

export type Bilingual = { en: string; es: string };

/**
 * English is the field you write; Spanish sits under it as its translation.
 *
 * Not two equal columns — being asked to fill two boxes reads like doing the
 * job twice. English leads because the panel, the site's default locale and
 * everything else built here is English; leading with Spanish while every
 * label around it was English is what made this screen look half-translated.
 *
 * The store still holds real text in both languages rather than translating in
 * the browser: a machine translation done at view time reads badly and Google
 * won't index it. The second language is output, collapsed until there is a
 * reason to look at it.
 */
export function BilingualField({
  title,
  value,
  onChange,
  multiline,
  hint,
}: {
  title: string;
  value: Bilingual;
  onChange: (next: Bilingual) => void;
  multiline?: boolean;
  hint?: string;
}) {
  const [showSpanish, setShowSpanish] = useState(false);
  const Control = multiline ? "textarea" : "input";
  const english = value?.en ?? "";
  const spanish = value?.es ?? "";
  // Worth surfacing without being asked: an empty translation is a page that
  // ships blank to Spanish-speaking customers.
  const missing = english.trim().length > 0 && spanish.trim().length === 0;

  return (
    <div className="flex flex-col gap-1.5">
      <span className={labelClass}>{title}</span>
      <Control
        className={`${inputClass} ${multiline ? "min-h-[78px] resize-y leading-relaxed" : ""}`}
        value={english}
        onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
          onChange({ ...value, en: event.target.value })
        }
      />
      {hint && <span className="text-[11.5px] text-stone-500">{hint}</span>}

      <button
        type="button"
        onClick={() => setShowSpanish((v) => !v)}
        className="self-start text-[11.5px] text-stone-500 underline underline-offset-2 hover:text-forest-950"
      >
        {showSpanish ? "Hide" : "Show"} Spanish version
        {missing && <span className="ml-1.5 font-semibold text-clay-600">· missing</span>}
      </button>

      {showSpanish && (
        <div className="flex flex-col gap-1 border-l-2 border-stone-200 pl-3">
          <span className="text-[9.5px] font-bold tracking-[0.14em] text-stone-400">SPANISH</span>
          <Control
            className={`${inputClass} ${multiline ? "min-h-[78px] resize-y leading-relaxed" : ""}`}
            value={spanish}
            onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
              onChange({ ...value, es: event.target.value })
            }
          />
        </div>
      )}
    </div>
  );
}
