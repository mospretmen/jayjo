/**
 * Static catalog adapter — works in any JS runtime (Node, Deno, Edge, browser).
 *
 * Uses explicit static imports instead of `import.meta.glob` so it bundles
 * correctly for Netlify Functions (esbuild does not implement Vite's glob).
 * Every new artwork/gallery file must be registered here.
 */
import type { Artwork, ArtworkFilter, CatalogRepository, Gallery } from "../types";

import { artwork as eveningFig } from "../../content/artworks/evening-fig";
import { artwork as oliveGrove } from "../../content/artworks/olive-grove";
import { artwork as cognacStill } from "../../content/artworks/cognac-still";
import { artwork as parchmentBloom } from "../../content/artworks/parchment-bloom";

import { gallery as warmStudy } from "../../content/galleries/warm-study";
import { gallery as duskArrangement } from "../../content/galleries/dusk-arrangement";

const allArtworks: Artwork[] = [eveningFig, oliveGrove, cognacStill, parchmentBloom]
  .filter((a) => a.published)
  .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

const allGalleries: Gallery[] = [warmStudy, duskArrangement]
  .filter((g) => g.published)
  .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

function matches(a: Artwork, f: ArtworkFilter): boolean {
  if (f.kind && a.kind !== f.kind) return false;
  if (f.colorTags?.length && !f.colorTags.some((t) => a.colorTags.includes(t))) return false;
  if (f.sizeTags?.length && !f.sizeTags.some((t) => a.sizeTags.includes(t))) return false;
  if (f.query) {
    const q = f.query.toLowerCase();
    if (!a.title.toLowerCase().includes(q) && !a.description.toLowerCase().includes(q)) return false;
  }
  if (f.inStock) {
    const inStock = a.variants.some((v) => v.stock === undefined || v.stock > 0);
    if (!inStock) return false;
  }
  if (f.priceMin !== undefined && Math.min(...a.variants.map((v) => v.priceCents)) < f.priceMin)
    return false;
  if (f.priceMax !== undefined && Math.max(...a.variants.map((v) => v.priceCents)) > f.priceMax)
    return false;
  return true;
}

export const staticAdapter: CatalogRepository = {
  async listArtworks(filter) {
    if (!filter) return allArtworks;
    return allArtworks.filter((a) => matches(a, filter));
  },
  async getArtwork(slug) {
    return allArtworks.find((a) => a.slug === slug) ?? null;
  },
  async listGalleries() {
    return allGalleries;
  },
  async getGallery(slug) {
    return allGalleries.find((g) => g.slug === slug) ?? null;
  },
};
