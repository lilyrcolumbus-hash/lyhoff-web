// Shared with worker.ts (Stripe checkout) — keep both in sync.
// Free shipping disabled for now (owner decision, 2026-07-15) — flat rate on every order.
export const FREE_SHIPPING_THRESHOLD_CENTS: number | null = null;
export const FLAT_SHIPPING_CENTS = 699; // $6.99 flat rate — fallback if the live Shippo rate can't be calculated

export interface ParcelSpec {
  weightOz: number;
  lengthIn: number;
  widthIn: number;
  heightIn: number;
}

// Per-product shipping weight/dimensions for the Shippo rate calculator.
// Dimensions are from owner-provided container spec photos (2026-07-15). Weights (jar/bottle +
// product, real, owner-measured 2026-07-15) are real except tallow-cream-4oz, still estimated —
// see CLAUDE.md "RESUME HERE" for the source data and what's still missing.
export const PARCEL_SPECS: Record<string, ParcelSpec> = {
  // 1oz jar: 1.93"H x 2.36"D, 2.3oz filled (real, owner-measured)
  "comfrey-salve-1oz": { weightOz: 2.3, lengthIn: 2.5, widthIn: 2.5, heightIn: 2 },
  // 2oz jar: 2.42"H x 2.86"D, 3.8oz filled (real) — Tallow Cream and Comfrey Salve share this jar mold
  "tallow-cream-2oz": { weightOz: 3.8, lengthIn: 3, widthIn: 3, heightIn: 2.5 },
  "comfrey-salve-2oz": { weightOz: 3.8, lengthIn: 3, widthIn: 3, heightIn: 2.5 },
  // 4oz jar: no diagram or weight provided yet — estimated proportionally larger than the 2oz jar
  "tallow-cream-4oz": { weightOz: 10, lengthIn: 3.5, widthIn: 3.5, heightIn: 3 },
  // Sea Salt Spray bottle: 6.15"H x 2"D, 8.5oz filled (real)
  "sea-salt-spray-her": { weightOz: 8.5, lengthIn: 2.5, widthIn: 2.5, heightIn: 6.5 },
  "sea-salt-spray-him": { weightOz: 8.5, lengthIn: 2.5, widthIn: 2.5, heightIn: 6.5 },
  // 2oz amber/blue dropper bottle, 4.3oz filled (real) — dims estimated (boston-round-with-dropper), no diagram
  "hair-growth-oil": { weightOz: 4.3, lengthIn: 2, widthIn: 2, heightIn: 4.5 },
  "methylene-blue": { weightOz: 4.3, lengthIn: 2, widthIn: 2, heightIn: 4.5 },
};

// Ships in a USPS Priority Mail Flat Rate Envelope — fixed price regardless of weight/dims,
// so it skips the per-item parcel calculation entirely (handled specially in the rate endpoint).
export const FLAT_RATE_ENVELOPE_SLUGS = new Set(["hummingbird-nectar"]);
