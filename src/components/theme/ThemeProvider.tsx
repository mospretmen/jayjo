import { useEffect, type ReactNode } from "react";
import { useThemeStore } from "@/store/theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme, hasUserChoice } = useThemeStore();

  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      const effective = hasUserChoice ? theme : mql.matches ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", effective);
    };

    apply();

    if (!hasUserChoice) {
      mql.addEventListener("change", apply);
      return () => mql.removeEventListener("change", apply);
    }
  }, [theme, hasUserChoice]);

  return <>{children}</>;
}
