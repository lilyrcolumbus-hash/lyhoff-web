# Selling this system to other brands — the offer

Working notes for turning the LYHOFF site + admin into something sold to other brands.
Nothing here is built yet. Prices are a starting point, to be adjusted after two real sales.

---

## What is actually being sold

**Not a platform. Not software.** A bespoke online store, built for one brand, that its owner
runs herself, and that we keep running for a monthly fee.

The comparison to Shopify is misleading and was dropped on purpose:

- **Shopify rents the admin.** The client builds the store inside it. Stop paying and the store
  goes dark, because the site was only ever an output of their platform.
- **We build the store.** It exists as real code and it belongs to the client. We operate it.

We do not compete with Shopify. **We compete with the agency a merchant would hire to build their
Shopify store** — that merchant otherwise pays the agency *and* Shopify *and* the apps.

---

## The two plans

Identical product. The only difference is who carries the cost of the build.

### Plan A — pay for the build, stay free

| | |
|---|---|
| Up front | **$2,950**, in three payments of ~$983 |
| Monthly | **$149**, starting the day it launches |
| Minimum stay | **None.** Cancel any month |

Payments: one to start the build, one at launch, one 30 days later.

### Plan B — no money up front, commit instead

| | |
|---|---|
| Up front | **$0** |
| Monthly | **$299** |
| Minimum stay | **24 months** |

### Why both exist

"No build fee" and "no commitment" cannot both be true. The build is 25–30 hours of real work; if
it is not paid up front, it is only recovered over about two years of monthly fees — and a client
free to leave in month three would leave that work unpaid.

So the choice is stated plainly to the client: **pay for the work and stay free, or pay nothing
now and stay two years.**

Over 24 months Plan B costs the client $7,176 against Plan A's $6,526. It *should* cost more —
that difference is the price of us carrying the risk.

---

## What the money actually does

The build fee and the monthly fee pay for two different things, and conflating them is what makes
the offer sound incoherent.

**$2,950 pays for building it.** Three to four weeks of work. The client owns the result. That
ownership is a *term of the deal*, not the thing being bought — the same way paying a carpenter
buys the hours, and the shelves happen to be yours afterwards.

**$149/month pays for it to keep running.** A store is not a file that gets handed over. It needs
a database running, a server processing payments, a system sending email, and somebody to fix it
when it breaks. That costs money every month whether we are involved or not.

Of the $149: roughly **$30 goes to platforms** (Supabase Pro ≈ $25, plus Resend and Cloudflare),
leaving about **$119**.

**Supabase's free tier is not an option for a client.** It pauses a project after a few days of
inactivity — it already took LYHOFF's own signup form down in July. On a client's store that is an
outage nobody is told about.

---

## What is included

**In the build (both plans):**
- A custom site designed for the brand — not a purchased theme
- Fully bilingual, English and Spanish
- **Their products loaded, using the photos and copy they supply.** We place their material; we
  do not produce it. Saying it this way matters — an earlier draft of this file promised "products
  loaded with photos and copy" in one list and excluded "photography and copywriting" in the next,
  which reads as a contradiction and would be argued about later.
- Working Stripe checkout, proven with a real purchase
- The admin panel
- Every account opened **in the client's name**: domain, Stripe, database, hosting
- Access to the recorded tutorials (below)

**In the monthly (both plans):**
- Database, hosting and checkout running
- The built-in features: reviews, discounts, abandoned cart, email capture, shipping
  notifications, SEO
- Updates to the panel
- Support, including **up to 30 minutes of changes per month**

**Not included — say so in writing or it will be expected for free:**
- **Producing** product photography (we place what they send; we do not shoot it)
- **Writing** their product copy from scratch (we place what they send)
- Any feature beyond the standard set
- Integrations with other systems

### Teaching them to use it: recorded, not live

**No one-hour training session.** A live hour has to be repeated with every client, forever, and
it is the first thing that makes a per-client business stop scaling.

Instead: **six short recorded videos, about two minutes each** — edit a product, change a price,
add a photo, publish, read an order, mark it shipped. Recorded once against the real panel, reused
for every brand from then on. It is a template asset exactly like the code is.

It is also better for the client: she rewatches the one she needs at eleven at night instead of
writing to us.

**And put the help where the work happens.** The panel already explains itself in one place
("Saving and publishing are two things"). Extending that — a line of plain explanation next to the
controls people get wrong — removes most support questions before they are asked, and costs
nothing per client.

---

## How much of it is theirs

Worth stating explicitly in the contract, because "it's yours" is doing real work in the pitch.

**Theirs outright:** the domain, the Stripe account holding their money, the database with their
customers and orders, the photos, the copy. All in their name from day one.

**Theirs to use:** the code of *their* store. They can keep it, change it, and hand it to another
developer whenever they like.

**Ours, and never handed over:** the template — the engine the stores are built from. Give that
away and a client can build stores with it and compete using our own work.

---

## Why the monthly is not a leash

Because the accounts are already in the client's name, a client who leaves changes the card paying
the platforms to their own. Ten minutes. **Their store never goes dark.** What stops is us fixing
things.

That is the point. The retention has to come from being worth it, not from holding the store
hostage. Shopify can say "stop paying and you lose everything" because they are a company; from a
single person the same line reads as a threat and sends the client straight back to Shopify.

The line that answers the inevitable *"what if you disappear?"*:

> **The store is yours. I run it for you. If we part ways, you keep it.**

---

## The pricing argument, in numbers

A merchant's Shopify route: roughly $3,000–5,000 to an agency to build it, **plus** ~$39/month for
Shopify, **plus** $50–150/month in apps (reviews, abandoned cart, email, translation), **plus** an
extra ~2% per transaction if they do not use Shopify Payments.

Realistically **$190–290 a month, forever.**

Ours is $149 with all of that already inside. That is a number, not an opinion, which is why it
works in a sales conversation.

---

## Competitors, ranked by how much damage they do

1. **Staying on Etsy / Amazon / TikTok Shop.** Not a company — inertia. The biggest one by far.
   The answer: on Etsy the customer belongs to Etsy, you never get their email, you pay commission
   on every sale, and if they close your account tomorrow the business is gone.
2. **Shopify, Squarespace, Wix — doing it themselves.** They win on entry price. Almost nobody
   does it well alone; they end up with a recognisable theme, in one language, abandoned in three
   months.
3. **Cheap freelancers ($500–1,500).** They win on price and nothing else — they vanish on
   delivery. Do not compete here; a client shopping on price is not the client.
4. **Shopify agencies ($5,000+).** The real competition for the same client. They win on being a
   team. We win on total cost and on the client talking to the person doing the work.
5. **The nephew who's good with computers.** Genuinely wins in small family brands. Don't compete —
   wait six months and call.

**Two advantages nobody else has:** genuinely bilingual (agencies bolt on a bad translation app),
and we sell physical product on Etsy, Amazon and TikTok Shop ourselves — a brand owner's problems
do not have to be guessed at.

**Ideal client:** a small physical-product brand already selling on Etsy or TikTok Shop, that wants
to stop depending on them.

---

## Honest disadvantages, kept in view

- **No scale.** Shopify adds a client at zero cost; we add one at weeks of work. A hard ceiling.
  Mitigated, not removed, by: a **narrow niche** (a template only stays reusable if every client
  looks alike), **price over volume** (eight well-paid clients beat forty cheap ones, and forty
  could not be supported anyway), and **saying no** to clients the template does not fit.
- **No app ecosystem.** Whatever is not built does not exist. The reframe: a merchant installs six
  apps, not four thousand, and those six are already built in. The long tail is handled in the
  contract, by charging for it.
- **"What if you disappear?"** Answered structurally, by putting every account in the client's name
  from day one — which also removes the liability of holding someone else's customer data and
  payment credentials.

---

## Blocking: this cannot be sold yet

Three defects have to be fixed first. The first two are days of work; the third is the big one.

1. **No undo and no audit.** There is no history table anywhere, and no confirmation on a price
   edit. LYHOFF's own Tallow Cream was sold at $1.00 this way. With a client, the mistake is theirs
   and the blame is ours, with nothing to prove what happened or roll it back.
2. **Deploys fail silently.** The live site was twelve days stale and nobody noticed. Hard to
   charge a fee that promises "your store works" with no alarm when it doesn't.
3. **The product editor's fields are hardcoded.** Until they are defined in a config file instead
   of written into the component, every new brand needs a developer — which is also what makes the
   price coherent. At 25–30 hours a build, $2,950 is about $100/hour. Without the template it is
   three times the hours, or roughly $37/hour.

**Do not sell at these prices until 3 is done.**
