// Locales, category taxonomy and UI dictionary for the bilingual site.

export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export const otherLocale = (l: Locale): Locale => (l === "en" ? "es" : "en");

// Category slugs are English-based and shared across both languages (one URL per category).
export type CategorySlug =
  | "garden"
  | "food"
  | "bodycare"
  | "remedies";

export interface Category {
  slug: CategorySlug;
  emoji: string;
  label: Record<Locale, string>;
  blurb: Record<Locale, string>;
}

export const categories: Category[] = [
  {
    slug: "garden",
    emoji: "🌱",
    label: { en: "Garden & Plants", es: "Huerto y Plantas" },
    blurb: {
      en: "Growing our own food and herbs, seed to harvest — the start of everything.",
      es: "Cultivamos nuestra comida y hierbas, de la semilla a la cosecha — el inicio de todo.",
    },
  },
  {
    slug: "food",
    emoji: "🍲",
    label: { en: "Homemade Food & Preserving", es: "Comida Casera y Conservas" },
    blurb: {
      en: "What we cook, ferment and preserve (canning) from the garden.",
      es: "Lo que cocinamos, fermentamos y conservamos (canning) de la cosecha.",
    },
  },
  {
    slug: "bodycare",
    emoji: "🧴",
    label: { en: "Skin & Hair Care", es: "Cuidado de Piel y Cabello" },
    blurb: {
      en: "Creams, oils, masks and hair care we make ourselves — no chemicals.",
      es: "Cremas, aceites, mascarillas y cuidado del cabello hechos por nosotros — sin químicos.",
    },
  },
  {
    slug: "remedies",
    emoji: "🌿",
    label: { en: "Herbal Remedies & Extracts", es: "Remedios y Extractos Herbales" },
    blurb: {
      en: "Tinctures, extracts and functional mushrooms (like lion's mane) from our harvest.",
      es: "Tinturas, extractos y hongos funcionales (como lion's mane) de nuestra cosecha.",
    },
  },
];

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

// UI strings (everything outside article bodies).
type Dict = {
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCta: string;
  featured: string;
  browseByTopic: string;
  latest: string;
  readMore: string;
  minRead: string;
  newsletterTitle: string;
  newsletterBody: string;
  emailPlaceholder: string;
  subscribe: string;
  subscribing: string;
  subscribed: string;
  newsletterError: string;
  saveToPinterest: string;
  relatedTitle: string;
  backHome: string;
  allArticles: string;
  inCategory: string;
  noArticles: string;
  aboutTitle: string;
  draftBadge: string;
  navTopics: string;
  navAbout: string;
  footerTagline: string;
  publishedOn: string;
};

export const dictionary: Record<Locale, Dict> = {
  en: {
    tagline: "Homemade. Natural. No chemicals.",
    heroTitle: "Everything we make at home, naturally",
    heroSubtitle:
      "We grow our own food and herbs and turn the harvest into what we actually use — meals, ferments and preserves, and our own skin, hair and herbal care. All organic and handmade, because we'd rather not buy the chemicals on the shelf.",
    heroCta: "Join the list",
    featured: "Start here",
    browseByTopic: "Browse by topic",
    latest: "Latest guides",
    readMore: "Read the guide",
    minRead: "min read",
    newsletterTitle: "Get the weekly homestead notes",
    newsletterBody:
      "One short email a week: something we grew, cooked, fermented or brewed — and how you can too. Natural living, no chemicals, no spam. Unsubscribe anytime.",
    emailPlaceholder: "you@email.com",
    subscribe: "Subscribe",
    subscribing: "Subscribing…",
    subscribed: "You're in! The next issue is headed your way.",
    newsletterError: "Something went wrong. Please try again.",
    saveToPinterest: "Save to Pinterest",
    relatedTitle: "Keep reading",
    backHome: "Back home",
    allArticles: "All guides",
    inCategory: "Guides in",
    noArticles: "New guides are on the way. Subscribe to hear first.",
    aboutTitle: "About SmartGrowth",
    draftBadge: "Draft — pending review",
    navTopics: "Topics",
    navAbout: "About",
    footerTagline: "Practical self-sufficiency, one skill at a time.",
    publishedOn: "Published",
  },
  es: {
    tagline: "Hecho en casa. Natural. Sin químicos.",
    heroTitle: "Todo lo que hacemos en casa, natural",
    heroSubtitle:
      "Cultivamos nuestra propia comida y hierbas, y convertimos la cosecha en lo que de verdad usamos — comida, fermentos y conservas, y nuestro propio cuidado de piel, cabello y remedios. Todo orgánico y hecho a mano, porque preferimos no comprar los químicos del supermercado.",
    heroCta: "Únete a la lista",
    featured: "Empieza aquí",
    browseByTopic: "Explorar por tema",
    latest: "Guías recientes",
    readMore: "Leer la guía",
    minRead: "min de lectura",
    newsletterTitle: "Recibe las notas semanales de la finca",
    newsletterBody:
      "Un correo corto por semana: algo que cultivamos, cocinamos, fermentamos o preparamos — y cómo tú también puedes. Vida natural, sin químicos, sin spam. Cancela cuando quieras.",
    emailPlaceholder: "tu@correo.com",
    subscribe: "Suscribirme",
    subscribing: "Suscribiendo…",
    subscribed: "¡Listo! Te llegará el próximo número.",
    newsletterError: "Algo salió mal. Inténtalo de nuevo.",
    saveToPinterest: "Guardar en Pinterest",
    relatedTitle: "Sigue leyendo",
    backHome: "Volver al inicio",
    allArticles: "Todas las guías",
    inCategory: "Guías en",
    noArticles: "Pronto hay guías nuevas. Suscríbete para enterarte primero.",
    aboutTitle: "Sobre SmartGrowth",
    draftBadge: "Borrador — pendiente de revisión",
    navTopics: "Temas",
    navAbout: "Nosotros",
    footerTagline: "Autosuficiencia práctica, una habilidad a la vez.",
    publishedOn: "Publicado",
  },
};

export const t = (locale: Locale) => dictionary[locale];

// Single source of truth for the production URL (used for SEO/canonical/sitemap).
// Currently the Cloudflare Workers Static Assets URL; swap to the custom domain
// (e.g. https://smartgrowth.farm) when it's connected.
export const SITE_URL = "https://smartgrowth-web.lilyrcolumbus.workers.dev";
export const SITE_NAME = "SmartGrowth";

// Pinterest "Claim your website" verification. In Pinterest (business account) →
// Settings → Claimed accounts → Claim a website → "Add HTML tag", copy ONLY the
// content value of <meta name="p:domain_verify" content="THIS"> and paste it
// here, then redeploy. Empty = nothing rendered. Enables Rich Pins + Pinterest
// analytics for traffic coming from your pins.
export const PINTEREST_DOMAIN_VERIFY = "";
