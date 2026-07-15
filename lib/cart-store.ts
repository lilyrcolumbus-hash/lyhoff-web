"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  slug: string;
  name: string;
  price: number;
  size: string;
  image: string;
  quantity: number;
  /** Scent, if this product has one (e.g. "Vanilla") — undefined for products with no scent options. */
  scent?: string;
}

// Two cart lines are "the same item" only if slug AND scent match — a Vanilla and a
// Peppermint jar of the same size must stay as separate lines, not merge quantities.
const sameLine = (a: { slug: string; scent?: string }, b: { slug: string; scent?: string }) =>
  a.slug === b.slug && a.scent === b.scent;

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (slug: string, scent?: string) => void;
  updateQty: (slug: string, quantity: number, scent?: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  total: () => number;
  count: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => sameLine(i, item));
          if (existing) {
            return {
              items: state.items.map((i) =>
                sameLine(i, item) ? { ...i, quantity: i.quantity + quantity } : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity }] };
        }),

      removeItem: (slug, scent) =>
        set((state) => ({ items: state.items.filter((i) => !sameLine(i, { slug, scent })) })),

      updateQty: (slug, quantity, scent) => {
        if (quantity <= 0) {
          get().removeItem(slug, scent);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            sameLine(i, { slug, scent }) ? { ...i, quantity } : i,
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: "lyhoff-cart",
      partialize: (state) => ({ items: state.items }),
      // Rehydrated manually after mount (see CartDrawer) so the first client
      // render matches the server (empty cart) — avoids a hydration mismatch
      // for anyone who already has items in localStorage from a prior visit.
      skipHydration: true,
    },
  ),
);
