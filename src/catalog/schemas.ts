import { z } from "zod";

export const ArtworkImageSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1, "alt is required (a11y)"),
  aspect: z.number().positive(),
});

export const ArtworkVariantSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  priceCents: z.number().int().positive(),
  stripePriceId: z.string().min(1),
  stock: z.number().int().nonnegative().optional(),
});

export const ArtworkSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "slug must be kebab-case ascii"),
  title: z.string().min(1),
  year: z.number().int().gte(1900).lte(2100),
  kind: z.enum(["original", "print"]),
  medium: z.string().min(1),
  description: z.string().min(1),
  story: z.string().optional(),
  colorTags: z.array(z.string()).min(1),
  sizeTags: z.array(z.string()).min(1),
  images: z.array(ArtworkImageSchema).min(1),
  variants: z.array(ArtworkVariantSchema).min(1),
  shippingGroup: z.enum(["print", "original-oversized"]),
  published: z.boolean(),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const GalleryBundleSchema = z.object({
  stripePriceId: z.string().min(1),
  bundlePriceCents: z.number().int().positive(),
});

export const GallerySchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  description: z.string().min(1),
  story: z.string().optional(),
  heroImage: ArtworkImageSchema,
  artworkSlugs: z.array(z.string()).min(1),
  bundle: GalleryBundleSchema.optional(),
  published: z.boolean(),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
