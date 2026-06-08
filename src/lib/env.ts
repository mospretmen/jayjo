export const env = {
  STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined,
  APP_URL: (import.meta.env.VITE_APP_URL as string) ?? "http://localhost:5173",
  CATALOG_ADAPTER:
    (import.meta.env.VITE_CATALOG_ADAPTER as "files" | "sanity" | "neon") ?? "files",
  PLAUSIBLE_DOMAIN: import.meta.env.VITE_PLAUSIBLE_DOMAIN as string | undefined,
};
