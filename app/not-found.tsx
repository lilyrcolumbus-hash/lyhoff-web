import type { Metadata } from "next";
import Link from "next/link";
import { Leaf } from "@/components/illustrations";
import "./globals.css";

export const metadata: Metadata = {
  title: "Page not found — LYHOFF",
};

// Global 404. Self-contained html/body because the root layout lives under
// app/[lang] and does not wrap this boundary.
export default function NotFound() {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 text-center text-ink">
        <Leaf className="h-12 w-12 text-forest-500" />
        <h1 className="mt-4 font-display text-3xl font-bold text-forest-900">
          Page not found
        </h1>
        <p className="mt-2 text-stone-600">
          This page wandered off into the garden. / Esta página se perdió en el
          huerto.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/en/"
            className="rounded-sm bg-forest-800 px-5 py-2.5 text-sm font-semibold text-cream hover:bg-forest-700"
          >
            Home
          </Link>
          <Link
            href="/es/"
            className="rounded-sm border border-forest-300 px-5 py-2.5 text-sm font-semibold text-forest-800 hover:bg-forest-50"
          >
            Inicio
          </Link>
        </div>
      </body>
    </html>
  );
}
