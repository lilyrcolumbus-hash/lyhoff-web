"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { type Locale } from "@/lib/i18n";
import { LogoMark } from "@/components/illustrations";

interface OrderItem {
  name: string;
  quantity: number;
  amount_total: number;
}

interface Order {
  id: string;
  amount_total: number;
  currency: string;
  items: OrderItem[];
  created_at: string;
}

const money = (cents: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);

export function AccountClient({ locale }: { locale: Locale }) {
  const es = locale === "es";

  const [email, setEmail] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[] | null>(null);
  // null = the newsletter feature isn't available (its migration hasn't been
  // run yet) — the section hides itself rather than showing a broken toggle.
  const [subscribed, setSubscribed] = useState<boolean | null>(null);
  const [savingNewsletter, setSavingNewsletter] = useState(false);

  const goToLogin = useCallback(() => {
    window.location.href = `/${locale}/account/login/`;
  }, [locale]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const me = await fetch("/api/account/me", { credentials: "same-origin" }).catch(() => null);
      if (!me?.ok) {
        goToLogin();
        return;
      }
      const { email: sessionEmail } = (await me.json()) as { email: string };
      if (cancelled) return;
      setEmail(sessionEmail);

      const [ordersRes, newsletterRes] = await Promise.all([
        fetch("/api/account/orders", { credentials: "same-origin" }).catch(() => null),
        fetch("/api/account/newsletter", { credentials: "same-origin" }).catch(() => null),
      ]);
      if (cancelled) return;

      if (ordersRes?.ok) {
        const data = (await ordersRes.json()) as { orders: Order[] };
        setOrders(data.orders ?? []);
      } else {
        setOrders([]);
      }

      if (newsletterRes?.ok) {
        const data = (await newsletterRes.json()) as { subscribed: boolean };
        setSubscribed(data.subscribed);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [goToLogin]);

  async function toggleNewsletter(next: boolean) {
    setSavingNewsletter(true);
    const res = await fetch("/api/account/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ subscribed: next }),
    }).catch(() => null);
    if (res?.ok) setSubscribed(next);
    setSavingNewsletter(false);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => null);
    goToLogin();
  }

  if (!email) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-32 text-center text-sm text-stone-500">
        {es ? "Cargando…" : "Loading…"}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <div className="text-center">
        <LogoMark className="mx-auto h-14 w-14 text-forest-950" textClassName="text-lg" />
        <h1 className="mt-4 font-display text-3xl font-bold text-forest-950">
          {es ? "Tu cuenta" : "Your account"}
        </h1>
        <p className="mt-2 text-sm text-stone-600">{email}</p>
      </div>

      <section className="mt-12 border-t border-stone-200 pt-10">
        <h2 className="font-display text-xl font-bold text-forest-950">
          {es ? "Tus pedidos" : "Your orders"}
        </h2>

        {orders === null ? (
          <p className="mt-4 text-sm text-stone-500">{es ? "Cargando…" : "Loading…"}</p>
        ) : orders.length === 0 ? (
          <div className="mt-4 rounded-sm border border-stone-200 bg-cream/60 px-5 py-6 backdrop-blur-xl">
            <p className="text-sm text-stone-600">
              {es
                ? "Todavía no hay pedidos con este email."
                : "No orders yet under this email."}
            </p>
            {/* Said plainly rather than left as a mystery: someone who bought on
                Etsy or TikTok Shop will otherwise assume this page is broken. */}
            <p className="mt-2 text-xs text-stone-500">
              {es
                ? "Aquí solo aparecen los pedidos hechos en lyhoff.com. Las compras por Etsy o TikTok Shop se consultan en esas plataformas."
                : "Only orders placed on lyhoff.com show up here. Etsy or TikTok Shop purchases live on those platforms."}
            </p>
            <Link
              href={`/${locale}/products/`}
              className="mt-5 inline-flex items-center rounded-sm bg-forest-950 px-6 py-3 text-sm font-semibold text-cream transition hover:bg-forest-800"
            >
              {es ? "Ver productos" : "Shop now"} →
            </Link>
          </div>
        ) : (
          <ul className="mt-4 flex flex-col gap-4">
            {orders.map((order) => (
              <li
                key={order.id}
                className="rounded-sm border border-stone-200 bg-cream/60 px-5 py-4 backdrop-blur-xl"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm font-medium text-forest-950">
                    {new Date(order.created_at).toLocaleDateString(es ? "es-US" : "en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span className="font-display text-base font-bold text-forest-950">
                    {money(order.amount_total, order.currency)}
                  </span>
                </div>
                {order.items.length > 0 && (
                  <ul className="mt-3 flex flex-col gap-1 border-t border-stone-200 pt-3">
                    {order.items.map((item, index) => (
                      <li key={index} className="flex justify-between gap-4 text-sm text-stone-600">
                        <span>
                          {item.quantity} × {item.name}
                        </span>
                        <span className="shrink-0">{money(item.amount_total, order.currency)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {subscribed !== null && (
        <section className="mt-10 border-t border-stone-200 pt-10">
          <h2 className="font-display text-xl font-bold text-forest-950">
            {es ? "Newsletter" : "Newsletter"}
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            {subscribed
              ? es
                ? "Estás suscrito. Te escribimos solo cuando tenemos algo real que contar."
                : "You're subscribed. We only write when we have something real to say."
              : es
                ? "No estás suscrito."
                : "You're not subscribed."}
          </p>
          <button
            type="button"
            onClick={() => toggleNewsletter(!subscribed)}
            disabled={savingNewsletter}
            className="mt-4 rounded-sm border border-forest-300 px-6 py-3 text-sm font-semibold text-forest-800 transition hover:bg-forest-50 disabled:opacity-60"
          >
            {savingNewsletter
              ? es
                ? "Guardando…"
                : "Saving…"
              : subscribed
                ? es
                  ? "Darme de baja"
                  : "Unsubscribe"
                : es
                  ? "Suscribirme"
                  : "Subscribe"}
          </button>
        </section>
      )}

      <div className="mt-12 flex items-center justify-between border-t border-stone-200 pt-8 text-sm">
        <Link href={`/${locale}/products/`} className="text-stone-500 underline underline-offset-4 hover:text-forest-800">
          {es ? "← Volver a la tienda" : "← Back to the shop"}
        </Link>
        <button
          type="button"
          onClick={logout}
          className="text-stone-500 underline underline-offset-4 hover:text-forest-800"
        >
          {es ? "Cerrar sesión" : "Sign out"}
        </button>
      </div>
    </div>
  );
}
