import type { Artwork, Gallery } from "@/catalog/types";

export interface CartInput {
  kind: "artwork" | "gallery";
  slug: string;
  variantId?: string;
  quantity: number;
}

export interface ResolvedLine {
  kind: "artwork" | "gallery";
  slug: string;
  variantId?: string;
  title: string;
  variantLabel?: string;
  unitPriceCents: number;
  quantity: number;
  stripePriceId: string;
  imageUrl: string;
}

export interface ResolveResult {
  lines: ResolvedLine[];
  subtotalCents: number;
}

interface Catalog {
  artworks: Artwork[];
  galleries: Gallery[];
}

export class PricingError extends Error {
  constructor(public code: string, message: string) {
    super(`${code}: ${message}`);
  }
}

export function resolveCartLines(inputs: CartInput[], catalog: Catalog): ResolveResult {
  const lines: ResolvedLine[] = [];
  let subtotalCents = 0;

  for (const input of inputs) {
    if (input.quantity < 1 || !Number.isFinite(input.quantity) || !Number.isInteger(input.quantity)) {
      throw new PricingError("QUANTITY_INVALID", `Quantity must be a positive integer for ${input.slug}`);
    }

    if (input.kind === "artwork") {
      const artwork = catalog.artworks.find((a) => a.slug === input.slug);
      if (!artwork) throw new PricingError("PRICE_NOT_FOUND", `Artwork not found: ${input.slug}`);
      const variant = artwork.variants.find((v) => v.id === input.variantId);
      if (!variant)
        throw new PricingError("PRICE_NOT_FOUND", `Variant not found: ${input.slug}/${input.variantId}`);
      if (artwork.kind === "original" && input.quantity > 1)
        throw new PricingError("QUANTITY_INVALID", `Originals are limited to quantity 1`);

      const line: ResolvedLine = {
        kind: "artwork",
        slug: artwork.slug,
        variantId: variant.id,
        title: artwork.title,
        variantLabel: variant.label,
        unitPriceCents: variant.priceCents,
        quantity: input.quantity,
        stripePriceId: variant.stripePriceId,
        imageUrl: artwork.images[0].src,
      };
      lines.push(line);
      subtotalCents += line.unitPriceCents * line.quantity;
    } else {
      const gallery = catalog.galleries.find((g) => g.slug === input.slug);
      if (!gallery) throw new PricingError("PRICE_NOT_FOUND", `Gallery not found: ${input.slug}`);
      if (!gallery.bundle)
        throw new PricingError("PRICE_NOT_FOUND", `Gallery has no bundle SKU: ${input.slug}`);

      const line: ResolvedLine = {
        kind: "gallery",
        slug: gallery.slug,
        title: `${gallery.title} (Gallery)`,
        unitPriceCents: gallery.bundle.bundlePriceCents,
        quantity: input.quantity,
        stripePriceId: gallery.bundle.stripePriceId,
        imageUrl: gallery.heroImage.src,
      };
      lines.push(line);
      subtotalCents += line.unitPriceCents * line.quantity;
    }
  }

  return { lines, subtotalCents };
}
