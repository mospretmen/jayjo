# Studio JayJo — Ecommerce App Design Spec

**Date:** 2026-06-08
**Status:** Draft for review
**Owner:** Gabriel Motta
**Repo (planned):** https://github.com/mospretmen/jayjo

## 1. Purpose and scope

Studio JayJo is a boutique ecommerce site for original artworks and prints. The brand reference is warm, editorial, and gallery-curated — closer to Soho Home and The Invisible Collection than a generic Shopify store. The site sells:

1. **Originals** — 1-of-1 physical artworks (stock = 1, then sold out)
2. **Prints** — reproducible editions with size variants and per-variant pricing/stock
3. **Wall Galleries** — curated multi-piece arrangements that work as either lookbooks (browse + buy individually) or bundle SKUs (buy the whole set), with a CTA to a B2B custom-curation flow
4. **B2B collaborations** — structured intake for collectors, interior designers, and hospitality clients

The site must feel premium, intuitive, responsive, and accessible. v1 ships with frictionless guest checkout, optional passwordless accounts, favorites, light/dark theming (default light), and a content layer that's trivial to expand.

## 2. Decisions log (locked during brainstorm)

| # | Decision |
|---|---|
| 1 | Products: originals + prints with size/edition variants |
| 2 | Wall Galleries: lookbook + optional bundle SKU + CTA to B2B custom curation |
| 3 | Catalog: `CatalogRepository` abstraction; v1 default = files-in-repo; Sanity + Neon adapters stubbed and documented |
| 4 | Auth: Guest checkout + optional passwordless magic-link account; orders associated by email so account signup later inherits guest history |
| 5 | Payments: Stripe Checkout (hosted) + Stripe Tax + webhook → Neon for orders |
| 6 | Shipping: worldwide via Stripe shipping zones, two rate groups (prints standard, originals oversized/fragile) |
| 7 | B2B form: structured intake (name, email, company, project type, budget, timeline, message) → Neon `submissions` + Resend notification |
| 8 | No runtime AI in v1; xAI key reserved for v1.5 build-time tooling if desired |
| 9 | Typography: Cormorant Garamond (display) + Inter (body), self-hosted via fontsource |
| 10 | Favorites: heart icon + favorites page; localStorage for guests, Neon-synced for accounts, merged on signup |
| 11 | Animations: Framer Motion (React-native) with editorial choreography rules; honors `prefers-reduced-motion` |
| 12 | Theming: CSS-variable tokens with light + dark modes, default light, single `[data-theme]` switch on `<html>` |
| 13 | Socials/contact: Instagram, Pinterest, TikTok placeholders + `hello@studiojayjo.com` + newsletter signup |
| 14 | Server-only secrets isolated by Vite's `VITE_` prefix convention; build-time secret scanner enforces no leakage |

## 3. High-level architecture

Single-page React (Vite) front-end deployed to Netlify as a static SPA with prerendered routes, talking to Netlify Functions for everything that needs a server. Neon Postgres for transactional data. Stripe for checkout. Resend for transactional email.

```
┌──────────────────────────────────────────────────────┐
│  Browser (React 18 + Vite + Tailwind + TypeScript)   │
│  - Routes via React Router                           │
│  - State: TanStack Query (server) + Zustand (UI/cart)│
│  - Theming: CSS vars (light default + dark)          │
│  - Motion: Framer Motion                             │
└───────────────┬──────────────────────────────────────┘
                │ HTTPS
                ▼
┌──────────────────────────────────────────────────────┐
│  Netlify CDN (static assets) + Netlify Functions     │
│  /api/checkout-create-session                        │
│  /api/checkout-webhook                               │
│  /api/auth-magic-{request,verify}, /api/auth-me      │
│  /api/favorites-{list,toggle,merge}                  │
│  /api/forms-{contact,newsletter}                     │
│  /api/orders-{list,get,by-email}                     │
└──────┬───────────────────────┬───────────────────────┘
       ▼                       ▼
┌────────────────┐    ┌──────────────────┐
│ Neon Postgres  │    │ Stripe + Resend  │
│ - users        │    │ - Checkout       │
│ - auth_tokens  │    │ - Tax            │
│ - orders       │    │ - Webhooks       │
│ - order_items  │    │ - Magic emails   │
│ - favorites    │    │ - Receipts       │
│ - inventory    │    │ - B2B notify     │
│ - submissions  │    └──────────────────┘
│ - newsletter   │
│ - rate_limit_buckets │
└────────────────┘
```

### Why these choices

- **Netlify Functions over a long-running Node server** — zero infra to manage, fits the static SPA model, pay per invocation. Trade-off: ~200-400ms cold start on cold routes; acceptable for a boutique store.
- **TanStack Query over Redux/SWR** — server state dominates; TanStack handles caching, retries, optimistic updates, and skeleton coordination out of the box.
- **Zustand for tiny client state** (cart, theme, modal flags) — 1KB, no boilerplate.
- **CSS variables for theming** — Tailwind reads our CSS vars, so a single `[data-theme="dark"]` switch flips the whole site; no `dark:` proliferation.
- **Files-in-repo catalog** for v1 — fastest to ship, zero external dependencies, perfectly performant for ~150 pieces. Behind a typed `CatalogRepository` interface that lets us swap to Sanity or Neon with one env var.

### Catalog abstraction layer

```
src/catalog/
├── types.ts                # Artwork, Gallery, Variant TS interfaces
├── schemas.ts              # Zod schemas (shared client + server)
├── index.ts                # adapter selector (VITE_CATALOG_ADAPTER)
└── adapters/
    ├── files.ts            # v1 active
    ├── sanity.ts           # stub + docs
    └── neon.ts             # stub + docs
```

Adapter selected via `VITE_CATALOG_ADAPTER=files|sanity|neon` (default `files`). All app code talks to `getCatalog()` which returns an object satisfying the `CatalogRepository` interface — `listArtworks(filter?)`, `getArtwork(slug)`, `listGalleries()`, `getGallery(slug)`, etc.

## 4. Frontend architecture

### Routes

All routes are `React.lazy()` code-split. `<Suspense fallback={<PageSkeleton />}>` per route.

| Path | Page | Notes |
|---|---|---|
| `/` | Home | Hero, "Shop By" pills, featured grid, Wall Galleries teaser, Work-with-us block |
| `/shop` | Catalog | Filter sidebar (category, color, size, price, availability), grid, infinite scroll |
| `/shop/:slug` | Artwork detail | Image carousel + zoom, variants picker, description, gallery backlinks, related pieces |
| `/galleries` | Wall Galleries index | Editorial grid |
| `/galleries/:slug` | Gallery detail | Lifestyle hero, piece list, optional "Buy the whole gallery", B2B CTA |
| `/cart` | Cart | Items, totals, "Checkout" |
| `/checkout/success` | Stripe success redirect | Polls webhook completion, shows confirmation |
| `/checkout/cancel` | Stripe cancel redirect | Returns to cart with toast |
| `/favorites` | Favorites | Same card grid, sourced from local or remote |
| `/account` | Account (auth-gated) | Orders, favorites, profile |
| `/account/orders/:id` | Single order detail | Tracking, items, totals |
| `/work-with-us` | B2B intake | Structured form |
| `/about` | Studio story | Bio, process |
| `/login` | Magic link request | Email + "Send link" |
| `/auth/callback` | Magic link verify | Sets session, redirects |
| `*` | 404 | Themed |

### Shell components

- `<RootLayout>` — header, footer, theme provider, toaster, cart drawer
- `<Header>` — logo, nav, search icon, favorites icon, cart icon, theme toggle
- `<Footer>` — newsletter signup, socials (IG/Pinterest/TikTok placeholders), nav, `hello@studiojayjo.com`, legal
- `<CartDrawer>` — slide-out from right, persistent across routes
- `<ThemeProvider>` — manages `[data-theme]` on `<html>`, persists to `localStorage`, respects `prefers-color-scheme` only on first visit; defaults to light
- `<ErrorBoundary>` per route + top-level
- `<Toaster>` — Sonner

### Reusable UI components (all themed via CSS vars)

- `<ArtworkCard>` / `<ArtworkCardSkeleton>`
- `<GalleryCard>` / `<GalleryCardSkeleton>`
- `<Price>` — locale-aware currency, supports "from $X" for variants
- `<ImageWithBlur>` — LQIP + `<picture>` AVIF/WebP fallback + `loading="lazy"` + `decoding="async"`
- `<Section>` — consistent padding + max-width wrapper
- `<EyebrowHeading>` — small-caps label above section titles
- `<Button>` (primary, ghost, link) + `<IconButton>`
- `<Input>` / `<Select>` / `<Checkbox>` — form primitives with built-in error + skeleton states
- `<Dialog>` / `<Sheet>` — Radix UI primitives (accessible by default)

### Theming tokens

Generated from the brand palette (Pantone references in `Colour Palette.pdf`). Single source of truth in `src/styles/tokens.css`. Tailwind reads via `theme.extend.colors` mapping (`bg-bg`, `text-text`, `bg-accent`, etc.).

```css
:root[data-theme="light"] {
  --color-bg:          #F2EBDC; /* Soft Parchment */
  --color-bg-elevated: #E8E2D3; /* Bone */
  --color-text:        #2E1F12; /* Cocoa / Walnut */
  --color-text-muted:  #A89A86; /* Warm Greige */
  --color-accent:      #A6541F; /* Cognac Leather */
  --color-accent-soft: #B57C82; /* Faded Fig */
  --color-fig:         #63242B; /* Deep Fig */
  --color-olive:       #7E9268; /* Olive Moss */
  --color-mustard:     #C97B10; /* Spiced Mustard */
  --color-burnt:       #8D3A2B; /* Burnt Umber */
  --color-border:      rgba(46,31,18,0.12);
}

:root[data-theme="dark"] {
  --color-bg:          #1A140E;
  --color-bg-elevated: #241A12;
  --color-text:        #F2EBDC;
  --color-text-muted:  #A89A86;
  --color-accent:      #C77A3E;
  --color-accent-soft: #B57C82;
  --color-fig:         #8C3A41;
  --color-olive:       #9DB387;
  --color-mustard:     #E08B1F;
  --color-burnt:       #B45844;
  --color-border:      rgba(242,235,220,0.12);
}
```

Dark mode is a desaturated warm-brown palette — **never true black** — preserving the brand warmth as the palette guidance directs.

### Typography

- **Display:** Cormorant Garamond Variable (600/700) — warm, editorial serif
- **Body:** Inter Variable (400/500/600) — neutral, readable sans
- Self-hosted via `@fontsource-variable/*` packages (no external Google Fonts request)
- `font-display: swap` to avoid invisible text during load

## 5. Backend (Netlify Functions)

All functions in `netlify/functions/*.ts`, TypeScript, deployed automatically by Netlify.

| Function | Method | Auth | Purpose |
|---|---|---|---|
| `checkout-create-session` | POST | none | Validates cart against catalog (server re-derives prices), creates Stripe Checkout Session, returns URL |
| `checkout-webhook` | POST | Stripe signature | Handles `checkout.session.completed`, `payment_intent.succeeded`, `charge.refunded`. Persists order, decrements inventory, emails receipt |
| `auth-magic-request` | POST | none | Rate-limited. Issues a hashed magic-link token, emails it via Resend |
| `auth-magic-verify` | GET | token | Validates token, upserts user, issues httpOnly JWT cookie |
| `auth-me` | GET | session | Returns current user |
| `auth-logout` | POST | session | Clears cookie |
| `favorites-list` | GET | session | Returns favorited artwork slugs |
| `favorites-toggle` | POST | session | Idempotent toggle |
| `favorites-merge` | POST | session | Merges guest localStorage favorites at sign-in |
| `forms-contact` | POST | none | B2B intake, stores in `submissions`, emails team |
| `forms-newsletter` | POST | none | Upserts email into `newsletter_subscribers`, sends confirmation |
| `orders-by-email` | POST | none | Guest lookup via `{ email, orderToken }` from receipt |
| `orders-list` | GET | session | Logged-in user's orders |
| `orders-get` | GET | session OR `?token=` | Single order via session or order-token |

### Shared modules — `netlify/functions/_lib/`

- `db.ts` — Neon serverless driver (`@neondatabase/serverless`), pooled
- `stripe.ts` — Stripe client singleton + webhook verification
- `resend.ts` — Resend client + React Email templates
- `auth.ts` — JWT sign/verify, cookie helpers, `requireSession()`
- `validate.ts` — Zod schemas for every request body
- `rateLimit.ts` — IP+email token-bucket via `rate_limit_buckets` table
- `errors.ts` — `AppError`, consistent error responses
- `log.ts` — structured logging with request IDs + secret redaction
- `env.ts` — `getServerEnv()` Zod-validates required vars at cold-start

## 6. Data model

### Neon Postgres schema

```sql
-- users
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         CITEXT UNIQUE NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- magic-link tokens (hashed)
CREATE TABLE auth_tokens (
  token_hash   TEXT PRIMARY KEY,    -- sha256 of raw token
  email        CITEXT NOT NULL,
  expires_at   TIMESTAMPTZ NOT NULL,
  consumed_at  TIMESTAMPTZ
);
CREATE INDEX ON auth_tokens (expires_at);

-- orders
CREATE TABLE orders (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID REFERENCES users(id),
  email              CITEXT NOT NULL,
  stripe_session_id  TEXT UNIQUE NOT NULL,
  stripe_payment_id  TEXT,
  status             TEXT NOT NULL,
  subtotal_cents     INTEGER NOT NULL,
  shipping_cents     INTEGER NOT NULL,
  tax_cents          INTEGER NOT NULL,
  total_cents        INTEGER NOT NULL,
  currency           TEXT NOT NULL,
  shipping_address   JSONB NOT NULL,
  guest_token        TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON orders (email);
CREATE INDEX ON orders (user_id);

CREATE TABLE order_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  artwork_slug     TEXT NOT NULL,
  variant_id       TEXT,
  title            TEXT NOT NULL,         -- snapshot
  unit_price_cents INTEGER NOT NULL,
  quantity         INTEGER NOT NULL,
  image_url        TEXT
);

CREATE TABLE favorites (
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  artwork_slug TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, artwork_slug)
);

CREATE TABLE inventory (
  artwork_slug TEXT PRIMARY KEY,
  stock        INTEGER NOT NULL,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE submissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         CITEXT NOT NULL,
  company       TEXT,
  project_type  TEXT NOT NULL,
  budget        TEXT,
  timeline      TEXT,
  message       TEXT NOT NULL,
  ip_hash       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE newsletter_subscribers (
  email      CITEXT PRIMARY KEY,
  confirmed  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE rate_limit_buckets (
  key       TEXT PRIMARY KEY,
  count     INTEGER NOT NULL,
  reset_at  TIMESTAMPTZ NOT NULL
);
```

### File-based catalog schema

```ts
// src/catalog/types.ts
export interface ArtworkVariant {
  id: string;                     // 'a3', 'a2', etc.
  label: string;                  // 'A3 (11x16)'
  priceCents: number;
  stripePriceId: string;
  stock?: number;                 // optional for unlimited prints
}

export interface ArtworkImage {
  src: string;
  alt: string;
  aspect: number;                 // width / height
}

export interface Artwork {
  slug: string;
  title: string;
  year: number;
  kind: 'original' | 'print';
  medium: string;
  description: string;
  story?: string;
  colorTags: string[];            // links to palette filter
  sizeTags: string[];
  images: ArtworkImage[];
  variants: ArtworkVariant[];     // length 1 for originals
  shippingGroup: 'print' | 'original-oversized';
  published: boolean;
  publishedAt: string;            // ISO date
}

export interface Gallery {
  slug: string;
  title: string;
  description: string;
  story?: string;
  heroImage: ArtworkImage;
  artworkSlugs: string[];         // ordered
  bundle?: {                      // optional: buy-the-set SKU
    stripePriceId: string;
    bundlePriceCents: number;     // typically discounted vs sum
  };
  published: boolean;
  publishedAt: string;
}
```

A `npm run catalog:validate` script Zod-validates every file at build time so a malformed artwork fails CI.

## 7. Key user flows

### Checkout flow

1. User clicks "Checkout" in cart
2. Client POSTs to `/api/checkout-create-session` with `{ items: [{slug, variantId, qty}] }`
3. Server loads catalog, validates each item, **re-derives prices** (never trusts client), checks original stock, builds Stripe Checkout Session with `automatic_tax: true`, both shipping rate groups, `metadata.guest_token`, redirect URLs
4. Returns `{ url }`; client does `window.location = url`
5. Stripe-hosted page handles Apple Pay / Google Pay / Link / Klarna / card
6. Async: Stripe webhook → `/api/checkout-webhook` (signature-verified) inserts order + items, decrements `inventory` for originals (transactional), sends receipt via Resend, links `user_id` if logged-in email matches
7. Buyer redirected to `/checkout/success?session_id=...`; frontend polls `/api/orders-get?session_id=...` with backoff up to 10s while waiting for the webhook
8. Confirmation page shows order, "Create account to track" CTA (passes email)

Robustness:
- `stripe_session_id UNIQUE` makes webhook retries idempotent
- Webhook is source of truth; success-URL polling is UX-only
- Inventory race handled by `UPDATE inventory SET stock = stock - 1 WHERE slug = $1 AND stock > 0` in a transaction; loser gets auto-refund + apology email
- Guest receipts contain a `guest_token` URL that grants lifetime read access to the order without an account

### Magic-link auth flow

1. User enters email at `/login` → POST `/api/auth-magic-request`
2. Server: rate-limit check (5/h IP, 3/h email), generate 32-byte random token, store `sha256(token)` in `auth_tokens` with 15-min TTL, send Resend email containing the raw token in a callback URL
3. Server returns 200 unconditionally (don't leak email existence)
4. User clicks link → `/auth/callback?token=...` → client GETs `/api/auth-magic-verify?token=...`
5. Server: hash + lookup, reject if expired/consumed/missing, upsert user, mark consumed, sign JWT (HS256, 30d), set httpOnly + Secure + SameSite=Lax cookie
6. Client passes any guest localStorage favorites to `/api/favorites-merge`, then redirects to `/account` (or original destination)

### Favorites flow

- **Guests:** `localStorage["favorites"] = string[]`; heart toggles update local; `/favorites` reads local
- **Authed:** read via TanStack Query from `/api/favorites-list`; optimistic toggle with rollback; `/api/favorites-merge` called once at sign-in to dedupe-merge guest list

## 8. Performance and UX patterns

### Image strategy

- Source images in `/public/art/<slug>/`
- Build script generates AVIF + WebP + JPG fallbacks at widths 640/1024/1600/2400
- LQIP (base64 blur) inlined; image fades in once loaded
- `<picture>` + `srcset` + `sizes` + native `loading="lazy"` + `decoding="async"`
- Above-the-fold hero: `fetchpriority="high"` + preloaded in HTML

### Skeletons

- Card and page skeletons match exact dimensions of loaded state (zero CLS)
- Skeletons use `--color-bg-elevated` with a subtle warm shimmer gradient
- Shown after **200ms delay** — prevents flicker on fast connections

### Code splitting & route prefetch

- Every route `React.lazy()`; vendor split (`vendor-react`, `vendor-stripe`, `vendor-utils`)
- Hover-prefetch on `<Link>` (TanStack Query + Vite import hints)
- Stripe.js only loaded when entering checkout (not on every page)

### Pre-rendering

- `vite-plugin-prerender` for static routes (`/`, `/about`, `/work-with-us`) and catalog routes (built from file catalog → all detail pages SSG'd)
- When/if catalog moves to Sanity, Netlify build hooks triggered by Sanity webhooks rebuild

### Responsive

- Mobile-first Tailwind, breakpoints `sm/md/lg/xl/2xl` (640/768/1024/1280/1536)
- Container queries for cards that adapt to context regardless of viewport
- Touch targets ≥ 44×44 (WCAG)
- QA viewports: iPhone SE / Pro Max, iPad portrait/landscape, 1280/1440/2560 desktop

### Scroll-reveal animations (Framer Motion)

Motion primitives in `src/components/motion/`:

- `<Reveal>` — fade + 12px rise on first scroll-into-view, once
- `<RevealStagger>` — wraps children with 60-80ms stagger
- `<Parallax intensity="subtle">` — hero images, gallery covers (4-8% range)
- `<HoverLift>` — 4px translate-y + warm shadow on ArtworkCard hover
- `<PageTransition>` — 220ms cross-fade between routes

Choreography rules (editorial, not templated):
- Duration 600ms ease-out for reveals
- Max 16px translate (never bouncy)
- No zoom/rotate reveals (feel cheap on a luxury site)
- 60-80ms sibling stagger
- `useInView({ once: true, margin: "-80px" })` — no re-trigger on scroll-up
- Above-the-fold: instant render, no scroll-reveal
- Page transitions: opacity-only (preserves scroll perception)
- Fully disabled when `prefers-reduced-motion: reduce`

Where applied:
- Hero copy on `/` — fade, no movement
- "Shop By" pills — 60ms stagger
- ArtworkCard grid — 80ms row-stagger, only first viewport
- Gallery hero — subtle parallax
- Section headings — eyebrow + title rise together
- Wall Gallery detail — left-aligned text reveals as you scroll past each piece
- Work-with-us terracotta block — slides up, copy reveals 120ms later
- ArtworkCard hover — `HoverLift` 180ms ease

## 9. Accessibility (WCAG 2.2 AA target)

- Radix UI primitives for Dialog, Sheet, Tabs, Select, Tooltip — keyboard + SR ready
- All images have meaningful `alt` (enforced at catalog validate time)
- Focus rings using `--color-accent`; `outline: none` is forbidden
- Skip-to-content link in header
- All form inputs labeled, `aria-describedby` for errors
- Color contrast ≥ 4.5:1 enforced via Vitest test that runs `wcag-contrast` on the token map (both themes)
- `prefers-reduced-motion` honored: transitions and shimmer disabled
- Theme toggle is `<button aria-pressed>`

## 10. Error handling

1. **Route-level error boundaries** with branded fallback per lazy route
2. **Top-level error boundary** with "Refresh" + "Go home" + `mailto:hello@studiojayjo.com`
3. **TanStack Query error states** — inline retry blocks; never blank page
4. **Form validation** — Zod schemas shared client and server (`src/shared/schemas.ts`)
5. **Network** — Query auto-retries GETs (3x exp backoff); mutations toast on failure with retry
6. **API contract** — `{ error: { code, message, requestId } }`; frontend maps `code` to copy
7. **Server logging** — `console.error` with request IDs (Netlify Functions log retention); structured JSON; Sentry placeholder hook
8. **Webhook resilience** — DB failure → 500 → Stripe retries with backoff; orders never lost
9. **Inventory race** — auto-refund + apology email
10. **Offline state** — PWA shell cache; "You're offline" banner; cart persisted to localStorage

## 11. Security

### Secret-handling guarantees

- **Server-only keys** (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `JWT_SECRET`, `DATABASE_URL`): never prefixed `VITE_`. Vite physically excludes them from the client bundle.
- **Filesystem isolation:** server keys accessed only from `netlify/functions/_lib/env.ts`. An ESLint rule blocks any `import.meta.env.<non-VITE_>` reference in `src/`.
- **`getServerEnv()` helper:** single chokepoint, Zod-validates required vars at cold-start, throws if missing. No fallback to client-exposed equivalents.
- **Build-time secret scanner:** `scripts/scan-bundle.ts` runs after `vite build` and greps `dist/` for known secret prefixes (`re_`, `sk_live_`, `sk_test_`, `xai-`, `ghp_`, `npg_`, `whsec_`, JWT-shaped strings). Match → fail build. CI runs this too.
- **`.gitignore`:** `.env`, `.env.local`, `.env.*.local`. `.env.example` is the only env file in the repo (placeholder values only).
- **Netlify scoping:** server vars marked "Functions only" in the dashboard; client vars (`VITE_*`) "Builds + Functions".
- **Resend usage:** singleton init per cold-start; log only `{ id, recipient, template }`, never response body or email content.
- **Logging hygiene:** `_lib/log.ts` runs redaction on every log call against the secret-prefix regex set; matches → `[REDACTED]`.
- **Stripe webhook secret:** consumed only inside `_lib/stripe.ts:verifyWebhook()`.
- **Two-name discipline:** `STRIPE_SECRET_KEY` (server) and `VITE_STRIPE_PUBLISHABLE_KEY` (client) are distinct names, cannot be swapped accidentally.

### Other security

- **HttpOnly + Secure + SameSite=Lax** cookie for JWT
- **Rate limiting** on `auth-magic-request`, `forms-contact`, `forms-newsletter` (IP + email token bucket via `rate_limit_buckets`)
- **CSP headers** via `netlify.toml` (strict, with allowlists for Stripe + fontsource)
- **HSTS, X-Frame-Options DENY, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy** restrictive
- **No PII in logs;** email hashed when storing rate-limit keys
- **Server price re-derivation** — client cart prices never trusted at checkout

### Live-key rotation reminder

`.env` currently holds active keys (GitHub PAT, Neon password, xAI, Resend) shared during the brainstorm. After v1 ships, rotate all four and set new values directly in the Netlify dashboard.

## 12. Testing strategy

| Layer | Tool | Tests |
|---|---|---|
| Unit | Vitest + Testing Library | Components render, hooks behave, pure utils (currency, price derivation, cart math) |
| Schema | Vitest + Zod | Every artwork/gallery file validates; API request/response shapes match contract |
| Integration | Vitest + msw + Neon test DB | Functions hit a real test DB; Stripe + Resend mocked |
| E2E | Playwright | Smoke: home → shop → detail → cart → Stripe test checkout → success. Mobile + desktop. Light + dark. |
| Visual regression | Playwright screenshots | Key pages × theme × viewport |
| Accessibility | `@axe-core/playwright` | Run on every key route in E2E; serious violations fail CI |
| Lighthouse | Netlify Lighthouse plugin | Performance ≥ 90, A11y ≥ 95, Best Practices ≥ 95, SEO ≥ 95 per deploy |

CI (GitHub Actions): lint → typecheck → catalog-validate → unit → integration → build → E2E → axe → lighthouse. Preview deploys via Netlify per PR.

## 13. Project structure

```
jayjo/
├── .env.example
├── .gitignore
├── .nvmrc                              # Node 20 LTS
├── README.md
├── CONTRIBUTING.md
├── netlify.toml
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── index.html
│
├── public/
│   ├── art/<slug>/{main,detail,...}.jpg
│   ├── galleries/<slug>/...
│   ├── fonts/                          # self-hosted via fontsource
│   └── favicon.svg, og-default.jpg, robots.txt
│
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── routes/                         # all route components
│   ├── components/
│   │   ├── layout/                     # RootLayout, Header, Footer, CartDrawer
│   │   ├── ui/                         # Button, Input, Dialog, Skeleton, ...
│   │   ├── motion/                     # Reveal, RevealStagger, Parallax, ...
│   │   ├── product/                    # ArtworkCard, VariantPicker, Price, ImageWithBlur
│   │   ├── gallery/                    # GalleryCard, GalleryHero, GalleryPieceList
│   │   ├── checkout/                   # CartLine, CartSummary, CheckoutButton
│   │   ├── forms/                      # ContactForm, NewsletterForm, MagicLinkForm
│   │   └── theme/                      # ThemeProvider, ThemeToggle
│   ├── catalog/
│   │   ├── types.ts
│   │   ├── schemas.ts
│   │   ├── index.ts
│   │   └── adapters/{files,sanity,neon}.ts
│   ├── content/
│   │   ├── artworks/<slug>.ts
│   │   ├── galleries/<slug>.ts
│   │   └── pages/{about,work-with-us}.ts
│   ├── store/                          # Zustand: cart, theme, ui
│   ├── hooks/                          # TanStack Query hooks
│   ├── lib/                            # api fetch wrapper, currency, seo, analytics
│   ├── styles/                         # tokens.css, base.css, globals.css
│   └── shared/                         # schemas shared with functions
│
├── netlify/functions/
│   ├── _lib/                           # db, stripe, resend, auth, errors, validate, log, env, rateLimit
│   └── *.ts                            # one file per endpoint
│
├── db/
│   ├── migrations/                     # 0001_init.sql, ...
│   └── seed.ts                         # local dev seed
│
├── scripts/
│   ├── catalog-validate.ts             # Zod-validates artworks + galleries; runs in CI
│   ├── images-optimize.ts              # build-time AVIF/WebP/LQIP generation
│   ├── db-migrate.ts                   # idempotent migration runner against DATABASE_URL
│   ├── stripe-sync.ts                  # creates/updates Stripe Products + Prices to match catalog (idempotent by metadata.catalogSlug)
│   └── scan-bundle.ts                  # post-build secret-leak scanner; fails build if matches
│
└── tests/
    ├── unit/                           # vitest
    ├── integration/                    # vitest
    └── e2e/                            # playwright
```

## 14. Environment variables

```bash
# server-only (Functions)
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
JWT_SECRET=<64-char random>
APP_URL=https://studiojayjo.com
NOTIFY_EMAIL=hello@studiojayjo.com

# client-safe (VITE_ prefix)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_APP_URL=https://studiojayjo.com
VITE_CATALOG_ADAPTER=files
VITE_PLAUSIBLE_DOMAIN=studiojayjo.com  # optional analytics
```

## 15. Deployment

- **Netlify** static SPA + Functions. SPA fallback `/* /index.html 200`. Function aliases `/api/* /.netlify/functions/:splat 200`.
- **Node 20** runtime
- **Image CDN** enabled
- **Headers** in `netlify.toml`: strict CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy
- **Local dev:** `npm run dev` runs Vite + `netlify dev` concurrently; functions proxied at `/api/*`. Local Neon branch via `neonctl branches create`. Stripe webhook via `stripe listen --forward-to localhost:8888/api/checkout-webhook`.

## 16. Adding a new artwork (the "easy to expand" promise)

1. Drop images in `public/art/<slug>/`
2. Create `src/content/artworks/<slug>.ts` (TypeScript autocomplete from `Artwork` type)
3. `npm run stripe:sync` — creates matching Stripe Prices (idempotent)
4. `npm run catalog:validate`
5. `git push` → Netlify preview → merge → live

To migrate the catalog to Sanity later: populate Sanity → set `VITE_CATALOG_ADAPTER=sanity` → redeploy. Zero changes to components, routes, or functions.

## 17. Out of scope for v1

These are deliberately deferred so we can ship a tight v1:

- Runtime AI features (xAI key reserved for v1.5 — e.g. AI semantic search, "find art for my space")
- Custom `/admin` UI for catalog management (use Git-based content for v1; migrate to Sanity Studio when needed)
- Multi-currency display (all priced in USD; Stripe Tax handles VAT/sales tax at checkout)
- Wishlist sharing / collaborative galleries
- Reviews / ratings
- Loyalty program
- Push notifications
- Native mobile app
- Real-time inventory updates via WebSocket (current model: polling at checkout, transactional decrement at webhook)

## 18. Open assumptions to validate in implementation

- Stripe Tax requires you to register tax obligations per jurisdiction; v1 assumes Studio JayJo will configure these in the Stripe dashboard before going live
- Self-fulfilled shipping is assumed (you pack and ship); no 3PL integration
- Plausible / analytics provider is a placeholder; can be wired up at any time
- The `studiojayjo.com` domain is assumed available; otherwise substitute the chosen domain
- The catalog v1 will be hand-curated TypeScript files; if non-dev editing becomes urgent before launch, we'd accelerate the Sanity adapter
