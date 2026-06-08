import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  hasUserChoice: boolean;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "light",
      hasUserChoice: false,
      setTheme: (t) => set({ theme: t, hasUserChoice: true }),
      toggle: () => set({ theme: get().theme === "light" ? "dark" : "light", hasUserChoice: true }),
    }),
    { name: "studio-jayjo-theme" },
  ),
);
