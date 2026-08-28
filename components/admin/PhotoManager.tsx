"use client";

import { useRef, useState } from "react";
import { site } from "@/site.config";
import { Button, Note } from "./ui";

const STORAGE_BASE = `${site.data.supabaseUrl}/storage/v1/object/public/product-photos`;

/**
 * Mirror of photoUrl() in lib/product-images.ts, which cannot be imported here
 * because it reads the filesystem. An entry starting with "/" is a file in the
 * repo; anything else is a path in the storage bucket.
 */
export function photoSrc(entry: string): string {
  return entry.startsWith("/") || entry.startsWith("http") ? entry : `${STORAGE_BASE}/${entry}`;
}

/** True for a photo this panel uploaded, and so one it is allowed to delete. */
export function isUploaded(entry: string): boolean {
  return !entry.startsWith("/") && !entry.startsWith("http");
}

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";
const MAX_BYTES = 10 * 1024 * 1024;

const ERRORS: Record<string, string> = {
  unsupported_type: "That file isn't a JPG, PNG, WebP or AVIF.",
  too_large: "That photo is over 10 MB.",
  upload_failed: "The upload didn't go through.",
  invalid_slug: "Couldn't tell which product that belongs to.",
};

/**
 * The gallery, in the order it appears on the site. First photo is the one the
 * shop grid shows, so it is labelled rather than left to be inferred.
 *
 * Removing a photo only takes it out of this list. The file itself is deleted
 * after Save, so discarding an edit cannot destroy a photo — see save() in
 * ProductsSection.
 */
export function PhotoManager({
  slug,
  photos,
  onChange,
}: {
  slug: string;
  photos: string[];
  onChange: (next: string[]) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  function move(from: number, to: number) {
    if (to < 0 || to >= photos.length) return;
    const next = [...photos];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  }

  async function upload(files: FileList) {
    setBusy(true);
    setError(null);
    const added: string[] = [];

    for (const file of Array.from(files)) {
      if (file.size > MAX_BYTES) {
        setError(`${file.name}: over 10 MB.`);
        continue;
      }
      const form = new FormData();
      form.append("slug", slug);
      form.append("file", file);

      const res = await fetch("/api/admin/photo", {
        method: "POST",
        body: form,
        credentials: "same-origin",
      }).catch(() => null);

      const data = (await res?.json().catch(() => ({}))) as { path?: string; error?: string };
      if (!res?.ok || !data.path) {
        setError(ERRORS[data.error ?? ""] ?? `${file.name} didn't upload.`);
        continue;
      }
      added.push(data.path);
    }

    if (added.length > 0) onChange([...photos, ...added]);
    if (input.current) input.current.value = "";
    setBusy(false);
  }

  return (
    <div className="flex flex-col gap-2.5">
      {photos.length === 0 ? (
        <p className="border border-dashed border-stone-300 px-4 py-6 text-center text-[12.5px] text-stone-500">
          No photos yet. The shop shows a placeholder until there is one.
        </p>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(104px,1fr))] gap-2">
          {photos.map((entry, index) => (
            <li key={entry} className="group relative border border-stone-200 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoSrc(entry)}
                alt=""
                loading="lazy"
                className="aspect-square w-full bg-stone-50 object-cover"
              />
              {index === 0 && (
                <span className="absolute left-0 top-0 bg-forest-950 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.1em] text-cream">
                  MAIN
                </span>
              )}
              <div className="flex items-center justify-between border-t border-stone-200 px-1 py-0.5">
                <span className="flex">
                  <button
                    type="button"
                    onClick={() => move(index, index - 1)}
                    disabled={index === 0}
                    aria-label="Move earlier"
                    className="px-1 text-[13px] text-stone-500 disabled:opacity-25 hover:text-forest-950"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, index + 1)}
                    disabled={index === photos.length - 1}
                    aria-label="Move later"
                    className="px-1 text-[13px] text-stone-500 disabled:opacity-25 hover:text-forest-950"
                  >
                    →
                  </button>
                </span>
                <button
                  type="button"
                  onClick={() => onChange(photos.filter((_, i) => i !== index))}
                  aria-label="Remove photo"
                  className="px-1 text-[13px] text-stone-400 hover:text-clay-600"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={input}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={(event) => event.target.files && void upload(event.target.files)}
        />
        <Button variant="quiet" onClick={() => input.current?.click()} disabled={busy}>
          {busy ? "Uploading…" : "Add photos"}
        </Button>
        <Note>JPG, PNG or WebP, up to 10 MB. The first one is what the shop grid shows.</Note>
      </div>

      {error && <p className="text-[12.5px] text-clay-600">{error}</p>}
    </div>
  );
}
