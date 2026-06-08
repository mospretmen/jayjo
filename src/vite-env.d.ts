interface ImportMetaEnv {
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string;
  readonly VITE_APP_URL?: string;
  readonly VITE_CATALOG_ADAPTER?: "files" | "sanity" | "neon";
  readonly VITE_PLAUSIBLE_DOMAIN?: string;
  readonly VITE_SANITY_PROJECT_ID?: string;
  readonly VITE_SANITY_DATASET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly glob: <T extends Record<string, unknown>>(
    pattern: string,
    options?: { eager?: boolean },
  ) => Record<string, T>;
}
