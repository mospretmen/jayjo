import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { ArtworkCard } from "@/components/product/ArtworkCard";
import { useFavorites } from "@/store/favorites";
import type { Artwork } from "@/catalog/types";

const sample: Artwork = {
  slug: "evening-fig",
  title: "Evening Fig",
  year: 2024,
  kind: "print",
  medium: "Giclée",
  description: "...",
  colorTags: ["deep-fig"],
  sizeTags: ["small"],
  images: [{ src: "/art/evening-fig/main.jpg", alt: "alt", aspect: 4 / 5 }],
  variants: [{ id: "a4", label: "A4", priceCents: 8500, stripePriceId: "x" }],
  shippingGroup: "print",
  published: true,
  publishedAt: "2024-11-01",
};

describe("ArtworkCard", () => {
  beforeEach(() => useFavorites.setState({ slugs: [] }));

  it("renders title and price", () => {
    render(
      <MemoryRouter>
        <ArtworkCard artwork={sample} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Evening Fig")).toBeInTheDocument();
    expect(screen.getByText("$85.00")).toBeInTheDocument();
  });

  it("toggles favorite on heart click", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ArtworkCard artwork={sample} />
      </MemoryRouter>,
    );
    const buttons = screen.getAllByRole("button", { name: /favorite evening fig/i });
    await user.click(buttons[0]);
    expect(useFavorites.getState().slugs.includes("evening-fig")).toBe(true);
  });
});
