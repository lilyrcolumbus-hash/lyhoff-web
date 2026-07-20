import type { Locale } from "@/lib/i18n";

const CODE = "WELCOME10";

export function AnnouncementBar({ locale }: { locale: Locale }) {
  return (
    <div className="bg-forest-950 py-2 text-center text-xs font-medium text-cream">
      {locale === "es" ? "10% de descuento en tu primera compra — código " : "10% off your first order — code "}
      <span className="font-bold tracking-widest">{CODE}</span>
    </div>
  );
}
