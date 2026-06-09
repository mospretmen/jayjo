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
  } catch {
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
