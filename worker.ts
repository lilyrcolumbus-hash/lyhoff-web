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
 * Welcome-popup signups (source "popup") additionally get a transactional email
 * with the WELCOME10 code via Resend (sendWelcomeEmail below) — the popup shows
 * the code on screen either way, the email is a backup so the customer doesn't
 * lose it. Sending a general newsletter (not just this one welcome email) is
 * still a separate, later step.
 *
 * Checkout = Stripe, called directly via fetch() (no `stripe` npm SDK — this
 * Worker has no Node runtime, nodejs_compat is off, same reasoning as the
 * Supabase call above). Prices are looked up server-side from lib/products.ts
 * by slug — the client only ever sends a slug + quantity, never a price, so a
 * tampered request can't change what gets charged.
 *
 * Shipping is one flat rate (lib/shipping.ts's FLAT_SHIPPING_CENTS) for the whole
 * catalog, shown as a fixed shipping_options entry with a generic 2-5 business day
 * estimate (no carrier/service name) on Stripe's hosted Checkout page — Stripe
 * collects the full address there, same as every other line item.
 */

import { getProduct } from "./lib/products";
import { FLAT_SHIPPING_CENTS } from "./lib/shipping";
import { shipping as shippingSettings } from "./lib/settings";

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  RESEND_API_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  GITHUB_TOKEN?: string;
  /** Proves to Postgres that a stock decrement came from this Worker. */
  STOCK_TOKEN?: string;
}

const WELCOME_CODE = "WELCOME10";
// Given via the QR on the post-purchase thank-you card, for returning customers
// (WELCOME_CODE is first-order-only in Stripe, so it won't redeem for them anyway).
const RETURNING_CODE = "THANKYOU15";
const KNOWN_PROMO_CODES = [WELCOME_CODE, RETURNING_CODE];
const WELCOME_FROM = "LYHOFF <hello@lyhoff.com>";
const WELCOME_REPLY_TO = "lyhoffllc.info@gmail.com";
const WELCOME_SITE_URL = "https://lyhoff.com";

// Public-safe defaults (same anon key already shipped in the sibling apps'
// client bundles). Overridable via Worker env vars if you ever rotate them.
const DEFAULT_SUPABASE_URL = "https://egxtilwjhfhohrhcjgbe.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVneHRpbHdqaGZob2hyaGNqZ2JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxODYzODgsImV4cCI6MjEwMDc2MjM4OH0.Q9SATTl0QmaAX0NrpxntyD3rWSu8tZ258b492v0Sp9w";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function welcomeEmailHtml(locale: string): string {
  const es = locale === "es";
  return `<!doctype html>
<html>
  <body style="margin:0;padding:32px 16px;background:#fbfaf7;font-family:Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" style="max-width:480px;margin:0 auto;">
      <tr>
        <td style="text-align:center;padding-bottom:24px;">
          <span style="font-size:12px;letter-spacing:0.25em;text-transform:uppercase;color:#b08968;font-weight:600;">LYHOFF</span>
        </td>
      </tr>
      <tr>
        <td style="background:#ffffff;border:1px solid #e7e4dc;padding:36px 28px;text-align:center;">
          <p style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#b08968;font-weight:600;margin:0 0 8px;">
            ${es ? "Bienvenido" : "Welcome"}
          </p>
          <h1 style="font-size:22px;color:#2b2a25;margin:0 0 12px;">
            ${es ? "10% de descuento en tu primer pedido" : "10% off your first order"}
          </h1>
          <p style="font-size:14px;color:#6b6f5e;line-height:1.6;margin:0 0 20px;">
            ${es
              ? "Usa este código al pagar en lyhoff.com:"
              : "Use this code at checkout on lyhoff.com:"}
          </p>
          <p style="display:inline-block;border:1px dashed #b08968;background:#faf3ec;color:#8a5a34;font-size:18px;font-weight:700;letter-spacing:0.2em;padding:10px 24px;margin:0 0 24px;">
            ${WELCOME_CODE}
          </p>
          <table role="presentation" style="margin:0 auto 24px;">
            <tr>
              <td style="background:#2b2a25;">
                <a href="${WELCOME_SITE_URL}/${es ? "es" : "en"}/products/"
                   style="display:inline-block;padding:14px 32px;color:#fbfaf7;font-size:14px;font-weight:600;text-decoration:none;">
                  ${es ? "Ver productos" : "Shop now"}
                </a>
              </td>
            </tr>
          </table>
          <p style="font-size:13px;color:#8a8672;line-height:1.6;margin:0;">
            ${es
              ? "Natural, sin químicos, hecho por nosotros — probado por nosotros primero."
              : "Natural, zero chemicals, made by us — tested by us first."}
          </p>
        </td>
      </tr>
      <tr>
        <td style="text-align:center;padding-top:20px;">
          <p style="font-size:11px;color:#a8a690;margin:0;">
            LYHOFF LLC · ${es ? "Este código es de un solo uso, para tu primer pedido." : "This code is single-use, for your first order."}
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function welcomeEmailText(locale: string): string {
  const es = locale === "es";
  const lines = es
    ? [
        "LYHOFF",
        "",
        "10% de descuento en tu primer pedido",
        "Usa este código al pagar en lyhoff.com:",
        "",
        WELCOME_CODE,
        "",
        `Ver productos: ${WELCOME_SITE_URL}/es/products/`,
        "",
        "Natural, sin químicos, hecho por nosotros — probado por nosotros primero.",
        "",
        "LYHOFF LLC · Este código es de un solo uso, para tu primer pedido.",
      ]
    : [
        "LYHOFF",
        "",
        "10% off your first order",
        "Use this code at checkout on lyhoff.com:",
        "",
        WELCOME_CODE,
        "",
        `Shop now: ${WELCOME_SITE_URL}/en/products/`,
        "",
        "Natural, zero chemicals, made by us — tested by us first.",
        "",
        "LYHOFF LLC · This code is single-use, for your first order.",
      ];
  return lines.join("\n");
}

async function sendWelcomeEmail(email: string, locale: string, env: Env): Promise<void> {
  if (!env.RESEND_API_KEY) return;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: WELCOME_FROM,
        to: [email],
        reply_to: WELCOME_REPLY_TO,
        subject:
          locale === "es"
            ? "Tu código de 10% de descuento — LYHOFF"
            : "Your 10% off code — LYHOFF",
        html: welcomeEmailHtml(locale),
        text: welcomeEmailText(locale),
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("resend_send_failed", res.status, detail);
    }
  } catch (err) {
    // Best-effort — the popup already shows the code on screen, so a failed
    // email send should never fail the subscribe request itself.
    console.error("resend_send_failed", err);
  }
}

async function handleSubscribe(request: Request, env: Env): Promise<Response> {
  let email = "";
  let locale = "en";
  let source = "lyhoff";
  try {
    const body = (await request.json()) as { email?: string; locale?: string; source?: string };
    email = (body.email ?? "").trim().toLowerCase();
    locale = body.locale === "es" ? "es" : "en";
    source = body.source === "popup" ? "popup" : "footer";
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
    body: JSON.stringify({ email, locale, source }),
  });

  // Both the welcome popup and the footer newsletter form promise WELCOME10 —
  // send it either way. Send on duplicates too (409) since re-submitting the
  // form means the customer still wants the code (e.g. lost the first email).
  // The code itself can still only be redeemed once per customer — Stripe
  // enforces that "first-time order only" restriction at checkout, regardless
  // of how many times we've emailed the code.
  if (res.ok || res.status === 409) {
    await sendWelcomeEmail(email, locale, env);
  }

  if (res.ok) return json({ ok: true });
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


// Looks up the real Stripe promotion_code object ID (promo_...) for a customer-
// facing code like "WELCOME10" — Checkout Sessions need the object ID, not the
// display code, to pre-apply a discount. Returns null if missing/inactive.
async function resolvePromotionCodeId(code: string, env: Env): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.stripe.com/v1/promotion_codes?code=${encodeURIComponent(code)}&active=true&limit=1`,
      { headers: { Authorization: `Basic ${btoa(`${env.STRIPE_SECRET_KEY}:`)}` } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { data?: { id: string }[] };
    return data.data?.[0]?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Which of these the shop cannot currently supply.
 *
 * A product with a null stock is not tracked and always sells — which is every
 * product until she puts a number on one, so this is inert by default. Any
 * problem reaching the database returns "everything is fine": refusing real
 * money because a read timed out is the worse failure of the two.
 */
async function findOutOfStock(wanted: Map<string, number>, env: Env): Promise<string[]> {
  if (wanted.size === 0) return [];
  const url = env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  if (!url || !key || key.startsWith("__")) return [];

  const list = [...wanted.keys()].map((slug) => `"${slug}"`).join(",");
  const res = await fetch(
    `${url}/rest/v1/products?select=slug,stock&slug=in.(${encodeURIComponent(list)})`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } },
  ).catch(() => null);

  if (!res?.ok) {
    console.error("stock check failed", res?.status);
    return [];
  }

  const rows = (await res.json().catch(() => [])) as { slug: string; stock: number | null }[];
  return rows
    .filter((row) => row.stock !== null && row.stock < (wanted.get(row.slug) ?? 0))
    .map((row) => row.slug);
}

async function handleCheckout(request: Request, env: Env): Promise<Response> {
  if (!env.STRIPE_SECRET_KEY) return json({ error: "not_configured" }, 503);

  let items: { slug?: string; quantity?: number }[] = [];
  let locale = "en";
  let matchedCode: string | null = null;
  try {
    const body = (await request.json()) as {
      items?: { slug?: string; quantity?: number }[];
      locale?: string;
      promoCode?: string;
    };
    items = Array.isArray(body.items) ? body.items : [];
    locale = body.locale === "es" ? "es" : "en";
    // Only ever look up one of our own known codes — accepting an arbitrary
    // client-sent code here would let anyone probe for other valid Stripe
    // promotion codes via the public checkout endpoint.
    matchedCode = KNOWN_PROMO_CODES.find((c) => c === body.promoCode) ?? null;
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

  // Availability is the one thing that cannot come from the build-time bundle:
  // a snapshot taken at the last publish would happily sell the last jar twice.
  // Price still comes from the bundle — this reads stock and nothing else, so
  // the guarantee that shown price equals charged price is untouched.
  const wanted = new Map<string, number>();
  for (const item of items) {
    const product = item.slug ? getProduct(item.slug) : undefined;
    const quantity = Math.floor(item.quantity ?? 0);
    if (product && quantity > 0) wanted.set(product.slug, (wanted.get(product.slug) ?? 0) + quantity);
  }

  const shortfall = await findOutOfStock(wanted, env);
  if (shortfall.length > 0) return json({ error: "out_of_stock", slugs: shortfall }, 409);

  const origin = request.headers.get("origin") || new URL(request.url).origin;

  // Pre-apply WELCOME10 when the customer already has it (from the welcome
  // popup/email) so they don't have to copy/paste it on Stripe's page. Stripe
  // rejects a Checkout Session that sets both `discounts` and
  // `allow_promotion_codes` — fall back to letting them enter one manually
  // (existing behavior) whenever we don't have a resolved discount to apply.
  const promotionCodeId = matchedCode ? await resolvePromotionCodeId(matchedCode, env) : null;

  const params: Record<string, unknown> = {
    mode: "payment",
    // Without this, Stripe defaults to "auto" — it renders its own UI chrome (delivery
    // estimates, form labels, buttons) in the customer's BROWSER language, independent of
    // our own locale strings above, which is how "Envío estándar" and "(2-5 business days)"
    // ended up on the same line. Pinning it to our own locale keeps the whole page consistent.
    locale,
    success_url: `${origin}/${locale}/checkout/success/?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/${locale}/checkout/cancel/`,
    line_items: lineItems,
    // Stripe's own line items carry names, not slugs, so the webhook has no way
    // back to the catalogue row it needs to count down. Carrying the slugs here
    // is what makes stock work. Capped at Stripe's 500-character metadata limit;
    // a cart long enough to hit it loses the tail rather than the whole order.
    metadata: {
      items: [...wanted.entries()].map(([slug, quantity]) => `${slug}:${quantity}`).join(",").slice(0, 500),
    },
    shipping_address_collection: { allowed_countries: shippingSettings.countries },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: FLAT_SHIPPING_CENTS, currency: "usd" },
          display_name: locale === "es" ? "Envío estándar" : "Standard shipping",
          delivery_estimate: {
            minimum: { unit: "business_day", value: shippingSettings.minDays },
            maximum: { unit: "business_day", value: shippingSettings.maxDays },
          },
        },
      },
    ],
  };

  if (promotionCodeId) {
    params.discounts = [{ promotion_code: promotionCodeId }];
  } else {
    params.allow_promotion_codes = true;
  }

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

// Public review-submission form (e.g. /thank-you) → lands in `review_submissions`
// with approved=false. The owner reviews/approves from the Supabase dashboard —
// see supabase/reviews.sql for why publishing to the live site is still a
// separate manual step for now.
async function handleReviews(request: Request, env: Env): Promise<Response> {
  let body: {
    slug?: string;
    rating?: number;
    author?: string;
    location?: string;
    text?: string;
    locale?: string;
  };
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid_body" }, 400);
  }

  const rating = Math.round(Number(body.rating));
  const text = (body.text ?? "").trim();
  const author = (body.author ?? "").trim();
  const location = (body.location ?? "").trim();
  const slug = (body.slug ?? "").trim();
  const locale = body.locale === "es" ? "es" : "en";

  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return json({ error: "invalid_rating" }, 400);
  }
  if (!text || text.length > 2000) return json({ error: "invalid_text" }, 400);
  if (!author || author.length > 120) return json({ error: "invalid_author" }, 400);
  if (location.length > 120) return json({ error: "invalid_location" }, 400);
  if (slug && !getProduct(slug)) return json({ error: "invalid_slug" }, 400);

  const url = env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  if (!url || !key || key.startsWith("__")) {
    return json({ error: "not_configured" }, 503);
  }

  const res = await fetch(`${url}/rest/v1/review_submissions`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      slug: slug || null,
      rating,
      author,
      location: location || null,
      text,
      locale,
    }),
  });

  if (res.ok) return json({ ok: true });
  const detail = await res.text().catch(() => "");
  return json({ error: "store_failed", status: res.status, detail }, 502);
}

// ---------------------------------------------------------------------------
// Customer accounts — email + password login, order history, newsletter preference.
//
// Auth is Supabase Auth driven entirely from this Worker: the browser never
// sees a token. The session lives in HttpOnly cookies that only this Worker can
// read, so no XSS on the static site can walk off with a customer's session.
// Passwords themselves never touch our storage — Supabase hashes and holds them.
//
// Login stays OPTIONAL — guest checkout is untouched. Everything here is an
// add-on for customers who want to see what they've ordered.
// ---------------------------------------------------------------------------

const ACCESS_COOKIE = "lyhoff_at";
const REFRESH_COOKIE = "lyhoff_rt";
// Supabase refresh tokens outlive the ~1h access token; 30 days keeps a
// customer logged in between orders without being indefinite.
const REFRESH_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

// SameSite=Lax (not Strict) so the cookie still travels when the customer
// arrives back from Stripe's hosted checkout on another domain.
const COOKIE_ATTRS = "Path=/; HttpOnly; Secure; SameSite=Lax";

function buildCookie(name: string, value: string, maxAgeSeconds: number): string {
  return `${name}=${value}; ${COOKIE_ATTRS}; Max-Age=${maxAgeSeconds}`;
}

function clearCookie(name: string): string {
  return `${name}=; ${COOKIE_ATTRS}; Max-Age=0`;
}

function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    out[part.slice(0, eq).trim()] = part.slice(eq + 1).trim();
  }
  return out;
}

function jsonWithCookies(data: unknown, cookies: string[], status = 200): Response {
  const headers = new Headers({ "Content-Type": "application/json" });
  for (const cookie of cookies) headers.append("Set-Cookie", cookie);
  return new Response(JSON.stringify(data), { status, headers });
}

function supabaseConfig(env: Env): { url: string; key: string } | null {
  const url = env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  if (!url || !key || key.startsWith("__")) return null;
  return { url, key };
}

interface SessionUser {
  id: string;
  email: string;
}

interface Session {
  user: SessionUser | null;
  // The CUSTOMER'S own token, not the shared anon key. Every account query must
  // use this: Supabase's RLS policies key off auth.uid()/auth.jwt(), which are
  // empty under the anon key — the policies would silently match nothing
  // instead of actually enforcing the "only your own rows" boundary.
  accessToken: string | null;
  // Non-empty when a silent refresh happened — the caller MUST pass these back
  // on its response or the customer gets logged out on the next request.
  setCookies: string[];
}

const NO_SESSION: Session = { user: null, accessToken: null, setCookies: [] };

function toSessionUser(raw: unknown): SessionUser | null {
  const user = raw as { id?: string; email?: string } | null;
  if (!user?.id || !user.email) return null;
  return { id: user.id, email: user.email.toLowerCase() };
}

/**
 * Resolves the caller's session from cookies, transparently refreshing an
 * expired access token once. Returns a null user for anonymous callers rather
 * than throwing — most callers just turn that into a 401.
 */
async function getSession(request: Request, env: Env): Promise<Session> {
  const config = supabaseConfig(env);
  if (!config) return NO_SESSION;

  const cookies = parseCookies(request.headers.get("Cookie"));
  const accessToken = cookies[ACCESS_COOKIE];
  const refreshToken = cookies[REFRESH_COOKIE];

  if (accessToken) {
    const res = await fetch(`${config.url}/auth/v1/user`, {
      headers: { apikey: config.key, Authorization: `Bearer ${accessToken}` },
    });
    if (res.ok) {
      const user = toSessionUser(await res.json());
      if (user) return { user, accessToken, setCookies: [] };
    }
  }

  if (!refreshToken) return NO_SESSION;

  // Access token expired (or missing) but the refresh token is still good —
  // mint a new pair silently so the customer never sees a surprise logout.
  const res = await fetch(`${config.url}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { apikey: config.key, "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) {
    // Refresh token revoked or expired — clear both so we stop retrying it.
    return { user: null, accessToken: null, setCookies: [clearCookie(ACCESS_COOKIE), clearCookie(REFRESH_COOKIE)] };
  }

  const data = (await res.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    user?: unknown;
  };
  const user = toSessionUser(data.user);
  if (!data.access_token || !data.refresh_token || !user) return NO_SESSION;

  return {
    user,
    accessToken: data.access_token,
    setCookies: [
      buildCookie(ACCESS_COOKIE, data.access_token, data.expires_in ?? 3600),
      buildCookie(REFRESH_COOKIE, data.refresh_token, REFRESH_MAX_AGE_SECONDS),
    ],
  };
}

// Supabase's own default is 6; 8 is the common floor customers expect and it
// costs nothing. Enforced on BOTH sides — the client check is only a courtesy,
// a crafted request would sail straight past it.
const MIN_PASSWORD_LENGTH = 8;

const SITE_ORIGIN = "https://lyhoff.com";

function sessionCookiesFrom(data: {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
}): string[] | null {
  if (!data.access_token || !data.refresh_token) return null;
  return [
    buildCookie(ACCESS_COOKIE, data.access_token, data.expires_in ?? 3600),
    buildCookie(REFRESH_COOKIE, data.refresh_token, REFRESH_MAX_AGE_SECONDS),
  ];
}

function readCredentials(body: unknown): { email: string; password: string } | null {
  const raw = body as { email?: string; password?: string };
  const email = (raw.email ?? "").trim().toLowerCase();
  const password = raw.password ?? "";
  if (!EMAIL_RE.test(email) || password.length < MIN_PASSWORD_LENGTH) return null;
  return { email, password };
}

/**
 * Create an account. Supabase emails a confirmation link and withholds the
 * session until it's clicked — that verification is NOT optional here: order
 * history is matched by email address, so an unverified signup would let
 * anyone register someone else's address and read their orders.
 */
async function handleRegister(request: Request, env: Env): Promise<Response> {
  const config = supabaseConfig(env);
  if (!config) return json({ error: "not_configured" }, 503);

  let credentials: { email: string; password: string } | null = null;
  let locale = "en";
  try {
    const body = (await request.json()) as { locale?: string };
    credentials = readCredentials(body);
    locale = body.locale === "es" ? "es" : "en";
  } catch {
    return json({ error: "invalid_body" }, 400);
  }
  if (!credentials) return json({ error: "invalid_credentials_format" }, 400);

  // `redirect_to` is a QUERY param on the REST API — the `options.email_redirect_to`
  // shape belongs to the JS SDK and is silently ignored here, which is why Spanish
  // signups were landing on the English account page.
  // `data` becomes the user's metadata, so the email templates can read
  // {{ .Data.locale }} and render entirely in one language instead of mixing two.
  const redirectTo = encodeURIComponent(`${SITE_ORIGIN}/${locale}/account/`);
  const res = await fetch(`${config.url}/auth/v1/signup?redirect_to=${redirectTo}`, {
    method: "POST",
    headers: { apikey: config.key, "Content-Type": "application/json" },
    body: JSON.stringify({ ...credentials, data: { locale } }),
  });

  if (res.status === 429) return json({ error: "rate_limited" }, 429);

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("signup failed", res.status, detail);
    // Weak passwords are the one failure worth naming — the customer can act on
    // it. Everything else stays generic so this can't be used to test which
    // addresses already have accounts.
    if (detail.includes("weak_password") || detail.includes("Password")) {
      return json({ error: "weak_password" }, 400);
    }
    return json({ error: "signup_failed" }, 400);
  }

  // Supabase answers 200 for an address that already exists too, deliberately,
  // so the response can't be used to enumerate customers. "Check your email"
  // is the honest thing to say either way.
  return json({ ok: true, confirmationRequired: true });
}

async function handleLogin(request: Request, env: Env): Promise<Response> {
  const config = supabaseConfig(env);
  if (!config) return json({ error: "not_configured" }, 503);

  let credentials: { email: string; password: string } | null = null;
  try {
    credentials = readCredentials(await request.json());
  } catch {
    return json({ error: "invalid_body" }, 400);
  }
  // Same generic answer as a genuinely wrong password: a distinct "that's too
  // short to be one of ours" reply would confirm the address exists.
  if (!credentials) return json({ error: "invalid_credentials" }, 400);

  const res = await fetch(`${config.url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: config.key, "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    // Worth distinguishing: "wrong password" and "you never clicked the link in
    // your email" need completely different actions from the customer.
    if (detail.includes("email_not_confirmed")) return json({ error: "email_not_confirmed" }, 403);
    return json({ error: "invalid_credentials" }, 400);
  }

  const data = (await res.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    user?: unknown;
  };
  const cookies = sessionCookiesFrom(data);
  const user = toSessionUser(data.user);
  if (!cookies || !user) return json({ error: "invalid_credentials" }, 400);

  return jsonWithCookies({ ok: true, email: user.email }, cookies);
}

/** Emails a reset link. Always answers ok — see handleRegister on enumeration. */
async function handleForgotPassword(request: Request, env: Env): Promise<Response> {
  const config = supabaseConfig(env);
  if (!config) return json({ error: "not_configured" }, 503);

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

  // Same query-param rule as signup above. The locale for the email body itself
  // comes from the account's stored metadata ({{ .Data.locale }}), set at signup.
  const redirectTo = encodeURIComponent(`${SITE_ORIGIN}/${locale}/account/reset-password/`);
  const res = await fetch(`${config.url}/auth/v1/recover?redirect_to=${redirectTo}`, {
    method: "POST",
    headers: { apikey: config.key, "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (res.status === 429) return json({ error: "rate_limited" }, 429);
  if (!res.ok) console.error("recover failed", res.status, await res.text().catch(() => ""));
  return json({ ok: true });
}

/**
 * Finish a reset. By the time the customer reaches the form, the recovery link
 * has already been verified by handleAuthConfirm and exchanged for a session
 * cookie — so the new password is authorised by that session and no token ever
 * has to travel through the page's URL or its JavaScript.
 */
async function handleResetPassword(request: Request, env: Env): Promise<Response> {
  const config = supabaseConfig(env);
  if (!config) return json({ error: "not_configured" }, 503);

  let password = "";
  try {
    const body = (await request.json()) as { password?: string };
    password = body.password ?? "";
  } catch {
    return json({ error: "invalid_body" }, 400);
  }
  if (password.length < MIN_PASSWORD_LENGTH) return json({ error: "weak_password" }, 400);

  const session = await getSession(request, env);
  if (!session.user || !session.accessToken) {
    return jsonWithCookies({ error: "link_expired" }, session.setCookies, 401);
  }

  const res = await fetch(`${config.url}/auth/v1/user`, {
    method: "PUT",
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("password reset failed", res.status, detail);
    // Report the real reason. This used to collapse every failure into
    // "link expired", which sent people off to request another email when the
    // actual problem was the password they had just typed.
    if (detail.includes("same_password") || detail.includes("should be different")) {
      return jsonWithCookies({ error: "same_password" }, session.setCookies, 400);
    }
    if (detail.includes("weak_password") || detail.includes("at least")) {
      return jsonWithCookies({ error: "weak_password" }, session.setCookies, 400);
    }
    return jsonWithCookies({ error: "save_failed" }, session.setCookies, 400);
  }

  return jsonWithCookies({ ok: true }, session.setCookies);
}

/**
 * Lands every emailed auth link (signup confirmation, password reset) on OUR
 * domain instead of Supabase's.
 *
 * Two reasons, both real: a message that says LYHOFF but links to
 * <project>.supabase.co is the exact shape of a phishing email, and spam
 * filters read the href without following its redirect — it was the single
 * biggest deliverability problem with these emails. And because the Worker
 * handles the verification itself, it can set the session cookie on the spot,
 * so the customer arrives already signed in rather than at a login form.
 */
async function handleAuthConfirm(request: Request, env: Env): Promise<Response> {
  const config = supabaseConfig(env);
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash") ?? "";
  const type = url.searchParams.get("type") ?? "signup";
  const requested = url.searchParams.get("redirect_to") ?? "";
  const locale = requested.includes("/es/") ? "es" : "en";

  // A recovery link has exactly one sensible destination: the form that sets the
  // new password. It is pinned rather than taken from `redirect_to`, because a
  // customer who clicked "I forgot my password" and lands on their account page
  // — signed in, no form in sight — has no way to finish what they started.
  // That was the real bug: `redirect_to` arrived empty, the fallback sent them
  // to /account/, and the reset silently went nowhere.
  const isRecovery = type === "recovery";
  const fallback = isRecovery
    ? `${SITE_ORIGIN}/${locale}/account/reset-password/`
    : `${SITE_ORIGIN}/${locale}/account/`;
  // Never redirect to a URL just because it arrived in a query param — that is
  // an open redirect, and an emailed link is exactly how it would be abused.
  const destination =
    !isRecovery && requested.startsWith(`${SITE_ORIGIN}/`) ? requested : fallback;
  const failure = `${SITE_ORIGIN}/${locale}/account/login/?error=link`;

  const redirect = (to: string, cookies: string[] = []) => {
    const headers = new Headers({ Location: to });
    for (const cookie of cookies) headers.append("Set-Cookie", cookie);
    return new Response(null, { status: 303, headers });
  };

  if (!config || !tokenHash) return redirect(failure);

  const res = await fetch(`${config.url}/auth/v1/verify`, {
    method: "POST",
    headers: { apikey: config.key, "Content-Type": "application/json" },
    body: JSON.stringify({ type, token_hash: tokenHash }),
  });

  if (!res.ok) {
    console.error("auth confirm failed", type, res.status, await res.text().catch(() => ""));
    return redirect(failure);
  }

  const data = (await res.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };
  const cookies = sessionCookiesFrom(data);
  // Verification itself succeeded even if no session came back — send them on
  // to sign in normally rather than telling them the link was broken.
  if (!cookies) return redirect(`${SITE_ORIGIN}/${locale}/account/login/`);

  // Tell the account page it was reached by confirming, so it can say so. A
  // button that appears to do nothing reads as broken even when it worked.
  const arrival = isRecovery
    ? destination
    : `${destination}${destination.includes("?") ? "&" : "?"}confirmed=1`;
  return redirect(arrival, cookies);
}

async function handleLogout(request: Request, env: Env): Promise<Response> {
  const config = supabaseConfig(env);
  const accessToken = parseCookies(request.headers.get("Cookie"))[ACCESS_COOKIE];

  // Revoke server-side too, so a stolen refresh token dies with the logout
  // instead of staying valid for its full 30 days.
  if (config && accessToken) {
    await fetch(`${config.url}/auth/v1/logout`, {
      method: "POST",
      headers: { apikey: config.key, Authorization: `Bearer ${accessToken}` },
    }).catch(() => undefined);
  }

  return jsonWithCookies({ ok: true }, [clearCookie(ACCESS_COOKIE), clearCookie(REFRESH_COOKIE)]);
}

async function handleAccountMe(request: Request, env: Env): Promise<Response> {
  const session = await getSession(request, env);
  if (!session.user) return jsonWithCookies({ error: "unauthorized" }, session.setCookies, 401);
  return jsonWithCookies({ email: session.user.email }, session.setCookies);
}

async function handleAccountOrders(request: Request, env: Env): Promise<Response> {
  const config = supabaseConfig(env);
  if (!config) return json({ error: "not_configured" }, 503);

  const session = await getSession(request, env);
  if (!session.user || !session.accessToken) {
    return jsonWithCookies({ error: "unauthorized" }, session.setCookies, 401);
  }

  // No email/user_id filter in this query on purpose — RLS is the filter. If the
  // policy is ever wrong, this returns nothing rather than someone else's data.
  const res = await fetch(
    `${config.url}/rest/v1/orders?select=id,amount_total,currency,items,locale,created_at&order=created_at.desc&limit=100`,
    { headers: { apikey: config.key, Authorization: `Bearer ${session.accessToken}` } },
  );

  if (!res.ok) {
    console.error("orders fetch failed", res.status, await res.text().catch(() => ""));
    return jsonWithCookies({ error: "fetch_failed" }, session.setCookies, 502);
  }

  return jsonWithCookies({ orders: await res.json() }, session.setCookies);
}

/** GET = current newsletter state, POST = opt in/out. Both scoped by RLS. */
async function handleAccountNewsletter(request: Request, env: Env): Promise<Response> {
  const config = supabaseConfig(env);
  if (!config) return json({ error: "not_configured" }, 503);

  const session = await getSession(request, env);
  if (!session.user || !session.accessToken) {
    return jsonWithCookies({ error: "unauthorized" }, session.setCookies, 401);
  }

  const email = session.user.email;
  const authHeaders = { apikey: config.key, Authorization: `Bearer ${session.accessToken}` };
  const rowUrl = `${config.url}/rest/v1/subscribers?email=eq.${encodeURIComponent(email)}&select=email,unsubscribed_at`;

  const existing = await fetch(rowUrl, { headers: authHeaders });
  if (!existing.ok) {
    console.error("newsletter read failed", existing.status, await existing.text().catch(() => ""));
    return jsonWithCookies({ error: "fetch_failed" }, session.setCookies, 502);
  }
  const rows = (await existing.json()) as { unsubscribed_at?: string | null }[];
  const row = rows[0];

  if (request.method === "GET") {
    return jsonWithCookies({ subscribed: Boolean(row) && !row.unsubscribed_at }, session.setCookies);
  }

  let subscribed = false;
  try {
    const body = (await request.json()) as { subscribed?: boolean };
    subscribed = body.subscribed === true;
  } catch {
    return jsonWithCookies({ error: "invalid_body" }, session.setCookies, 400);
  }

  if (!row) {
    // Never signed up before. Opting out is already the state — nothing to do.
    if (!subscribed) return jsonWithCookies({ ok: true, subscribed: false }, session.setCookies);
    // Inserting uses the anon key: `authenticated` deliberately has no insert
    // grant on subscribers, so the public form stays the only way rows are born.
    const created = await fetch(`${config.url}/rest/v1/subscribers`, {
      method: "POST",
      headers: { ...authHeaders, Authorization: `Bearer ${config.key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ email, locale: "en", source: "account" }),
    });
    if (!created.ok && created.status !== 409) {
      console.error("newsletter insert failed", created.status, await created.text().catch(() => ""));
      return jsonWithCookies({ error: "save_failed" }, session.setCookies, 502);
    }
    return jsonWithCookies({ ok: true, subscribed: true }, session.setCookies);
  }

  const updated = await fetch(`${config.url}/rest/v1/subscribers?email=eq.${encodeURIComponent(email)}`, {
    method: "PATCH",
    headers: { ...authHeaders, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({ unsubscribed_at: subscribed ? null : new Date().toISOString() }),
  });

  if (!updated.ok) {
    console.error("newsletter update failed", updated.status, await updated.text().catch(() => ""));
    return jsonWithCookies({ error: "save_failed" }, session.setCookies, 502);
  }

  return jsonWithCookies({ ok: true, subscribed }, session.setCookies);
}

// ---------------------------------------------------------------------------
// Admin API — the owner editing her own catalogue.
//
// Every call runs through here rather than the browser talking to Supabase
// directly, because the session lives in an HttpOnly cookie the page can't
// read. That is the point: no admin token is ever exposed to JavaScript, so an
// XSS on the site can't be turned into "rewrite every price".
//
// Authorisation is NOT decided in this file. Each request is forwarded with the
// caller's OWN access token, and Postgres' row level security decides — the
// `admins` table plus is_admin(). If the check here were ever wrong, the
// database still refuses. See supabase/products.sql.
// ---------------------------------------------------------------------------

/** Resolves the caller's session and whether Postgres considers them an admin. */
async function getAdminSession(
  request: Request,
  env: Env,
): Promise<{ session: Session; isAdmin: boolean; config: { url: string; key: string } | null }> {
  const config = supabaseConfig(env);
  const session = await getSession(request, env);
  if (!config || !session.user || !session.accessToken) {
    return { session, isAdmin: false, config };
  }

  const res = await fetch(`${config.url}/rest/v1/rpc/is_admin`, {
    method: "POST",
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  });

  if (!res.ok) {
    console.error("is_admin rpc failed", res.status, await res.text().catch(() => ""));
    return { session, isAdmin: false, config };
  }

  return { session, isAdmin: (await res.json()) === true, config };
}

async function handleAdminMe(request: Request, env: Env): Promise<Response> {
  const { session, isAdmin } = await getAdminSession(request, env);
  if (!session.user) return jsonWithCookies({ error: "unauthorized" }, session.setCookies, 401);
  // A signed-in customer who wanders onto /admin is told plainly, not shown a
  // broken editor.
  if (!isAdmin) {
    return jsonWithCookies({ error: "not_admin", email: session.user.email }, session.setCookies, 403);
  }
  return jsonWithCookies({ email: session.user.email, isAdmin: true }, session.setCookies);
}

/**
 * Generic admin collections.
 *
 * One pair of endpoints serves every table the panel edits, described by the
 * map below rather than by hand-written routes. That is what makes this
 * reusable: another site adds an entry here and the panel can already read and
 * write it — no new Worker code, no new form.
 *
 * `editable` is an allowlist, never a denylist. A column absent from it cannot
 * be written from the panel at any price — which is how a product's slug (its
 * URL, already circulating on Pinterest) and its variant grouping stay out of
 * reach of a casual edit.
 */
interface AdminCollection {
  table: string;
  /** Column used to address a single row on write. */
  key: string;
  order: string;
  editable: string[];
  /**
   * Columns accepted when creating a row, if creation is allowed at all.
   * Deliberately separate from `editable`: a product's slug and its variant
   * grouping are settable exactly once, at birth, and unwritable forever after.
   */
  creatable?: string[];
  /**
   * What the key may look like. A product's key is its URL, so it is held to a
   * far narrower shape than a row keyed on an id Stripe generated.
   */
  keyPattern?: RegExp;
}

const ADMIN_COLLECTIONS: Record<string, AdminCollection> = {
  products: {
    table: "products",
    key: "slug",
    order: "position.asc,slug.asc",
    editable: [
      "name",
      "tagline",
      "description",
      "ingredients",
      "benefits",
      "how_to_use",
      "gift",
      "badge",
      "reviews",
      "price",
      "size",
      "category",
      "active",
      "position",
      "photos",
      "stock",
    ],
    creatable: [
      "slug",
      "category",
      "name",
      "tagline",
      "description",
      "how_to_use",
      "gift",
      "price",
      "size",
      "active",
      "variant_group",
      "scent",
      "scent_group",
      "position",
      "stock",
    ],
    keyPattern: /^[a-z0-9]+(-[a-z0-9]+)*$/,
  },
  orders: {
    table: "orders",
    key: "id",
    order: "created_at.desc",
    editable: ["tracking_number", "tracking_url", "shipped_at"],
  },
  settings: {
    table: "site_settings",
    key: "key",
    order: "key.asc",
    editable: ["value"],
  },
  order_notes: {
    table: "order_notes",
    key: "order_id",
    order: "updated_at.desc",
    editable: ["note"],
    creatable: ["order_id", "note"],
  },
  reviews: {
    table: "review_submissions",
    key: "id",
    order: "created_at.desc",
    editable: ["approved"],
  },
  subscribers: {
    table: "subscribers",
    key: "id",
    order: "created_at.desc",
    editable: ["unsubscribed_at"],
  },
};

/** Price is the one field where a typo costs real money. */
function normalisePrice(value: unknown): number | null {
  const price = Number(value);
  if (!Number.isFinite(price) || price < 0 || price > 10000) return null;
  return price;
}

/**
 * Create a row.
 *
 * Split out from the edit path because the rules genuinely differ: creation
 * accepts the columns that identify a row — slug, variant grouping — precisely
 * because they can never be changed afterwards. A product URL is settled once,
 * when nobody has linked to it yet.
 */
async function createRow(
  request: Request,
  session: Session,
  config: { url: string; key: string },
  auth: Record<string, string>,
): Promise<Response> {
  let name = "";
  let row: Record<string, unknown> = {};
  try {
    const body = (await request.json()) as { name?: string; row?: Record<string, unknown> };
    name = body.name ?? "";
    row = body.row ?? {};
  } catch {
    return jsonWithCookies({ error: "invalid_body" }, session.setCookies, 400);
  }

  const collection = ADMIN_COLLECTIONS[name];
  if (!collection?.creatable) {
    return jsonWithCookies({ error: "create_not_allowed" }, session.setCookies, 400);
  }

  const rejected = Object.keys(row).filter((field) => !collection.creatable!.includes(field));
  if (rejected.length > 0) {
    return jsonWithCookies({ error: "field_not_creatable", fields: rejected }, session.setCookies, 400);
  }

  // A product's key is its URL for the rest of its life, so it is held to a
  // shape that survives a static export and that a person can type. Rows keyed
  // on an identifier someone else generated only have to be sane.
  const id = String(row[collection.key] ?? "");
  const pattern = collection.keyPattern ?? /^[A-Za-z0-9_-]+$/;
  if (!pattern.test(id) || id.length > 200) {
    return jsonWithCookies({ error: "invalid_slug" }, session.setCookies, 400);
  }

  if ("price" in row) {
    const price = normalisePrice(row.price);
    if (price === null) return jsonWithCookies({ error: "invalid_price" }, session.setCookies, 400);
    row.price = price;
  }

  const res = await fetch(`${config.url}/rest/v1/${collection.table}`, {
    method: "POST",
    headers: { ...auth, "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify(row),
  });

  if (res.status === 409) {
    return jsonWithCookies({ error: "slug_taken" }, session.setCookies, 409);
  }
  if (!res.ok) {
    console.error("admin create failed", name, res.status, await res.text().catch(() => ""));
    return jsonWithCookies({ error: "create_failed" }, session.setCookies, 502);
  }

  const rows = (await res.json()) as unknown[];
  // Row level security answers a blocked write with an empty set, not an error.
  if (rows.length === 0) {
    return jsonWithCookies({ error: "forbidden" }, session.setCookies, 403);
  }
  return jsonWithCookies({ ok: true, row: rows[0] }, session.setCookies);
}

async function handleAdminCollection(request: Request, env: Env): Promise<Response> {
  const { session, isAdmin, config } = await getAdminSession(request, env);
  if (!config) return json({ error: "not_configured" }, 503);
  if (!session.user || !session.accessToken) {
    return jsonWithCookies({ error: "unauthorized" }, session.setCookies, 401);
  }
  if (!isAdmin) return jsonWithCookies({ error: "not_admin" }, session.setCookies, 403);

  const auth = { apikey: config.key, Authorization: `Bearer ${session.accessToken}` };

  if (request.method === "GET") {
    const name = new URL(request.url).searchParams.get("name") ?? "";
    const collection = ADMIN_COLLECTIONS[name];
    if (!collection) return jsonWithCookies({ error: "unknown_collection" }, session.setCookies, 400);

    const res = await fetch(
      `${config.url}/rest/v1/${collection.table}?select=*&order=${collection.order}&limit=500`,
      { headers: auth },
    );
    if (!res.ok) {
      console.error("admin collection read failed", name, res.status, await res.text().catch(() => ""));
      return jsonWithCookies({ error: "fetch_failed" }, session.setCookies, 502);
    }
    return jsonWithCookies({ rows: await res.json() }, session.setCookies);
  }

  if (request.method === "POST") return createRow(request, session, config, auth);

  let name = "";
  let id = "";
  let patch: Record<string, unknown> = {};
  try {
    const body = (await request.json()) as { name?: string; id?: string; patch?: Record<string, unknown> };
    name = body.name ?? "";
    id = String(body.id ?? "");
    patch = body.patch ?? {};
  } catch {
    return jsonWithCookies({ error: "invalid_body" }, session.setCookies, 400);
  }

  const collection = ADMIN_COLLECTIONS[name];
  if (!collection) return jsonWithCookies({ error: "unknown_collection" }, session.setCookies, 400);
  if (!id) return jsonWithCookies({ error: "missing_id" }, session.setCookies, 400);

  const rejected = Object.keys(patch).filter((field) => !collection.editable.includes(field));
  if (rejected.length > 0) {
    return jsonWithCookies({ error: "field_not_editable", fields: rejected }, session.setCookies, 400);
  }
  if (Object.keys(patch).length === 0) {
    return jsonWithCookies({ error: "empty_patch" }, session.setCookies, 400);
  }

  if ("price" in patch) {
    const price = normalisePrice(patch.price);
    if (price === null) return jsonWithCookies({ error: "invalid_price" }, session.setCookies, 400);
    patch.price = price;
  }

  const res = await fetch(
    `${config.url}/rest/v1/${collection.table}?${collection.key}=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { ...auth, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(patch),
    },
  );

  if (!res.ok) {
    console.error("admin collection write failed", name, res.status, await res.text().catch(() => ""));
    return jsonWithCookies({ error: "save_failed" }, session.setCookies, 502);
  }

  const rows = (await res.json()) as unknown[];
  // Row level security answers a blocked write with an empty set rather than an
  // error, so "changed nothing" has to count as a failure.
  if (rows.length === 0) {
    return jsonWithCookies({ error: "not_found_or_forbidden" }, session.setCookies, 404);
  }

  return jsonWithCookies({ ok: true, row: rows[0] }, session.setCookies);
}

/**
 * Photo upload.
 *
 * The browser never holds a Supabase token — the session is an HttpOnly cookie —
 * so the file comes here and this forwards it to storage with the caller's own
 * access token. The bucket's policies then decide, exactly like every other
 * admin write: authorisation is Postgres, not this Worker.
 *
 * Only the file lands here. The panel adds the returned path to the product's
 * `photos` list through the ordinary collection endpoint, so ordering and
 * removal stay one mechanism instead of two.
 */
const PHOTO_BUCKET = "product-photos";
const PHOTO_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
const PHOTO_MAX_BYTES = 10 * 1024 * 1024;

async function handleAdminPhoto(request: Request, env: Env): Promise<Response> {
  const { session, isAdmin, config } = await getAdminSession(request, env);
  if (!config) return json({ error: "not_configured" }, 503);
  if (!session.user || !session.accessToken) {
    return jsonWithCookies({ error: "unauthorized" }, session.setCookies, 401);
  }
  if (!isAdmin) return jsonWithCookies({ error: "not_admin" }, session.setCookies, 403);

  const auth = { apikey: config.key, Authorization: `Bearer ${session.accessToken}` };

  if (request.method === "DELETE") {
    const path = new URL(request.url).searchParams.get("path") ?? "";
    // A path is only ever one this Worker minted. Refusing anything else keeps a
    // crafted request from reaching for another object in the bucket.
    if (!/^[a-z0-9-]+\/[0-9]+-[a-z0-9]+\.[a-z]+$/.test(path)) {
      return jsonWithCookies({ error: "invalid_path" }, session.setCookies, 400);
    }
    const res = await fetch(`${config.url}/storage/v1/object/${PHOTO_BUCKET}/${path}`, {
      method: "DELETE",
      headers: auth,
    });
    if (!res.ok && res.status !== 404) {
      console.error("photo delete failed", res.status, await res.text().catch(() => ""));
      return jsonWithCookies({ error: "delete_failed" }, session.setCookies, 502);
    }
    return jsonWithCookies({ ok: true }, session.setCookies);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonWithCookies({ error: "invalid_body" }, session.setCookies, 400);
  }

  const slug = String(form.get("slug") ?? "");
  const file = form.get("file");
  if (!/^[a-z0-9-]+$/.test(slug)) return jsonWithCookies({ error: "invalid_slug" }, session.setCookies, 400);
  if (!(file instanceof File)) return jsonWithCookies({ error: "missing_file" }, session.setCookies, 400);

  const ext = PHOTO_TYPES[file.type];
  if (!ext) return jsonWithCookies({ error: "unsupported_type" }, session.setCookies, 400);
  if (file.size > PHOTO_MAX_BYTES) return jsonWithCookies({ error: "too_large" }, session.setCookies, 400);

  // The name is generated, never taken from the upload: a filename is attacker
  // controlled text, and a stable random name also means re-uploading a photo
  // can never overwrite a different one that happens to share a name.
  const path = `${slug}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const res = await fetch(`${config.url}/storage/v1/object/${PHOTO_BUCKET}/${path}`, {
    method: "POST",
    headers: { ...auth, "Content-Type": file.type, "Cache-Control": "public, max-age=31536000, immutable" },
    // Buffered rather than streamed: capped at 10 MB above, and a stream body
    // needs a length Supabase's storage API will not always accept without.
    body: await file.arrayBuffer(),
  });

  if (!res.ok) {
    console.error("photo upload failed", res.status, await res.text().catch(() => ""));
    return jsonWithCookies({ error: "upload_failed" }, session.setCookies, 502);
  }

  return jsonWithCookies({ ok: true, path }, session.setCookies);
}

/**
 * Discount codes.
 *
 * Coupons stay in Stripe — Stripe is what stops the same customer redeeming a
 * code twice, and duplicating that here would mean two systems disagreeing
 * about who has already used what. This screen reads and writes Stripe's own
 * objects with the key the Worker already holds, so there is no second key to
 * ask for and no copy of the truth to keep in step.
 *
 * Deactivating rather than deleting is deliberate: a deleted code loses the
 * record of what was redeemed under it.
 */
async function handleAdminDiscounts(request: Request, env: Env): Promise<Response> {
  const { session, isAdmin } = await getAdminSession(request, env);
  if (!session.user) return jsonWithCookies({ error: "unauthorized" }, session.setCookies, 401);
  if (!isAdmin) return jsonWithCookies({ error: "not_admin" }, session.setCookies, 403);
  if (!env.STRIPE_SECRET_KEY) return jsonWithCookies({ error: "not_configured" }, session.setCookies, 503);

  const auth = { Authorization: `Basic ${btoa(`${env.STRIPE_SECRET_KEY}:`)}` };
  const form = { ...auth, "Content-Type": "application/x-www-form-urlencoded" };

  if (request.method === "GET") {
    const res = await fetch(
      "https://api.stripe.com/v1/promotion_codes?limit=100&expand[]=data.coupon",
      { headers: auth },
    );
    if (!res.ok) {
      console.error("stripe promotion_codes list failed", res.status, await res.text().catch(() => ""));
      return jsonWithCookies({ error: "stripe_failed" }, session.setCookies, 502);
    }
    const data = (await res.json()) as {
      data?: {
        id: string;
        code: string;
        active: boolean;
        times_redeemed: number;
        max_redemptions: number | null;
        restrictions?: { first_time_transaction?: boolean };
        coupon?: { percent_off: number | null; amount_off: number | null; duration: string };
      }[];
    };
    return jsonWithCookies(
      {
        codes: (data.data ?? []).map((row) => ({
          id: row.id,
          code: row.code,
          active: row.active,
          redeemed: row.times_redeemed,
          maxRedemptions: row.max_redemptions,
          firstOrderOnly: row.restrictions?.first_time_transaction ?? false,
          percentOff: row.coupon?.percent_off ?? null,
          amountOff: row.coupon?.amount_off ?? null,
        })),
      },
      session.setCookies,
    );
  }

  let body: { id?: string; active?: boolean; code?: string; percentOff?: number; firstOrderOnly?: boolean };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return jsonWithCookies({ error: "invalid_body" }, session.setCookies, 400);
  }

  if (request.method === "PATCH") {
    if (!body.id) return jsonWithCookies({ error: "missing_id" }, session.setCookies, 400);
    const res = await fetch(`https://api.stripe.com/v1/promotion_codes/${encodeURIComponent(body.id)}`, {
      method: "POST",
      headers: form,
      body: `active=${body.active ? "true" : "false"}`,
    });
    if (!res.ok) {
      console.error("stripe promotion_code update failed", res.status, await res.text().catch(() => ""));
      return jsonWithCookies({ error: "stripe_failed" }, session.setCookies, 502);
    }
    return jsonWithCookies({ ok: true }, session.setCookies);
  }

  // Create. A code is two Stripe objects: the coupon holds the discount, the
  // promotion code is the text a customer types. One of each, made together.
  const code = String(body.code ?? "").trim().toUpperCase();
  const percent = Number(body.percentOff);
  if (!/^[A-Z0-9]{3,32}$/.test(code)) {
    return jsonWithCookies({ error: "invalid_code" }, session.setCookies, 400);
  }
  if (!Number.isFinite(percent) || percent <= 0 || percent > 100) {
    return jsonWithCookies({ error: "invalid_percent" }, session.setCookies, 400);
  }

  const coupon = await fetch("https://api.stripe.com/v1/coupons", {
    method: "POST",
    headers: form,
    body: `percent_off=${percent}&duration=once&name=${encodeURIComponent(code)}`,
  });
  if (!coupon.ok) {
    console.error("stripe coupon create failed", coupon.status, await coupon.text().catch(() => ""));
    return jsonWithCookies({ error: "stripe_failed" }, session.setCookies, 502);
  }
  const { id: couponId } = (await coupon.json()) as { id: string };

  const params = new URLSearchParams({ coupon: couponId, code });
  if (body.firstOrderOnly) params.set("restrictions[first_time_transaction]", "true");

  const promo = await fetch("https://api.stripe.com/v1/promotion_codes", {
    method: "POST",
    headers: form,
    body: params.toString(),
  });
  if (!promo.ok) {
    const detail = await promo.text().catch(() => "");
    console.error("stripe promotion_code create failed", promo.status, detail);
    return jsonWithCookies(
      { error: detail.includes("already exists") ? "code_taken" : "stripe_failed" },
      session.setCookies,
      promo.status === 400 ? 400 : 502,
    );
  }

  return jsonWithCookies({ ok: true }, session.setCookies);
}

// The Publish button.
//
// Content edits land in Supabase immediately, but the site is static: the pages
// only change when they are rebuilt. This asks GitHub Actions to do that
// rebuild, which reads the catalogue at build time and freezes it into the
// bundle — the reason a customer can never be shown one price and charged
// another.
const GITHUB_REPO = "lilyrcolumbus-hash/lyhoff-web";

async function handleAdminPublish(request: Request, env: Env): Promise<Response> {
  const { session, isAdmin } = await getAdminSession(request, env);
  if (!session.user) return jsonWithCookies({ error: "unauthorized" }, session.setCookies, 401);
  if (!isAdmin) return jsonWithCookies({ error: "not_admin" }, session.setCookies, 403);

  if (!env.GITHUB_TOKEN) {
    return jsonWithCookies({ error: "not_configured" }, session.setCookies, 503);
  }

  const headers = {
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "lyhoff-admin",
  };

  if (request.method === "GET") {
    // Whether a build is running, and how the last one went. Without this the
    // button is a leap of faith: you press it and watch nothing happen for two
    // minutes.
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/actions/runs?per_page=1&event=repository_dispatch`,
      { headers },
    );
    if (!res.ok) {
      console.error("publish status failed", res.status, await res.text().catch(() => ""));
      return jsonWithCookies({ error: "status_failed" }, session.setCookies, 502);
    }
    const data = (await res.json()) as {
      workflow_runs?: { status: string; conclusion: string | null; created_at: string; html_url: string }[];
    };
    const run = data.workflow_runs?.[0];
    return jsonWithCookies(
      {
        running: run ? run.status !== "completed" : false,
        conclusion: run?.conclusion ?? null,
        startedAt: run?.created_at ?? null,
        url: run?.html_url ?? null,
      },
      session.setCookies,
    );
  }

  const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/dispatches`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      event_type: "publish",
      client_payload: { by: session.user.email },
    }),
  });

  // GitHub answers a successful dispatch with 204 and no body.
  if (res.status !== 204) {
    const detail = await res.text().catch(() => "");
    console.error("publish dispatch failed", res.status, detail);
    return jsonWithCookies({ error: "dispatch_failed", status: res.status }, session.setCookies, 502);
  }

  return jsonWithCookies({ ok: true }, session.setCookies);
}

// ---------------------------------------------------------------------------
// Stripe webhook → our own `orders` table.
//
// Every completed Checkout Session gets stored in Supabase so order history
// lives in OUR database instead of only inside Stripe's dashboard. Signature
// verification is done by hand with Web Crypto (HMAC-SHA256) — no `stripe` npm
// SDK, same no-Node-runtime constraint as every other call in this file.
// See supabase/orders.sql for the table + RLS.
// ---------------------------------------------------------------------------

// Reject anything older than this so a captured request can't be replayed later.
const STRIPE_SIGNATURE_TOLERANCE_SECONDS = 300;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Compares two hex digests without leaking where they diverge via timing.
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Verifies Stripe's `Stripe-Signature` header against the RAW request body.
 * The header looks like `t=<unix>,v1=<hex>,v1=<hex>` — Stripe sends more than
 * one v1 during a secret roll, so any match counts.
 */
async function verifyStripeSignature(
  payload: string,
  header: string,
  secret: string,
): Promise<boolean> {
  const parts = header.split(",").map((part) => part.trim());
  const timestamp = parts.find((part) => part.startsWith("t="))?.slice(2);
  const signatures = parts.filter((part) => part.startsWith("v1=")).map((part) => part.slice(3));
  if (!timestamp || signatures.length === 0) return false;

  const age = Math.floor(Date.now() / 1000) - Number(timestamp);
  if (!Number.isFinite(age) || Math.abs(age) > STRIPE_SIGNATURE_TOLERANCE_SECONDS) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestamp}.${payload}`));
  const expected = toHex(mac);

  return signatures.some((signature) => timingSafeEqual(signature, expected));
}

interface OrderLineItem {
  name: string;
  quantity: number;
  amount_total: number;
}

/**
 * Line items aren't part of the webhook payload — they need their own API call.
 * A failure here is logged but never fails the webhook: an order row with an
 * empty item list is still far better than losing the order entirely.
 */
async function fetchSessionLineItems(sessionId: string, env: Env): Promise<OrderLineItem[]> {
  if (!env.STRIPE_SECRET_KEY) return [];

  const res = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}/line_items?limit=100`,
    {
      headers: {
        Authorization: `Basic ${btoa(`${env.STRIPE_SECRET_KEY}:`)}`,
        "Stripe-Version": "2024-06-20",
      },
    },
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("stripe line_items failed", res.status, detail);
    return [];
  }

  const data = (await res.json()) as {
    data?: { description?: string; quantity?: number; amount_total?: number }[];
  };

  return (data.data ?? []).map((item) => ({
    name: item.description ?? "",
    quantity: item.quantity ?? 0,
    amount_total: item.amount_total ?? 0,
  }));
}

async function handleStripeWebhook(request: Request, env: Env): Promise<Response> {
  if (!env.STRIPE_WEBHOOK_SECRET) return json({ error: "not_configured" }, 503);

  const signature = request.headers.get("Stripe-Signature");
  if (!signature) return json({ error: "missing_signature" }, 400);

  // Must read the body as raw text — the signature is over the exact bytes
  // Stripe sent, so re-serializing parsed JSON would never match.
  const payload = await request.text();
  const valid = await verifyStripeSignature(payload, signature, env.STRIPE_WEBHOOK_SECRET);
  if (!valid) return json({ error: "invalid_signature" }, 400);

  let event: { type?: string; data?: { object?: Record<string, unknown> } };
  try {
    event = JSON.parse(payload);
  } catch {
    return json({ error: "invalid_body" }, 400);
  }

  // We only subscribe to one event, but acknowledge anything else so Stripe
  // doesn't retry an event we deliberately ignore.
  if (event.type !== "checkout.session.completed") return json({ ok: true, ignored: true });

  const session = (event.data?.object ?? {}) as {
    id?: string;
    customer_email?: string | null;
    customer_details?: { email?: string | null; name?: string | null } | null;
    shipping_details?: { name?: string | null; address?: Record<string, string | null> | null } | null;
    collected_information?: {
      shipping_details?: { name?: string | null; address?: Record<string, string | null> | null } | null;
    } | null;
    client_reference_id?: string | null;
    amount_total?: number | null;
    currency?: string | null;
    locale?: string | null;
    metadata?: Record<string, string> | null;
  };

  const id = session.id;
  const email = (session.customer_details?.email ?? session.customer_email ?? "").trim().toLowerCase();
  if (!id || !email) {
    // Nothing useful to store, and retrying won't change that — acknowledge it.
    console.error("stripe webhook: session missing id/email", id);
    return json({ ok: true, skipped: true });
  }

  const url = env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  if (!url || !key || key.startsWith("__")) return json({ error: "not_configured" }, 503);

  const shipping = session.collected_information?.shipping_details ?? session.shipping_details ?? null;

  const res = await fetch(`${url}/rest/v1/orders`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      id,
      // Set once customers can log in before checking out; null for guests.
      user_id: session.client_reference_id && UUID_RE.test(session.client_reference_id)
        ? session.client_reference_id
        : null,
      email,
      amount_total: session.amount_total ?? 0,
      currency: session.currency ?? "usd",
      items: await fetchSessionLineItems(id, env),
      locale: session.locale === "es" ? "es" : "en",
      // Stripe moved shipping onto collected_information; older API versions put
      // it at the top level. Read both so an upgrade cannot quietly stop
      // recording the address an order has to be posted to.
      customer_name:
        shipping?.name ?? session.customer_details?.name ?? null,
      shipping_address: shipping?.address ?? null,
    }),
  });

  // Count the stock down for what was actually bought. Deliberately after the
  // order is stored and never allowed to fail the webhook: a 500 here makes
  // Stripe retry, and a retried decrement would take the same units off twice.
  // A number that drifts low is fixable in the panel; a lost order is not.
  if (res.ok || res.status === 409) {
    for (const entry of (session.metadata?.items ?? "").split(",")) {
      const [slug, count] = entry.split(":");
      const quantity = Number(count);
      if (!slug || !Number.isInteger(quantity) || quantity <= 0) continue;
      await fetch(`${url}/rest/v1/rpc/decrement_stock`, {
        method: "POST",
        headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        // The anon key is public, so the function will not act on it alone —
        // this token is what tells Postgres the caller is this Worker and not a
        // stranger walking the catalogue down to zero.
        body: JSON.stringify({ p_token: env.STOCK_TOKEN ?? "", p_slug: slug, p_quantity: quantity }),
      }).catch((error) => console.error("stock decrement failed", slug, error));
    }
  }

  // Stripe retries on any non-2xx, so a duplicate delivery of an order we
  // already stored (409 on the primary key) is a success, not a failure.
  if (res.ok) return json({ ok: true });
  if (res.status === 409) return json({ ok: true, already: true });

  // Real storage failure: return 500 so Stripe retries instead of dropping it.
  const detail = await res.text().catch(() => "");
  console.error("orders insert failed", res.status, detail);
  return json({ error: "store_failed", status: res.status }, 500);
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
    if (url.pathname === "/api/reviews") {
      if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
      }
      return handleReviews(request, env);
    }
    if (url.pathname === "/api/admin/me") {
      if (request.method !== "GET") return new Response("Method Not Allowed", { status: 405 });
      return handleAdminMe(request, env);
    }
    if (url.pathname === "/api/admin/publish") {
      if (request.method === "GET" || request.method === "POST") {
        return handleAdminPublish(request, env);
      }
      return new Response("Method Not Allowed", { status: 405 });
    }
    if (url.pathname === "/api/admin/discounts") {
      if (request.method === "GET" || request.method === "POST" || request.method === "PATCH") {
        return handleAdminDiscounts(request, env);
      }
      return new Response("Method Not Allowed", { status: 405 });
    }
    if (url.pathname === "/api/admin/photo") {
      if (request.method === "POST" || request.method === "DELETE") {
        return handleAdminPhoto(request, env);
      }
      return new Response("Method Not Allowed", { status: 405 });
    }
    if (url.pathname === "/api/admin/collection") {
      if (request.method === "GET" || request.method === "PATCH" || request.method === "POST") {
        return handleAdminCollection(request, env);
      }
      return new Response("Method Not Allowed", { status: 405 });
    }
    if (url.pathname === "/api/auth/confirm") {
      if (request.method !== "GET") return new Response("Method Not Allowed", { status: 405 });
      return handleAuthConfirm(request, env);
    }
    if (url.pathname === "/api/auth/register") {
      if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
      return handleRegister(request, env);
    }
    if (url.pathname === "/api/auth/login") {
      if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
      return handleLogin(request, env);
    }
    if (url.pathname === "/api/auth/forgot-password") {
      if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
      return handleForgotPassword(request, env);
    }
    if (url.pathname === "/api/auth/reset-password") {
      if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
      return handleResetPassword(request, env);
    }
    if (url.pathname === "/api/auth/logout") {
      if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
      return handleLogout(request, env);
    }
    if (url.pathname === "/api/account/me") {
      if (request.method !== "GET") return new Response("Method Not Allowed", { status: 405 });
      return handleAccountMe(request, env);
    }
    if (url.pathname === "/api/account/orders") {
      if (request.method !== "GET") return new Response("Method Not Allowed", { status: 405 });
      return handleAccountOrders(request, env);
    }
    if (url.pathname === "/api/account/newsletter") {
      if (request.method !== "GET" && request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
      }
      return handleAccountNewsletter(request, env);
    }
    if (url.pathname === "/api/stripe/webhook") {
      if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
      }
      return handleStripeWebhook(request, env);
    }
    // Everything else → static site.
    return env.ASSETS.fetch(request);
  },
};
