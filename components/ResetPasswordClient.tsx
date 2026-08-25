"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type Locale } from "@/lib/i18n";
import { LogoMark } from "@/components/illustrations";
import { PasswordField } from "@/components/PasswordField";

type Status = "checking" | "ready" | "loading" | "error" | "noSession";

const MIN_PASSWORD_LENGTH = 8;

export function ResetPasswordClient({ locale }: { locale: Locale }) {
  const es = locale === "es";

  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("checking");
  const [errorKey, setErrorKey] = useState("");

  useEffect(() => {
    // The recovery link was already verified by the Worker, which set a session
    // cookie before redirecting here — so "can I read my own account?" is
    // exactly the same question as "was that link valid?".
    let cancelled = false;
    async function check() {
      const res = await fetch("/api/account/me", { credentials: "same-origin" }).catch(() => null);
      if (cancelled) return;
      setStatus(res?.ok ? "ready" : "noSession");
    }
    void check();
    return () => {
      cancelled = true;
    };
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setErrorKey("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setErrorKey(data.error ?? "unknown");
        setStatus("error");
        return;
      }
      window.location.href = `/${locale}/account/`;
    } catch {
      setErrorKey("unknown");
      setStatus("error");
    }
  }

  if (status === "checking") {
    return (
      <div className="mx-auto max-w-md px-6 py-32 text-center text-sm text-stone-500">
        {es ? "Cargando…" : "Loading…"}
      </div>
    );
  }

  if (status === "noSession") {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <LogoMark className="mx-auto h-14 w-14 text-forest-950" textClassName="text-lg" />
        <h1 className="mt-4 font-display text-2xl font-bold text-forest-950">
          {es ? "Enlace no válido" : "Invalid link"}
        </h1>
        <p className="mt-4 text-sm text-stone-600 leading-relaxed">
          {es
            ? "Este enlace ya se usó o caducó. Pide uno nuevo desde la pantalla de inicio de sesión."
            : "This link was already used or has expired. Request a new one from the sign-in screen."}
        </p>
        <Link
          href={`/${locale}/account/login/`}
          className="mt-8 inline-flex items-center rounded-sm bg-forest-950 px-6 py-3 text-sm font-semibold text-cream transition hover:bg-forest-800"
        >
          {es ? "Ir a iniciar sesión" : "Go to sign in"}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <div className="text-center">
        <LogoMark className="mx-auto h-14 w-14 text-forest-950" textClassName="text-lg" />
        <h1 className="mt-4 font-display text-3xl font-bold text-forest-950">
          {es ? "Nueva contraseña" : "New password"}
        </h1>
      </div>

      <form onSubmit={submit} className="mt-10 flex flex-col gap-4 border-t border-stone-200 pt-8">
        <PasswordField
          id="new-password"
          label={es ? "Elige una contraseña" : "Choose a password"}
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          locale={locale}
          hint={es ? `Mínimo ${MIN_PASSWORD_LENGTH} caracteres.` : `At least ${MIN_PASSWORD_LENGTH} characters.`}
        />

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-sm bg-forest-950 px-6 py-3.5 text-sm font-semibold text-cream transition hover:bg-forest-800 disabled:opacity-60"
        >
          {status === "loading"
            ? es
              ? "Guardando…"
              : "Saving…"
            : es
              ? "Guardar y entrar"
              : "Save and sign in"}
        </button>

        {status === "error" && (
          <p className="text-sm text-clay-600">
            {errorKey === "weak_password"
              ? es
                ? `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
                : `Your password needs at least ${MIN_PASSWORD_LENGTH} characters.`
              : errorKey === "same_password"
                ? es
                  ? "Esa es la contraseña que ya tenías. Elige una distinta."
                  : "That's the password you already had. Choose a different one."
                : errorKey === "link_expired"
                  ? es
                    ? "Este enlace ya se usó o caducó. Pide uno nuevo."
                    : "This link was already used or has expired. Request a new one."
                  : es
                    ? "No pudimos guardarla. Inténtalo de nuevo."
                    : "We couldn't save it. Please try again."}
          </p>
        )}
      </form>
    </div>
  );
}
