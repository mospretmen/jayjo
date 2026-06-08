import { readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { ArtworkSchema, GallerySchema } from "../src/catalog/schemas";

const ROOT = resolve(process.cwd());
const ART_DIR = join(ROOT, "src/content/artworks");
const GAL_DIR = join(ROOT, "src/content/galleries");

function walk(dir: string): string[] {
  return readdirSync(dir)
    .map((f) => join(dir, f))
    .filter((p) => statSync(p).isFile() && p.endsWith(".ts"));
}

async function loadAndValidate<T>(
  files: string[],
  exportName: string,
  schema: { parse: (x: unknown) => T },
  kind: string,
): Promise<number> {
  let ok = 0;
  for (const f of files) {
    const mod: Record<string, unknown> = await import(pathToFileURL(f).href);
    const data = mod[exportName];
    if (!data) {
      console.error(`✗ ${kind} ${f}: missing export "${exportName}"`);
      process.exitCode = 1;
      continue;
    }
    try {
      schema.parse(data);
      ok++;
      console.log(`✓ ${kind}: ${f.replace(ROOT + "/", "")}`);
    } catch (e) {
      console.error(`✗ ${kind} ${f}:`, e);
      process.exitCode = 1;
    }
  }
  return ok;
}

(async () => {
  const arts = await loadAndValidate(walk(ART_DIR), "artwork", ArtworkSchema, "artwork");
  const gals = await loadAndValidate(walk(GAL_DIR), "gallery", GallerySchema, "gallery");
  console.log(`\nValidated ${arts} artworks and ${gals} galleries.`);
  if (process.exitCode) {
    console.error("Catalog validation FAILED.");
  } else {
    console.log("Catalog validation OK.");
  }
})();
