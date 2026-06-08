import { useEffect, type ReactNode } from "react";
import { useThemeStore } from "@/store/theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme, hasUserChoice, setTheme } = useThemeStore();

  useEffect(() => {
    if (!hasUserChoice) {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        document.documentElement.setAttribute("data-theme", "dark");
        useThemeStore.setState({ theme: "dark", hasUserChoice: false });
        return;
      }
    }
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme, hasUserChoice, setTheme]);

  return <>{children}</>;
}
