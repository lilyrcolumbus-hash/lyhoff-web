/**
 * Cloudflare Pages Function — newsletter signup.
 * POST /api/subscribe  { email, locale }
 *
 * Adds the contact to a Resend Audience. Optionally sends a welcome email if
 * RESEND_FROM is configured. Returns an honest error if not configured or if
 * Resend rejects the request — the UI surfaces it instead of faking success.
 *
 * Required env (Cloudflare Pages → Settings → Environment variables):
 *   RESEND_API_KEY      — Resend API key
 *   RESEND_AUDIENCE_ID  — Resend Audience id to add contacts to
 * Optional:
 *   RESEND_FROM         — verified sender, e.g. "SmartGrowth <hello@smartgrowth.farm>"
 */

interface Env {
  RESEND_API_KEY?: string;
  RESEND_AUDIENCE_ID?: string;
  RESEND_FROM?: string;
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const onRequestPost = async (context: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const { request, env } = context;

  let email = "";
  let locale = "en";
  try {
    const body = (await request.json()) as { email?: string; locale?: string };
    email = (body.email ?? "").trim().toLowerCase();
    locale = body.locale === "es" ? "es" : "en";
  } catch {
    return json({ error: "invalid_body" }, 400);
  }

  if (!EMAIL_RE.test(email)) {
    return json({ error: "invalid_email" }, 400);
  }

  if (!env.RESEND_API_KEY || !env.RESEND_AUDIENCE_ID) {
    return json({ error: "not_configured" }, 503);
  }

  // Add contact to the Resend audience.
  const res = await fetch(
    `https://api.resend.com/audiences/${env.RESEND_AUDIENCE_ID}/contacts`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, unsubscribed: false }),
    },
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    // 409 = already a contact; treat as success.
    if (res.status === 409) return json({ ok: true, already: true });
    return json({ error: "resend_failed", status: res.status, detail }, 502);
  }

  // Optional welcome email (best-effort; signup still succeeds if it fails).
  if (env.RESEND_FROM) {
    const subject =
      locale === "es"
        ? "Bienvenido/a a SmartGrowth 🌱"
        : "Welcome to SmartGrowth 🌱";
    const text =
      locale === "es"
        ? "¡Gracias por suscribirte! Cada semana te enviaremos una receta de temporada, qué sembrar o conservar, y una habilidad útil. — SmartGrowth"
        : "Thanks for subscribing! Each week we'll send a seasonal recipe, what to plant or preserve, and a useful skill. — SmartGrowth";
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: env.RESEND_FROM, to: email, subject, text }),
    }).catch(() => {});
  }

  return json({ ok: true });
};
