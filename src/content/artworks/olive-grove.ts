import type { Artwork } from "@/catalog/types";

export const artwork: Artwork = {
  slug: "olive-grove",
  title: "Olive Grove",
  year: 2024,
  kind: "original",
  medium: "Oil on linen, 24×36 in",
  description:
    "A late-afternoon olive grove rendered in moss and warm greige. A single, framed original.",
  colorTags: ["olive-moss", "warm-greige"],
  sizeTags: ["large"],
  images: [{ src: "/art/olive-grove/main.jpg", alt: "Olive Grove — olive trees in afternoon light", aspect: 4 / 5 }],
  variants: [
    {
      id: "original",
      label: "Original — 24×36 in (framed)",
      priceCents: 380000,
      stripePriceId: "price_placeholder_og_original",
      stock: 1,
    },
  ],
  shippingGroup: "original-oversized",
  published: true,
  publishedAt: "2024-10-15",
};
