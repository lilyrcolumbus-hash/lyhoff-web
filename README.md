# LYHOFF — Website + Admin

**Live:** [lyhoff.com](https://lyhoff.com)

A bilingual (EN/ES) e-commerce platform for LYHOFF, a small-batch skincare and home-goods brand —
built, owned and operated independently of any third-party platform (no Shopify, no monthly
platform fee). The storefront takes real payments; the owner runs the entire business herself
from a self-service admin panel, with no developer in the loop for day-to-day changes.

**Built as a reusable engine, not a one-off site.** The same codebase — generic storefront,
generic admin, one config file per brand — has been cloned and stood up for a second, independent
brand (Frontier Lab) with its own Supabase project, Stripe account and domain. `SYSTEM.md`
documents the architecture for standing it up again elsewhere.

## What it does

- **Storefront** — bilingual product catalog with variant grouping (size/scent), cart, Stripe
  Checkout, customer accounts with order history, abandoned-checkout recovery emails, SEO
  (sitemap, hreflang, per-page OpenGraph/JSON-LD), and an MCP server (`mcp.ts`) exposing the
  catalog/orders as read-only tools for AI clients.
- **Admin panel** (`/admin`) — a self-service, Shopify-equivalent control panel the owner uses
  directly: Orders (with tracking + printable packing slips), Products (schema-driven fields, so
  a new product field needs no code change), Customers (assembled CRM from orders + mailing
  list), Reviews (moderation + auto-publish), Discounts (reads/writes Stripe's own promotion
  codes), Abandoned checkouts, Pages (a block-based page builder), Navigation, Brand (live color
  palette with a WCAG contrast check), and Content (every UI string, bilingual).
- **Publish pipeline** — editing in the admin never touches the live site directly; "Publish"
  triggers a GitHub Actions rebuild + redeploy, so the storefront stays a pre-rendered static
  export (fast, cheap, nothing to patch at 2am) while still being editable like a CMS.

## Architecture

```
Browser
  │
  ├── static pages ................ Cloudflare Workers Assets (pre-rendered per locale)
  │
  └── /api/* ...................... worker.ts (one Cloudflare Worker, no Node runtime)
                                      ├── Stripe   — checkout, order webhook, refunds, discounts
                                      ├── Supabase — auth, catalogue, orders, reviews (RLS)
                                      └── Resend   — transactional email (receipts, reviews, etc.)
```

The rule the whole architecture protects: **content is read from the database at build time,
never at request time.** A customer's checkout price always matches the price they saw, because
both come from the same frozen build — a live database read in the payment path would let those
drift apart. Publishing costs a 1–3 minute rebuild; that trade is worth it on a site that handles
real money. Full rationale, every trap, and what's generic vs. LYHOFF-specific: see `SYSTEM.md`.

- **Stack:** Next.js 16 (App Router, static export) · Tailwind v4 · MDX · Zustand (cart) ·
  Framer Motion · Supabase (Postgres + Auth, RLS) · Stripe · Resend
- **Deploy:** Cloudflare Workers + Static Assets (`wrangler.jsonc` + `worker.ts`) — not Cloudflare
  Pages, not Vercel. One Worker handles every dynamic route via raw `fetch()` calls (no SDKs), to
  keep the bundle auditable on a site that takes card payments.
- **i18n:** every route lives under `/en/…` and `/es/…`, with a language toggle, hreflang and a
  generated sitemap.

## Develop

```bash
npm install
npm run dev          # http://localhost:3000  (root redirects to /en)
npm run build        # static export → ./out  (+ language-aware out/index.html)
npm run preview      # serve the built ./out locally
```

`npm run dev` does **not** run `worker.ts`, so any `/api/*` route 404s locally. Test those with
`npx wrangler dev` or a real deploy.

## Add an article

1. Create a folder under `content/articles/<slug>/`.
2. Add `en.mdx` and `es.mdx`. Frontmatter schema:

```yaml
---
title: "Pinterest-friendly, keyword-front-loaded title"
description: "140–160 char SEO description with the main keyword."
category: "garden"   # garden | food | bodycare | remedies
tags: ["tallow", "skincare"]
publishedAt: "2026-07-10"
draft: true              # true = shows a 'Draft — pending review' badge
featured: false           # true = appears in the homepage "Start here" row
# heroImage: "/images/articles/<slug>/hero.jpg"   # 16:9, optional
# pinImage:  "/images/articles/<slug>/pin.jpg"    # 2:3 vertical, used for Pinterest/OG
---

Body in Markdown/MDX…
```

The body is plain Markdown (headings, lists, **bold**, links, > quotes). Reading time is
computed automatically. With zero articles, `/topics/` and the homepage guide sections show an
honest "new guides coming soon" message instead of anything fake.

## Add a product

Products and their fields live in Supabase, edited through `/admin` — no code change needed for
a normal catalog update. `product-fields.config.ts` declares the schema (label, input kind, which
editor section, which column) that both the admin UI and the Worker's save allowlist are derived
from, so a brand needing a field this one doesn't have just adds a declaration rather than editing
a component.

## Add real photos (articles)

Without `heroImage`/`pinImage` the site shows a branded placeholder. To use real photos, put
files in `public/images/articles/<slug>/hero.jpg` and `pin.jpg`, then add `heroImage`/`pinImage`
to the frontmatter. `pinImage` should be a **tall 2:3 image** — it's what Pinterest/OG use.

## Deploy

```bash
npm run build
npx wrangler deploy
```

Push to `main` also triggers a GitHub Actions deploy (used by the admin's own "Publish" button).

### Secrets (Cloudflare Worker)

```bash
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put SUPABASE_URL          # optional override, has a public-safe default
npx wrangler secret put SUPABASE_ANON_KEY     # optional override, has a public-safe default
```

## Connect the custom domain later

1. Add the domain in Cloudflare Workers → Custom domains.
2. Update `SITE_URL` in `lib/i18n.ts` to the real domain.
3. Rebuild/redeploy.

## Project layout

```
app/[lang]/               # storefront routes (en/es) — root layout sets <html lang>
  page.tsx                # homepage
  articles/[slug]/        # article page (SEO meta + JSON-LD + Save to Pinterest)
  category/[category]/    # category listing
  products/, products/[slug]/  # shop listing + product detail (variants, reviews)
  account/                # customer login + order history
  cart/, checkout/success|cancel/
app/admin/                # self-service admin panel (client-only route)
app/not-found.tsx, sitemap.ts, robots.ts
components/               # storefront components (Header, ProductCard, CartDrawer, …)
components/admin/         # admin panel sections (Orders, Products, Customers, Reviews, …)
content/articles/         # MDX content
lib/                      # products, cart store, i18n, ingredients, product-fields schema
supabase/                 # schema + RLS policies (SQL, applied via the Supabase SQL editor)
worker.ts                 # the one Cloudflare Worker — every /api/* route
mcp.ts                    # MCP server exposing the catalog/orders read-only to AI clients
SYSTEM.md                 # architecture spec for standing this engine up for another brand
```
