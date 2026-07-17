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
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (slug: string) => void;
  updateQty: (slug: string, quantity: number) => void;
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
          const existing = state.items.find((i) => i.slug === item.slug);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.slug === item.slug ? { ...i, quantity: i.quantity + quantity } : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity }] };
        }),

      removeItem: (slug) =>
        set((state) => ({ items: state.items.filter((i) => i.slug !== slug) })),

      updateQty: (slug, quantity) => {
        if (quantity <= 0) {
          get().removeItem(slug);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => (i.slug === slug ? { ...i, quantity } : i)),
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
