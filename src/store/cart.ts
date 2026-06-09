import { create } from "zustand";
import { persist } from "zustand/middleware";

export const CART_STORAGE_KEY = "studio-jayjo-cart";

export interface CartLine {
  kind: "artwork" | "gallery";
  slug: string;
  variantId?: string;
  quantity: number;
}

type LineKey = Pick<CartLine, "kind" | "slug" | "variantId">;

function sameLine(a: LineKey, b: LineKey): boolean {
  return a.kind === b.kind && a.slug === b.slug && (a.variantId ?? "") === (b.variantId ?? "");
}

interface CartState {
  items: CartLine[];
  add: (key: LineKey) => void;
  remove: (key: LineKey) => void;
  setQuantity: (key: LineKey, quantity: number) => void;
  clear: () => void;
  itemCount: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (key) =>
        set((s) => {
          const existing = s.items.find((i) => sameLine(i, key));
          if (existing) {
            return {
              items: s.items.map((i) => (sameLine(i, key) ? { ...i, quantity: i.quantity + 1 } : i)),
            };
          }
          return { items: [...s.items, { ...key, quantity: 1 }] };
        }),
      remove: (key) => set((s) => ({ items: s.items.filter((i) => !sameLine(i, key)) })),
      setQuantity: (key, quantity) =>
        set((s) => {
          if (quantity <= 0) return { items: s.items.filter((i) => !sameLine(i, key)) };
          return {
            items: s.items.map((i) => (sameLine(i, key) ? { ...i, quantity } : i)),
          };
        }),
      clear: () => set({ items: [] }),
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: CART_STORAGE_KEY },
  ),
);
