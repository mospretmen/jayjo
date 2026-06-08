import type { Gallery } from "@/catalog/types";

export const gallery: Gallery = {
  slug: "warm-study",
  title: "The Warm Study",
  description:
    "Three pieces in deep fig and cognac for a den or reading nook. Pairs with walnut and brass.",
  heroImage: {
    src: "/galleries/warm-study/hero.jpg",
    alt: "The Warm Study — three pieces arranged on a walnut wall",
    aspect: 3 / 2,
  },
  artworkSlugs: ["evening-fig", "cognac-still", "parchment-bloom"],
  bundle: { stripePriceId: "price_placeholder_warm_study_bundle", bundlePriceCents: 38500 },
  published: true,
  publishedAt: "2024-11-05",
};
