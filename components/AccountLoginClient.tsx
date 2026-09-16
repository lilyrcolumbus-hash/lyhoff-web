"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type Locale } from "@/lib/i18n";
import { LogoMark } from "@/components/illustrations";
import { PasswordField } from "@/components/PasswordField";

type Mode = "login" | "register" | "forgot";
type Status = "idle" | "loading" | "error" | "sentConfirmation" | "sentReset";

const MIN_PASSWORD_LENGTH = 8;

const inputClass =
  "w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-indigo-500";
const primaryButtonClass =
  "w-full rounded-sm bg-forest-950 px-6 py-3.5 text-sm font-semibold text-cream transition hover:bg-forest-800 disabled:opacity-60";
const linkClass = "text-stone-500 underline underline-offset-4 hover:text-forest-800";

export function AccountLoginClient({ locale }: { locale: Locale }) {
  const es = locale === "es";

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorKey, setErrorKey] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // The Worker sends people here with ?error=link when an emailed
    // confirmation or reset link has already been used or has expired.
    if (params.get("error") === "link") {
      setErrorKey("link_expired");
      setStatus("error");
      window.history.replaceState(null, "", window.location.pathname);
      return;
    }

    // The admin's "Forgot your password" link deep-links here with
    // ?mode=forgot, since this page otherwise always opens on Login — the
    // very screen someone who forgot their password can't get past.
    if (params.get("mode") === "forgot") {
      setMode("forgot");
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  function switchTo(next: Mode) {
    setMode(next);
    setStatus("idle");
    setErrorKey("");
    setPassword("");
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setErrorKey("");

    const endpoint =
      mode === "login"
        ? "/api/auth/login"
        : mode === "register"
          ? "/api/auth/register"
          : "/api/auth/forgot-password";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(mode === "forgot" ? { email, locale } : { email, password, locale }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setErrorKey(data.error ?? "unknown");
        setStatus("error");
        return;
      }

      if (mode === "login") {
        // Full navigation, not a router push: the session cookie was just set by
        // the Worker and the account page reads it on its own first request.
        window.location.href = `/${locale}/account/`;
        return;
      }
      setStatus(mode === "register" ? "sentConfirmation" : "sentReset");
    } catch {
      setErrorKey("unknown");
      setStatus("error");
    }
  }

  function errorMessage(): string {
    switch (errorKey) {
      case "invalid_credentials":
        return es ? "Email o contraseña incorrectos." : "Wrong email or password.";
      case "email_not_confirmed":
        return es
          ? "Todavía no has confirmado tu email. Busca nuestro mensaje y haz clic en el enlace."
          : "You haven't confirmed your email yet. Find our message and click the link.";
      case "weak_password":
        return es
          ? `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
          : `Your password needs at least ${MIN_PASSWORD_LENGTH} characters.`;
      case "invalid_credentials_format":
        return es
          ? `Revisa el email y usa al menos ${MIN_PASSWORD_LENGTH} caracteres de contraseña.`
          : `Check the email and use at least ${MIN_PASSWORD_LENGTH} password characters.`;
      case "link_expired":
        return es
          ? "Ese enlace ya se usó o caducó. Vuelve a intentarlo desde aquí."
          : "That link was already used or has expired. Try again from here.";
      case "rate_limited":
        return es
          ? "Demasiados intentos seguidos. Espera unos minutos."
          : "Too many attempts in a row. Wait a few minutes.";
      default:
        return es ? "Algo falló — inténtalo de nuevo." : "Something went wrong — please try again.";
    }
  }

  if (status === "sentConfirmation" || status === "sentReset") {
    const isConfirmation = status === "sentConfirmation";
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <LogoMark className="mx-auto h-14 w-14 text-forest-950" textClassName="text-lg" />
        <h1 className="mt-4 font-display text-2xl font-bold text-forest-950">
          {es ? "Revisa tu correo" : "Check your email"}
        </h1>
        <p className="mt-4 text-sm text-stone-600 leading-relaxed">
          {isConfirmation
            ? es
              ? "Te enviamos un enlace para confirmar tu cuenta. Haz clic en él y ya podrás entrar."
              : "We sent you a link to confirm your account. Click it and you'll be able to sign in."
            : es
              ? "Si existe una cuenta con ese email, te enviamos un enlace para cambiar la contraseña."
              : "If an account exists for that email, we've sent a link to change the password."}
        </p>
        <p className="mt-3 text-sm font-medium text-forest-950">{email}</p>
        <p className="mt-6 text-xs text-stone-500">
          {es
            ? "¿No llega? Mira en spam antes de volver a intentarlo."
            : "Not there? Check your spam folder before trying again."}
        </p>
        <button type="button" onClick={() => switchTo("login")} className={`mt-8 text-sm ${linkClass}`}>
          {es ? "← Volver a iniciar sesión" : "← Back to sign in"}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <div className="text-center">
        <LogoMark className="mx-auto h-14 w-14 text-forest-950" textClassName="text-lg" />
        <h1 className="mt-4 font-display text-3xl font-bold text-forest-950">
          {mode === "login"
            ? es
              ? "Iniciar sesión"
              : "Sign in"
            : mode === "register"
              ? es
                ? "Crear cuenta"
                : "Create account"
              : es
                ? "Recuperar contraseña"
                : "Reset password"}
        </h1>
        <p className="mt-3 text-sm text-stone-600 leading-relaxed">
          {mode === "forgot"
            ? es
              ? "Escribe tu email y te enviamos un enlace para crear una contraseña nueva."
              : "Enter your email and we'll send a link to set a new password."
            : es
              ? "Entra para ver tus pedidos. No hace falta cuenta para comprar."
              : "Sign in to see your orders. You never need an account to buy."}
        </p>
      </div>

      <div className="mt-10 border-t border-stone-200 pt-8">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-forest-950" htmlFor="account-email">
              {es ? "Email" : "Email"}
            </label>
            <input
              id="account-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value.trim())}
              placeholder={es ? "tu@email.com" : "you@email.com"}
              className={inputClass}
            />
          </div>

          {mode !== "forgot" && (
            <PasswordField
              id="account-password"
              label={es ? "Contraseña" : "Password"}
              value={password}
              onChange={setPassword}
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              minLength={MIN_PASSWORD_LENGTH}
              locale={locale}
              hint={
                mode === "register"
                  ? es
                    ? `Mínimo ${MIN_PASSWORD_LENGTH} caracteres.`
                    : `At least ${MIN_PASSWORD_LENGTH} characters.`
                  : undefined
              }
            />
          )}

          <button type="submit" disabled={status === "loading"} className={primaryButtonClass}>
            {status === "loading"
              ? es
                ? "Un momento…"
                : "One moment…"
              : mode === "login"
                ? es
                  ? "Entrar"
                  : "Sign in"
                : mode === "register"
                  ? es
                    ? "Crear cuenta"
                    : "Create account"
                  : es
                    ? "Enviar enlace"
                    : "Send link"}
          </button>

          {status === "error" && <p className="text-sm text-clay-600">{errorMessage()}</p>}
        </form>

        <div className="mt-6 flex flex-col gap-2 text-sm">
          {mode === "login" && (
            <>
              <button type="button" onClick={() => switchTo("forgot")} className={`self-start ${linkClass}`}>
                {es ? "Olvidé mi contraseña" : "I forgot my password"}
              </button>
              <button type="button" onClick={() => switchTo("register")} className={`self-start ${linkClass}`}>
                {es ? "No tengo cuenta — crear una" : "I don't have an account — create one"}
              </button>
            </>
          )}
          {mode !== "login" && (
            <button type="button" onClick={() => switchTo("login")} className={`self-start ${linkClass}`}>
              {es ? "← Ya tengo cuenta" : "← I already have an account"}
            </button>
          )}
        </div>
      </div>

      <p className="mt-10 text-center text-sm">
        <Link href={`/${locale}/products/`} className={linkClass}>
          {es ? "← Volver a la tienda" : "← Back to the shop"}
        </Link>
      </p>
    </div>
  );
}
