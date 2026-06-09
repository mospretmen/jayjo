import { describe, it, expect } from "vitest";
import { CartItemSchema, CreateCheckoutRequestSchema } from "@/shared/schemas";

describe("CartItemSchema", () => {
  it("accepts a valid artwork item", () => {
    const r = CartItemSchema.safeParse({ kind: "artwork", slug: "evening-fig", variantId: "a4", quantity: 1 });
    expect(r.success).toBe(true);
  });

  it("rejects bad slug", () => {
    expect(CartItemSchema.safeParse({ kind: "artwork", slug: "Evening Fig!", variantId: "a4", quantity: 1 }).success).toBe(false);
  });

  it("rejects quantity 0", () => {
    expect(CartItemSchema.safeParse({ kind: "artwork", slug: "evening-fig", variantId: "a4", quantity: 0 }).success).toBe(false);
  });

  it("rejects quantity above 99", () => {
    expect(CartItemSchema.safeParse({ kind: "artwork", slug: "evening-fig", variantId: "a4", quantity: 100 }).success).toBe(false);
  });
});

describe("CreateCheckoutRequestSchema", () => {
  it("rejects empty cart", () => {
    expect(CreateCheckoutRequestSchema.safeParse({ items: [] }).success).toBe(false);
  });

  it("rejects > 20 items", () => {
    const items = Array.from({ length: 21 }, () => ({ kind: "artwork" as const, slug: "x", variantId: "a", quantity: 1 }));
    expect(CreateCheckoutRequestSchema.safeParse({ items }).success).toBe(false);
  });
});
