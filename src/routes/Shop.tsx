import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Artwork, ArtworkFilter } from "@/catalog/types";
import { getCatalog } from "@/catalog";
import { Section } from "@/components/ui/Section";
import { EyebrowHeading } from "@/components/ui/EyebrowHeading";
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
    <Section>
      <EyebrowHeading
        eyebrow="Shop"
        title="The full studio."
        description="Originals and prints, sorted by latest."
      />
      <div className="mt-12 grid gap-12 lg:grid-cols-[16rem_1fr]">
        <ArtworkFilters value={filter} onChange={setFilter} />
        <ArtworkGrid artworks={results ?? []} loading={results === null} />
      </div>
    </Section>
  );
}
