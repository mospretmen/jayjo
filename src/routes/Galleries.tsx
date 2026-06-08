import { useEffect, useState } from "react";
import type { Gallery } from "@/catalog/types";
import { getCatalog } from "@/catalog";
import { Section } from "@/components/ui/Section";
import { EyebrowHeading } from "@/components/ui/EyebrowHeading";
import { GalleryCard } from "@/components/gallery/GalleryCard";
import { GalleryCardSkeleton } from "@/components/gallery/GalleryCardSkeleton";

export default function Galleries() {
  const [galleries, setGalleries] = useState<Gallery[] | null>(null);
  useEffect(() => {
    getCatalog().listGalleries().then(setGalleries);
  }, []);
  return (
    <Section>
      <EyebrowHeading
        eyebrow="Wall Galleries"
        title="Curated arrangements."
        description="Browse the lookbooks, or shop the bundle."
      />
      <div className="mt-12 grid gap-12 md:grid-cols-2">
        {galleries
          ? galleries.map((g) => <GalleryCard key={g.slug} gallery={g} />)
          : Array.from({ length: 2 }).map((_, i) => <GalleryCardSkeleton key={i} />)}
      </div>
    </Section>
  );
}
