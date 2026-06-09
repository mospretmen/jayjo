import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/store/theme";
import { cn } from "@/lib/cn";

interface ThemeToggleProps {
  transparent?: boolean;
}

export function ThemeToggle({ transparent = false }: ThemeToggleProps) {
  const { theme, toggle } = useThemeStore();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDark}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full outline-none transition focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
        transparent
          ? "text-bg/85 hover:bg-bg/15 hover:text-bg focus-visible:ring-offset-transparent"
          : "text-text-muted hover:bg-bg-elevated hover:text-text focus-visible:ring-offset-bg",
      )}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
