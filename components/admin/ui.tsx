"use client";

// Shared shell pieces for the admin. Kept in one file so a new section is a
// few imports rather than a new set of hand-styled divs — the panel has to stay
// consistent as it grows, and consistency is cheaper to enforce than to police.

export const inputClass =
  "w-full rounded-sm border border-stone-300 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-indigo-500";
export const labelClass = "text-xs font-semibold text-forest-950";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`border border-stone-200 bg-white ${className}`}>{children}</div>;
}

export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <Card className="p-8 text-center text-sm text-stone-500">{children}</Card>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "quiet" | "accent";
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const styles = {
    primary: "bg-forest-950 text-cream hover:bg-forest-800",
    accent: "bg-earth-500 text-forest-950 hover:bg-earth-600 font-bold",
    quiet: "border border-stone-300 bg-white text-forest-950 hover:border-indigo-400",
  }[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-sm px-4 py-2 text-[13px] font-semibold transition disabled:opacity-40 ${styles}`}
    >
      {children}
    </button>
  );
}

export function Pill({ tone, children }: { tone: "live" | "off" | "warn"; children: React.ReactNode }) {
  const styles = {
    live: "border-earth-500 bg-earth-50 text-earth-700",
    off: "border-stone-300 text-stone-500",
    warn: "border-indigo-500 bg-indigo-50 text-indigo-600",
  }[tone];
  return (
    <span className={`shrink-0 border px-1.5 py-0.5 text-[9.5px] font-semibold ${styles}`}>
      {children}
    </span>
  );
}

export function Note({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] leading-relaxed text-stone-500">{children}</p>;
}

export const money = (cents: number, currency = "usd") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(
    cents / 100,
  );

export const price = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value) || 0);

export const day = (iso: string) =>
  new Date(iso).toLocaleDateString("es-US", { year: "numeric", month: "short", day: "numeric" });

/** Every admin read goes through here, so auth failures behave the same everywhere. */
export async function readCollection<T>(name: string): Promise<T[] | null> {
  const res = await fetch(`/api/admin/collection?name=${encodeURIComponent(name)}`, {
    credentials: "same-origin",
  }).catch(() => null);
  if (!res?.ok) return null;
  const body = (await res.json()) as { rows: T[] };
  return body.rows ?? [];
}

export async function patchRow(
  name: string,
  id: string,
  patch: Record<string, unknown>,
): Promise<{ ok: boolean; row?: unknown; error?: string }> {
  const res = await fetch("/api/admin/collection", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ name, id, patch }),
  }).catch(() => null);
  if (!res) return { ok: false, error: "network" };
  const body = (await res.json().catch(() => ({}))) as { row?: unknown; error?: string };
  return res.ok ? { ok: true, row: body.row } : { ok: false, error: body.error };
}

export async function createRow(
  name: string,
  row: Record<string, unknown>,
): Promise<{ ok: boolean; row?: unknown; error?: string }> {
  const res = await fetch("/api/admin/collection", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ name, row }),
  }).catch(() => null);
  if (!res) return { ok: false, error: "network" };
  const body = (await res.json().catch(() => ({}))) as { row?: unknown; error?: string };
  return res.ok ? { ok: true, row: body.row } : { ok: false, error: body.error };
}
