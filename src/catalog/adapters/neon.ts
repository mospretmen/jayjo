import type { CatalogRepository } from "@/catalog/types";

/**
 * Neon adapter — stubbed.
 *
 * To activate: implement these methods against Postgres tables `artworks`,
 * `artwork_variants`, `galleries`, `gallery_items`. Run via Netlify Functions
 * proxy so the client never touches DB credentials. Set VITE_CATALOG_ADAPTER=neon.
 */
export const neonAdapter: CatalogRepository = {
  async listArtworks() {
    throw new Error("Neon adapter not configured.");
  },
  async getArtwork() {
    throw new Error("Neon adapter not configured.");
  },
  async listGalleries() {
    throw new Error("Neon adapter not configured.");
  },
  async getGallery() {
    throw new Error("Neon adapter not configured.");
  },
};
