import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        "bg-elevated": "var(--color-bg-elevated)",
        text: "var(--color-text)",
        "text-muted": "var(--color-text-muted)",
        accent: "var(--color-accent)",
        "accent-soft": "var(--color-accent-soft)",
        fig: "var(--color-fig)",
        olive: "var(--color-olive)",
        mustard: "var(--color-mustard)",
        burnt: "var(--color-burnt)",
        border: "var(--color-border)",
      },
      fontFamily: {
        display: ['"Cormorant Garamond Variable"', "ui-serif", "Georgia", "serif"],
        sans: ['"Inter Variable"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      maxWidth: {
        prose: "65ch",
        page: "80rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
  },
  plugins: [],
} satisfies Config;
