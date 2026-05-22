import Link from "next/link";
import { categories, t, type Locale } from "@/lib/i18n";

export function Footer({ locale }: { locale: Locale }) {
  const dict = t(locale);
  return (
    <footer className="mt-16 border-t border-stone-200 bg-forest-950 text-stone-200">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 font-display text-xl font-semibold text-cream">
              <span aria-hidden>🌱</span> SmartGrowth
            </div>
            <p className="mt-2 text-sm text-stone-400">{dict.footerTagline}</p>
          </div>

          <div>
            <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-stone-400">
              {dict.browseByTopic}
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/${locale}/category/${c.slug}/`}
                    className="text-stone-300 hover:text-cream"
                  >
                    {c.emoji} {c.label[locale]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-forest-800 pt-6 text-xs text-stone-500 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} SmartGrowth</span>
          <Link href={`/${locale}/about/`} className="hover:text-cream">
            {dict.navAbout}
          </Link>
        </div>
      </div>
    </footer>
  );
}
