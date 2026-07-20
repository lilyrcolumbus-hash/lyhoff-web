// Shared with worker.ts (Stripe checkout) — keep both in sync.
// Free shipping disabled for now (owner decision, 2026-07-15) — flat rate on every order.
export const FREE_SHIPPING_THRESHOLD_CENTS: number | null = null;

// Both rates below are backed by real Shippo quotes (2026-07-20) from the real ship-from
// address (Lima, OH) — not guesses. Re-check if the catalog's typical weight changes materially.
//
// Core catalog (jars/bottles, ~3.8oz + packaging): real USPS Ground Advantage quotes across
// 5 US zones ranged $5.58–$6.24 (avg $5.88). $6.49 covers every sampled zone with a small buffer.
export const FLAT_SHIPPING_CENTS = 649;

// Hummingbird Nectar ships in a USPS Priority Mail Flat Rate Envelope — genuinely the same
// price everywhere by USPS design (confirmed identical, $9.62, across 2 different zones).
export const ENVELOPE_SHIPPING_CENTS = 999;
export const FLAT_RATE_ENVELOPE_SLUGS = new Set(["hummingbird-nectar"]);
