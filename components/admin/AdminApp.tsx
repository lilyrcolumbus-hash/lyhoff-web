"use client";

import { useCallback, useEffect, useState } from "react";
import { LogoMark } from "@/components/illustrations";
import { AdminLogin } from "./AdminLogin";
import { ProductsSection } from "./ProductsSection";
import { OrdersSection } from "./OrdersSection";
import { ReviewsSection } from "./ReviewsSection";
import { CustomersSection } from "./CustomersSection";
import { BrandSection } from "./BrandSection";
import { DiscountsSection } from "./DiscountsSection";
import { HomeSection } from "./HomeSection";
import { PreferencesSection } from "./PreferencesSection";
import { ComingSection } from "./ComingSection";
import { PublishBar } from "./PublishBar";

export type SectionId =
  | "home"
  | "orders"
  | "products"
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
      { id: "products", label: "Products" },
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
    <div className="lg:grid lg:min-h-screen lg:grid-cols-[216px_1fr]">
      <aside className="border-b border-stone-200 bg-white lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-2.5 px-4 py-4">
          <LogoMark className="h-7 w-7 text-forest-950" textClassName="text-[9px]" />
          <span className="font-display text-[13px] text-forest-950" style={{ letterSpacing: "0.18em" }}>
            LYHOFF
          </span>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="ml-auto text-[13px] font-medium text-stone-500 lg:hidden"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>

        <nav className={`${menuOpen ? "block" : "hidden"} pb-4 lg:block`}>
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
        <PublishBar />
        <h1 className="mb-5 font-display text-xl font-bold text-forest-950">{current?.label}</h1>

        {section === "home" && <HomeSection onGo={setSection} />}
        {section === "products" && <ProductsSection reportCount={reportCount} />}
        {section === "orders" && <OrdersSection reportCount={reportCount} />}
        {section === "reviews" && <ReviewsSection reportCount={reportCount} />}
        {section === "customers" && <CustomersSection reportCount={reportCount} />}
        {section === "brand" && <BrandSection />}
        {section === "pages" && (
          <ComingSection
            title="Pages"
            what="Create new pages and compose them from blocks: full-bleed video, product grid, text with photo, FAQ."
            why="Needs a pages table and a block renderer on the public site. The next large piece after Publish."
          />
        )}
        {section === "content" && (
          <ComingSection
            title="Content"
            what="The ~200 strings the storefront is written in: navigation, footer, categories, buttons, messages."
            why="They live in lib/i18n.ts today. Moving them to the database is mechanical but touches every page, so it follows Publish."
          />
        )}
        {section === "navigation" && (
          <ComingSection
            title="Navigation"
            what="What appears in the header and footer, and in what order."
            why="Depends on content being in the database — a menu is text with links attached."
          />
        )}
        {section === "discounts" && <DiscountsSection />}
        {section === "preferences" && <PreferencesSection />}
      </main>
    </div>
  );
}
