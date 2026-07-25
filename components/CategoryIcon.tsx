import { Droplet, Jar, Flask } from "@/components/illustrations";
import type { CategorySlug } from "@/lib/i18n";

const ICONS: Record<CategorySlug, typeof Droplet> = {
  bodycare: Droplet,
  remedies: Jar,
  lab: Flask,
};

export function CategoryIcon({
  slug,
  className = "",
}: {
  slug: CategorySlug;
  className?: string;
}) {
  const Icon = ICONS[slug];
  return <Icon className={className} />;
}
