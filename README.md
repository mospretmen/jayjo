# Studio JayJo

A boutique ecommerce site for original art, prints, and curated wall galleries.

> v1: Plan 1 (Foundation + Storefront) — browseable site with theming, catalog, galleries, favorites (local). Cart, checkout, accounts and forms land in Plans 2–4.

## Stack

- **Frontend:** React 18 + Vite + TypeScript + Tailwind + Framer Motion
- **State:** Zustand (UI) + TanStack Query (server, used heavily in later plans)
- **Theming:** CSS variables, light + dark (default light)
- **Catalog:** files-in-repo adapter (Sanity / Neon adapters stubbed; swap via `VITE_CATALOG_ADAPTER`)
- **Backend (Plan 2+):** Netlify Functions + Neon Postgres + Stripe + Resend

## Quick start

```bash
nvm use            # Node 20
npm install
cp .env.example .env.local   # fill VITE_ vars only for Plan 1
npm run dev
```

Open http://localhost:5173

## Scripts

- `npm run dev` — Vite dev server
- `npm run build` — typecheck + production build
- `npm run preview` — preview the built bundle
- `npm run lint` — ESLint
- `npm run format` — Prettier
- `npm run typecheck` — TS only
- `npm test` — Vitest unit tests
- `npm run catalog:validate` — Zod-validate content files

## Adding an artwork

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Project structure

- `src/catalog/` — catalog abstraction + adapters
- `src/content/` — file-based catalog (artworks, galleries, page copy)
- `src/components/` — UI, motion, layout, product, gallery
- `src/routes/` — page components
- `src/styles/` — tokens + base + globals
- `scripts/` — build-time helpers
