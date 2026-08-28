// Locales, category taxonomy and UI dictionary for the bilingual site.

export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export const otherLocale = (l: Locale): Locale => (l === "en" ? "es" : "en");

// Category slugs are English-based and shared across both languages (one URL per category).
// Only categories with real products behind them are shown — "garden"/"food" were dropped
// (2026-07-23) since nothing is sold in those lines yet.
export type CategorySlug =
  | "bodycare"
  | "remedies"
  | "lab";

export interface Category {
  slug: CategorySlug;
  emoji: string;
  label: Record<Locale, string>;
  blurb: Record<Locale, string>;
}

export const categories: Category[] = [
  {
    slug: "bodycare",
    emoji: "🌸",
    label: { en: "Skin & Hair", es: "Piel y Cabello" },
    blurb: {
      en: "Natural care, free of synthetic chemicals.",
      es: "Cuidado natural, libre de químicos sintéticos.",
    },
  },
  {
    slug: "remedies",
    emoji: "🌿",
    label: { en: "Herbal Remedies", es: "Remedios Herbales" },
    blurb: {
      en: "Plant-based remedies and extracts.",
      es: "Remedios y extractos a base de plantas.",
    },
  },
  {
    slug: "lab",
    emoji: "🧪",
    label: { en: "Wellness", es: "Salud" },
    blurb: {
      en: "Precision formulas from HOFF, made in our own professional lab.",
      es: "Fórmulas de precisión de HOFF, hechas en nuestro propio laboratorio profesional.",
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
  shopAll: string;
  featuredProducts: string;
  ourProcess: string;
  cartTitle: string;
  cartEmpty: string;
  cartSubtotal: string;
  cartRemove: string;
  cartCheckout: string;
  cartCheckingOut: string;
  cartError: string;
  cartSoldOut: string;
  addToBag: string;
  soldOut: string;
  lastOne: string;
  onlyLeft: string;
  viewCart: string;
  freeShippingUnlocked: string;
};

export const dictionary: Record<Locale, Dict> = {
  en: {
    tagline: "Pure. Natural. Chemical-free.",
    heroTitle: "Nothing synthetic. Nothing to hide.",
    heroSubtitle:
      "The confidence of knowing exactly what's in every jar — grown with care, made in our own professional lab, tested on ourselves before anyone else.",
    heroCta: "Join the list",
    featured: "Start here",
    browseByTopic: "Browse by topic",
    latest: "Latest guides",
    readMore: "Read the guide",
    minRead: "min read",
    newsletterTitle: "Join our journal",
    newsletterBody:
      "What's growing, what we're creating, and a little natural-living inspiration. No chemicals, no spam. Unsubscribe anytime.",
    emailPlaceholder: "you@email.com",
    subscribe: "Subscribe",
    subscribing: "Subscribing…",
    subscribed: "You're on the list — thanks for joining.",
    newsletterError: "Something went wrong. Please try again.",
    saveToPinterest: "Save to Pinterest",
    relatedTitle: "Keep reading",
    backHome: "Back home",
    allArticles: "All guides",
    inCategory: "Guides in",
    noArticles: "New guides are on the way. Subscribe to hear first.",
    aboutTitle: "About",
    draftBadge: "Draft — pending review",
    navTopics: "Topics",
    navAbout: "About",
    footerTagline: "Natural, organic, chemical-free.",
    publishedOn: "Published",
    shopAll: "Shop all",
    featuredProducts: "Featured products",
    ourProcess: "How we make it",
    cartTitle: "Your bag",
    cartEmpty: "Your bag is empty.",
    cartSubtotal: "Subtotal",
    cartRemove: "Remove",
    cartCheckout: "Checkout",
    cartCheckingOut: "Redirecting to checkout…",
    cartError: "Something went wrong. Please try again.",
    cartSoldOut: "Something in your bag just sold out. Remove it and try again.",
    addToBag: "Add to bag",
    soldOut: "Sold out",
    lastOne: "Last one",
    onlyLeft: "Only {n} left",
    viewCart: "View bag",
    freeShippingUnlocked: "🎉 You've unlocked free shipping!",
  },
  es: {
    tagline: "Puro. Natural. Sin químicos.",
    heroTitle: "Nada sintético. Nada que ocultar.",
    heroSubtitle:
      "La tranquilidad de saber exactamente qué hay en cada frasco — cultivado con cuidado, hecho en nuestro propio laboratorio profesional, probado en nosotros antes que en nadie más.",
    heroCta: "Únete a la lista",
    featured: "Empieza aquí",
    browseByTopic: "Explorar por tema",
    latest: "Guías recientes",
    readMore: "Leer la guía",
    minRead: "min de lectura",
    newsletterTitle: "Únete a nuestro diario",
    newsletterBody:
      "Qué está creciendo, qué estamos creando, y un poco de inspiración para una vida natural. Sin químicos, sin spam. Cancela cuando quieras.",
    emailPlaceholder: "tu@correo.com",
    subscribe: "Suscribirme",
    subscribing: "Suscribiendo…",
    subscribed: "Ya estás en la lista — gracias por unirte.",
    newsletterError: "Algo salió mal. Inténtalo de nuevo.",
    saveToPinterest: "Guardar en Pinterest",
    relatedTitle: "Sigue leyendo",
    backHome: "Volver al inicio",
    allArticles: "Todas las guías",
    inCategory: "Guías en",
    noArticles: "Pronto hay guías nuevas. Suscríbete para enterarte primero.",
    aboutTitle: "Sobre nosotros",
    draftBadge: "Borrador — pendiente de revisión",
    navTopics: "Temas",
    navAbout: "Nosotros",
    footerTagline: "Natural, orgánico, sin químicos.",
    publishedOn: "Publicado",
    shopAll: "Ver toda la tienda",
    featuredProducts: "Productos destacados",
    ourProcess: "Cómo lo hacemos",
    cartTitle: "Tu bolsa",
    cartEmpty: "Tu bolsa está vacía.",
    cartSubtotal: "Subtotal",
    cartRemove: "Quitar",
    cartCheckout: "Pagar",
    cartCheckingOut: "Redirigiendo al pago…",
    cartError: "Algo salió mal. Inténtalo de nuevo.",
    cartSoldOut: "Algo de tu bolsa acaba de agotarse. Quítalo e inténtalo de nuevo.",
    addToBag: "Añadir a la bolsa",
    soldOut: "Agotado",
    lastOne: "Queda una",
    onlyLeft: "Quedan {n}",
    viewCart: "Ver bolsa",
    freeShippingUnlocked: "🎉 ¡Desbloqueaste envío gratis!",
  },
};

export const t = (locale: Locale) => dictionary[locale];

// Single source of truth for the production URL (used for SEO/canonical/sitemap).
// Currently the Cloudflare Workers Static Assets URL; swap to the custom domain
// (e.g. https://smartgrowth.farm) when it's connected.
export const SITE_URL = "https://lyhoff.com";
export const SITE_NAME = "LYHOFF";

// Pinterest "Claim your website" verification. In Pinterest (business account) →
// Settings → Claimed accounts → Claim a website → "Add HTML tag", copy ONLY the
// content value of <meta name="p:domain_verify" content="THIS"> and paste it
// here, then redeploy. Empty = nothing rendered. Enables Rich Pins + Pinterest
// analytics for traffic coming from your pins.
export const PINTEREST_DOMAIN_VERIFY = "";
