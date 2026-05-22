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
  | "extracts"
  | "bodycare"
  | "mushrooms"
  | "garden";

export interface Category {
  slug: CategorySlug;
  emoji: string;
  label: Record<Locale, string>;
  blurb: Record<Locale, string>;
}

export const categories: Category[] = [
  {
    slug: "extracts",
    emoji: "🌿",
    label: { en: "Herbal Extracts & Tinctures", es: "Extractos y Tinturas Herbales" },
    blurb: {
      en: "Concentrated plant extracts and tinctures made from our own harvest.",
      es: "Extractos y tinturas concentrados, hechos con nuestra propia cosecha.",
    },
  },
  {
    slug: "bodycare",
    emoji: "🧴",
    label: { en: "Natural Skin & Body Care", es: "Cuidado Natural de Piel y Cuerpo" },
    blurb: {
      en: "Handmade creams, body oils, face masks and sea-salt deodorant — all natural.",
      es: "Cremas, aceites corporales, mascarillas y desodorante de sal marina, hechos a mano.",
    },
  },
  {
    slug: "mushrooms",
    emoji: "🍄",
    label: { en: "Functional Mushrooms", es: "Hongos Funcionales" },
    blurb: {
      en: "Lion's mane and other functional mushrooms — grown, dried, powdered and extracted.",
      es: "Lion's mane y otros hongos funcionales — cultivados, secados, en polvo y extracto.",
    },
  },
  {
    slug: "garden",
    emoji: "🌱",
    label: { en: "Garden & Growing", es: "Huerto y Cultivo" },
    blurb: {
      en: "Growing the plants and ingredients behind everything we make.",
      es: "Cómo cultivamos las plantas e ingredientes detrás de todo lo que hacemos.",
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
    tagline: "Grown by us, made by hand.",
    heroTitle: "Natural remedies & skincare, grown from scratch",
    heroSubtitle:
      "Herbal extracts, handmade skincare and functional mushrooms — made from the plants we grow and harvest ourselves. Natural, organic, nothing synthetic.",
    heroCta: "Join the list",
    featured: "Start here",
    browseByTopic: "Browse by topic",
    latest: "Latest guides",
    readMore: "Read the guide",
    minRead: "min read",
    newsletterTitle: "Get the weekly homestead notes",
    newsletterBody:
      "One short email a week: a remedy or product we made, what's growing right now, and a natural-living tip. No spam, unsubscribe anytime.",
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
    tagline: "Cultivado por nosotros, hecho a mano.",
    heroTitle: "Remedios naturales y cuidado de la piel, desde la raíz",
    heroSubtitle:
      "Extractos herbales, cuidado de la piel hecho a mano y hongos funcionales — hechos con las plantas que cultivamos y cosechamos nosotros mismos. Natural, orgánico, sin nada sintético.",
    heroCta: "Únete a la lista",
    featured: "Empieza aquí",
    browseByTopic: "Explorar por tema",
    latest: "Guías recientes",
    readMore: "Leer la guía",
    minRead: "min de lectura",
    newsletterTitle: "Recibe las notas semanales de la finca",
    newsletterBody:
      "Un correo corto por semana: un remedio o producto que hicimos, qué está creciendo ahora, y un consejo de vida natural. Sin spam, cancela cuando quieras.",
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
