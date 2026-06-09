import type { Artwork } from "@/catalog/types";

export const artwork: Artwork = {
  slug: "parchment-bloom",
  title: "Parchment Bloom",
  year: 2023,
  kind: "print",
  medium: "Giclée on cotton rag",
  description: "Soft botanical study on a parchment ground. Designed to brighten a quiet corner.",
  colorTags: ["soft-parchment", "olive-moss"],
  sizeTags: ["small", "medium", "large"],
  images: [{ src: "/art/parchment-bloom/main.jpg", alt: "Parchment Bloom — botanical study on warm ivory", aspect: 3 / 4 }],
  variants: [
    { id: "a4", label: "A4 (8×11 in)", priceCents: 7500, stripePriceId: "price_placeholder_pb_a4" },
    { id: "a3", label: "A3 (11×16 in)", priceCents: 12500, stripePriceId: "price_placeholder_pb_a3" },
    { id: "a2", label: "A2 (16×23 in)", priceCents: 22500, stripePriceId: "price_placeholder_pb_a2" },
  ],
  shippingGroup: "print",
  published: true,
  publishedAt: "2023-12-10",
};
