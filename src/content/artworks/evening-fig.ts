import type { Artwork } from "@/catalog/types";

export const artwork: Artwork = {
  slug: "evening-fig",
  title: "Evening Fig",
  year: 2024,
  kind: "print",
  medium: "Giclée on cotton rag",
  description:
    "A dusky still-life in deep fig and cognac — quiet enough for a bedroom, rich enough to hold a corner.",
  story:
    "Painted at the close of a long summer. The fig sat on a parchment-coloured cloth for a week before I touched a brush.",
  colorTags: ["deep-fig", "cognac"],
  sizeTags: ["small", "medium", "large"],
  images: [{ src: "/art/evening-fig/main.jpg", alt: "Evening Fig — fig and cognac still-life", aspect: 4 / 5 }],
  variants: [
    { id: "a4", label: "A4 (8×11 in)", priceCents: 8500, stripePriceId: "price_placeholder_ef_a4" },
    { id: "a3", label: "A3 (11×16 in)", priceCents: 14500, stripePriceId: "price_placeholder_ef_a3" },
    { id: "a2", label: "A2 (16×23 in)", priceCents: 24500, stripePriceId: "price_placeholder_ef_a2" },
  ],
  shippingGroup: "print",
  published: true,
  publishedAt: "2024-11-01",
};
