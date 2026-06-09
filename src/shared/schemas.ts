import { z } from "zod";

export const CartItemSchema = z.object({
  kind: z.enum(["artwork", "gallery"]),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  variantId: z.string().min(1).optional(),
  quantity: z.number().int().positive().max(99),
});

export const CreateCheckoutRequestSchema = z.object({
  items: z.array(CartItemSchema).min(1).max(20),
});

export type CartItem = z.infer<typeof CartItemSchema>;
export type CreateCheckoutRequest = z.infer<typeof CreateCheckoutRequestSchema>;
