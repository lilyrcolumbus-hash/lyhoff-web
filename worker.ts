/**
 * Cloudflare Worker entry for smartgrowth-web (Workers + Static Assets).
 *
 * Routing: static assets in ./out are served first (the Worker only runs on a
 * miss). The Worker handles POST /api/subscribe (newsletter → Resend) and falls
 * back to the static assets for everything else.
 *
 * Newsletter env (Cloudflare → Settings → Variables):
 *   RESEND_API_KEY      — Resend API key
 *   RESEND_AUDIENCE_ID  — Resend Audience id to add contacts to
 *   RESEND_FROM         — optional verified sender, e.g. "SmartGrowth <hello@smartgrowth.farm>"
 * Without the first two, /api/subscribe returns an honest error (no fake success).
 */

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
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

async function handleSubscribe(request: Request, env: Env): Promise<Response> {
  let email = "";
  let locale = "en";
  try {
    const body = (await request.json()) as { email?: string; locale?: string };
    email = (body.email ?? "").trim().toLowerCase();
    locale = body.locale === "es" ? "es" : "en";
  } catch {
    return json({ error: "invalid_body" }, 400);
  }

  if (!EMAIL_RE.test(email)) return json({ error: "invalid_email" }, 400);

  if (!env.RESEND_API_KEY || !env.RESEND_AUDIENCE_ID) {
    return json({ error: "not_configured" }, 503);
  }

  // Add the contact to the Resend audience.
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
    if (res.status === 409) return json({ ok: true, already: true }); // already subscribed
    return json({ error: "resend_failed", status: res.status, detail }, 502);
  }

  // Optional welcome email (best-effort).
  if (env.RESEND_FROM) {
    const subject =
      locale === "es"
        ? "Bienvenido/a a SmartGrowth 🌿"
        : "Welcome to SmartGrowth 🌿";
    const text =
      locale === "es"
        ? "¡Gracias por suscribirte! Cada semana te compartimos un remedio o producto natural que hicimos, qué está creciendo en el huerto, y un consejo de vida natural. — SmartGrowth"
        : "Thanks for subscribing! Each week we share a natural remedy or product we made, what's growing in the garden, and a natural-living tip. — SmartGrowth";
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
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/subscribe") {
      if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
      }
      return handleSubscribe(request, env);
    }
    // Everything else → static site.
    return env.ASSETS.fetch(request);
  },
};
