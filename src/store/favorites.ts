import { create } from "zustand";
import { persist } from "zustand/middleware";

export const FAVORITES_STORAGE_KEY = "studio-jayjo-favorites";

interface FavoritesState {
  slugs: string[];
  toggle: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
  mergeSlugs: (incoming: string[]) => void;
  clear: () => void;
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      slugs: [],
      toggle: (slug) =>
        set((s) =>
          s.slugs.includes(slug)
            ? { slugs: s.slugs.filter((x) => x !== slug) }
            : { slugs: [...s.slugs, slug] },
        ),
      isFavorite: (slug) => get().slugs.includes(slug),
      mergeSlugs: (incoming) =>
        set((s) => ({ slugs: Array.from(new Set([...s.slugs, ...incoming])) })),
      clear: () => set({ slugs: [] }),
    }),
    { name: FAVORITES_STORAGE_KEY },
  ),
);
