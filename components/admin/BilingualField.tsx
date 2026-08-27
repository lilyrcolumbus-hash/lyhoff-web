"use client";

import { useState } from "react";
import { inputClass, labelClass } from "./ui";

export type Bilingual = { en: string; es: string };

/**
 * Spanish is the field you write; English sits under it as its translation.
 *
 * Not two equal columns: the owner writes in Spanish and was right that being
 * asked to fill two boxes reads like doing the job twice. The English is still
 * shown — the store stores real text in both languages rather than translating
 * in the browser, because a machine translation done at view time reads badly
 * and Google won't index it — but it is presented as output, collapsed until
 * there is a reason to look at it.
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
  const [showEnglish, setShowEnglish] = useState(false);
  const Control = multiline ? "textarea" : "input";
  const english = value?.en ?? "";
  const spanish = value?.es ?? "";
  // Worth surfacing without being asked: an empty translation is a page that
  // ships blank to English-speaking customers.
  const missing = spanish.trim().length > 0 && english.trim().length === 0;

  return (
    <div className="flex flex-col gap-1.5">
      <span className={labelClass}>{title}</span>
      <Control
        className={`${inputClass} ${multiline ? "min-h-[78px] resize-y leading-relaxed" : ""}`}
        value={spanish}
        onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
          onChange({ ...value, es: event.target.value })
        }
      />
      {hint && <span className="text-[11.5px] text-stone-500">{hint}</span>}

      <button
        type="button"
        onClick={() => setShowEnglish((v) => !v)}
        className="self-start text-[11.5px] text-stone-500 underline underline-offset-2 hover:text-forest-950"
      >
        {showEnglish ? "Hide" : "Show"} English version
        {missing && <span className="ml-1.5 font-semibold text-clay-600">· missing</span>}
      </button>

      {showEnglish && (
        <div className="flex flex-col gap-1 border-l-2 border-stone-200 pl-3">
          <span className="text-[9.5px] font-bold tracking-[0.14em] text-stone-400">ENGLISH</span>
          <Control
            className={`${inputClass} ${multiline ? "min-h-[78px] resize-y leading-relaxed" : ""}`}
            value={english}
            onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
              onChange({ ...value, en: event.target.value })
            }
          />
        </div>
      )}
    </div>
  );
}
