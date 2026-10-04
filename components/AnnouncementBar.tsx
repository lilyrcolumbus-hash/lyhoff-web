import type { Locale } from "@/lib/i18n";

export function AnnouncementBar({ locale }: { locale: Locale }) {
  return (
    <div className="bg-forest-950 py-2 text-center text-xs font-medium text-cream">
      {locale === "es"
        ? "Demo de portafolio — el pago real está desactivado. Admin: "
        : "Portfolio demo — real checkout is switched off. Admin: "}
      <a href="/admin/" className="font-bold tracking-wide underline underline-offset-2">
        lyhoff.com/admin
      </a>
    </div>
  );
}
