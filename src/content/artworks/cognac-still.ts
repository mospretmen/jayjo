import type { Artwork } from "@/catalog/types";

export const artwork: Artwork = {
  slug: "cognac-still",
  title: "Cognac Still",
  year: 2024,
  kind: "print",
  medium: "Giclée on cotton rag",
  description: "Warm cognac leather, walnut shadows, and a single bone-coloured bowl.",
  colorTags: ["cognac", "walnut"],
  sizeTags: ["small", "medium"],
  images: [{ src: "/art/cognac-still/main.jpg", alt: "Cognac Still — warm leather still-life", aspect: 4 / 5 }],
  variants: [
    { id: "a4", label: "A4 (8×11 in)", priceCents: 8500, stripePriceId: "price_placeholder_cs_a4" },
    { id: "a3", label: "A3 (11×16 in)", priceCents: 14500, stripePriceId: "price_placeholder_cs_a3" },
  ],
  shippingGroup: "print",
  published: true,
  publishedAt: "2024-09-20",
};
