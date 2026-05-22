# SmartGrowth — Website

Bilingual (EN/ES) homesteading & self-sufficiency content site. It's the **destination for the SmartGrowth Pinterest pins**: each pin links to an article here (recipes, preserving, herbal, garden, off-grid).

- **Stack:** Next.js 16 (App Router, static export) · Tailwind v4 · MDX · Cloudflare Pages
- **Newsletter:** Resend, via a Cloudflare Pages Function (`functions/api/subscribe.ts`)
- **i18n:** `/en/…` and `/es/…` routes, language toggle, hreflang + sitemap

## Develop

```bash
npm install
npm run dev          # http://localhost:3000  (root redirects to /en)
npm run build        # static export → ./out  (+ language-aware out/index.html)
npm run preview      # serve the built ./out locally
```

## Add an article

1. Create a folder under `content/articles/<slug>/`.
2. Add `en.mdx` and `es.mdx`. Frontmatter schema:

```yaml
---
title: "Pinterest-friendly, keyword-front-loaded title"
description: "140–160 char SEO description with the main keyword."
category: "preserving"   # recipes | preserving | herbal | garden | offgrid
tags: ["canning", "strawberry"]
publishedAt: "2026-05-22"
draft: true              # true = shows a 'Draft — pending review' badge
featured: false          # true = appears in the homepage "Start here" row
# heroImage: "/images/articles/<slug>/hero.jpg"   # 16:9, optional
# pinImage:  "/images/articles/<slug>/pin.jpg"    # 2:3 vertical, used for Pinterest/OG
---

Body in Markdown/MDX…
```

The body is plain Markdown (headings, lists, **bold**, links, > quotes). Reading time is computed automatically.

## Add real photos

Without `heroImage`/`pinImage` the site shows a branded placeholder. To use real photos:

1. Put files in `public/images/articles/<slug>/hero.jpg` and `pin.jpg`.
2. Uncomment/add `heroImage` and `pinImage` in the article frontmatter.

`pinImage` should be a **tall 2:3 image** — it's what Pinterest and social cards use.

## Deploy to Cloudflare Pages

Create a Pages project from this repo (or `wrangler pages deploy out`). Build settings:

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Build output directory | `out` |
| Functions | auto-detected from `/functions` |

### Environment variables (Cloudflare Pages → Settings → Variables)

| Name | Required | Notes |
|---|---|---|
| `RESEND_API_KEY` | for newsletter | Resend API key |
| `RESEND_AUDIENCE_ID` | for newsletter | Resend Audience to add contacts to |
| `RESEND_FROM` | optional | e.g. `SmartGrowth <hello@smartgrowth.farm>` — sends a welcome email |

If the Resend vars are missing, the signup form returns an honest error instead of faking success.

## Connect the custom domain later

1. Add the domain in Cloudflare Pages → Custom domains.
2. Update `SITE_URL` in `lib/i18n.ts` to the real domain (e.g. `https://smartgrowth.farm`) so canonical URLs, hreflang and the sitemap are correct.
3. Rebuild/redeploy.

## Project layout

```
app/[lang]/            # all routes (en/es) — root layout sets <html lang>
  page.tsx             # homepage
  articles/[slug]/     # article page (SEO meta + JSON-LD + Save to Pinterest)
  category/[category]/ # category listing
  topics/              # all guides
  about/               # about (draft — personalize)
app/not-found.tsx      # global 404
app/sitemap.ts         # sitemap.xml (with hreflang)
app/robots.ts          # robots.txt
components/             # Header, Footer, ArticleCard, Newsletter, Mdx, …
content/articles/      # the MDX content
functions/api/         # Cloudflare Pages Functions (newsletter)
lib/i18n.ts            # locales, categories, UI strings, SITE_URL
lib/content.ts         # MDX reader
```
