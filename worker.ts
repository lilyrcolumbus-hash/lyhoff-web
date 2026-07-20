/**
 * Cloudflare Worker entry for lyhoff (Workers + Static Assets).
 *
 * Routing: static assets in ./out are served first (the Worker only runs on a
 * miss). The Worker handles POST /api/subscribe (newsletter signup) and
 * POST /api/checkout (Stripe Checkout Session), falling back to the static
 * assets for everything else.
 *
 * Newsletter storage = OUR OWN Supabase (no third party for storage). The email
 * is inserted into the `subscribers` table in the shared Supabase project. The
 * anon key is public-safe; RLS allows INSERT only (nobody can read the list with
 * it — the owner reads it from the Supabase dashboard). Run the SQL in
 * supabase/subscribers.sql once to create the table + policy.
 *
 * Sending newsletters is a separate, later step (you own the list, so you can
 * use any sender — e.g. Resend free tier — when you're ready).
 *
 * Checkout = Stripe, called directly via fetch() (no `stripe` npm SDK — this
 * Worker has no Node runtime, nodejs_compat is off, same reasoning as the
 * Supabase call above). Prices are looked up server-side from lib/products.ts
 * by slug — the client only ever sends a slug + quantity, never a price, so a
 * tampered request can't change what gets charged.
 *
 * Shipping is a flat rate (FLAT_SHIPPING_CENTS) shown as a fixed shipping_options
 * entry on Stripe's hosted Checkout page — Stripe collects the full address there,
 * same as every other line item; there's no separate rate-lookup step beforehand.
 */

import { getProduct } from "./lib/products";
import { FLAT_SHIPPING_CENTS } from "./lib/shipping";

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  STRIPE_SECRET_KEY?: string;
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

// Flattens a nested object/array into Stripe's bracket-notation form fields,
// e.g. { line_items: [{ quantity: 1 }] } → "line_items[0][quantity]=1".
// Stripe's REST API takes application/x-www-form-urlencoded, not JSON.
function toStripeFormBody(params: Record<string, unknown>): string {
  const pairs: string[] = [];
  function walk(key: string, value: unknown) {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((v, i) => walk(`${key}[${i}]`, v));
    } else if (typeof value === "object") {
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        walk(`${key}[${k}]`, v);
      }
    } else {
      pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }
  for (const [k, v] of Object.entries(params)) walk(k, v);
  return pairs.join("&");
}


async function handleCheckout(request: Request, env: Env): Promise<Response> {
  if (!env.STRIPE_SECRET_KEY) return json({ error: "not_configured" }, 503);

  let items: { slug?: string; quantity?: number }[] = [];
  let locale = "en";
  try {
    const body = (await request.json()) as {
      items?: { slug?: string; quantity?: number }[];
      locale?: string;
    };
    items = Array.isArray(body.items) ? body.items : [];
    locale = body.locale === "es" ? "es" : "en";
  } catch {
    return json({ error: "invalid_body" }, 400);
  }

  const lineItems = items
    .map((i) => {
      const product = i.slug ? getProduct(i.slug) : undefined;
      const quantity = Math.floor(i.quantity ?? 0);
      if (!product || quantity <= 0) return null;
      return {
        price_data: {
          currency: "usd",
          unit_amount: Math.round(product.price * 100),
          product_data: {
            name: product.name[locale as "en" | "es"],
            images: [product.image],
          },
        },
        quantity,
      };
    })
    .filter((li): li is NonNullable<typeof li> => li !== null);

  if (lineItems.length === 0) return json({ error: "empty_cart" }, 400);

  const origin = request.headers.get("origin") || new URL(request.url).origin;

  const params = {
    mode: "payment",
    success_url: `${origin}/${locale}/checkout/success/?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/${locale}/checkout/cancel/`,
    line_items: lineItems,
    allow_promotion_codes: true,
    shipping_address_collection: { allowed_countries: ["US"] },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: FLAT_SHIPPING_CENTS, currency: "usd" },
          display_name: locale === "es" ? "Envío estándar" : "Standard shipping",
        },
      },
    ],
  };

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${env.STRIPE_SECRET_KEY}:`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Stripe-Version": "2024-06-20",
    },
    body: toStripeFormBody(params),
  });

  const data = (await res.json()) as { id?: string; url?: string; error?: { message?: string } };

  if (!res.ok) {
    return json({ error: "stripe_error", detail: data.error?.message }, 502);
  }

  return json({ url: data.url });
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
    if (url.pathname === "/api/checkout") {
      if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
      }
      return handleCheckout(request, env);
    }
    // Everything else → static site.
    return env.ASSETS.fetch(request);
  },
};
