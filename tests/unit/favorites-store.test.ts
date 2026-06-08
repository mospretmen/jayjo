import { describe, it, expect, beforeEach } from "vitest";
import { useFavorites } from "@/store/favorites";

describe("favorites store", () => {
  beforeEach(() => {
    localStorage.clear();
    useFavorites.setState({ slugs: [] });
  });

  it("toggles a slug on and off", () => {
    const { toggle, isFavorite } = useFavorites.getState();
    toggle("evening-fig");
    expect(isFavorite("evening-fig")).toBe(true);
    toggle("evening-fig");
    expect(isFavorite("evening-fig")).toBe(false);
  });

  it("doesn't duplicate when toggling on twice via mergeSlugs", () => {
    useFavorites.getState().mergeSlugs(["a", "a", "b"]);
    expect(useFavorites.getState().slugs.sort()).toEqual(["a", "b"]);
  });
});
