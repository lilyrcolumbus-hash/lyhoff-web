import { site } from "@/site.config";
import generated from "./settings.generated.json";

/**
 * Settings the owner edits, merged over what the code compiles in.
 *
 * The compiled value is always the fallback, never a placeholder: a site that
 * has never run the migration, or a key she has not touched, behaves exactly as
 * it did before this file existed. Frozen at build time — see
 * scripts/fetch-settings.mjs for why that is deliberate.
 */
const stored = generated as Record<string, Record<string, unknown> | undefined>;

function read<T>(key: string, field: string, fallback: T): T {
  const value = stored[key]?.[field];
  return value === undefined || value === null || value === "" ? fallback : (value as T);
}

export const shipping = {
  /** One flat rate for the whole catalogue, in cents. */
  flatCents: read("shipping", "flatCents", site.commerce.flatShippingCents),
  countries: read("shipping", "countries", site.commerce.countries),
  minDays: read("shipping", "minDays", 2),
  maxDays: read("shipping", "maxDays", 5),
};

export const business = {
  email: read("business", "email", "lyhoffllc.info@gmail.com"),
  legalName: read("business", "legalName", site.name),
};

/** Storefront wording overridden per key, per locale. Empty for most sites. */
export const contentOverrides = (stored.content ?? {}) as Record<string, Record<string, string>>;

/** Shop categories she has renamed, reordered or added. */
export const categoryOverrides = (stored.categories ?? {}) as Record<string, unknown>;

/** Header and footer links, when the owner has arranged her own. */
export const navigationOverrides = (stored.navigation ?? {}) as Record<string, unknown>;
