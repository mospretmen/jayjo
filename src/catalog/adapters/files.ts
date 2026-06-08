import type { Artwork, ArtworkFilter, CatalogRepository, Gallery } from "@/catalog/types";

const artworkModules = import.meta.glob<{ artwork: Artwork }>("/src/content/artworks/*.ts", {
  eager: true,
});
const galleryModules = import.meta.glob<{ gallery: Gallery }>("/src/content/galleries/*.ts", {
  eager: true,
});

const allArtworks: Artwork[] = Object.values(artworkModules)
  .map((m) => m.artwork)
  .filter((a) => a.published)
  .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

const allGalleries: Gallery[] = Object.values(galleryModules)
  .map((m) => m.gallery)
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

export const filesAdapter: CatalogRepository = {
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
