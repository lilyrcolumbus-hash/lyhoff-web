import { FREE_SHIPPING_THRESHOLD_CENTS } from "@/lib/shipping";
import { t, type Locale } from "@/lib/i18n";

export function FreeShippingProgress({
  subtotal,
  locale,
}: {
  subtotal: number;
  locale: Locale;
}) {
  const thresholdDollars = FREE_SHIPPING_THRESHOLD_CENTS / 100;
  const remaining = Math.max(0, thresholdDollars - subtotal);
  const pct = Math.min(100, (subtotal / thresholdDollars) * 100);
  const unlocked = remaining === 0;

  return (
    <div className="mb-4">
      <p className="text-xs font-medium text-stone-600">
        {unlocked
          ? t(locale).freeShippingUnlocked
          : locale === "en"
            ? `Add $${remaining.toFixed(2)} more for free shipping`
            : `Añade $${remaining.toFixed(2)} más para envío gratis`}
      </p>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
        <div
          className="h-full rounded-full bg-earth-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
