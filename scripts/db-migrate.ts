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
