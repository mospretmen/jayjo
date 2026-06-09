import { useEffect, type ReactNode } from "react";
import { useThemeStore } from "@/store/theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme, hasUserChoice } = useThemeStore();

  useEffect(() => {
    // Always default to light. Only an explicit user toggle (via ThemeToggle)
    // promotes hasUserChoice to true and applies the persisted theme. System
    // preference is intentionally ignored — per product brief, default is light.
    const effective = hasUserChoice ? theme : "light";
    document.documentElement.setAttribute("data-theme", effective);
  }, [theme, hasUserChoice]);

  return <>{children}</>;
}
