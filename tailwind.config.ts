import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Each token is an RGB triple defined in tokens.css; <alpha-value>
        // lets Tailwind compose opacity modifiers (e.g. bg-bg/80).
        bg: "rgb(var(--color-bg-rgb) / <alpha-value>)",
        "bg-elevated": "rgb(var(--color-bg-elevated-rgb) / <alpha-value>)",
        text: "rgb(var(--color-text-rgb) / <alpha-value>)",
        "text-muted": "rgb(var(--color-text-muted-rgb) / <alpha-value>)",
        accent: "rgb(var(--color-accent-rgb) / <alpha-value>)",
        "accent-soft": "rgb(var(--color-accent-soft-rgb) / <alpha-value>)",
        fig: "rgb(var(--color-fig-rgb) / <alpha-value>)",
        olive: "rgb(var(--color-olive-rgb) / <alpha-value>)",
        mustard: "rgb(var(--color-mustard-rgb) / <alpha-value>)",
        burnt: "rgb(var(--color-burnt-rgb) / <alpha-value>)",
        border: "rgb(var(--color-border-rgb) / 0.12)",
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
