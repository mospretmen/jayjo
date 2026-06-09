# Contributing to Studio JayJo

## Adding an artwork

1. Drop main image into `public/art/<slug>/main.jpg` (4:5 ratio recommended, ≥1200×1500)
2. Create `src/content/artworks/<slug>.ts`:

```ts
import type { Artwork } from "@/catalog/types";

export const artwork: Artwork = {
  slug: "your-slug",
  title: "Your Title",
  year: 2026,
  kind: "print",                 // or "original"
  medium: "Giclée on cotton rag",
  description: "...",
  colorTags: ["deep-fig"],       // see existing files for the set
  sizeTags: ["small", "medium"],
  images: [{ src: "/art/your-slug/main.jpg", alt: "describe the work", aspect: 4 / 5 }],
  variants: [
    { id: "a3", label: "A3 (11×16 in)", priceCents: 14500, stripePriceId: "price_xxx" },
  ],
  shippingGroup: "print",
  published: true,
  publishedAt: "2026-01-01",
};
```

3. Run `npm run catalog:validate` — fixes any schema issues before commit
4. Commit and push — Netlify previews the change

## Adding a wall gallery

Same pattern under `src/content/galleries/<slug>.ts` referencing artwork slugs.

## Theming

All colors come from `src/styles/tokens.css`. Both themes use the same variable names; only values differ. Components use Tailwind classes like `bg-bg`, `text-text`, `bg-accent` — these read the variables.

## Tests

Run `npm test` before committing. New components → write a Vitest test in `tests/unit/`.
