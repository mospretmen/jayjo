import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "studio-jayjo-theme";

interface ThemeState {
  theme: Theme;
  hasUserChoice: boolean;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "light",
      hasUserChoice: false,
      setTheme: (t) => set({ theme: t, hasUserChoice: true }),
      toggle: () =>
        set((s) => ({
          theme: s.theme === "light" ? "dark" : "light",
          hasUserChoice: true,
        })),
    }),
    { name: THEME_STORAGE_KEY },
  ),
);
