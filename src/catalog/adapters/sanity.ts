import type { CatalogRepository } from "@/catalog/types";

/**
 * Sanity adapter — stubbed.
 *
 * To activate:
 *   1. Install: npm i @sanity/client
 *   2. Set VITE_SANITY_PROJECT_ID, VITE_SANITY_DATASET in your env.
 *   3. Replace each method below with GROQ queries that return the same shapes.
 *   4. Set VITE_CATALOG_ADAPTER=sanity and redeploy.
 *
 * The CatalogRepository interface is the contract; nothing else in the app
 * changes when you swap adapters.
 */
export const sanityAdapter: CatalogRepository = {
  async listArtworks() {
    throw new Error(
      "Sanity adapter not configured. Set VITE_CATALOG_ADAPTER=files or wire up Sanity.",
    );
  },
  async getArtwork() {
    throw new Error("Sanity adapter not configured.");
  },
  async listGalleries() {
    throw new Error("Sanity adapter not configured.");
  },
  async getGallery() {
    throw new Error("Sanity adapter not configured.");
  },
};
