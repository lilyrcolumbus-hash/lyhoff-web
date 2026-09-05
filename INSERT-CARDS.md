# LYHOFF — Printable insert cards: complete build brief

Everything needed to rebuild, restyle or extend the physical cards that ship inside
LYHOFF orders. Written so an agent with no prior context can produce a correct card
on the first pass. Two cards exist today; both were built, printed and shipped.

---

## 0. Non-negotiable rules

These are not preferences. Each one was learned by getting it wrong first.

1. **Render the card in HTML/CSS and screenshot it. Never generate a card with an
   image model.** This was confirmed by spending real credit: image models deform
   small text even when explicitly told to preserve it exactly. A card is 90% small
   text. Same rule as LYHOFF product labels.
2. **One language per printed card, end to end.** Never mix English and Spanish on
   one artifact. The builder ships a language toggle; the *print output* is
   single-language.
3. **Square corners.** No rounded rectangles anywhere. Only true circles stay round.
   This has been rejected 3+ times on the site and applies here.
4. **No colored backgrounds.** Cards print on any home printer without the
   "background graphics" option enabled. Ink goes on marks, not on fills.
5. **Never claim anything untrue.** No "certified", no "artisanal", no
   "hand-mixed". LYHOFF is a *professional lab*. No fake press, no fake seals.
6. **Downloads inside a Claude Artifact need `window.claude.downloads.save()`.**
   A plain `<a download>` silently fails in the sandboxed iframe. Declare
   `capabilities: { downloads: true }` on publish. Keep an anchor fallback for
   when that object is absent.
7. **When exporting the card to canvas/PNG, scale drawn icons by the viewBox
   dimension you are fitting against.** Scaling a 120x90 illustration by its
   *height* renders it oversized and spills it across the card. Scale by width
   when the art is wider than tall.
8. **The DOM render and the canvas export must share one data source.** Path data,
   colors and copy live in one object each, consumed by both. Two hand-kept copies
   drift apart silently.

---

## 1. Brand system

### Palette (the only colors either card uses)

| Token       | Hex       | Job on the card                                    |
|-------------|-----------|----------------------------------------------------|
| `ink`       | `#2b2a25` | All primary text, monogram frame                   |
| `sage`      | `#6b6f5e` | Tagline, secondary brand line                      |
| `kraft`     | `#b08968` | Gold — hibiscus illustration                       |
| `kraftDeep` | `#8f6b4c` | Discount badge outline + numeral                   |
| `brick`     | `#9c5544` | Muted red — hummingbird illustration               |
| `tide`      | `#1e9e8f` | Sea Salt teal, mid                                 |
| `tideLight` | `#7fd9c9` | Sea Salt teal, pale (texture swatch highlights)    |
| `tideDeep`  | `#0f6b60` | Sea Salt teal, dark (wordmark, caption)            |

`brick` and `kraft` are the real Hummingbird Nectar label's own red and gold,
muted to sit inside the site's palette instead of the label's bold red. The tide
family is the real Sea Salt Spray label's teal.

### Typography

**Zen Kaku Gothic New, weight 700** — a Japanese geometric gothic, the same face the
site uses. Embed it as a base64 `@font-face` data URI: Artifacts block external font
CDNs, and the canvas export needs the face loaded via `FontFace` before drawing, or
the PNG falls back to a system font.

Two distinct treatments, do not conflate them:
- **Monogram**: tight, `letter-spacing: -0.04em`, font-size ~29% of the frame size.
- **Wordmark / brand line**: wide, `letter-spacing: 0.12–0.14em`, uppercase.

Body/condition text uses the system sans, not Zen Kaku — it is small print, not display.

### LF monogram — exact approved geometry

130-unit viewBox. All four corners **closed**; the only opening is a gap **centered
on the top edge**. Bottom edge is thick — the "rooted" meaning. Round caps and joins.

```js
var MONO_PATHS = [
  { d: 'M72.5,6 L124,6 L124,124 L6,124 L6,6 L57.5,6', w: 1.4, c: 'ink' },
  { d: 'M6,124 L124,124',                              w: 4.5, c: 'ink' }
];
```

The letters "LF" are HTML text absolutely centered inside the frame, not a path.

**Do not put the gap on a corner.** An earlier rebuild did that from a prose
description and was wrong. The gap is on the top edge, centered, x 57.5→72.5.

### Tagline

- EN: `Real roots. Nothing to hide.`
- ES: `Raíces reales. Nada que esconder.`

---

## 2. Card A — Sea Salt Spray (vertical)

**Purpose:** ships inside Etsy / TikTok Shop / other-platform orders to convert those
buyers into a first *direct* order on lyhoff.com. The discount is visible on the card.

**Format:** 2" wide x 3.5" tall (business-card size, rotated). **8 per US Letter
sheet**, 4 across x 2 down. Sheet padding `0.5in 0.75in`; grid `8in x 7in`.
Dashed `#cfcabd` cut guides.

### Element stack, in order, top to bottom

| Element        | Spec (print sheet values)                                                        |
|----------------|----------------------------------------------------------------------------------|
| Texture swatch | absolute, top `0.14in` right `0.14in`, `0.2in` square. See below.                 |
| LF monogram    | `0.32in` square, "LF" at `6.7pt`                                                  |
| Brand line     | `LYHOFF`, `6.4pt`, `letter-spacing .13em`, uppercase, `ink`                       |
| `SALT`         | `15pt`, Zen Kaku 700, teal gradient fill                                          |
| `OF THE`       | `5.8pt`, `letter-spacing .16em`, `ink`                                            |
| `SEA`          | `15pt`, same gradient                                                             |
| Caption        | product name, `5.6pt`, uppercase, `.05em`, `tideDeep`, weight 600                 |
| Discount badge | `1.24in` wide, **1pt outline only** in `kraftDeep`, no fill                       |
| — numeral      | `15%` at `20pt`, Zen Kaku 700, `line-height .9`                                   |
| — sublabel     | `OFF` at `6pt`, `.16em`, `ink` at 75% opacity                                     |
| QR code        | `0.62in` square                                                                   |
| Condition      | `5.8pt`, 72% opacity                                                              |
| Tagline        | `6pt`, Zen Kaku 700, `sage`                                                       |
| Site           | `lyhoff.com`, `5.6pt`, 50% opacity                                                |

### The two elements lifted from the real physical label

**1. The `SALT / OF THE / SEA` wordmark.** Traced from the actual product photo, not
invented. The real label fills those letters with a marbled teal texture; the card
stands that in with a gradient:

```css
background: linear-gradient(120deg, var(--tide-deep) 20%, var(--tide) 80%);
-webkit-background-clip: text; background-clip: text;
```

**Never let that gradient run toward `tideLight`** — the tail of each word
disappears against the white card.

**2. The texture swatch.** A tiny square recreating the label's own mottled two-tone
teal fill. It spells nothing; it is a literal short detail from the physical bottle:

```css
background:
  radial-gradient(circle at 28% 25%, var(--tide-light) 0%, transparent 42%),
  radial-gradient(circle at 68% 55%, var(--tide-light) 0%, transparent 38%),
  radial-gradient(circle at 45% 75%, var(--tide) 0%, transparent 46%),
  var(--tide-deep);
```

In the canvas export, reproduce it as three manually drawn radial blobs over a
`tideDeep` square, at the same relative positions.

### Why the discount badge is an outline, not a filled block

The 15% is the actual conversion hook, so it must visually outrank both the QR
(which is only the *mechanism*) and the wordmark. An earlier version buried it in a
72%-opacity sentence — wrong. But a solid kraft-filled rectangle burns home-printer
ink and fights the site's MUJI restraint. The resolution: **thin outline, no fill,
large bold numeral.** Size and weight carry the attention, not a color fill.

### Copy — exact strings

```js
en: {
  brand: 'LYHOFF', salt: 'SALT', ofthe: 'OF THE', sea: 'SEA',
  caption: 'Volumizing Sea Salt Hair Spray',
  discountNum: '15%', discountOff: 'OFF',
  condition: 'Leave a real review — good or bad — to unlock it.',
  url: 'https://lyhoff.com/en/thank-you/?p=sea-salt-spray-her',
  tag: 'Real roots. Nothing to hide.', site: 'lyhoff.com'
},
es: {
  brand: 'LYHOFF', salt: 'SALT', ofthe: 'OF THE', sea: 'SEA',
  caption: 'Spray de Sal Marina Voluminizador',
  discountNum: '15%', discountOff: 'DE DESCUENTO',
  condition: 'Deja tu reseña real, buena o mala, para desbloquearlo.',
  url: 'https://lyhoff.com/es/thank-you/?p=sea-salt-spray-her',
  tag: 'Raíces reales. Nada que esconder.', site: 'lyhoff.com'
}
```

**The wordmark stays in English in both languages.** It is the literal printed label
on the bottle the customer is holding — translating it would hurt recognition, not
help it. Only the caption, condition and tagline localize.

**One QR serves both Her and Him variants.** Sea Salt Spray sells as two catalog
slugs, but printing two cards is not worth it — so `/thank-you/` strips the
"— For Her/Him" suffix from the displayed product name (display-only regex; the
catalog names and slugs are untouched).

---

## 3. Card B — Hummingbird Nectar thank-you card (horizontal)

**Purpose:** ships inside Hummingbird Nectar orders. Asks for an honest review.
The discount is **not** shown as the headline — it unlocks after a review is
submitted, and the ask for honesty is the loudest thing on the card.

**Format:** 3.5" wide x 2" tall. **10 per US Letter sheet**, 2 across x 5 down.
Sheet padding `0.5in 0.75in`; grid `7in x 10in`.

### Element stack

| Element    | Spec                                                                  |
|------------|-----------------------------------------------------------------------|
| Header row | monogram `0.4in` + illustration `0.56in`, side by side, gap `0.18in`  |
| Brand line | `LYHOFF`, `7.5pt`, `.14em`, uppercase, `sage`                         |
| Message    | `8.6pt`, Zen Kaku 700, max width `2.9in` — the loudest element        |
| QR code    | `0.68in` square                                                       |
| Offer line | `6.6pt`, 72% opacity, max width `2.7in`                               |

### Copy — exact strings

```js
en: {
  brand: 'LYHOFF',
  msg: 'Real roots. Nothing to hide — not even a bad review.',
  offer: 'Leave yours, good or bad — it unlocks 15% off your next order.',
  url: 'https://lyhoff.com/en/thank-you/'
},
es: {
  brand: 'LYHOFF',
  msg: 'Raíces reales. Nada que esconder — ni siquiera una mala reseña.',
  offer: 'Déjala, buena o mala — desbloquea 15% en tu próxima compra.',
  url: 'https://lyhoff.com/es/thank-you/'
}
```

The headline is the brand tagline **fused** with the review invitation — not two
separate lines. This was corrected twice; keep them fused. The same fused line is
also the H1 of the `/thank-you/` page, word for word.

### Why "invite a bad review" is a real differentiator, not a platitude

Most brands' "ask for honest feedback" playbook means asking only customers already
known to be happy. Genuinely inviting critical feedback is rare in this niche. It is
also the legally correct framing: the FTC bars implying an incentive requires a
*positive* review. So the code unlocks on **any** real review, never filtered by
rating. Never gate on sentiment — that is review-gating and it is illegal.

### Illustration — hummingbird approaching a hibiscus

Redrawn from the real Hummingbird Nectar label's own mark (bold red background, solid
gray bird whose wing doubles as a leaf, gold hibiscus outline) into the site's
thin-line MUJI style. Single stroke weight, round caps, muted label colors.
120x90 viewBox:

```js
var BIRD_PATHS = [
  { d: 'M8,36 Q26,20 46,26 Q56,30 66,40', w: 1.6, c: 'brick' },
  { d: 'M8,36 Q24,48 44,46 Q54,44 60,40', w: 1.6, c: 'brick' },
  { d: 'M8,36 L1,28',                     w: 1.4, c: 'brick' },
  { d: 'M8,36 L1,44',                     w: 1.4, c: 'brick' },
  { d: 'M20,28 Q34,6 57,9 Q40,19 20,28',  w: 1.5, c: 'brick' },
  { d: 'M22,26 Q38,15 55,10',             w: 1.2, c: 'brick' }
];
var BIRD_DOTS = [{ cx: 42, cy: 27, r: 1.4, c: 'brick' }];

var FLOWER_PATHS = [
  { d: 'M95,45 Q101,34 95,25 Q89,34 95,45',             w: 1.4, c: 'gold' },
  { d: 'M95,45 Q107.4,47.3 114,39 Q103.6,35.9 95,45',   w: 1.4, c: 'gold' },
  { d: 'M95,45 Q96.6,57.4 106.8,61.2 Q106.3,50.4 95,45',w: 1.4, c: 'gold' },
  { d: 'M95,45 Q83.7,50.4 83.2,61.2 Q93.4,57.4 95,45',  w: 1.4, c: 'gold' },
  { d: 'M95,45 Q86.4,35.9 76,38.8 Q82.7,47.3 95,45',    w: 1.4, c: 'gold' },
  { d: 'M95,45 L104,38', w: 1, c: 'gold' },
  { d: 'M95,45 L108,44', w: 1, c: 'gold' },
  { d: 'M95,45 L103,51', w: 1, c: 'gold' }
];
var FLOWER_DOTS = [
  { cx: 104, cy: 38, r: 0.9, c: 'gold' },
  { cx: 108, cy: 44, r: 0.9, c: 'gold' },
  { cx: 103, cy: 51, r: 0.9, c: 'gold' },
  { cx: 95,  cy: 45, r: 2.2, c: 'gold' }
];
```

This card is deliberately **the first place the new minimalist style appears**, ahead
of eventually redesigning the printed labels themselves to match.

---

## 4. The QR code

- Library: **`qrcode-generator` by Kazuhiko Arase (MIT)**, pasted inline. Artifacts
  block external script hosts other than the CSP allowlist, and a card that cannot
  draw its own QR is useless.
- Settings: `qrcode(0, 'M')` — auto type number, medium error correction.
- Output: `createDataURL(6, 2)` — cell size 6, margin 2.
- The URL is **language-specific** (`/en/` vs `/es/`) and, on Card A, carries the
  product query param.
- Ship a separate "Download QR only (PNG)" button — she pastes it into Canva.

**Always verify the QR resolves before printing.** A card was once handed over with
a QR pointing at a route that had been written but never deployed. It 404'd for real.
`curl` the exact URL and confirm 200 before anyone prints anything.

---

## 5. PNG export (for Canva)

- Card A canvas: **800 x 1400**, transparent background.
- Card B: same approach, horizontal proportions.
- Mirror the DOM layout with canvas primitives, driven by the same `COPY`, `COLORS`
  and `*_PATHS` objects. Load the embedded font via `FontFace` and await it before
  the first `fillText`.
- Save via `window.claude.downloads.save({ filename, data: blob })` from
  `canvas.toBlob()`.

**Warn her to paste the PNG into Canva as a flat image.** Canva's text-import
reformatting mangled a headline once — "NothingTo Hide", missing space, wrong caps —
which looked like a bug in the card but was Canva converting the image to editable
text. The source string was correct.

---

## 6. Rejected — do not re-propose

Every one of these was built and turned down:

- A plain bottle silhouette as the memorable label detail.
- A pink/orange salt-crystal icon (accurate to the real "Ancient Utah sea salt"
  ingredient — still rejected, "muy largo").
- The three-line wordmark alone as the memorable detail (same objection).
- A solid kraft-filled discount badge (too much ink, too loud).
- Rounded corners, in any form.
- Two separate cards for Sea Salt Spray Her and Him.
- A discount offered *before* the review on Card B.

After two rejected creative guesses on the same vague ask, **stop guessing and ask
with concrete described options.** That rule was written because of this card.

---

## 7. Pre-handoff checklist

- [ ] Card renders at true size on the sheet — measure it, don't eyeball it
- [ ] Exactly one language on the printed output
- [ ] QR scans with a real phone and lands on a live 200 page
- [ ] Every hex traced to the table in section 1
- [ ] No rounded corners except true circles
- [ ] Monogram gap on the top edge, centered, bottom edge thick
- [ ] Download buttons use `window.claude.downloads.save`
- [ ] Nothing on the card claims something LYHOFF cannot prove

---

## 8. The live artifacts

- Sea Salt Spray card — `https://claude.ai/code/artifact/0c6c2b34-e7cb-413e-8587-a33e42cc4863`
- Thank-you card — `https://claude.ai/code/artifact/b441ebcc-4db7-4781-942e-1894ebc9769a`

Read the real artifact for exact geometry before rebuilding either one. A prose
paraphrase — including this document — can drift from what was actually approved.
