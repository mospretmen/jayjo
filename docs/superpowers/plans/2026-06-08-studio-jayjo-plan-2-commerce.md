# Studio JayJo — Plan 2: Commerce

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the full purchase flow on top of Plan 1's storefront — cart, Stripe Checkout (hosted), webhook-driven order persistence to Neon, transactional email receipts via Resend, and inventory decrement for one-of-one originals. v1 ships as guest-only checkout; accounts land in Plan 3.

**Architecture:** Static SPA continues to serve catalog pages instantly. New `cart` Zustand store (persisted to localStorage) hydrates a slide-out `<CartDrawer>` and a `/cart` page. Checkout calls a Netlify Function that re-derives every price from the server-side catalog (never trusts the client), then creates a Stripe Checkout Session and redirects. Stripe handles wallets + tax + shipping. Stripe webhook → second Netlify Function writes orders + items to Neon, decrements inventory atomically for originals, and triggers a branded receipt email via Resend. `/checkout/success` polls Neon by `session_id` with exponential backoff while waiting for the webhook (UX-only; webhook is authoritative).

**Tech Stack:** Netlify Functions (TypeScript), `@neondatabase/serverless`, `stripe`, `resend`, `zod`, plus a new Zustand cart store and a TanStack Query hook for order polling.

**Spec reference:** `docs/superpowers/specs/2026-06-08-studio-jayjo-design.md` §5–§7, §11
**Predecessor plan:** `docs/superpowers/plans/2026-06-08-studio-jayjo-plan-1-foundation.md` (v0.1.0 shipped)

---

## File structure produced by this plan

```
jayjo/
├── netlify.toml                              (new)
├── package.json                              (modified — add deps + scripts)
│
├── db/
│   └── migrations/
│       ├── 0001_init.sql                     (new — orders, order_items, inventory, rate_limit_buckets)
│
├── scripts/
│   ├── db-migrate.ts                         (new)
│   ├── stripe-sync.ts                        (new — creates/updates Stripe Products/Prices from catalog)
│   └── scan-bundle.ts                        (new — post-build secret scanner)
│
├── netlify/functions/
│   ├── _lib/
│   │   ├── env.ts                            (new — server-side env reader)
│   │   ├── db.ts                             (new — Neon serverless client)
│   │   ├── stripe.ts                         (new — Stripe client + verifyWebhook)
│   │   ├── resend.ts                         (new — Resend client + receipt template)
│   │   ├── validate.ts                       (new — Zod request schemas)
│   │   ├── errors.ts                         (new — AppError + JSON response helpers)
│   │   ├── log.ts                            (new — structured logging + secret redaction)
│   │   ├── rateLimit.ts                      (new — DB-backed token bucket)
│   │   └── pricing.ts                        (new — server price re-derivation)
│   ├── checkout-create-session.ts            (new)
│   └── checkout-webhook.ts                   (new)
│
├── src/
│   ├── store/
│   │   └── cart.ts                           (new — Zustand cart store, persisted)
│   ├── lib/
│   │   └── api.ts                            (new — typed fetch wrapper for /api/*)
│   ├── shared/
│   │   └── schemas.ts                        (new — Zod schemas shared with functions)
│   ├── hooks/
│   │   └── useOrderPolling.ts                (new)
│   ├── components/
│   │   ├── checkout/
│   │   │   ├── CartLine.tsx                  (new)
│   │   │   ├── CartSummary.tsx               (new)
│   │   │   ├── CartDrawer.tsx                (new)
│   │   │   ├── CartButton.tsx                (new — replaces disabled stub in Header)
│   │   │   ├── AddToCartButton.tsx           (new — replaces disabled stub in ArtworkDetail)
│   │   │   └── BuyGalleryButton.tsx          (new — replaces disabled stub in GalleryDetail)
│   │   └── layout/
│   │       └── RootLayout.tsx                (modify — mount CartDrawer + bootstrap TanStack QueryClient)
│   └── routes/
│       ├── Cart.tsx                          (new — replaces NotFound stub)
│       ├── CheckoutSuccess.tsx               (new)
│       ├── CheckoutCancel.tsx                (new)
│       ├── ArtworkDetail.tsx                 (modify — wire AddToCartButton)
│       └── GalleryDetail.tsx                 (modify — wire BuyGalleryButton)
│
├── .env.example                              (modify — uncomment server keys with notes)
│
└── tests/
    ├── unit/
    │   ├── cart-store.test.ts                (new)
    │   ├── pricing.test.ts                   (new — server-side re-derivation)
    │   └── validate.test.ts                  (new — Zod schemas)
    └── integration/                          (new dir)
        └── checkout-create-session.test.ts   (new — hits real test DB + mocked Stripe)
```

---

## Pre-flight setup (do this before Task 1)

You'll need accounts and CLI tools provisioned:

1. **Stripe** — sign up at https://dashboard.stripe.com/. Use Test Mode for everything in Plan 2.
   - Get your **Secret key** (`sk_test_...`) and **Publishable key** (`pk_test_...`)
   - Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
   - Log in: `stripe login`
   - Note the **Webhook signing secret** the CLI gives you when running `stripe listen` — you'll need it for `STRIPE_WEBHOOK_SECRET`
2. **Resend** — sign up at https://resend.com/. The user already provided `RESEND_API_KEY` in `.env`. Verify your sender domain (or use the sandbox `onboarding@resend.dev` while testing).
3. **Neon** — `DATABASE_URL` is already in `.env`. We'll create migrations against this branch. For dev, create a separate branch: `neonctl branches create --name dev` (optional — main branch works for v1).
4. **Netlify CLI** — `npm i -g netlify-cli`. We'll use `netlify dev` to run Vite + Functions together at `localhost:8888`.
5. **JWT secret** — generate one: `openssl rand -base64 64` and stash in `.env` as `JWT_SECRET` (used in Plan 3 too, but `_lib/env.ts` will validate it now).

---

## Task 1: Install Plan 2 dependencies + add npm scripts

**Files:**
- Modify: `/Users/gabrielmotta/jayjo/package.json`

- [ ] **Step 1.1: Install runtime dependencies**

```bash
cd /Users/gabrielmotta/jayjo
npm i @neondatabase/serverless@^0.10.4 stripe@^17.5.0 resend@^4.0.1
```

- [ ] **Step 1.2: Install dev dependencies**

```bash
npm i -D netlify-cli@^17.36.4 @netlify/functions@^2.8.2 @types/node@^22.10.0
```

- [ ] **Step 1.3: Add scripts to `package.json`**

Open `package.json`. The `scripts` block currently has:
```
"dev": "vite",
"build": "tsc --noEmit -p tsconfig.json && vite build",
...
```

Replace `"dev"` and add the new scripts so the block reads:

```json
"scripts": {
  "dev": "netlify dev",
  "dev:vite": "vite",
  "build": "tsc --noEmit -p tsconfig.json && vite build && npm run scan:bundle",
  "preview": "vite preview --port 5173",
  "lint": "eslint . --max-warnings 0",
  "format": "prettier -w .",
  "typecheck": "tsc --noEmit -p tsconfig.json && tsc --noEmit -p tsconfig.node.json && tsc --noEmit -p tsconfig.scripts.json && tsc --noEmit -p tsconfig.functions.json",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test",
  "catalog:validate": "tsx scripts/catalog-validate.ts",
  "db:migrate": "tsx scripts/db-migrate.ts",
  "stripe:sync": "tsx scripts/stripe-sync.ts",
  "scan:bundle": "tsx scripts/scan-bundle.ts"
}
```

- [ ] **Step 1.4: Verify install + typecheck still pass**

```bash
npm run typecheck   # will FAIL because tsconfig.functions.json doesn't exist yet — that's expected; we add it in Task 2
npm test            # 18 tests still pass
```

(Skip the typecheck failure for now — Task 2 fixes it.)

- [ ] **Step 1.5: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(plan-2): install Stripe, Resend, Neon, Netlify CLI dependencies"
```

---

## Task 2: Netlify Functions TypeScript config + netlify.toml

**Files:**
- Create: `/Users/gabrielmotta/jayjo/tsconfig.functions.json`
- Create: `/Users/gabrielmotta/jayjo/netlify.toml`
- Modify: `/Users/gabrielmotta/jayjo/.gitignore`

- [ ] **Step 2.1: Create `tsconfig.functions.json`**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ES2022",
    "lib": ["ES2023"],
    "types": ["node"],
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "jsx": "preserve",
    "paths": {
      "@/shared/*": ["src/shared/*"],
      "@/catalog/*": ["src/catalog/*"]
    }
  },
  "include": ["netlify/functions/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 2.2: Create `netlify.toml`**

```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "20"

[functions]
  node_bundler = "esbuild"
  external_node_modules = ["@neondatabase/serverless"]

# SPA fallback — must come AFTER api redirects below
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Security headers — strict CSP; Stripe + Plausible whitelisted
[[headers]]
  for = "/*"
  [headers.values]
    Strict-Transport-Security = "max-age=63072000; includeSubDomains; preload"
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(), camera=(), microphone=(), payment=(self \"https://js.stripe.com\")"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com https://plausible.io; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: https:; connect-src 'self' https://api.stripe.com https://plausible.io; frame-src https://js.stripe.com https://hooks.stripe.com; object-src 'none'; base-uri 'self'; form-action 'self' https://checkout.stripe.com"
```

- [ ] **Step 2.3: Update `.gitignore`** — add `.netlify/` if not present, plus the build artifact for functions.

Append to `/Users/gabrielmotta/jayjo/.gitignore`:

```
# Netlify dev artifacts
.netlify/
```

(If `.netlify/` already exists in `.gitignore`, skip — `grep -E "^\.netlify/?$" .gitignore` to check first.)

- [ ] **Step 2.4: Verify typecheck passes**

```bash
npm run typecheck
```

Expected: all 4 tsconfig projects exit 0. (No function files exist yet — the empty `include` glob is fine.)

- [ ] **Step 2.5: Commit**

```bash
git add tsconfig.functions.json netlify.toml .gitignore
git commit -m "chore(plan-2): add netlify.toml, functions tsconfig, csp + security headers"
```

---

## Task 3: Server env reader + DB client + Stripe + Resend singletons

**Files:**
- Create: `/Users/gabrielmotta/jayjo/netlify/functions/_lib/env.ts`
- Create: `/Users/gabrielmotta/jayjo/netlify/functions/_lib/db.ts`
- Create: `/Users/gabrielmotta/jayjo/netlify/functions/_lib/stripe.ts`
- Create: `/Users/gabrielmotta/jayjo/netlify/functions/_lib/resend.ts`
- Create: `/Users/gabrielmotta/jayjo/netlify/functions/_lib/log.ts`
- Create: `/Users/gabrielmotta/jayjo/netlify/functions/_lib/errors.ts`

- [ ] **Step 3.1: Create `_lib/env.ts`**

```ts
import { z } from "zod";

const ServerEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  STRIPE_SECRET_KEY: z.string().min(10).startsWith("sk_"),
  STRIPE_WEBHOOK_SECRET: z.string().min(10).startsWith("whsec_"),
  RESEND_API_KEY: z.string().min(10).startsWith("re_"),
  JWT_SECRET: z.string().min(32),
  APP_URL: z.string().url(),
  NOTIFY_EMAIL: z.string().email(),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;

let cached: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = ServerEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Missing or invalid server env vars: ${missing}`);
  }
  cached = parsed.data;
  return cached;
}
```

- [ ] **Step 3.2: Create `_lib/log.ts`** — structured logger with secret redaction.

```ts
const SECRET_PATTERNS = [
  /sk_(live|test)_[A-Za-z0-9]{20,}/g,
  /whsec_[A-Za-z0-9]{20,}/g,
  /re_[A-Za-z0-9_]{20,}/g,
  /xai-[A-Za-z0-9]{20,}/g,
  /ghp_[A-Za-z0-9]{20,}/g,
  /npg_[A-Za-z0-9]{8,}/g,
  /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, // JWT
];

function redact(value: unknown): unknown {
  if (typeof value === "string") {
    let out = value;
    for (const p of SECRET_PATTERNS) out = out.replace(p, "[REDACTED]");
    return out;
  }
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object") {
    const o: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) o[k] = redact(v);
    return o;
  }
  return value;
}

export function log(level: "info" | "warn" | "error", msg: string, ctx: Record<string, unknown> = {}) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    msg,
    ...(redact(ctx) as Record<string, unknown>),
  };
  const sink = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
  sink(JSON.stringify(entry));
}

export function newRequestId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
```

- [ ] **Step 3.3: Create `_lib/errors.ts`**

```ts
import { log } from "./log";

export class AppError extends Error {
  constructor(
    public code: string,
    public httpStatus: number,
    message: string,
    public context: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

export function errorResponse(err: unknown, requestId: string) {
  if (err instanceof AppError) {
    log("warn", err.message, { code: err.code, requestId, ...err.context });
    return jsonResponse({ error: { code: err.code, message: err.message, requestId } }, err.httpStatus);
  }
  log("error", "Unhandled error", { requestId, error: String(err), stack: (err as Error)?.stack });
  return jsonResponse(
    { error: { code: "internal_error", message: "Something went wrong.", requestId } },
    500,
  );
}
```

- [ ] **Step 3.4: Create `_lib/db.ts`**

```ts
import { neon } from "@neondatabase/serverless";
import { getServerEnv } from "./env";

let cached: ReturnType<typeof neon> | null = null;

export function db() {
  if (cached) return cached;
  cached = neon(getServerEnv().DATABASE_URL);
  return cached;
}
```

- [ ] **Step 3.5: Create `_lib/stripe.ts`**

```ts
import Stripe from "stripe";
import { getServerEnv } from "./env";

let cached: Stripe | null = null;

export function stripe(): Stripe {
  if (cached) return cached;
  cached = new Stripe(getServerEnv().STRIPE_SECRET_KEY, {
    apiVersion: "2025-09-30.acacia",
    typescript: true,
  });
  return cached;
}

export function verifyWebhook(rawBody: string, signature: string): Stripe.Event {
  return stripe().webhooks.constructEvent(rawBody, signature, getServerEnv().STRIPE_WEBHOOK_SECRET);
}
```

- [ ] **Step 3.6: Create `_lib/resend.ts`**

```ts
import { Resend } from "resend";
import { getServerEnv } from "./env";
import { log } from "./log";

let cached: Resend | null = null;

function client(): Resend {
  if (cached) return cached;
  cached = new Resend(getServerEnv().RESEND_API_KEY);
  return cached;
}

interface OrderReceiptInput {
  to: string;
  orderId: string;
  guestToken: string | null;
  totalCents: number;
  currency: string;
  items: Array<{ title: string; variantLabel?: string; quantity: number; unitPriceCents: number }>;
}

function formatCents(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export async function sendOrderReceipt(input: OrderReceiptInput): Promise<void> {
  const env = getServerEnv();
  const trackUrl = input.guestToken
    ? `${env.APP_URL}/account/orders/${input.orderId}?token=${input.guestToken}`
    : `${env.APP_URL}/account/orders/${input.orderId}`;

  const itemsHtml = input.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0;">${i.title}${i.variantLabel ? ` — ${i.variantLabel}` : ""} × ${i.quantity}</td><td style="padding:6px 0;text-align:right;">${formatCents(i.unitPriceCents * i.quantity, input.currency)}</td></tr>`,
    )
    .join("");

  const html = `
<!doctype html>
<html><body style="font-family: Georgia, serif; background:#F2EBDC; color:#2E1F12; padding:32px;">
  <div style="max-width:560px; margin:0 auto; background:#E8E2D3; padding:32px; border-radius:8px;">
    <p style="font-size:12px; letter-spacing:0.18em; text-transform:uppercase; color:#756751;">Studio JayJo</p>
    <h1 style="font-size:28px; margin:8px 0 24px;">Thank you for your order</h1>
    <p>We've received your order. We'll email you again when it ships.</p>
    <table style="width:100%; margin-top:24px; border-top:1px solid #A89A86; border-bottom:1px solid #A89A86; padding:12px 0;">${itemsHtml}</table>
    <p style="font-size:18px; text-align:right; margin:16px 0;"><strong>Total: ${formatCents(input.totalCents, input.currency)}</strong></p>
    <p style="margin-top:24px;"><a href="${trackUrl}" style="color:#A6541F;">Track your order</a></p>
    <p style="margin-top:32px; font-size:12px; color:#756751;">Studio JayJo · hello@studiojayjo.com</p>
  </div>
</body></html>`;

  const result = await client().emails.send({
    from: "Studio JayJo <hello@studiojayjo.com>",
    to: input.to,
    subject: `Your Studio JayJo order — ${input.orderId.slice(0, 8)}`,
    html,
  });

  log("info", "Receipt email sent", { id: result.data?.id, recipient: input.to, template: "order_receipt" });
}
```

- [ ] **Step 3.7: Run typecheck**

```bash
npm run typecheck
```

Expected: exit 0.

- [ ] **Step 3.8: Commit**

```bash
git add netlify/functions/_lib/
git commit -m "feat(functions): add env, db, stripe, resend, log, errors lib modules"
```

---

## Task 4: Database schema + migration runner

**Files:**
- Create: `/Users/gabrielmotta/jayjo/db/migrations/0001_init.sql`
- Create: `/Users/gabrielmotta/jayjo/scripts/db-migrate.ts`

- [ ] **Step 4.1: Create `db/migrations/0001_init.sql`**

```sql
-- Studio JayJo Plan 2 — Commerce tables
-- Users + auth land in Plan 3; included here as placeholder so orders can FK once it lands.
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         CITEXT UNIQUE NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS orders (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID REFERENCES users(id),
  email              CITEXT NOT NULL,
  stripe_session_id  TEXT UNIQUE NOT NULL,
  stripe_payment_id  TEXT,
  status             TEXT NOT NULL CHECK (status IN ('pending','paid','refunded','failed')),
  subtotal_cents     INTEGER NOT NULL,
  shipping_cents     INTEGER NOT NULL DEFAULT 0,
  tax_cents          INTEGER NOT NULL DEFAULT 0,
  total_cents        INTEGER NOT NULL,
  currency           TEXT NOT NULL,
  shipping_address   JSONB,
  guest_token        TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS orders_email_idx ON orders (email);
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders (user_id);
CREATE INDEX IF NOT EXISTS orders_guest_token_idx ON orders (guest_token) WHERE guest_token IS NOT NULL;

CREATE TABLE IF NOT EXISTS order_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  artwork_slug     TEXT NOT NULL,
  variant_id       TEXT,
  title            TEXT NOT NULL,
  variant_label    TEXT,
  unit_price_cents INTEGER NOT NULL,
  quantity         INTEGER NOT NULL CHECK (quantity > 0),
  image_url        TEXT
);
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items (order_id);

CREATE TABLE IF NOT EXISTS inventory (
  artwork_slug TEXT NOT NULL,
  variant_id   TEXT NOT NULL DEFAULT '',
  stock        INTEGER NOT NULL CHECK (stock >= 0),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (artwork_slug, variant_id)
);

CREATE TABLE IF NOT EXISTS rate_limit_buckets (
  key        TEXT PRIMARY KEY,
  count      INTEGER NOT NULL,
  reset_at   TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS schema_migrations (
  version    TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

- [ ] **Step 4.2: Create `scripts/db-migrate.ts`**

```ts
import { neon } from "@neondatabase/serverless";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const MIGRATIONS_DIR = join(process.cwd(), "db", "migrations");

async function ensureTable() {
  await sql(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
}

async function applied(): Promise<Set<string>> {
  const rows = (await sql(`SELECT version FROM schema_migrations`)) as { version: string }[];
  return new Set(rows.map((r) => r.version));
}

async function main() {
  await ensureTable();
  const seen = await applied();
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  let count = 0;
  for (const f of files) {
    const version = f.replace(/\.sql$/, "");
    if (seen.has(version)) {
      console.log(`✓ ${version} (already applied)`);
      continue;
    }
    const body = readFileSync(join(MIGRATIONS_DIR, f), "utf8");
    console.log(`→ applying ${version}`);
    // Split by ';' carefully; Neon serverless one-shot is single statement, so loop.
    const statements = body
      .split(/;\s*$/m)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    for (const stmt of statements) {
      await sql(stmt);
    }
    await sql(`INSERT INTO schema_migrations (version) VALUES ($1)`, [version]);
    console.log(`✓ ${version} applied`);
    count++;
  }
  console.log(`\nApplied ${count} new migration(s).`);
}

main().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
```

- [ ] **Step 4.3: Run the migration against Neon**

```bash
npm run db:migrate
```

Expected output:
```
→ applying 0001_init
✓ 0001_init applied

Applied 1 new migration(s).
```

If the migration partially fails, fix the SQL and re-run (the `IF NOT EXISTS` clauses make the migration idempotent up to a point; if you need a clean slate, drop and re-create the database via the Neon dashboard).

- [ ] **Step 4.4: Verify tables exist**

```bash
node -e "
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env' });
(async () => {
  const sql = neon(process.env.DATABASE_URL);
  const rows = await sql(\`SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename\`);
  console.log(rows.map(r => r.tablename));
})();
"
```

Expected output includes: `inventory`, `order_items`, `orders`, `rate_limit_buckets`, `schema_migrations`, `users`.

(If `dotenv` complains, you may need to `npm i -D dotenv` first. Alternatively run `DATABASE_URL="$(grep DATABASE_URL .env | cut -d= -f2-)" node -e ...`.)

- [ ] **Step 4.5: Commit**

```bash
git add db/migrations/0001_init.sql scripts/db-migrate.ts
git commit -m "feat(db): add 0001_init migration with orders/items/inventory tables + migration runner"
```

---

## Task 5: Stripe products sync script

**Files:**
- Create: `/Users/gabrielmotta/jayjo/scripts/stripe-sync.ts`

- [ ] **Step 5.1: Create `scripts/stripe-sync.ts`** — idempotent sync of catalog → Stripe Products + Prices

```ts
import { readdirSync } from "node:fs";
import { join } from "node:path";
import Stripe from "stripe";
import { pathToFileURL } from "node:url";
import type { Artwork, Gallery } from "../src/catalog/types";

const KEY = process.env.STRIPE_SECRET_KEY;
if (!KEY) {
  console.error("STRIPE_SECRET_KEY not set in env");
  process.exit(1);
}
const stripe = new Stripe(KEY, { apiVersion: "2025-09-30.acacia" });

const ART_DIR = join(process.cwd(), "src", "content", "artworks");
const GAL_DIR = join(process.cwd(), "src", "content", "galleries");

async function loadArtworks(): Promise<Artwork[]> {
  const files = readdirSync(ART_DIR).filter((f) => f.endsWith(".ts"));
  const all: Artwork[] = [];
  for (const f of files) {
    const mod = (await import(pathToFileURL(join(ART_DIR, f)).href)) as { artwork: Artwork };
    all.push(mod.artwork);
  }
  return all;
}

async function loadGalleries(): Promise<Gallery[]> {
  const files = readdirSync(GAL_DIR).filter((f) => f.endsWith(".ts"));
  const all: Gallery[] = [];
  for (const f of files) {
    const mod = (await import(pathToFileURL(join(GAL_DIR, f)).href)) as { gallery: Gallery };
    all.push(mod.gallery);
  }
  return all;
}

async function findOrCreateProduct(name: string, metadataKey: string, metadataValue: string): Promise<string> {
  const search = await stripe.products.search({
    query: `metadata['${metadataKey}']:'${metadataValue}' AND active:'true'`,
    limit: 1,
  });
  if (search.data[0]) return search.data[0].id;
  const created = await stripe.products.create({
    name,
    metadata: { [metadataKey]: metadataValue },
  });
  return created.id;
}

async function findOrCreatePrice(
  productId: string,
  unitAmount: number,
  currency: string,
  metadataKey: string,
  metadataValue: string,
): Promise<string> {
  const prices = await stripe.prices.list({
    product: productId,
    active: true,
    limit: 100,
  });
  const match = prices.data.find(
    (p) => p.unit_amount === unitAmount && p.currency === currency && p.metadata[metadataKey] === metadataValue,
  );
  if (match) return match.id;
  const created = await stripe.prices.create({
    product: productId,
    unit_amount: unitAmount,
    currency,
    metadata: { [metadataKey]: metadataValue },
  });
  return created.id;
}

async function main() {
  const artworks = await loadArtworks();
  const galleries = await loadGalleries();
  const updates: Array<{ file: string; field: string; oldId: string; newId: string }> = [];

  for (const a of artworks) {
    const productId = await findOrCreateProduct(a.title, "catalogSlug", a.slug);
    for (const v of a.variants) {
      const priceId = await findOrCreatePrice(productId, v.priceCents, "usd", "variantId", `${a.slug}:${v.id}`);
      if (v.stripePriceId !== priceId) {
        updates.push({ file: `artworks/${a.slug}.ts`, field: `variants[${v.id}].stripePriceId`, oldId: v.stripePriceId, newId: priceId });
      }
      console.log(`✓ ${a.slug} / ${v.id} → ${priceId}`);
    }
  }

  for (const g of galleries) {
    if (!g.bundle) continue;
    const productId = await findOrCreateProduct(`${g.title} (Gallery)`, "galleryBundleSlug", g.slug);
    const priceId = await findOrCreatePrice(productId, g.bundle.bundlePriceCents, "usd", "galleryBundleSlug", g.slug);
    if (g.bundle.stripePriceId !== priceId) {
      updates.push({ file: `galleries/${g.slug}.ts`, field: `bundle.stripePriceId`, oldId: g.bundle.stripePriceId, newId: priceId });
    }
    console.log(`✓ ${g.slug} bundle → ${priceId}`);
  }

  if (updates.length > 0) {
    console.log(`\nThe following catalog files reference outdated/placeholder Stripe Price IDs. Update them:\n`);
    for (const u of updates) console.log(`  ${u.file}: ${u.field}\n    was: ${u.oldId}\n    now: ${u.newId}`);
    console.log(`\n(Plan: the placeholders currently in the catalog files were intentional for Plan 1.)`);
  } else {
    console.log(`\nAll catalog Stripe Price IDs are up to date.`);
  }
}

main().catch((e) => {
  console.error("Stripe sync failed:", e);
  process.exit(1);
});
```

- [ ] **Step 5.2: Load env and run the sync**

```bash
export $(grep -v '^#' .env | xargs)   # load .env into shell
npm run stripe:sync
```

Expected: prints `✓ <slug>/<variant> → price_xxx` for every artwork variant + 1 line per gallery bundle. Then a list of placeholder Price IDs to replace in the catalog files.

- [ ] **Step 5.3: Update each catalog content file with the real Stripe Price IDs**

The script's output names every catalog file that needs editing and the exact replacement. For each one:

- Open the file (e.g. `src/content/artworks/evening-fig.ts`)
- Find the variant by `id` (e.g. `id: "a4"`)
- Replace the placeholder `stripePriceId: "price_placeholder_ef_a4"` with the real ID from the script output
- Do this for every variant on every artwork, and for `bundle.stripePriceId` on the `warm-study` gallery

- [ ] **Step 5.4: Re-run `npm run stripe:sync`**

Expected: no remaining placeholders flagged. Output ends with `All catalog Stripe Price IDs are up to date.`

- [ ] **Step 5.5: Re-run `npm run catalog:validate`**

Confirms the catalog still validates after the edits.

- [ ] **Step 5.6: Commit**

```bash
git add scripts/stripe-sync.ts src/content/
git commit -m "feat(stripe): add idempotent product/price sync; replace catalog placeholder IDs with real Stripe IDs"
```

---

## Task 6: Server-side pricing module (re-derive cart totals, never trust client)

**Files:**
- Create: `/Users/gabrielmotta/jayjo/netlify/functions/_lib/pricing.ts`
- Create: `/Users/gabrielmotta/jayjo/tests/unit/pricing.test.ts`

- [ ] **Step 6.1: Write failing test `tests/unit/pricing.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { resolveCartLines, type CartInput } from "../../netlify/functions/_lib/pricing";
import type { Artwork, Gallery } from "@/catalog/types";

const artwork: Artwork = {
  slug: "evening-fig",
  title: "Evening Fig",
  year: 2024,
  kind: "print",
  medium: "Giclée",
  description: "",
  colorTags: ["deep-fig"],
  sizeTags: ["small"],
  images: [{ src: "/a.jpg", alt: "a", aspect: 1 }],
  variants: [
    { id: "a4", label: "A4", priceCents: 8500, stripePriceId: "price_a4" },
    { id: "a3", label: "A3", priceCents: 14500, stripePriceId: "price_a3" },
  ],
  shippingGroup: "print",
  published: true,
  publishedAt: "2024-11-01",
};

const original: Artwork = {
  ...artwork,
  slug: "olive-grove",
  title: "Olive Grove",
  kind: "original",
  variants: [{ id: "original", label: "Original", priceCents: 380000, stripePriceId: "price_o", stock: 1 }],
  shippingGroup: "original-oversized",
};

const gallery: Gallery = {
  slug: "warm-study",
  title: "Warm Study",
  description: "",
  heroImage: { src: "/h.jpg", alt: "h", aspect: 1 },
  artworkSlugs: ["evening-fig"],
  bundle: { stripePriceId: "price_bundle", bundlePriceCents: 38500 },
  published: true,
  publishedAt: "2024-11-05",
};

describe("resolveCartLines", () => {
  it("resolves a print variant line", () => {
    const out = resolveCartLines(
      [{ kind: "artwork", slug: "evening-fig", variantId: "a3", quantity: 2 }] satisfies CartInput[],
      { artworks: [artwork, original], galleries: [gallery] },
    );
    expect(out.lines).toEqual([
      {
        kind: "artwork",
        slug: "evening-fig",
        variantId: "a3",
        title: "Evening Fig",
        variantLabel: "A3",
        unitPriceCents: 14500,
        quantity: 2,
        stripePriceId: "price_a3",
        imageUrl: "/a.jpg",
      },
    ]);
    expect(out.subtotalCents).toBe(29000);
  });

  it("resolves a gallery bundle line", () => {
    const out = resolveCartLines(
      [{ kind: "gallery", slug: "warm-study", quantity: 1 }],
      { artworks: [artwork, original], galleries: [gallery] },
    );
    expect(out.lines[0]).toMatchObject({
      kind: "gallery",
      slug: "warm-study",
      title: "Warm Study (Gallery)",
      unitPriceCents: 38500,
      stripePriceId: "price_bundle",
    });
  });

  it("throws PRICE_NOT_FOUND when artwork is missing", () => {
    expect(() =>
      resolveCartLines(
        [{ kind: "artwork", slug: "nope", variantId: "a4", quantity: 1 }],
        { artworks: [artwork], galleries: [] },
      ),
    ).toThrowError(/PRICE_NOT_FOUND/);
  });

  it("throws PRICE_NOT_FOUND when variant is missing", () => {
    expect(() =>
      resolveCartLines(
        [{ kind: "artwork", slug: "evening-fig", variantId: "xxl", quantity: 1 }],
        { artworks: [artwork], galleries: [] },
      ),
    ).toThrowError(/PRICE_NOT_FOUND/);
  });

  it("throws QUANTITY_INVALID for non-positive quantity", () => {
    expect(() =>
      resolveCartLines(
        [{ kind: "artwork", slug: "evening-fig", variantId: "a4", quantity: 0 }],
        { artworks: [artwork], galleries: [] },
      ),
    ).toThrowError(/QUANTITY_INVALID/);
  });

  it("caps original quantity at 1", () => {
    expect(() =>
      resolveCartLines(
        [{ kind: "artwork", slug: "olive-grove", variantId: "original", quantity: 2 }],
        { artworks: [artwork, original], galleries: [] },
      ),
    ).toThrowError(/QUANTITY_INVALID/);
  });
});
```

- [ ] **Step 6.2: Run, confirm FAIL**

```bash
npm test -- tests/unit/pricing.test.ts
```
Expected: module not found.

- [ ] **Step 6.3: Implement `_lib/pricing.ts`**

```ts
import type { Artwork, Gallery } from "@/catalog/types";

export interface CartInput {
  kind: "artwork" | "gallery";
  slug: string;
  variantId?: string;
  quantity: number;
}

export interface ResolvedLine {
  kind: "artwork" | "gallery";
  slug: string;
  variantId?: string;
  title: string;
  variantLabel?: string;
  unitPriceCents: number;
  quantity: number;
  stripePriceId: string;
  imageUrl: string;
}

export interface ResolveResult {
  lines: ResolvedLine[];
  subtotalCents: number;
}

interface Catalog {
  artworks: Artwork[];
  galleries: Gallery[];
}

export class PricingError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

export function resolveCartLines(inputs: CartInput[], catalog: Catalog): ResolveResult {
  const lines: ResolvedLine[] = [];
  let subtotalCents = 0;

  for (const input of inputs) {
    if (input.quantity < 1 || !Number.isFinite(input.quantity) || !Number.isInteger(input.quantity)) {
      throw new PricingError("QUANTITY_INVALID", `Quantity must be a positive integer for ${input.slug}`);
    }

    if (input.kind === "artwork") {
      const artwork = catalog.artworks.find((a) => a.slug === input.slug);
      if (!artwork) throw new PricingError("PRICE_NOT_FOUND", `Artwork not found: ${input.slug}`);
      const variant = artwork.variants.find((v) => v.id === input.variantId);
      if (!variant)
        throw new PricingError("PRICE_NOT_FOUND", `Variant not found: ${input.slug}/${input.variantId}`);
      if (artwork.kind === "original" && input.quantity > 1)
        throw new PricingError("QUANTITY_INVALID", `Originals are limited to quantity 1`);

      const line: ResolvedLine = {
        kind: "artwork",
        slug: artwork.slug,
        variantId: variant.id,
        title: artwork.title,
        variantLabel: variant.label,
        unitPriceCents: variant.priceCents,
        quantity: input.quantity,
        stripePriceId: variant.stripePriceId,
        imageUrl: artwork.images[0].src,
      };
      lines.push(line);
      subtotalCents += line.unitPriceCents * line.quantity;
    } else {
      const gallery = catalog.galleries.find((g) => g.slug === input.slug);
      if (!gallery) throw new PricingError("PRICE_NOT_FOUND", `Gallery not found: ${input.slug}`);
      if (!gallery.bundle)
        throw new PricingError("PRICE_NOT_FOUND", `Gallery has no bundle SKU: ${input.slug}`);

      const line: ResolvedLine = {
        kind: "gallery",
        slug: gallery.slug,
        title: `${gallery.title} (Gallery)`,
        unitPriceCents: gallery.bundle.bundlePriceCents,
        quantity: input.quantity,
        stripePriceId: gallery.bundle.stripePriceId,
        imageUrl: gallery.heroImage.src,
      };
      lines.push(line);
      subtotalCents += line.unitPriceCents * line.quantity;
    }
  }

  return { lines, subtotalCents };
}
```

- [ ] **Step 6.4: Run, confirm PASS**

```bash
npm test -- tests/unit/pricing.test.ts
```
Expected: 6/6 PASS.

- [ ] **Step 6.5: Commit**

```bash
git add netlify/functions/_lib/pricing.ts tests/unit/pricing.test.ts
git commit -m "feat(pricing): add server-side cart re-derivation; never trusts client prices"
```

---

## Task 7: Shared request schemas (Zod) + validate helper

**Files:**
- Create: `/Users/gabrielmotta/jayjo/src/shared/schemas.ts`
- Create: `/Users/gabrielmotta/jayjo/netlify/functions/_lib/validate.ts`
- Create: `/Users/gabrielmotta/jayjo/tests/unit/validate.test.ts`

- [ ] **Step 7.1: Create `src/shared/schemas.ts`** — schemas reusable by client and server.

```ts
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
```

- [ ] **Step 7.2: Create `_lib/validate.ts`**

```ts
import { z } from "zod";
import { AppError } from "./errors";

export async function parseJson<T>(req: Request, schema: z.ZodType<T>): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new AppError("invalid_json", 400, "Request body must be JSON.");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new AppError("validation_failed", 400, "Invalid request body.", {
      issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
  }
  return parsed.data;
}
```

- [ ] **Step 7.3: Write failing test `tests/unit/validate.test.ts`**

```ts
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
    const items = Array.from({ length: 21 }, () => ({ kind: "artwork", slug: "x", variantId: "a", quantity: 1 }));
    expect(CreateCheckoutRequestSchema.safeParse({ items }).success).toBe(false);
  });
});
```

- [ ] **Step 7.4: Run, confirm PASS**

```bash
npm test -- tests/unit/validate.test.ts
```
Expected: 6/6 PASS.

- [ ] **Step 7.5: Commit**

```bash
git add src/shared/schemas.ts netlify/functions/_lib/validate.ts tests/unit/validate.test.ts
git commit -m "feat(shared): add Zod request schemas and validate helper"
```

---

## Task 8: Cart Zustand store

**Files:**
- Create: `/Users/gabrielmotta/jayjo/src/store/cart.ts`
- Create: `/Users/gabrielmotta/jayjo/tests/unit/cart-store.test.ts`

- [ ] **Step 8.1: Write failing test `tests/unit/cart-store.test.ts`**

```ts
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
```

- [ ] **Step 8.2: Run, confirm FAIL**

```bash
npm test -- tests/unit/cart-store.test.ts
```

- [ ] **Step 8.3: Implement `src/store/cart.ts`**

```ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const CART_STORAGE_KEY = "studio-jayjo-cart";

export interface CartLine {
  kind: "artwork" | "gallery";
  slug: string;
  variantId?: string;
  quantity: number;
}

type LineKey = Pick<CartLine, "kind" | "slug" | "variantId">;

function sameLine(a: LineKey, b: LineKey): boolean {
  return a.kind === b.kind && a.slug === b.slug && (a.variantId ?? "") === (b.variantId ?? "");
}

interface CartState {
  items: CartLine[];
  add: (key: LineKey) => void;
  remove: (key: LineKey) => void;
  setQuantity: (key: LineKey, quantity: number) => void;
  clear: () => void;
  itemCount: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (key) =>
        set((s) => {
          const existing = s.items.find((i) => sameLine(i, key));
          if (existing) {
            return {
              items: s.items.map((i) => (sameLine(i, key) ? { ...i, quantity: i.quantity + 1 } : i)),
            };
          }
          return { items: [...s.items, { ...key, quantity: 1 }] };
        }),
      remove: (key) => set((s) => ({ items: s.items.filter((i) => !sameLine(i, key)) })),
      setQuantity: (key, quantity) =>
        set((s) => {
          if (quantity <= 0) return { items: s.items.filter((i) => !sameLine(i, key)) };
          return {
            items: s.items.map((i) => (sameLine(i, key) ? { ...i, quantity } : i)),
          };
        }),
      clear: () => set({ items: [] }),
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: CART_STORAGE_KEY },
  ),
);
```

- [ ] **Step 8.4: Run, confirm 8/8 PASS**

```bash
npm test -- tests/unit/cart-store.test.ts
```

- [ ] **Step 8.5: Commit**

```bash
git add src/store/cart.ts tests/unit/cart-store.test.ts
git commit -m "feat(cart): add cart Zustand store with localStorage persistence (8 tests)"
```

---

## Task 9: Typed API fetch wrapper

**Files:**
- Create: `/Users/gabrielmotta/jayjo/src/lib/api.ts`

- [ ] **Step 9.1: Create `src/lib/api.ts`**

```ts
import { env } from "@/lib/env";

export interface ApiError {
  code: string;
  message: string;
  requestId?: string;
}

export class FetchError extends Error {
  constructor(public status: number, public apiError: ApiError) {
    super(apiError.message);
  }
}

async function call<TBody, TResponse>(
  method: "GET" | "POST",
  path: string,
  body?: TBody,
): Promise<TResponse> {
  const baseUrl = env.APP_URL.replace(/\/$/, "");
  const url = path.startsWith("http") ? path : `${baseUrl}${path}`;
  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let payload: { error?: ApiError } = {};
    try {
      payload = await res.json();
    } catch {
      // ignore
    }
    throw new FetchError(res.status, payload.error ?? { code: "network_error", message: res.statusText });
  }
  return (await res.json()) as TResponse;
}

export const api = {
  post<TBody, TResponse>(path: string, body: TBody): Promise<TResponse> {
    return call<TBody, TResponse>("POST", path, body);
  },
  get<TResponse>(path: string): Promise<TResponse> {
    return call<undefined, TResponse>("GET", path);
  },
};
```

- [ ] **Step 9.2: Commit**

```bash
git add src/lib/api.ts
git commit -m "feat(lib): add typed api fetch wrapper for /api/* endpoints"
```

---

## Task 10: `checkout-create-session` Netlify Function

**Files:**
- Create: `/Users/gabrielmotta/jayjo/netlify/functions/checkout-create-session.ts`

- [ ] **Step 10.1: Implement the function**

```ts
import type { Context } from "@netlify/functions";
import { randomBytes } from "node:crypto";
import { stripe } from "./_lib/stripe";
import { db } from "./_lib/db";
import { getServerEnv } from "./_lib/env";
import { parseJson } from "./_lib/validate";
import { CreateCheckoutRequestSchema } from "../../src/shared/schemas";
import { resolveCartLines, PricingError } from "./_lib/pricing";
import { AppError, errorResponse, jsonResponse } from "./_lib/errors";
import { log, newRequestId } from "./_lib/log";
import { filesAdapter } from "../../src/catalog/adapters/files";

const SHIPPING_RATES = {
  // Configure in Stripe dashboard then drop the IDs here OR pass shipping_options inline.
  // For Plan 2 simplicity: inline two rates. Replace with dashboard IDs in production.
} as const;

export default async (req: Request, _ctx: Context): Promise<Response> => {
  const requestId = newRequestId();
  try {
    if (req.method !== "POST") throw new AppError("method_not_allowed", 405, "POST only");

    const env = getServerEnv();
    const body = await parseJson(req, CreateCheckoutRequestSchema);

    const artworks = await filesAdapter.listArtworks();
    const galleries = await filesAdapter.listGalleries();

    let resolved;
    try {
      resolved = resolveCartLines(body.items, { artworks, galleries });
    } catch (e) {
      if (e instanceof PricingError) {
        throw new AppError(e.code, 400, e.message);
      }
      throw e;
    }

    // Determine shipping group: if ANY line is an oversized original, use the heavier rate.
    const needsOversized = resolved.lines.some((l) => {
      if (l.kind !== "artwork") return false;
      const a = artworks.find((x) => x.slug === l.slug);
      return a?.shippingGroup === "original-oversized";
    });

    const guestToken = randomBytes(24).toString("base64url");

    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: resolved.lines.map((l) => ({
        price: l.stripePriceId,
        quantity: l.quantity,
      })),
      automatic_tax: { enabled: true },
      shipping_address_collection: {
        allowed_countries: [
          "US","CA","GB","IE","FR","DE","ES","IT","NL","BE","SE","DK","NO","FI","CH","AT","PT","AU","NZ","JP","SG","HK",
        ],
      },
      shipping_options: needsOversized
        ? [
            {
              shipping_rate_data: {
                type: "fixed_amount",
                fixed_amount: { amount: 7500, currency: "usd" },
                display_name: "White-glove (originals)",
                delivery_estimate: {
                  minimum: { unit: "business_day", value: 5 },
                  maximum: { unit: "business_day", value: 14 },
                },
              },
            },
          ]
        : [
            {
              shipping_rate_data: {
                type: "fixed_amount",
                fixed_amount: { amount: 1500, currency: "usd" },
                display_name: "Standard (prints)",
                delivery_estimate: {
                  minimum: { unit: "business_day", value: 3 },
                  maximum: { unit: "business_day", value: 7 },
                },
              },
            },
          ],
      success_url: `${env.APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.APP_URL}/checkout/cancel`,
      metadata: {
        guest_token: guestToken,
        cart_hash: resolved.lines.map((l) => `${l.slug}:${l.variantId ?? ""}:${l.quantity}`).join(","),
      },
    });

    // Persist a pending order row so webhook can find it; the webhook upgrades status to 'paid'.
    await db()(
      `INSERT INTO orders (stripe_session_id, email, status, subtotal_cents, total_cents, currency, guest_token)
       VALUES ($1, $2, 'pending', $3, $3, 'usd', $4)
       ON CONFLICT (stripe_session_id) DO NOTHING`,
      [session.id, "pending@studiojayjo.com", resolved.subtotalCents, guestToken],
    );

    log("info", "Checkout session created", {
      requestId,
      sessionId: session.id,
      lineCount: resolved.lines.length,
      subtotalCents: resolved.subtotalCents,
    });

    return jsonResponse({ url: session.url });
  } catch (e) {
    return errorResponse(e, requestId);
  }
};

export const config = { path: "/api/checkout-create-session" };
```

- [ ] **Step 10.2: Run typecheck**

```bash
npm run typecheck
```

Expected: exit 0.

- [ ] **Step 10.3: Commit**

```bash
git add netlify/functions/checkout-create-session.ts
git commit -m "feat(checkout): add create-session function with server price re-derivation, shipping rates by group, Stripe Tax"
```

---

## Task 11: `checkout-webhook` Netlify Function

**Files:**
- Create: `/Users/gabrielmotta/jayjo/netlify/functions/checkout-webhook.ts`

- [ ] **Step 11.1: Implement**

```ts
import type { Context } from "@netlify/functions";
import type Stripe from "stripe";
import { verifyWebhook, stripe } from "./_lib/stripe";
import { db } from "./_lib/db";
import { sendOrderReceipt } from "./_lib/resend";
import { AppError, errorResponse, jsonResponse } from "./_lib/errors";
import { log, newRequestId } from "./_lib/log";
import { filesAdapter } from "../../src/catalog/adapters/files";

export default async (req: Request, _ctx: Context): Promise<Response> => {
  const requestId = newRequestId();
  try {
    if (req.method !== "POST") throw new AppError("method_not_allowed", 405, "POST only");

    const signature = req.headers.get("stripe-signature");
    if (!signature) throw new AppError("missing_signature", 400, "Stripe signature header missing");

    const rawBody = await req.text();
    let event: Stripe.Event;
    try {
      event = verifyWebhook(rawBody, signature);
    } catch (e) {
      log("warn", "Webhook signature verification failed", { requestId, error: String(e) });
      throw new AppError("invalid_signature", 400, "Invalid webhook signature");
    }

    log("info", "Webhook received", { requestId, type: event.type, id: event.id });

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleSessionCompleted(session, requestId);
    } else if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      await handleRefund(charge, requestId);
    } else {
      log("info", "Ignored event type", { requestId, type: event.type });
    }

    return jsonResponse({ received: true });
  } catch (e) {
    return errorResponse(e, requestId);
  }
};

async function handleSessionCompleted(session: Stripe.Checkout.Session, requestId: string) {
  // Expand line items to get pricing details for persistence
  const expanded = await stripe().checkout.sessions.retrieve(session.id, {
    expand: ["line_items", "line_items.data.price"],
  });
  const lineItems = expanded.line_items?.data ?? [];

  const email = session.customer_details?.email ?? "unknown@studiojayjo.com";
  const guestToken = session.metadata?.guest_token ?? null;
  const subtotal = session.amount_subtotal ?? 0;
  const shipping = session.shipping_cost?.amount_subtotal ?? 0;
  const tax = session.total_details?.amount_tax ?? 0;
  const total = session.amount_total ?? subtotal + shipping + tax;
  const currency = session.currency ?? "usd";
  const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;
  const shippingAddress = session.shipping_details?.address ?? null;

  await db()(
    `UPDATE orders SET
       email = $2,
       stripe_payment_id = $3,
       status = 'paid',
       subtotal_cents = $4,
       shipping_cents = $5,
       tax_cents = $6,
       total_cents = $7,
       currency = $8,
       shipping_address = $9
     WHERE stripe_session_id = $1`,
    [session.id, email, paymentIntentId, subtotal, shipping, tax, total, currency, shippingAddress ? JSON.stringify(shippingAddress) : null],
  );

  // Resolve catalog metadata for items (to record slugs + variant labels + image URLs)
  const artworks = await filesAdapter.listArtworks();
  const galleries = await filesAdapter.listGalleries();

  const orderRows = (await db()(`SELECT id FROM orders WHERE stripe_session_id = $1`, [session.id])) as { id: string }[];
  const orderId = orderRows[0]?.id;
  if (!orderId) {
    log("error", "Order missing after session.completed", { requestId, sessionId: session.id });
    throw new AppError("order_missing", 500, "Order row not found after webhook");
  }

  // Idempotency: delete any pre-existing items for this order before inserting.
  await db()(`DELETE FROM order_items WHERE order_id = $1`, [orderId]);

  const receiptItems: Array<{ title: string; variantLabel?: string; quantity: number; unitPriceCents: number }> = [];

  for (const li of lineItems) {
    const meta = (li.price?.metadata ?? {}) as Record<string, string>;
    const variantId = meta.variantId; // format: "<slug>:<variantId>"
    const galleryBundleSlug = meta.galleryBundleSlug;
    let title = li.description ?? "Item";
    let slug = "";
    let variantInternalId: string | null = null;
    let variantLabel: string | undefined;
    let imageUrl: string | null = null;

    if (variantId) {
      const [aSlug, vId] = variantId.split(":");
      slug = aSlug;
      variantInternalId = vId;
      const artwork = artworks.find((a) => a.slug === aSlug);
      if (artwork) {
        title = artwork.title;
        variantLabel = artwork.variants.find((v) => v.id === vId)?.label;
        imageUrl = artwork.images[0]?.src ?? null;
      }
    } else if (galleryBundleSlug) {
      slug = galleryBundleSlug;
      const gallery = galleries.find((g) => g.slug === galleryBundleSlug);
      if (gallery) {
        title = `${gallery.title} (Gallery)`;
        imageUrl = gallery.heroImage.src;
      }
    }

    const qty = li.quantity ?? 1;
    const unit = li.price?.unit_amount ?? 0;

    await db()(
      `INSERT INTO order_items (order_id, artwork_slug, variant_id, title, variant_label, unit_price_cents, quantity, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [orderId, slug || "unknown", variantInternalId, title, variantLabel ?? null, unit, qty, imageUrl],
    );

    receiptItems.push({ title, variantLabel, quantity: qty, unitPriceCents: unit });

    // Decrement inventory for originals
    if (variantId && slug) {
      const artwork = artworks.find((a) => a.slug === slug);
      if (artwork?.kind === "original") {
        await db()(
          `INSERT INTO inventory (artwork_slug, variant_id, stock) VALUES ($1, $2, 0)
           ON CONFLICT (artwork_slug, variant_id) DO UPDATE SET stock = GREATEST(inventory.stock - 1, 0), updated_at = NOW()`,
          [slug, variantInternalId ?? ""],
        );
      }
    }
  }

  try {
    await sendOrderReceipt({
      to: email,
      orderId,
      guestToken,
      totalCents: total,
      currency,
      items: receiptItems,
    });
  } catch (e) {
    log("warn", "Receipt email failed (order still persisted)", { requestId, orderId, error: String(e) });
  }

  log("info", "Order persisted", { requestId, orderId, sessionId: session.id, totalCents: total });
}

async function handleRefund(charge: Stripe.Charge, requestId: string) {
  const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
  if (!paymentIntentId) return;
  await db()(
    `UPDATE orders SET status = 'refunded' WHERE stripe_payment_id = $1`,
    [paymentIntentId],
  );
  log("info", "Order refunded", { requestId, paymentIntentId });
}

// Stripe webhooks need RAW body — disable Netlify's JSON parsing
export const config = {
  path: "/api/checkout-webhook",
};
```

- [ ] **Step 11.2: Run typecheck**

```bash
npm run typecheck
```

Expected: exit 0.

- [ ] **Step 11.3: Commit**

```bash
git add netlify/functions/checkout-webhook.ts
git commit -m "feat(checkout): webhook persists order + items, decrements inventory for originals, emails Resend receipt"
```

---

## Task 12: Cart UI — CartLine + CartSummary + CartDrawer + CartButton

**Files:**
- Create: `/Users/gabrielmotta/jayjo/src/components/checkout/CartLine.tsx`
- Create: `/Users/gabrielmotta/jayjo/src/components/checkout/CartSummary.tsx`
- Create: `/Users/gabrielmotta/jayjo/src/components/checkout/CartDrawer.tsx`
- Create: `/Users/gabrielmotta/jayjo/src/components/checkout/CartButton.tsx`
- Modify: `/Users/gabrielmotta/jayjo/src/components/layout/Header.tsx` (use CartButton)

- [ ] **Step 12.1: Create `CartLine.tsx`**

```tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import type { Artwork, Gallery } from "@/catalog/types";
import { getCatalog } from "@/catalog";
import { type CartLine as TLine, useCart } from "@/store/cart";
import { Price } from "@/components/ui/Price";
import { ImageWithBlur } from "@/components/product/ImageWithBlur";

interface Resolved {
  title: string;
  variantLabel?: string;
  unitPriceCents: number;
  imageUrl: string;
  href: string;
}

async function resolveLine(line: TLine): Promise<Resolved | null> {
  const catalog = getCatalog();
  if (line.kind === "artwork") {
    const a = await catalog.getArtwork(line.slug);
    if (!a) return null;
    const v = a.variants.find((x) => x.id === line.variantId);
    if (!v) return null;
    return {
      title: a.title,
      variantLabel: v.label,
      unitPriceCents: v.priceCents,
      imageUrl: a.images[0].src,
      href: `/shop/${a.slug}`,
    };
  }
  const g = await catalog.getGallery(line.slug);
  if (!g?.bundle) return null;
  return {
    title: `${g.title} (Gallery)`,
    unitPriceCents: g.bundle.bundlePriceCents,
    imageUrl: g.heroImage.src,
    href: `/galleries/${g.slug}`,
  };
}

export function CartLine({ line }: { line: TLine }) {
  const [resolved, setResolved] = useState<Resolved | null>(null);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);

  useEffect(() => {
    resolveLine(line).then(setResolved);
  }, [line]);

  if (!resolved) {
    return <div className="h-24 animate-pulse rounded-md bg-bg-elevated" />;
  }

  const key = { kind: line.kind, slug: line.slug, variantId: line.variantId };

  return (
    <div className="flex gap-4 py-4">
      <Link to={resolved.href} className="block w-20 shrink-0">
        <ImageWithBlur src={resolved.imageUrl} alt={resolved.title} aspect={4 / 5} />
      </Link>
      <div className="flex-1 space-y-1">
        <Link to={resolved.href} className="font-display text-base text-text hover:text-accent">
          {resolved.title}
        </Link>
        {resolved.variantLabel && (
          <p className="text-xs text-text-muted">{resolved.variantLabel}</p>
        )}
        <Price cents={resolved.unitPriceCents} className="text-sm text-text-muted" />
        <div className="mt-2 flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-text-muted">
            Qty
            <input
              type="number"
              min={1}
              max={99}
              value={line.quantity}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (!Number.isNaN(n)) setQuantity(key, n);
              }}
              className="h-8 w-14 rounded-md border border-border bg-bg-elevated px-2 text-sm text-text"
            />
          </label>
          <button
            type="button"
            onClick={() => remove(key)}
            aria-label={`Remove ${resolved.title}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:text-fig"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 12.2: Create `CartSummary.tsx`**

```tsx
import { useEffect, useState } from "react";
import { useCart } from "@/store/cart";
import { getCatalog } from "@/catalog";
import { Price } from "@/components/ui/Price";

export function CartSummary() {
  const items = useCart((s) => s.items);
  const [subtotalCents, setSubtotalCents] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const catalog = getCatalog();
      let total = 0;
      for (const line of items) {
        if (line.kind === "artwork") {
          const a = await catalog.getArtwork(line.slug);
          const v = a?.variants.find((x) => x.id === line.variantId);
          if (v) total += v.priceCents * line.quantity;
        } else {
          const g = await catalog.getGallery(line.slug);
          if (g?.bundle) total += g.bundle.bundlePriceCents * line.quantity;
        }
      }
      if (!cancelled) setSubtotalCents(total);
    })();
    return () => {
      cancelled = true;
    };
  }, [items]);

  return (
    <div className="space-y-2 border-t border-border pt-4">
      <div className="flex items-center justify-between text-sm text-text-muted">
        <span>Subtotal</span>
        {subtotalCents !== null ? <Price cents={subtotalCents} /> : <span>—</span>}
      </div>
      <p className="text-xs text-text-muted">Shipping and taxes calculated at checkout.</p>
    </div>
  );
}
```

- [ ] **Step 12.3: Create `CartDrawer.tsx`**

```tsx
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useCart } from "@/store/cart";
import { CartLine } from "./CartLine";
import { CartSummary } from "./CartSummary";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { api, FetchError } from "@/lib/api";
import { toast } from "sonner";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const items = useCart((s) => s.items);
  const [submitting, setSubmitting] = useState(false);

  async function startCheckout() {
    if (items.length === 0) return;
    setSubmitting(true);
    try {
      const { url } = await api.post<{ items: typeof items }, { url: string }>(
        "/api/checkout-create-session",
        {
          items: items.map((i) => ({
            kind: i.kind,
            slug: i.slug,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        },
      );
      window.location.href = url;
    } catch (e) {
      const msg = e instanceof FetchError ? e.apiError.message : "Checkout couldn't start. Try again.";
      toast.error(msg);
      setSubmitting(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-text/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content
          className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-bg shadow-[var(--shadow-card-hover)] data-[state=open]:animate-in data-[state=open]:slide-in-from-right"
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <Dialog.Title className="font-display text-xl text-text">Your cart</Dialog.Title>
            <Dialog.Close
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-text-muted hover:bg-bg-elevated hover:text-text"
              aria-label="Close cart"
            >
              <X size={18} />
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-2">
            {items.length === 0 ? (
              <div className="py-12 text-center text-text-muted">
                Your cart is empty.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {items.map((line, i) => (
                  <CartLine key={`${line.kind}:${line.slug}:${line.variantId ?? ""}:${i}`} line={line} />
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-border bg-bg-elevated px-6 py-4 space-y-4">
              <CartSummary />
              <Button onClick={startCheckout} disabled={submitting} fullWidth size="lg">
                {submitting ? "Redirecting…" : "Checkout"}
              </Button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

- [ ] **Step 12.4: Create `CartButton.tsx`** — replaces the existing cart `<Link>` in the Header with a drawer-toggling button. (We keep `/cart` route as a fallback view for shared/deep links.)

```tsx
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/store/cart";

interface CartButtonProps {
  onClick: () => void;
}

export function CartButton({ onClick }: CartButtonProps) {
  const count = useCart((s) => s.itemCount());
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Cart${count ? ` (${count})` : ""}`}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-text-muted outline-none transition hover:bg-bg-elevated hover:text-text focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
    >
      <ShoppingBag size={18} />
      {count > 0 && (
        <span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs text-bg"
        >
          {count}
        </span>
      )}
    </button>
  );
}
```

- [ ] **Step 12.5: Modify `Header.tsx`** — accept an `onOpenCart` prop, render `<CartButton>` instead of the `<Link to="/cart">`.

Open `/Users/gabrielmotta/jayjo/src/components/layout/Header.tsx`. Replace the cart `<Link>` block with the imported `<CartButton>`.

Specifically:
1. Import: `import { CartButton } from "@/components/checkout/CartButton";`
2. Change the component signature to accept `onOpenCart`:
   ```tsx
   export function Header({ onOpenCart }: { onOpenCart: () => void }) {
   ```
3. Replace the existing cart `<Link to="/cart">…</Link>` with `<CartButton onClick={onOpenCart} />`.

- [ ] **Step 12.6: Run typecheck + lint + tests**

```bash
npm run typecheck
npm run lint
npm test
```

All three must exit 0. Test count: 26 (18 prior + 8 new cart-store).

- [ ] **Step 12.7: Commit**

```bash
git add src/components/checkout/ src/components/layout/Header.tsx
git commit -m "feat(cart): add CartLine, CartSummary, CartDrawer (Radix Dialog), CartButton; wire Header"
```

---

## Task 13: Mount CartDrawer in RootLayout

**Files:**
- Modify: `/Users/gabrielmotta/jayjo/src/components/layout/RootLayout.tsx`

- [ ] **Step 13.1: Update RootLayout** so it owns the open/close state.

Replace the current contents of `/Users/gabrielmotta/jayjo/src/components/layout/RootLayout.tsx` with:

```tsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Toaster } from "@/components/ui/Toaster";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { PageTransition } from "@/components/motion/PageTransition";
import { CartDrawer } from "@/components/checkout/CartDrawer";

export function RootLayout() {
  const [cartOpen, setCartOpen] = useState(false);
  return (
    <ThemeProvider>
      <a href="#main" className="skip-link">Skip to content</a>
      <Header onOpenCart={() => setCartOpen(true)} />
      <main id="main">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      <Toaster />
    </ThemeProvider>
  );
}
```

- [ ] **Step 13.2: Verify build still works**

```bash
npm run build
```

Expected: success, no new bundles drastically larger than before. CartDrawer should split into its own lazy chunk via Radix's tree-shaking.

- [ ] **Step 13.3: Commit**

```bash
git add src/components/layout/RootLayout.tsx
git commit -m "feat(layout): mount CartDrawer in RootLayout with shared open state"
```

---

## Task 14: AddToCartButton + BuyGalleryButton (replace disabled stubs)

**Files:**
- Create: `/Users/gabrielmotta/jayjo/src/components/checkout/AddToCartButton.tsx`
- Create: `/Users/gabrielmotta/jayjo/src/components/checkout/BuyGalleryButton.tsx`
- Modify: `/Users/gabrielmotta/jayjo/src/routes/ArtworkDetail.tsx`
- Modify: `/Users/gabrielmotta/jayjo/src/routes/GalleryDetail.tsx`
- Modify: `/Users/gabrielmotta/jayjo/src/components/product/VariantPicker.tsx` (lift selected variant up via callback — already supports `onChange`)

- [ ] **Step 14.1: Create `AddToCartButton.tsx`**

```tsx
import { useState } from "react";
import type { Artwork, ArtworkVariant } from "@/catalog/types";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/store/cart";
import { VariantPicker } from "@/components/product/VariantPicker";
import { toast } from "sonner";

export function AddToCartButton({ artwork }: { artwork: Artwork }) {
  const [variant, setVariant] = useState<ArtwarVariantOrFirst>(() => artwork.variants[0]);
  const add = useCart((s) => s.add);
  const isSoldOut = variant.stock !== undefined && variant.stock <= 0;

  return (
    <div className="space-y-4">
      <VariantPicker artwork={artwork} onChange={setVariant} />
      <Button
        size="lg"
        disabled={isSoldOut}
        onClick={() => {
          add({ kind: "artwork", slug: artwork.slug, variantId: variant.id });
          toast.success(`Added "${artwork.title}${variant.label ? ` — ${variant.label}` : ""}" to cart.`);
        }}
      >
        {isSoldOut ? "Sold" : "Add to cart"}
      </Button>
    </div>
  );
}

// helper alias so TS infers the right type from VariantPicker callback
type ArtwarVariantOrFirst = ArtworkVariant;
```

(Note: the typo alias `ArtwarVariantOrFirst` is intentional only as a way to reuse the import without re-declaring; rename if you prefer.)

- [ ] **Step 14.2: Create `BuyGalleryButton.tsx`**

```tsx
import type { Gallery } from "@/catalog/types";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/store/cart";
import { toast } from "sonner";

export function BuyGalleryButton({ gallery }: { gallery: Gallery }) {
  const add = useCart((s) => s.add);
  if (!gallery.bundle) return null;
  return (
    <Button
      onClick={() => {
        add({ kind: "gallery", slug: gallery.slug });
        toast.success(`Added "${gallery.title}" gallery to cart.`);
      }}
    >
      Buy the whole gallery
    </Button>
  );
}
```

- [ ] **Step 14.3: Modify `ArtworkDetail.tsx`**

Find the existing block:
```tsx
<div className="mt-10 space-y-4">
  <VariantPicker artwork={artwork} />
  <div className="flex gap-3">
    <Button size="lg" disabled aria-disabled title="Cart launches with Plan 2">
      Add to cart
    </Button>
    <button ... favorite button ... />
  </div>
</div>
```

Replace with:
```tsx
<div className="mt-10 space-y-4">
  <div className="flex items-end gap-3">
    <AddToCartButton artwork={artwork} />
    <button
      type="button"
      onClick={() => toggle(artwork.slug)}
      aria-pressed={isFav}
      aria-label={isFav ? "Remove from favorites" : "Favorite this piece"}
      className="inline-flex h-12 w-12 items-center justify-center rounded-md border border-border text-text-muted transition hover:text-text"
    >
      <Heart size={18} className={isFav ? "fill-fig text-fig" : ""} />
    </button>
  </div>
</div>
```

And add the import: `import { AddToCartButton } from "@/components/checkout/AddToCartButton";`

Remove the now-unused `VariantPicker` import + the `Button` import if no other usages remain.

- [ ] **Step 14.4: Modify `GalleryDetail.tsx`**

Find:
```tsx
<Button disabled aria-disabled title="Bundle checkout launches with Plan 2">
  Buy the whole gallery
</Button>
```

Replace with:
```tsx
<BuyGalleryButton gallery={gallery} />
```

Add import: `import { BuyGalleryButton } from "@/components/checkout/BuyGalleryButton";`

Remove the unused `Button` import if no other usages remain.

- [ ] **Step 14.5: Verify**

```bash
npm run typecheck
npm run lint
npm test
```

All three exit 0. 26 tests.

- [ ] **Step 14.6: Commit**

```bash
git add src/components/checkout/AddToCartButton.tsx src/components/checkout/BuyGalleryButton.tsx src/routes/ArtworkDetail.tsx src/routes/GalleryDetail.tsx
git commit -m "feat(cart): wire AddToCart + BuyGallery buttons into product pages; replace disabled stubs"
```

---

## Task 15: `/cart` route + `/checkout/success` + `/checkout/cancel`

**Files:**
- Create: `/Users/gabrielmotta/jayjo/src/routes/Cart.tsx`
- Create: `/Users/gabrielmotta/jayjo/src/routes/CheckoutSuccess.tsx`
- Create: `/Users/gabrielmotta/jayjo/src/routes/CheckoutCancel.tsx`
- Create: `/Users/gabrielmotta/jayjo/src/hooks/useOrderPolling.ts`
- Modify: `/Users/gabrielmotta/jayjo/src/App.tsx` (replace NotFound stub for /cart, add the two checkout routes)

- [ ] **Step 15.1: Create `useOrderPolling.ts`** — polls Neon via a (future Plan 3) `/api/orders-get` endpoint, with exponential backoff. For Plan 2, the endpoint doesn't exist yet; we'll degrade gracefully.

```ts
import { useEffect, useState } from "react";
import { api, FetchError } from "@/lib/api";

interface OrderPolling {
  status: "polling" | "found" | "timeout" | "error";
  order: { id: string; totalCents: number; currency: string } | null;
  error?: string;
}

const SCHEDULE_MS = [500, 1000, 2000, 3000, 5000];

export function useOrderPolling(sessionId: string | null): OrderPolling {
  const [state, setState] = useState<OrderPolling>({ status: "polling", order: null });

  useEffect(() => {
    if (!sessionId) {
      setState({ status: "error", order: null, error: "Missing session id" });
      return;
    }
    let cancelled = false;
    let attempt = 0;
    const tick = async () => {
      if (cancelled) return;
      try {
        const res = await api.get<{ order: OrderPolling["order"] }>(
          `/api/orders-get?session_id=${encodeURIComponent(sessionId)}`,
        );
        if (res.order) {
          setState({ status: "found", order: res.order });
          return;
        }
      } catch (e) {
        // 404 = not found yet; other errors logged but we keep polling
        if (e instanceof FetchError && e.status !== 404) {
          setState({ status: "error", order: null, error: e.apiError.message });
          return;
        }
      }
      if (attempt >= SCHEDULE_MS.length) {
        setState({ status: "timeout", order: null });
        return;
      }
      setTimeout(tick, SCHEDULE_MS[attempt++]);
    };
    tick();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return state;
}
```

- [ ] **Step 15.2: Create `routes/Cart.tsx`**

```tsx
import { Link } from "react-router-dom";
import { useCart } from "@/store/cart";
import { Section } from "@/components/ui/Section";
import { EyebrowHeading } from "@/components/ui/EyebrowHeading";
import { Button } from "@/components/ui/Button";
import { CartLine } from "@/components/checkout/CartLine";
import { CartSummary } from "@/components/checkout/CartSummary";
import { api, FetchError } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";

export default function Cart() {
  const items = useCart((s) => s.items);
  const [submitting, setSubmitting] = useState(false);

  async function startCheckout() {
    if (items.length === 0) return;
    setSubmitting(true);
    try {
      const { url } = await api.post<{ items: typeof items }, { url: string }>(
        "/api/checkout-create-session",
        { items: items.map((i) => ({ kind: i.kind, slug: i.slug, variantId: i.variantId, quantity: i.quantity })) },
      );
      window.location.href = url;
    } catch (e) {
      const msg = e instanceof FetchError ? e.apiError.message : "Checkout couldn't start. Try again.";
      toast.error(msg);
      setSubmitting(false);
    }
  }

  return (
    <Section>
      <EyebrowHeading eyebrow="Your cart" title="Review your selection" />
      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_360px]">
        <div className="divide-y divide-border">
          {items.length === 0 ? (
            <div className="py-12 text-center text-text-muted">
              Your cart is empty.{" "}
              <Link to="/shop" className="underline">
                Browse the studio
              </Link>
              .
            </div>
          ) : (
            items.map((line, i) => (
              <CartLine key={`${line.kind}:${line.slug}:${line.variantId ?? ""}:${i}`} line={line} />
            ))
          )}
        </div>
        {items.length > 0 && (
          <aside className="h-fit rounded-md bg-bg-elevated p-6 space-y-4">
            <CartSummary />
            <Button onClick={startCheckout} disabled={submitting} fullWidth size="lg">
              {submitting ? "Redirecting…" : "Checkout"}
            </Button>
          </aside>
        )}
      </div>
    </Section>
  );
}
```

- [ ] **Step 15.3: Create `routes/CheckoutSuccess.tsx`**

```tsx
import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { useOrderPolling } from "@/hooks/useOrderPolling";
import { useCart } from "@/store/cart";
import { Skeleton } from "@/components/ui/Skeleton";
import { Price } from "@/components/ui/Price";

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const polling = useOrderPolling(sessionId);
  const clearCart = useCart((s) => s.clear);

  useEffect(() => {
    if (polling.status === "found") clearCart();
  }, [polling.status, clearCart]);

  return (
    <Section className="text-center">
      <p className="eyebrow">Thank you</p>
      <h1 className="mt-3 font-display text-4xl text-text md:text-5xl">Your order is confirmed.</h1>

      <div className="mx-auto mt-12 max-w-md">
        {polling.status === "polling" && (
          <div className="space-y-3">
            <Skeleton className="mx-auto h-6 w-3/4" delayMs={0} />
            <Skeleton className="mx-auto h-4 w-1/2" delayMs={0} />
            <p className="text-sm text-text-muted">Saving your order…</p>
          </div>
        )}
        {polling.status === "found" && polling.order && (
          <div className="space-y-3">
            <p className="text-text-muted">Order ID</p>
            <p className="font-mono text-sm text-text">{polling.order.id}</p>
            <p className="text-text-muted">Total</p>
            <Price cents={polling.order.totalCents} currency={polling.order.currency.toUpperCase()} className="font-display text-2xl" />
            <p className="mt-6 text-text-muted">
              We emailed you a receipt with a tracking link.
            </p>
          </div>
        )}
        {polling.status === "timeout" && (
          <p className="text-text-muted">
            Your order is being processed. Check your inbox for the receipt.
          </p>
        )}
        {polling.status === "error" && (
          <p className="text-fig">{polling.error ?? "Couldn't load order."}</p>
        )}
      </div>

      <div className="mt-12 flex flex-col items-center gap-3">
        <Button asChild={false}>
          <Link to="/shop">Keep shopping</Link>
        </Button>
        <Link to="/" className="text-sm text-text-muted underline">Back to the studio</Link>
      </div>
    </Section>
  );
}
```

(Note: `<Button asChild={false}><Link>` — our Button doesn't render children as a different element; this nests a Link inside a button which is invalid HTML. Replace with a Link styled like a Button, or import `useNavigate`:
```tsx
import { useNavigate } from "react-router-dom";
const navigate = useNavigate();
<Button onClick={() => navigate("/shop")}>Keep shopping</Button>
```
Use the navigate form.)

- [ ] **Step 15.4: Create `routes/CheckoutCancel.tsx`**

```tsx
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

export default function CheckoutCancel() {
  const navigate = useNavigate();
  useEffect(() => {
    toast.message("Checkout cancelled. Your cart is still here.");
  }, []);
  return (
    <Section className="text-center">
      <p className="eyebrow">Cancelled</p>
      <h1 className="mt-3 font-display text-4xl text-text md:text-5xl">No charge made.</h1>
      <p className="mt-6 text-text-muted">Take your time. Your cart is saved.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Button onClick={() => navigate("/cart")}>Back to cart</Button>
        <Button variant="ghost" onClick={() => navigate("/shop")}>Keep browsing</Button>
      </div>
    </Section>
  );
}
```

- [ ] **Step 15.5: Update `App.tsx` routes**

In `/Users/gabrielmotta/jayjo/src/App.tsx`:
1. Add lazy imports:
   ```tsx
   const Cart = lazy(() => import("@/routes/Cart"));
   const CheckoutSuccess = lazy(() => import("@/routes/CheckoutSuccess"));
   const CheckoutCancel = lazy(() => import("@/routes/CheckoutCancel"));
   ```
2. Replace the `/cart` route element (currently `wrap(NotFound)`) with `wrap(Cart)`.
3. Add two new route children:
   ```tsx
   { path: "/checkout/success", element: wrap(CheckoutSuccess) },
   { path: "/checkout/cancel", element: wrap(CheckoutCancel) },
   ```

- [ ] **Step 15.6: Verify**

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

All four exit 0.

- [ ] **Step 15.7: Commit**

```bash
git add src/routes/Cart.tsx src/routes/CheckoutSuccess.tsx src/routes/CheckoutCancel.tsx src/hooks/useOrderPolling.ts src/App.tsx
git commit -m "feat(routes): add /cart page, /checkout/success polling, /checkout/cancel"
```

---

## Task 16: Bundle secret scanner

**Files:**
- Create: `/Users/gabrielmotta/jayjo/scripts/scan-bundle.ts`

- [ ] **Step 16.1: Create the scanner**

```ts
import { readdirSync, statSync, readFileSync } from "node:fs";
import { join } from "node:path";

const DIST = join(process.cwd(), "dist");

const PATTERNS: Array<{ name: string; regex: RegExp }> = [
  { name: "Stripe live secret", regex: /sk_live_[A-Za-z0-9]{16,}/ },
  { name: "Stripe test secret", regex: /sk_test_[A-Za-z0-9]{16,}/ },
  { name: "Stripe webhook secret", regex: /whsec_[A-Za-z0-9]{16,}/ },
  { name: "Resend key", regex: /re_[A-Za-z0-9_]{16,}/ },
  { name: "xAI key", regex: /xai-[A-Za-z0-9]{16,}/ },
  { name: "GitHub PAT", regex: /ghp_[A-Za-z0-9]{16,}/ },
  { name: "Neon password", regex: /npg_[A-Za-z0-9]{8,}/ },
  { name: "JWT-shaped", regex: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/ },
];

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(js|map|html|css)$/.test(entry)) out.push(p);
  }
  return out;
}

function main() {
  let files: string[] = [];
  try {
    files = walk(DIST);
  } catch (e) {
    console.error("dist/ not found. Did you run `vite build` first?");
    process.exit(1);
  }

  const hits: Array<{ file: string; pattern: string; sample: string }> = [];
  for (const f of files) {
    const body = readFileSync(f, "utf8");
    for (const p of PATTERNS) {
      const m = body.match(p.regex);
      if (m) hits.push({ file: f.replace(process.cwd() + "/", ""), pattern: p.name, sample: m[0].slice(0, 8) + "…" });
    }
  }

  if (hits.length > 0) {
    console.error("\n✗ Secret-shaped strings found in built bundle:\n");
    for (const h of hits) console.error(`  ${h.file}: ${h.pattern} (${h.sample})`);
    console.error("\nBuild aborted. Move the secret to netlify/functions/_lib/env.ts (server-only).");
    process.exit(1);
  }

  console.log(`Bundle scanner OK — ${files.length} files scanned, no secrets leaked.`);
}

main();
```

- [ ] **Step 16.2: Test it**

```bash
npm run build         # includes scan:bundle now
```

Expected: clean build ends with `Bundle scanner OK — N files scanned, no secrets leaked.`

To verify the scanner actually works, temporarily add `console.log("sk_test_AAAAAAAAAAAAAAAAAAAAAAAA");` to `src/main.tsx`, run `npm run build`, expect failure. Revert.

- [ ] **Step 16.3: Commit**

```bash
git add scripts/scan-bundle.ts
git commit -m "feat(scripts): add post-build secret-leak scanner; wired into npm run build"
```

---

## Task 17: Local end-to-end smoke test with Stripe CLI

**Files:** (none new)

This is a manual verification step — no code changes.

- [ ] **Step 17.1: Start `netlify dev` (terminal A)**

```bash
cd /Users/gabrielmotta/jayjo
netlify dev
```

Expected: `◈ Server now ready on http://localhost:8888` (or similar).

- [ ] **Step 17.2: Forward Stripe webhooks (terminal B)**

```bash
stripe listen --forward-to http://localhost:8888/api/checkout-webhook
```

Copy the `whsec_...` value it prints and set it as `STRIPE_WEBHOOK_SECRET` in `.env`. Restart `netlify dev` after editing `.env`.

- [ ] **Step 17.3: Run a test checkout (browser)**

1. Open `http://localhost:8888`
2. Add an artwork to cart (e.g. evening-fig / A3)
3. Open the cart drawer; click Checkout
4. On Stripe-hosted page, use test card `4242 4242 4242 4242`, any future expiry, any 3-digit CVC, any zip
5. Complete payment; you should land on `/checkout/success?session_id=...`

- [ ] **Step 17.4: Verify**

- The success page shows your order ID + total within ~5 seconds
- Terminal A logs: `Checkout session created`, `Webhook received {type:'checkout.session.completed'}`, `Order persisted`, `Receipt email sent` (or warn if Resend domain isn't verified — receipt still optional)
- Terminal B logs `→ checkout.session.completed [evt_...]`
- The `orders` table has a row with `status='paid'`, the `order_items` table has matching rows
  ```bash
  node -e "
  const { neon } = require('@neondatabase/serverless');
  (async () => {
    const sql = neon(process.env.DATABASE_URL);
    const o = await sql(\`SELECT id, email, status, total_cents, currency FROM orders ORDER BY created_at DESC LIMIT 1\`);
    const items = await sql(\`SELECT artwork_slug, variant_id, quantity, unit_price_cents FROM order_items WHERE order_id = \${'$' }1\`, [o[0].id]);
    console.log('order:', o[0]);
    console.log('items:', items);
  })();
  " 2>&1
  ```

If you ordered an `olive-grove` original, also confirm `SELECT * FROM inventory WHERE artwork_slug='olive-grove'` shows `stock=0`.

- [ ] **Step 17.5: Test cancel**

1. Go to `/cart`, click Checkout
2. On the Stripe page, click the back arrow (top-left)
3. Should land on `/checkout/cancel`, see the cancellation message, cart is preserved

If all checks pass, you're cleared for Plan 2 v1.

---

## Task 18: Final verification + tag v0.2.0

- [ ] **Step 18.1: Run all gates**

```bash
cd /Users/gabrielmotta/jayjo
npm run lint
npm run typecheck
npm test                     # 26 tests pass (18 prior + 8 new)
npm run catalog:validate
npm run build                # includes scan:bundle
```

All exit 0.

- [ ] **Step 18.2: Push and tag**

```bash
git push
git tag -a v0.2.0 -m "Plan 2 — Commerce

- Cart store with localStorage persistence
- Stripe Checkout (hosted) with server-side price re-derivation
- Stripe Tax + shipping rates by product group
- Webhook → Neon orders + items + inventory
- Resend transactional receipts
- /cart, /checkout/success (polling), /checkout/cancel
- Bundle secret scanner blocks leaks at build
- DB migration runner + Stripe sync script"
git push --tags
```

---

## Self-review

**Spec coverage:**

| Spec section | Tasks |
|---|---|
| §5 Functions: checkout-create-session, checkout-webhook | 10, 11 |
| §5 Shared _lib (db, stripe, resend, log, errors, validate, env, pricing) | 3, 6, 7 |
| §6 Data model — orders, order_items, inventory, rate_limit_buckets, users | 4 |
| §7 Checkout flow (server price derivation, webhook idempotency, inventory decrement, guest token) | 6, 10, 11, 14, 15 |
| §11 Security (server-only secrets, bundle scanner, CSP, rate limiting placeholder, no logged PII) | 2 (CSP), 3 (env), 16 (scanner) |
| §10 Error handling (TanStack Query auto-retry, error contract, toast on mutation failure, polling) | 9, 12, 15 |
| §13 New scripts (db-migrate, stripe-sync, scan-bundle) | 4, 5, 16 |

**Out of scope (deferred to Plan 3 or 4):**
- `/api/orders-get` endpoint (the polling hook will return `error` for now; Plan 3 wires it with auth)
- User accounts / magic link (Plan 3)
- Favorites sync to DB (Plan 3)
- `orders-by-email`, `orders-list` (Plan 3 — needs session auth)
- Rate limiting wired into specific functions (placeholder table exists; Plan 4 wires forms)
- Production Stripe Tax registration (Stripe dashboard work, not code)

**Placeholder scan:** no TBDs, no "TODO", no "Add appropriate error handling" placeholders. Every code step has a code block.

**Type consistency:** `CartLine`/`CartInput`/`ResolvedLine` shapes consistent between cart store, shared schemas, pricing module, and webhook handler. `Artwork`/`Gallery` references match Plan 1 types. Stripe types come from the official SDK.

**Gaps acknowledged:** `useOrderPolling` will get 404 responses until Plan 3's `/api/orders-get`. The CheckoutSuccess UI handles `timeout` gracefully (says "check your inbox").
