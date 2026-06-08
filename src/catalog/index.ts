import { env } from "@/lib/env";
import type { CatalogRepository } from "@/catalog/types";
import { filesAdapter } from "@/catalog/adapters/files";
import { sanityAdapter } from "@/catalog/adapters/sanity";
import { neonAdapter } from "@/catalog/adapters/neon";

let cached: CatalogRepository | null = null;

export function getCatalog(): CatalogRepository {
  if (cached) return cached;
  switch (env.CATALOG_ADAPTER) {
    case "sanity":
      cached = sanityAdapter;
      break;
    case "neon":
      cached = neonAdapter;
      break;
    case "files":
    default:
      cached = filesAdapter;
  }
  return cached;
}
