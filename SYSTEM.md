# The system behind this site

A bilingual storefront the owner administers herself: static pages, real
payments, and a self-service admin panel — with no monthly platform fee and no
developer needed for day-to-day changes.

This document is written for a developer standing the same thing up somewhere
else. It describes what is generic, what is specific to LYHOFF, and the reasons
behind the decisions that look unusual.

---

## 1. Shape

```
Browser
  │
  ├── static pages ................ Cloudflare Workers Assets (./out)
  │
  └── /api/* ...................... worker.ts  (one Cloudflare Worker)
                                      ├── Stripe   — checkout, order webhook
                                      ├── Supabase — auth, catalogue, orders
                                      └── Resend   — transactional email
```

**Next.js in `output: "export"` mode.** Every page is HTML on a CDN. There is no
server rendering, so there is no server to fall over, nothing to scale, and no
cold start in front of a customer.

**One Worker for all dynamic behaviour.** It has no Node runtime — every
integration is a raw `fetch()`, no SDKs. That is a constraint worth keeping: the
bundle stays tiny and there is no dependency tree to audit on a site that takes
card payments.

### The rule the whole architecture protects

> Content is read from the database at **build** time, never at request time.

`worker.ts` prices a Stripe checkout from the same frozen bundle the page was
rendered from. The price a customer reads and the price they are charged come
from one snapshot and cannot drift apart mid-session. A live database read in
the payment path would allow exactly that, in exchange for a convenience nobody
asked for.

The cost is that publishing takes a rebuild — one to three minutes. That is the
same trade every static CMS makes, and it is the right one on a site handling
money.

---

## 2. The one file that defines a site

`site.config.ts` — identity, palette, fonts, locales, commerce, and which
Supabase project holds the content.

```ts
export const site: SiteConfig = {
  name: "LYHOFF",
  tagline: { en: "…", es: "…" },
  origin: "https://lyhoff.com",
  locales: ["en", "es"],
  palette: { cream, ink, forest: {…}, earth: {…}, indigo: {…}, clay: {…} },
  commerce: { currency: "usd", flatShippingCents: 999, countries: ["US"] },
  data: { supabaseUrl, supabaseAnonKey },
};
```

`scripts/generate-theme.mjs` compiles the palette into the `@theme` block of
`app/globals.css` at build time. **No component names a colour** — that is what
lets a different site re-skin everything by editing one file.

Two traps worth inheriting the fix for:

- **Write the theme inline, never `@import` it.** Tailwind v4 only reads
  `@theme` from the entry stylesheet. Imported, the entire palette is silently
  dropped and every colour utility stops generating — the build still succeeds.
- **Do not read `SUPABASE_URL` / `SUPABASE_ANON_KEY` from the environment.**
  Those names are generic enough that a developer with another Supabase project
  exported in their shell builds against someone else's database with no
  warning. It happened here on the first run. Name the project in the config.

---

## 3. Data model

All in one Supabase project. Row level security on every table; the anon key is
public by design, and RLS — not secrecy — is what protects the data.

| Table | Holds | anon | customer | admin |
|---|---|---|---|---|
| `products` | catalogue, bilingual JSONB fields | read | read | full |
| `orders` | one row per completed Stripe checkout | insert¹ | own rows | all + update |
| `review_submissions` | reviews awaiting approval | insert | — | read + approve |
| `subscribers` | mailing list | insert | own row | read |
| `admins` | who may administer | — | — | — ² |

¹ The Stripe webhook writes with the anon key. It can insert, never read.
² No policy at all, which is the most closed a table can be. Only `is_admin()`,
a `SECURITY DEFINER` function, can see inside it.

```sql
create or replace function public.is_admin()
returns boolean language sql stable security definer
set search_path = public, pg_temp        -- not optional, see below
as $$ select exists (select 1 from public.admins where user_id = auth.uid()); $$;
```

**A `SECURITY DEFINER` function must pin its `search_path`.** Without it a
caller can point `public` at a schema of their own and have the function resolve
`admins` to a table they control. Supabase's own linter catches this — run
`get_advisors` after every migration.

**Never write a policy as `to authenticated using (true)`.** That reads as "only
me" right up until the day the site gains customer accounts, at which point
every customer who registers is `authenticated`. That exact policy shipped here
and had to be closed.

---

## 4. The admin panel

`/admin` — a client-only route with its own root layout, outside the localised
tree. Not linked from the site, `noindex`, absent from the sitemap.

### Authorisation

The browser never holds a token. The session is an `HttpOnly` cookie set by the
Worker, so no script on the page can read it and an XSS cannot be escalated into
catalogue writes. Every admin request is forwarded to PostgREST with the
caller's **own** access token, so:

> Authorisation is decided by Postgres, not by the Worker.

If a check in application code were wrong, the database still refuses. The
Worker's `is_admin` check exists to render the right screen, not to protect the
data.

### One engine, every collection

```ts
const ADMIN_COLLECTIONS = {
  products: { table: "products", key: "slug", order: "position.asc", editable: [...] },
  orders:   { table: "orders",   key: "id",   order: "created_at.desc",
              editable: ["tracking_number", "tracking_url", "shipped_at"] },
  reviews:  { table: "review_submissions", key: "id", editable: ["approved"] },
};
```

`GET /api/admin/collection?name=…` and `PATCH /api/admin/collection` serve all of
them. Adding a collection on another site is an entry in this map — no route, no
new form.

**`editable` is an allowlist, never a denylist.** A column absent from it cannot
be written at any price. That is how a product's `slug` — its URL, already
circulating on Pinterest and carrying its search ranking — stays out of reach of
a casual edit, along with the variant grouping that decides which products merge
into one page.

Two details that are easy to get wrong:

- **RLS answers a blocked write with an empty result set, not an error.** Treat
  "changed nothing" as failure, or the panel reports success for writes that
  were refused.
- **Send only changed fields.** A whole-row write stamps over anything edited
  elsewhere since the page loaded.

### Editing bilingual content

Fields are Spanish-first with the English collapsed beneath, and a marker when a
translation is missing. Two equal columns read as doing the job twice.

The store keeps **real text in both languages** rather than translating in the
browser: a machine translation performed at view time reads badly and search
engines do not index it, which would throw away the whole advantage of being
bilingual. Auto-translation belongs at save time, writing a real value the owner
can then correct.

---

## 5. Standing one up elsewhere

```
1. Clone. Edit site.config.ts — name, origin, locales, palette, Supabase project.
2. Run supabase/*.sql in order. Insert your own user id into `admins`.
3. wrangler secret put STRIPE_SECRET_KEY STRIPE_WEBHOOK_SECRET RESEND_API_KEY
4. Supabase → Auth: custom SMTP, Site URL, and email templates that use
   {{ .TokenHash }} pointed at /api/auth/confirm on YOUR domain.
5. npm run build && npx wrangler deploy
```

### Step 4 is the one that will cost you a day

Supabase's default templates link to `<project>.supabase.co`. That is a
different domain from the one the email claims to be from, which is the shape of
a phishing message — spam filters read the `href` and do not follow its
redirect. Route the link through your own domain and verify the token
server-side, which also lets you set the session cookie and land the customer
already signed in.

### The ones that cost real time here

- **Cloudflare's asset router answers browser navigation requests itself.** A
  path under `/api` works perfectly from `fetch()` and returns the 404 page when
  a human clicks a link to it. Set `assets.run_worker_first: ["/api/*"]` in
  `wrangler.jsonc`. Test link-reachable endpoints with
  `-H 'Sec-Fetch-Mode: navigate' -H 'Sec-Fetch-Dest: document'` — plain `curl`
  hides this completely.
- **Cloudflare serves the previous deploy for a few seconds** after
  `wrangler deploy`. Retry before diagnosing.
- **A credential added as a plain Variable instead of a Secret works exactly
  once.** Both live on the same dashboard screen and look interchangeable. They
  are not: `wrangler deploy` sends the full variable set from `wrangler.jsonc`,
  so any plain variable the config does not declare is dropped on the next
  deploy — while secrets are managed separately and survive. A token stored as
  a variable therefore publishes successfully, and that very publish erases it;
  the next attempt answers 503 with nothing having changed. Confirm with
  `wrangler secret list` (the name appears) and `wrangler versions view <id>`
  (the name is *absent* from the plaintext bindings). Being unable to read the
  value back is the signal it was stored correctly.
- **wrangler-action installs its own wrangler unless you pin it.** It picks a
  3.x, which cannot read `wrangler.jsonc`; with no config it finds no entry
  point and fails with `Missing entry-point` before ever touching your
  Cloudflare credentials — so it reads like a broken token. Set
  `wranglerVersion` in the action and keep it in step with `devDependencies`.

---

## 6. What Stripe owns, and what this owns

| | Where it lives | Why |
|---|---|---|
| Product names, prices, copy | this database | the owner edits them |
| The amount actually charged | build-time bundle | shown price and charged price must match |
| Coupons and redemption limits | **Stripe** | Stripe is what stops one customer redeeming a code twice |
| Cards, PCI scope | **Stripe** | never touches this system |
| Order history | this database, via webhook | so it survives, and can be queried |

Checkout builds line items with inline `price_data` — there are no Stripe
Product objects to keep in sync. **The price set in the admin is the price Stripe
charges**, at the next publish. Nothing to reconcile, by design.

---

## 7. Deliberately not built

- **A code editor in the panel.** Shopify can offer one because a broken
  template renders one bad page; here a syntax error fails the build and nothing
  publishes at all. A block composer plus a scoped custom-CSS field gives the
  same freedom without a way to take the site down.
- **Live catalogue reads in the payment path.** See §1.
- **Saved payment methods and addresses.** Stripe already holds both.

---

## 8. Files

```
site.config.ts               the one file a new site edits
scripts/generate-theme.mjs   palette → CSS variables, at build time
scripts/fetch-products.mjs   catalogue → lib/products.generated.json, at build time
worker.ts                    every API route: checkout, auth, webhook, admin
app/admin/                   the panel's route and root layout
components/admin/            the panel; ui.tsx holds the shared shell
supabase/*.sql               schema and policies, in order
```
