/**
 * Cloudflare Worker entry for lyhoff (Workers + Static Assets).
 *
 * Routing: static assets in ./out are served first (the Worker only runs on a
 * miss). The Worker handles POST /api/subscribe (newsletter signup) and falls
 * back to the static assets for everything else.
 *
 * Newsletter storage = OUR OWN Supabase (no third party for storage). The email
 * is inserted into the `subscribers` table in the shared Supabase project. The
 * anon key is public-safe; RLS allows INSERT only (nobody can read the list with
 * it — the owner reads it from the Supabase dashboard). Run the SQL in
 * supabase/subscribers.sql once to create the table + policy.
 *
 * Sending newsletters is a separate, later step (you own the list, so you can
 * use any sender — e.g. Resend free tier — when you're ready).
 */

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
}

// Public-safe defaults (same anon key already shipped in the sibling apps'
// client bundles). Overridable via Worker env vars if you ever rotate them.
const DEFAULT_SUPABASE_URL = "https://xgprfrckkziglufsxyfm.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhncHJmcmNra3ppZ2x1ZnN4eWZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1ODM0MDcsImV4cCI6MjA5NDE1OTQwN30.j6xgkfyboWbLzOdH-AGZqI-MqbwVJRn4LBLgG55tc4Y";

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

  const url = env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  if (!url || !key || key.startsWith("__")) {
    return json({ error: "not_configured" }, 503);
  }

  // Insert into our own Supabase `subscribers` table via PostgREST.
  const res = await fetch(`${url}/rest/v1/subscribers`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ email, locale, source: "lyhoff" }),
  });

  if (res.ok) return json({ ok: true });

  // 409 = duplicate email (unique constraint) → already on the list, that's fine.
  if (res.status === 409) return json({ ok: true, already: true });

  const detail = await res.text().catch(() => "");
  return json({ error: "store_failed", status: res.status, detail }, 502);
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
