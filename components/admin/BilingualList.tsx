"use client";

import type { Bilingual } from "./BilingualField";
import { Button, inputClass, labelClass } from "./ui";

/**
 * An ordered list of short bilingual phrases — ingredients, benefits.
 *
 * Order is part of the content here: the first ingredient is the one a customer
 * reads, and a benefits list is an argument made in sequence. So the rows move
 * rather than sorting themselves.
 *
 * Both languages sit side by side instead of collapsing the Spanish the way a
 * long field does. These are two or three words each, and a half-translated
 * ingredient list is worse than a visibly empty box.
 */
export function BilingualList({
  title,
  hint,
  items,
  onChange,
}: {
  title: string;
  hint?: string;
  items: Bilingual[];
  onChange: (next: Bilingual[]) => void;
}) {
  function set(index: number, patch: Partial<Bilingual>) {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function move(index: number, to: number) {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(to, 0, moved);
    onChange(next);
  }

  const missing = items.filter((item) => item.en.trim() && !item.es.trim()).length;

  return (
    <div className="flex flex-col gap-2">
      <span className={labelClass}>
        {title}
        {missing > 0 && (
          <span className="ml-2 font-semibold text-clay-600">
            {missing} without Spanish
          </span>
        )}
      </span>

      {items.length === 0 ? (
        <p className="border border-dashed border-stone-300 px-3 py-4 text-center text-[12px] text-stone-500">
          Nothing here yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              <span className="flex shrink-0 flex-col">
                <button
                  type="button"
                  onClick={() => move(index, index - 1)}
                  disabled={index === 0}
                  aria-label="Move up"
                  className="text-[10px] leading-tight text-stone-500 disabled:opacity-25 hover:text-forest-950"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => move(index, index + 1)}
                  disabled={index === items.length - 1}
                  aria-label="Move down"
                  className="text-[10px] leading-tight text-stone-500 disabled:opacity-25 hover:text-forest-950"
                >
                  ▼
                </button>
              </span>
              <input
                className={`${inputClass} flex-1 py-1.5 text-[13px]`}
                value={item.en}
                aria-label={`${title} in English`}
                placeholder="English"
                onChange={(event) => set(index, { en: event.target.value })}
              />
              <input
                className={`${inputClass} flex-1 py-1.5 text-[13px]`}
                value={item.es}
                aria-label={`${title} in Spanish`}
                placeholder="Español"
                onChange={(event) => set(index, { es: event.target.value })}
              />
              <button
                type="button"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
                aria-label="Remove"
                className="shrink-0 px-1 text-[13px] text-stone-400 hover:text-clay-600"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <span className="flex items-center gap-3">
        <Button variant="quiet" onClick={() => onChange([...items, { en: "", es: "" }])}>
          Add
        </Button>
        {hint && <span className="text-[11.5px] text-stone-500">{hint}</span>}
      </span>
    </div>
  );
}
