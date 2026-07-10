# LYHOFF — Website

Bilingual (EN/ES) brand + content site for LYHOFF (small-batch tallow skincare, hair care, home
essentials). Two jobs in one site: (1) the **destination for Pinterest pins** — educational
articles readers land on — and (2) the **shop** — product pages, cart, and Stripe checkout.

- **Stack:** Next.js 16 (App Router, static export) · Tailwind v4 · MDX · Zustand (cart) ·
  Framer Motion
- **Deploy:** Cloudflare **Workers + Static Assets** (`wrangler.jsonc` + `worker.ts` — not
  Cloudflare Pages, not Vercel). `worker.ts` is the only server code: `POST /api/subscribe`
  (newsletter → Supabase) and `POST /api/checkout` (Stripe Checkout Session).
- **i18n:** `/en/…` and `/es/…` routes, language toggle, hreflang + sitemap

## Develop

```bash
npm install
npm run dev          # http://localhost:3000  (root redirects to /en)
npm run build        # static export → ./out  (+ language-aware out/index.html)
npm run preview      # serve the built ./out locally
```

`npm run dev` does **not** run `worker.ts`, so `/api/subscribe` and `/api/checkout` 404 locally.
Test those with `npx wrangler dev` or a real deploy.

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

Edit `lib/products.ts` — each entry is one `Product` object (name, price, ingredients, benefits,
how-to-use, etc). Drop real photos in `public/images/products/<slug>/` (any filename; a file
named `main`/`1` is used first). Two products sharing a `variantGroup` (e.g. the 2oz/4oz tallow
cream) render as one listing card with a size selector instead of two separate cards.

## Add real photos (articles)

Without `heroImage`/`pinImage` the site shows a branded placeholder. To use real photos, put
files in `public/images/articles/<slug>/hero.jpg` and `pin.jpg`, then add `heroImage`/`pinImage`
to the frontmatter. `pinImage` should be a **tall 2:3 image** — it's what Pinterest/OG use.

## Deploy

Push to `main` — the repo *should* auto-deploy via a Cloudflare Workers git connection, but as
of 2026-07-10 that connection wasn't firing reliably. Until confirmed fixed (Cloudflare
dashboard → Workers & Pages → lyhoff-web → Settings → Build & deployments), deploy manually
after every push:

```bash
npm run build
npx wrangler deploy
```

Then verify with `curl` against the live URL — don't assume the push alone published it.

### Secrets (Cloudflare Worker)

```bash
npx wrangler secret put STRIPE_SECRET_KEY     # required for /api/checkout to work
npx wrangler secret put SUPABASE_URL          # optional override, has a public-safe default
npx wrangler secret put SUPABASE_ANON_KEY     # optional override, has a public-safe default
```

## Connect the custom domain later

1. Add the domain in Cloudflare Workers → Custom domains.
2. Update `SITE_URL` in `lib/i18n.ts` to the real domain.
3. Rebuild/redeploy.

## Project layout

```
app/[lang]/               # all routes (en/es) — root layout sets <html lang>
  page.tsx                # homepage
  articles/[slug]/        # article page (SEO meta + JSON-LD + Save to Pinterest)
  category/[category]/    # category listing (+ shop cross-sell on bodycare)
  topics/                 # all guides, grouped by category
  about/                  # brand story (draft banner until personalized)
  products/                # shop listing
  products/[slug]/        # product detail (gallery, variants, reviews placeholder)
  ingredients/             # ingredient education page
  quiz/                    # product-finder quiz
  cart/                    # cart page
  checkout/success|cancel/ # post-Stripe pages
app/not-found.tsx         # global 404
app/sitemap.ts            # sitemap.xml (with hreflang)
app/robots.ts             # robots.txt
components/                # Header, Footer, ProductCard, CartDrawer, Newsletter, Mdx, …
content/articles/         # the MDX content (empty until real articles are added)
lib/products.ts           # product catalog
lib/ingredients.ts        # ingredient education data
lib/cart-store.ts         # Zustand cart
lib/i18n.ts                # locales, categories, UI strings, SITE_URL
lib/content.ts             # MDX reader
worker.ts                  # Cloudflare Worker — newsletter + Stripe checkout endpoints
```
