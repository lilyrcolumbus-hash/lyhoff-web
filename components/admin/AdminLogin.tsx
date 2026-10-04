"use client";

import { useState } from "react";
import { LogoMark } from "@/components/illustrations";
import { Button, inputClass, labelClass } from "./ui";
import { site } from "@/site.config";
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from "@/lib/demo";

/**
 * The panel has its own way in, rather than sending the owner to the storefront
 * account page and back. Same accounts and same session underneath — the
 * difference that matters is that /admin is a door, not a redirect.
 */
export function AdminLogin({ onSignedIn }: { onSignedIn: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ email, password }),
    }).catch(() => null);

    if (!res?.ok) {
      const data = (await res?.json().catch(() => ({}))) as { error?: string };
      setError(
        data.error === "email_not_confirmed"
          ? "That account hasn't confirmed its email yet."
          : "Wrong email or password.",
      );
      setBusy(false);
      return;
    }

    onSignedIn();
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <div className="text-center">
        <LogoMark className="mx-auto h-14 w-14 text-forest-950" textClassName="text-lg" />
        <h1 className="mt-4 font-display text-2xl font-bold text-forest-950">{site.name} Admin</h1>
        <p className="mt-2 text-sm text-stone-600">Manage your store.</p>
      </div>

      <div className="mt-8 border border-stone-200 bg-white p-4 text-[13px] text-stone-600">
        <p className="font-medium text-forest-950">Portfolio demo — look around</p>
        <p className="mt-1">
          Sign in with the demo account to explore every screen. It is read-only: nothing you do
          here is saved.
        </p>
        <p className="mt-2">
          <span className="text-stone-500">Email</span> {DEMO_ADMIN_EMAIL}
          <br />
          <span className="text-stone-500">Password</span> {DEMO_ADMIN_PASSWORD}
        </p>
        <button
          type="button"
          onClick={() => {
            setEmail(DEMO_ADMIN_EMAIL);
            setPassword(DEMO_ADMIN_PASSWORD);
          }}
          className="mt-3 text-[12px] font-medium text-forest-950 underline underline-offset-2"
        >
          Fill in the demo account
        </button>
      </div>

      <form onSubmit={submit} className="mt-4 flex flex-col gap-4 border border-stone-200 bg-white p-6">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            type="email"
            required
            autoComplete="email"
            className={inputClass}
            value={email}
            onChange={(event) => setEmail(event.target.value.trim())}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            required
            autoComplete="current-password"
            className={inputClass}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <Button type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
        {error && <p className="text-[13px] text-clay-600">{error}</p>}
        <a
          href="/en/account/login/?mode=forgot"
          className="text-center text-[12px] text-stone-500 underline underline-offset-2 hover:text-forest-950"
        >
          Forgot your password
        </a>
      </form>
    </div>
  );
}
