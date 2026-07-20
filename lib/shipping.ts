// Shared with worker.ts (Stripe checkout) — keep both in sync.
// Free shipping disabled for now (owner decision, 2026-07-15) — flat rate on every order.
export const FREE_SHIPPING_THRESHOLD_CENTS: number | null = null;
export const FLAT_SHIPPING_CENTS = 699; // $6.99 flat rate, shown as a fixed Stripe shipping option
