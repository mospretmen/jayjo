import { describe, it, expect, beforeEach } from "vitest";
import { useCart, CART_STORAGE_KEY } from "@/store/cart";

describe("cart store", () => {
  beforeEach(() => {
    localStorage.clear();
    useCart.setState({ items: [] });
  });

  it("starts empty", () => {
    expect(useCart.getState().items).toEqual([]);
    expect(useCart.getState().itemCount()).toBe(0);
  });

  it("adds an artwork variant; second add increments quantity", () => {
    useCart.getState().add({ kind: "artwork", slug: "evening-fig", variantId: "a4" });
    useCart.getState().add({ kind: "artwork", slug: "evening-fig", variantId: "a4" });
    expect(useCart.getState().items).toHaveLength(1);
    expect(useCart.getState().items[0].quantity).toBe(2);
    expect(useCart.getState().itemCount()).toBe(2);
  });

  it("keeps different variants of the same artwork separate", () => {
    useCart.getState().add({ kind: "artwork", slug: "evening-fig", variantId: "a4" });
    useCart.getState().add({ kind: "artwork", slug: "evening-fig", variantId: "a3" });
    expect(useCart.getState().items).toHaveLength(2);
  });

  it("removes an item by key", () => {
    useCart.getState().add({ kind: "artwork", slug: "evening-fig", variantId: "a4" });
    useCart.getState().remove({ kind: "artwork", slug: "evening-fig", variantId: "a4" });
    expect(useCart.getState().items).toEqual([]);
  });

  it("setQuantity clamps to 1+; <= 0 removes the line", () => {
    useCart.getState().add({ kind: "artwork", slug: "evening-fig", variantId: "a4" });
    useCart.getState().setQuantity({ kind: "artwork", slug: "evening-fig", variantId: "a4" }, 3);
    expect(useCart.getState().items[0].quantity).toBe(3);
    useCart.getState().setQuantity({ kind: "artwork", slug: "evening-fig", variantId: "a4" }, 0);
    expect(useCart.getState().items).toEqual([]);
  });

  it("gallery bundle key has no variantId", () => {
    useCart.getState().add({ kind: "gallery", slug: "warm-study" });
    useCart.getState().add({ kind: "gallery", slug: "warm-study" });
    expect(useCart.getState().items).toHaveLength(1);
    expect(useCart.getState().items[0].quantity).toBe(2);
  });

  it("clear empties the cart", () => {
    useCart.getState().add({ kind: "artwork", slug: "evening-fig", variantId: "a4" });
    useCart.getState().clear();
    expect(useCart.getState().items).toEqual([]);
  });

  it("persists to localStorage under CART_STORAGE_KEY", () => {
    useCart.getState().add({ kind: "artwork", slug: "evening-fig", variantId: "a4" });
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    expect(raw).toBeTruthy();
    expect(raw).toContain("evening-fig");
  });
});
