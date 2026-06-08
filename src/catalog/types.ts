export interface ArtworkVariant {
  id: string;
  label: string;
  priceCents: number;
  stripePriceId: string;
  stock?: number;
}

export interface ArtworkImage {
  src: string;
  alt: string;
  aspect: number; // width / height
}

export type ArtworkKind = "original" | "print";
export type ShippingGroup = "print" | "original-oversized";

export interface Artwork {
  slug: string;
  title: string;
  year: number;
  kind: ArtworkKind;
  medium: string;
  description: string;
  story?: string;
  colorTags: string[];
  sizeTags: string[];
  images: ArtworkImage[];
  variants: ArtworkVariant[];
  shippingGroup: ShippingGroup;
  published: boolean;
  publishedAt: string;
}

export interface GalleryBundle {
  stripePriceId: string;
  bundlePriceCents: number;
}

export interface Gallery {
  slug: string;
  title: string;
  description: string;
  story?: string;
  heroImage: ArtworkImage;
  artworkSlugs: string[];
  bundle?: GalleryBundle;
  published: boolean;
  publishedAt: string;
}

export interface ArtworkFilter {
  colorTags?: string[];
  sizeTags?: string[];
  kind?: ArtworkKind;
  query?: string;
  inStock?: boolean;
  priceMin?: number;
  priceMax?: number;
}

export interface CatalogRepository {
  listArtworks(filter?: ArtworkFilter): Promise<Artwork[]>;
  getArtwork(slug: string): Promise<Artwork | null>;
  listGalleries(): Promise<Gallery[]>;
  getGallery(slug: string): Promise<Gallery | null>;
}
