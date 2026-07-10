import type { MetadataRoute } from "next";
import { categories, locales, SITE_URL } from "@/lib/i18n";
import { getSlugs } from "@/lib/content";
import { activeProducts } from "@/lib/products";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = getSlugs();
  const paths: string[] = [
    "",
    "topics/",
    "about/",
    "products/",
    "ingredients/",
    "quiz/",
    ...categories.map((c) => `category/${c.slug}/`),
    ...slugs.map((s) => `articles/${s}/`),
    ...activeProducts.map((p) => `products/${p.slug}/`),
  ];

  return locales.flatMap((lang) =>
    paths.map((p) => ({
      url: `${SITE_URL}/${lang}/${p}`,
      changeFrequency: "weekly" as const,
      priority: p === "" ? 1 : 0.7,
      alternates: {
        languages: {
          en: `${SITE_URL}/en/${p}`,
          es: `${SITE_URL}/es/${p}`,
        },
      },
    })),
  );
}
