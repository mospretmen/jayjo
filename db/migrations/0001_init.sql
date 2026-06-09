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
