// Shared with worker.ts (Stripe checkout) — keep both in sync.
// Free shipping disabled for now (owner decision, 2026-07-15) — flat rate on every order.
export const FREE_SHIPPING_THRESHOLD_CENTS: number | null = null;

// One flat rate for the whole catalog (owner decision, 2026-07-20) — set to the higher of the
// two real rates found (Hummingbird Nectar's own USPS flat-rate-envelope cost, $9.62, confirmed
// identical across zones) so every order is covered, not just the lighter jars/bottles
// (real USPS quotes for those ran \$5.58-\$6.24). Simpler than a per-product rate, and never
// undercharges. Shown to the customer as a generic 2-5 business day estimate, no carrier/service
// name — real underlying services span USPS Ground Advantage (2-5 days) and Priority Mail
// (1-3 days), both of which fall inside that window.
export const FLAT_SHIPPING_CENTS = 999;
