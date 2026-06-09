import { describe, it, expect } from "vitest";
import { resolveCartLines, type CartInput } from "../../netlify/functions/_lib/pricing";
import type { Artwork, Gallery } from "@/catalog/types";

const artwork: Artwork = {
  slug: "evening-fig",
  title: "Evening Fig",
  year: 2024,
  kind: "print",
  medium: "Giclée",
  description: "",
  colorTags: ["deep-fig"],
  sizeTags: ["small"],
  images: [{ src: "/a.jpg", alt: "a", aspect: 1 }],
  variants: [
    { id: "a4", label: "A4", priceCents: 8500, stripePriceId: "price_a4" },
    { id: "a3", label: "A3", priceCents: 14500, stripePriceId: "price_a3" },
  ],
  shippingGroup: "print",
  published: true,
  publishedAt: "2024-11-01",
};

const original: Artwork = {
  ...artwork,
  slug: "olive-grove",
  title: "Olive Grove",
  kind: "original",
  variants: [{ id: "original", label: "Original", priceCents: 380000, stripePriceId: "price_o", stock: 1 }],
  shippingGroup: "original-oversized",
};

const gallery: Gallery = {
  slug: "warm-study",
  title: "Warm Study",
  description: "",
  heroImage: { src: "/h.jpg", alt: "h", aspect: 1 },
  artworkSlugs: ["evening-fig"],
  bundle: { stripePriceId: "price_bundle", bundlePriceCents: 38500 },
  published: true,
  publishedAt: "2024-11-05",
};

describe("resolveCartLines", () => {
  it("resolves a print variant line", () => {
    const out = resolveCartLines(
      [{ kind: "artwork", slug: "evening-fig", variantId: "a3", quantity: 2 }] satisfies CartInput[],
      { artworks: [artwork, original], galleries: [gallery] },
    );
    expect(out.lines).toEqual([
      {
        kind: "artwork",
        slug: "evening-fig",
        variantId: "a3",
        title: "Evening Fig",
        variantLabel: "A3",
        unitPriceCents: 14500,
        quantity: 2,
        stripePriceId: "price_a3",
        imageUrl: "/a.jpg",
      },
    ]);
    expect(out.subtotalCents).toBe(29000);
  });

  it("resolves a gallery bundle line", () => {
    const out = resolveCartLines(
      [{ kind: "gallery", slug: "warm-study", quantity: 1 }],
      { artworks: [artwork, original], galleries: [gallery] },
    );
    expect(out.lines[0]).toMatchObject({
      kind: "gallery",
      slug: "warm-study",
      title: "Warm Study (Gallery)",
      unitPriceCents: 38500,
      stripePriceId: "price_bundle",
    });
  });

  it("throws PRICE_NOT_FOUND when artwork is missing", () => {
    expect(() =>
      resolveCartLines(
        [{ kind: "artwork", slug: "nope", variantId: "a4", quantity: 1 }],
        { artworks: [artwork], galleries: [] },
      ),
    ).toThrowError(/PRICE_NOT_FOUND/);
  });

  it("throws PRICE_NOT_FOUND when variant is missing", () => {
    expect(() =>
      resolveCartLines(
        [{ kind: "artwork", slug: "evening-fig", variantId: "xxl", quantity: 1 }],
        { artworks: [artwork], galleries: [] },
      ),
    ).toThrowError(/PRICE_NOT_FOUND/);
  });

  it("throws QUANTITY_INVALID for non-positive quantity", () => {
    expect(() =>
      resolveCartLines(
        [{ kind: "artwork", slug: "evening-fig", variantId: "a4", quantity: 0 }],
        { artworks: [artwork], galleries: [] },
      ),
    ).toThrowError(/QUANTITY_INVALID/);
  });

  it("caps original quantity at 1", () => {
    expect(() =>
      resolveCartLines(
        [{ kind: "artwork", slug: "olive-grove", variantId: "original", quantity: 2 }],
        { artworks: [artwork, original], galleries: [] },
      ),
    ).toThrowError(/QUANTITY_INVALID/);
  });
});
