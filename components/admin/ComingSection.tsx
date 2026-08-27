"use client";

import { Card, Note } from "./ui";

/**
 * A section that exists in the navigation but isn't built yet.
 *
 * Shown deliberately rather than hidden: the owner asked for the whole shape up
 * front, and a visible map of what is coming — with the honest reason it isn't
 * here yet — is more useful than a short menu that quietly grows.
 */
export function ComingSection({ title, what, why }: { title: string; what: string; why: string }) {
  return (
    <Card className="max-w-2xl p-6">
      <span className="border border-indigo-500 bg-indigo-50 px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-indigo-600">
        Not built yet
      </span>
      <h2 className="mt-3 font-display text-base font-bold text-forest-950">{title}</h2>
      <p className="mt-2 text-sm text-stone-700">{what}</p>
      <div className="mt-4 border-t border-stone-200 pt-3">
        <Note>{why}</Note>
      </div>
    </Card>
  );
}
