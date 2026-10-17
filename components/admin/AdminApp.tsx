"use client";

import { useCallback, useEffect, useState } from "react";
import { LogoMark } from "@/components/illustrations";
import { AdminLogin } from "./AdminLogin";
import { ProductsSection } from "./ProductsSection";
import { OrdersSection } from "./OrdersSection";
import { ReviewsSection } from "./ReviewsSection";
import { CustomersSection } from "./CustomersSection";
import { BrandSection } from "./BrandSection";
import { AbandonedSection } from "./AbandonedSection";
import { CategoriesSection } from "./CategoriesSection";
import { ContentSection } from "./ContentSection";
import { DiscountsSection } from "./DiscountsSection";
import { HomeSection } from "./HomeSection";
import { NavigationSection } from "./NavigationSection";
import { PagesSection } from "./PagesSection";
import { PreferencesSection } from "./PreferencesSection";
import { ComingSection } from "./ComingSection";
import { PublishBar } from "./PublishBar";
import { site } from "@/site.config";
import { DEMO_ADMIN_EMAIL } from "@/lib/demo";

export type SectionId =
  | "home"
  | "orders"
  | "abandoned"
  | "products"
  | "categories"
  | "customers"
  | "reviews"
  | "content"
  | "pages"
  | "navigation"
  | "brand"
  | "discounts"
  | "preferences";

// Ordered the way a shop owner works, which is also roughly Shopify's order:
// what happened today, then what to ship, then what you sell, then who bought,
// then the storefront itself, then settings.
const NAV: { group: string; items: { id: SectionId; label: string }[] }[] = [
  {
    group: "Store",
    items: [
      { id: "home", label: "Home" },
      { id: "orders", label: "Orders" },
      { id: "abandoned", label: "Abandoned" },
      { id: "products", label: "Products" },
      { id: "categories", label: "Categories" },
      { id: "customers", label: "Customers" },
      { id: "reviews", label: "Reviews" },
    ],
  },
  {
    group: "Online store",
    items: [
      { id: "pages", label: "Pages" },
      { id: "content", label: "Content" },
      { id: "navigation", label: "Navigation" },
      { id: "brand", label: "Brand & style" },
    ],
  },
  {
    group: "Settings",
    items: [
      { id: "discounts", label: "Discounts" },
      { id: "preferences", label: "Preferences" },
    ],
  },
];

type Gate = "checking" | "anonymous" | "notAdmin" | "ready";

export function AdminApp() {
  const [gate, setGate] = useState<Gate>("checking");
  const [email, setEmail] = useState("");
  const [section, setSection] = useState<SectionId>("home");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [menuOpen, setMenuOpen] = useState(false);

  const check = useCallback(async () => {
    const res = await fetch("/api/admin/me", { credentials: "same-origin" }).catch(() => null);
    if (!res || res.status === 401) return setGate("anonymous");
    if (res.status === 403) {
      const data = (await res.json().catch(() => ({}))) as { email?: string };
      setEmail(data.email ?? "");
      return setGate("notAdmin");
    }
    const data = (await res.json()) as { email: string };
    setEmail(data.email);
    setGate("ready");
  }, []);

  useEffect(() => {
    void check();
  }, [check]);

  // Counts live here so the sidebar can show them without each section
  // re-fetching on every navigation.
  const reportCount = useCallback((key: string, value: number) => {
    setCounts((current) => (current[key] === value ? current : { ...current, [key]: value }));
  }, []);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => null);
    window.location.reload();
  }

  if (gate === "checking") {
    return <p className="p-16 text-center text-sm text-stone-500">Loading…</p>;
  }

  if (gate === "anonymous") return <AdminLogin onSignedIn={check} />;

  if (gate === "notAdmin") {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <LogoMark className="mx-auto h-14 w-14 text-forest-950" textClassName="text-lg" />
        <h1 className="mt-4 font-display text-2xl font-bold text-forest-950">
          This account doesn't manage the store
        </h1>
        <p className="mt-3 text-sm text-stone-600">
          You're signed in as <span className="font-medium text-forest-950">{email}</span>.
        </p>
        <button
          type="button"
          onClick={signOut}
          className="mt-8 rounded-sm bg-forest-950 px-6 py-3 text-sm font-semibold text-cream hover:bg-forest-800"
        >
          Sign in with another account
        </button>
      </div>
    );
  }

  const current = NAV.flatMap((g) => g.items).find((i) => i.id === section);

  return (
    <div className="sm:grid sm:min-h-screen sm:grid-cols-[200px_1fr] lg:grid-cols-[216px_1fr]">
      <aside className="border-b border-stone-200 bg-white sm:border-b-0 sm:border-r">
        <div className="flex items-center gap-2.5 px-4 py-4">
          <LogoMark className="h-7 w-7 text-forest-950" textClassName="text-[9px]" />
          <span className="font-display text-[13px] text-forest-950" style={{ letterSpacing: "0.18em" }}>
            {site.name}
          </span>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="ml-auto text-[13px] font-medium text-stone-500 sm:hidden"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>

        <nav className={`${menuOpen ? "block" : "hidden"} pb-4 sm:block`}>
          {NAV.map((group) => (
            <div key={group.group} className="mb-4">
              <p className="px-4 pb-1.5 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                {group.group}
              </p>
              {group.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSection(item.id);
                    setMenuOpen(false);
                  }}
                  aria-current={section === item.id}
                  className={`flex w-full items-center gap-2 border-l-2 px-4 py-1.5 text-left text-[13.5px] transition ${
                    section === item.id
                      ? "border-earth-500 bg-earth-50 font-semibold text-forest-950"
                      : "border-transparent text-stone-600 hover:bg-stone-50 hover:text-forest-950"
                  }`}
                >
                  {item.label}
                  {counts[item.id] !== undefined && (
                    <span className="ml-auto text-[11px] tabular-nums text-stone-400">
                      {counts[item.id]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}

          <div className="mt-2 border-t border-stone-200 px-4 pt-3">
            <p className="truncate text-[11px] text-stone-500">{email}</p>
            <button
              type="button"
              onClick={signOut}
              className="mt-1 text-[12px] text-stone-500 underline underline-offset-2 hover:text-forest-950"
            >
              Sign out
            </button>
          </div>
        </nav>
      </aside>

      <main className="min-w-0 px-4 py-6 sm:px-6">
        {email.toLowerCase() === DEMO_ADMIN_EMAIL && (
          <p className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 border border-stone-200 bg-white px-4 py-3 text-[13px] text-stone-600">
            <span>
              <span className="font-medium text-forest-950">Public demo.</span> Edit a product,
              page or setting and it really saves — publishing, refunds and anything that costs
              real money stay switched off.
            </span>
            <DemoRestoreButton />
          </p>
        )}
        <PublishBar />
        <h1 className="mb-5 font-display text-xl font-bold text-forest-950">{current?.label}</h1>

        {section === "home" && <HomeSection onGo={setSection} />}
        {section === "products" && <ProductsSection reportCount={reportCount} />}
        {section === "categories" && <CategoriesSection reportCount={reportCount} />}
        {section === "orders" && <OrdersSection reportCount={reportCount} />}
        {section === "abandoned" && <AbandonedSection reportCount={reportCount} />}
        {section === "reviews" && <ReviewsSection reportCount={reportCount} />}
        {section === "customers" && <CustomersSection reportCount={reportCount} />}
        {section === "brand" && <BrandSection />}
        {section === "pages" && <PagesSection reportCount={reportCount} />}
        {section === "content" && <ContentSection />}
        {section === "navigation" && <NavigationSection />}
        {section === "discounts" && <DiscountsSection />}
        {section === "preferences" && <PreferencesSection />}
      </main>
    </div>
  );
}

/**
 * Puts the demo catalogue back the way it really is, in one click — so
 * whatever a visitor just tried is never something the next one has to live
 * with. Only products are restored today; see `handleAdminDemoRestore` in
 * `worker.ts` for why pages/settings aren't included yet.
 */
function DemoRestoreButton() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function restore() {
    if (busy) return;
    setBusy(true);
    setMessage("");
    const res = await fetch("/api/admin/demo-restore", {
      method: "POST",
      credentials: "same-origin",
    }).catch(() => null);
    setBusy(false);
    setMessage(res?.ok ? "Back to the real catalogue." : "Couldn't restore it — try again in a moment.");
  }

  return (
    <span className="inline-flex shrink-0 items-center gap-2">
      <button
        type="button"
        onClick={restore}
        disabled={busy}
        className="text-[12.5px] font-semibold text-indigo-600 underline underline-offset-2 hover:text-forest-950 disabled:opacity-50"
      >
        {busy ? "Restoring…" : "Restore demo data"}
      </button>
      {message && <span className="text-[12px] text-stone-500">{message}</span>}
    </span>
  );
}
