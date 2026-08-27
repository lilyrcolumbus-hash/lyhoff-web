/**
 * The one file that defines a site built on this system.
 *
 * Everything brand-specific lives here — identity, palette, type, commerce —
 * so that standing up another store means editing this file rather than
 * hunting through components. `scripts/generate-theme.mjs` turns the palette
 * below into CSS variables at build time; nothing reads these colours from
 * anywhere else.
 *
 * The admin panel edits the same values through the database and regenerates
 * this theme on publish, which is why the shape here has to stay declarative:
 * a form can be drawn from it, a hand-written stylesheet cannot.
 */

export interface BrandPalette {
  /** Page ground. Everything else is chosen to sit on this. */
  cream: string;
  /** Body copy and headings, darkest first. */
  ink: string;
  /** Dark neutral ramp — headings, dark surfaces, primary buttons. */
  forest: Record<string, string>;
  /** Primary accent — the brand's one colour. */
  earth: Record<string, string>;
  /** Secondary accent, reserved for interactive states. */
  indigo: Record<string, string>;
  /** Errors only. Never decorative. */
  clay: Record<string, string>;
}

export interface SiteConfig {
  name: string;
  legalName: string;
  tagline: Record<string, string>;
  contactEmail: string;
  origin: string;
  locales: string[];
  defaultLocale: string;
  palette: BrandPalette;
  fonts: { display: string; body: string };
  commerce: { currency: string; flatShippingCents: number; countries: string[] };
  /** Where this site's content lives. The anon key is public by design — row
   *  level security, not secrecy, is what protects the data. */
  data: { supabaseUrl: string; supabaseAnonKey: string };
}

export const site: SiteConfig = {
  name: "LYHOFF",
  legalName: "LYHOFF LLC",
  tagline: {
    en: "Real roots. Nothing to hide.",
    es: "Raíces reales. Nada que esconder.",
  },
  contactEmail: "lyhoffllc.info@gmail.com",
  origin: "https://lyhoff.com",

  locales: ["en", "es"],
  defaultLocale: "en",

  // Approved 2026-08-24. Two accents coexist only because they are split by
  // JOB — olive carries the brand, indigo carries interaction — so a new site
  // adopting this system should keep that split even while changing the hues.
  palette: {
    cream: "#fbfaf7",
    ink: "#2b2a25",
    forest: {
      "50": "#f7f5f0",
      "100": "#eae8de",
      "200": "#d4d1c0",
      "300": "#bfbca4",
      "400": "#a8a488",
      "500": "#93906d",
      "600": "#585c4c",
      "700": "#46493d",
      "800": "#363830",
      "900": "#2b2a25",
      "950": "#1c1b17",
    },
    earth: {
      "50": "#f4f3ec",
      "300": "#bfbca4",
      "400": "#a8a488",
      "500": "#93906d",
      "600": "#7a7757",
      "700": "#5f5d42",
    },
    indigo: {
      "300": "#9aa6b2",
      "400": "#7a8899",
      "500": "#5f6f80",
      "600": "#4a5a6b",
      "700": "#3a4756",
    },
    clay: {
      "50": "#f7edea",
      "500": "#a3634c",
      "600": "#8a4f3d",
    },
  },

  fonts: {
    display: "var(--font-zen-kaku), ui-sans-serif, system-ui, sans-serif",
    body: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
  },

  commerce: {
    currency: "usd",
    flatShippingCents: 999,
    countries: ["US"],
  },

  // Named here rather than read from SUPABASE_URL/SUPABASE_ANON_KEY in the
  // environment on purpose: those are generic names, and a developer with
  // another Supabase project exported in their shell would otherwise build this
  // site against someone else's database without any warning. It happened.
  data: {
    supabaseUrl: "https://egxtilwjhfhohrhcjgbe.supabase.co",
    supabaseAnonKey:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVneHRpbHdqaGZob2hyaGNqZ2JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxODYzODgsImV4cCI6MjEwMDc2MjM4OH0.Q9SATTl0QmaAX0NrpxntyD3rWSu8tZ258b492v0Sp9w",
  },
};
