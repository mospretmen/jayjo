import type { Gallery } from "@/catalog/types";

export const gallery: Gallery = {
  slug: "dusk-arrangement",
  title: "Dusk Arrangement",
  description:
    "A larger statement — an original anchored by two complementary prints. Built around olive and moss.",
  heroImage: {
    src: "/galleries/dusk-arrangement/hero.jpg",
    alt: "Dusk Arrangement — original olive grove flanked by two prints",
    aspect: 3 / 2,
  },
  artworkSlugs: ["olive-grove", "parchment-bloom", "evening-fig"],
  published: true,
  publishedAt: "2024-10-25",
};
