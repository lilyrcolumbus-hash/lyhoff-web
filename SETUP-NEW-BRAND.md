# Standing up a new brand from this codebase

Every step needed to take this repo and turn it into a second live store. Written so it does not
depend on anyone remembering.

**Open every third-party account in the client's name, not ours.** They own the domain, the Stripe
account holding their money, and the database holding their customers. We get collaborator access.
That is what makes "the store is yours" true rather than a sales line, and it keeps their customer
data and payment credentials out of our hands.

---

## 1. Supabase

Create the project. **Use a paid plan for a client** — the free tier pauses a project after a few
days of inactivity, which already took LYHOFF's own signup form down in July. On a client's store
that is a silent outage.

Run the SQL in `supabase/` in this order (later files add columns to earlier tables):

```
subscribers.sql
products.sql
orders.sql
reviews.sql
site-settings.sql
pages.sql
abandoned-checkouts.sql
product-photos.sql
product-stock.sql
products-position.sql
order-detail.sql
subscribers-account-access.sql
product-details.sql   # only if the brand declares fields LYHOFF doesn't have
mcp-read.sql          # only if the MCP connector is wanted
```

Skip `seed-temp-policy.sql` — it exists only for the one-off original catalogue import and grants
anon INSERT on products, which must never be left in place.

Then:

- Create the **`product-photos` storage bucket** and apply its policies.
- Create the **`admins`** row for the owner's email (see step 7).
- Insert the `stock` token into `service_tokens`, and the `mcp` token if using MCP (that one is
  stored as a **SHA-256 hash**, not the token itself).

**After every migration, run the Supabase advisors.** A policy is not a grant: a new table needs
both, or reads fail with `permission denied` even where the policy allows them.

## 2. Stripe

New account in the client's name, business verification, bank account.

Webhook endpoint → `https://theirdomain.com/api/stripe/webhook`, with these events:

- `checkout.session.completed` — records the order, decrements stock
- `checkout.session.expired` — sends the abandoned-cart reminder

Keep the signing secret for step 5. Turn on **Settings → Customer emails → Successful payments**
so buyers get a receipt; the success page does not send one.

## 3. Resend

Add their domain and use **Auto configure** if the domain is on Cloudflare. Auto configure adds
SPF and DKIM but **not DMARC** — add that TXT record by hand or their email lands in spam:

```
_dmarc   TXT   v=DMARC1; p=none; rua=mailto:<their address>
```

## 4. Cloudflare

Create the Worker, then add their domain as a **Custom Domain** on it (nameservers must already
point at Cloudflare; a completed registrar transfer is not required). Add `www` with a 301 to the
bare domain.

**Do not pick the "Next.js" framework preset.** With no wrangler config Cloudflare runs the
OpenNext server adapter, which crashes on a static export. `wrangler.jsonc` being present is what
prevents that — never delete it.

## 5. Secrets

Repo secrets in GitHub: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`. A minimal custom token
with **Workers Scripts: Edit + Account Settings: Read** is enough — no Zone permission, because
`wrangler.jsonc` declares no routes.

Worker secrets, via `npx wrangler secret put <NAME>`:

| Secret | What it is |
|---|---|
| `STRIPE_SECRET_KEY` | Live key, once verification is through |
| `STRIPE_WEBHOOK_SECRET` | From step 2 |
| `RESEND_API_KEY` | From step 3 |
| `GITHUB_TOKEN` | Fires the rebuild behind the Publish button |
| `STOCK_TOKEN` | Matches the `stock` row in `service_tokens` |
| `MCP_TOKEN`, `MCP_DB_TOKEN` | Only if the MCP connector is wanted |

**`GITHUB_TOKEN` must be a Worker *Secret*, not a Variable** — a plain Variable is erased by the
very deploy it enables.

**`wranglerVersion` is pinned in `.github/workflows/deploy.yml`.** Unpinned, the action installs a
wrangler 3.x that cannot read `wrangler.jsonc`, and the deploy dies with `Missing entry-point` —
which reads exactly like a broken token and has cost real hours. Keep it in step with the wrangler
in `devDependencies`.

## 6. `site.config.ts` and `product-fields.config.ts`

Two files, and between them they are the brand.

**`site.config.ts`** — name, legal name, tagline, contact email, origin, locales, palette, fonts,
currency, flat shipping rate, countries, and their Supabase URL and anon key.

**`product-fields.config.ts`** — what a product *is* here. Every box in the product editor, every
column the panel is allowed to write, and every field the create form asks for are all drawn from
this one list, so a brand whose products have a roast level instead of a scent is a list edit
rather than a component edit.

A field that LYHOFF's schema has no column for goes in the `details` json column
(`storage: { in: "json", column: "details", key: "roast" }`) — run `product-details.sql` first.
Before choosing which fields are shared across variants and which differ, run
`count(distinct …)` per variant group on the real catalogue, the way it was done here. Taste gets
this wrong; the data does not.

## 7. The owner's account

Register their email through the site's normal signup, confirm it, then insert that email into
`admins`. They sign in at **`theirdomain.com/admin`** — same domain as the shop, never a second
one, and never linked from the storefront.

## 8. Deploy and verify

Push to `main`; `.github/workflows/deploy.yml` builds and deploys. **Do not try to build locally
in a sandbox** — `next/font/google` downloads the typeface at build time and fails with a
misleading `Module not found: @vercel/turbopack-next/internal/font/google/font`.

Then check, with real requests rather than assumption:

- The storefront answers 200 in both languages
- `/admin` answers 200 and the owner can sign in
- A real test checkout produces a `cs_live_...` session
- The admin endpoints answer 401 when signed out
- The site that is actually live matches `main` — **the git auto-deploy has failed silently
  before**, leaving the live site twelve days behind without anyone noticing
