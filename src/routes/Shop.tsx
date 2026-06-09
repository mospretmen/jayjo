import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Artwork, ArtworkFilter } from "@/catalog/types";
import { getCatalog } from "@/catalog";
import { ArtworkFilters } from "@/components/product/ArtworkFilters";
import { ArtworkGrid } from "@/components/product/ArtworkGrid";

export default function Shop() {
  const [params] = useSearchParams();
  const initialKind = params.get("kind") as Artwork["kind"] | null;
  const [filter, setFilter] = useState<ArtworkFilter>({ kind: initialKind ?? undefined });
  const [results, setResults] = useState<Artwork[] | null>(null);

  useEffect(() => {
    setResults(null);
    getCatalog()
      .listArtworks(filter)
      .then(setResults);
  }, [filter]);

  return (
    <section className="container-page py-6 md:py-8">
      <header className="mb-6 flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-4">
        <div>
          <p className="eyebrow">Shop</p>
          <h1 className="mt-1 font-display text-2xl text-text md:text-3xl">The full studio.</h1>
        </div>
        <p className="text-sm text-text-muted">
          {results === null ? "Loading…" : `${results.length} ${results.length === 1 ? "work" : "works"}`}
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[15rem_1fr] lg:gap-12">
        <ArtworkFilters value={filter} onChange={setFilter} />
        <ArtworkGrid artworks={results ?? []} loading={results === null} />
      </div>
    </section>
  );
}
