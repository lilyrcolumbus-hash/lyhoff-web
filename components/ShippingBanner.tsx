import { t, type Locale } from "@/lib/i18n";

export function ShippingBanner({ locale }: { locale: Locale }) {
  return (
    <div className="bg-forest-950 py-2 text-center text-xs font-medium text-cream">
      {t(locale).freeShippingBanner}
    </div>
  );
}
