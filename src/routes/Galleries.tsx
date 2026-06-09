import { useEffect, useState } from "react";
import type { Gallery } from "@/catalog/types";
import { getCatalog } from "@/catalog";
import { GalleryCard } from "@/components/gallery/GalleryCard";
import { GalleryCardSkeleton } from "@/components/gallery/GalleryCardSkeleton";

export default function Galleries() {
  const [galleries, setGalleries] = useState<Gallery[] | null>(null);
  useEffect(() => {
    getCatalog().listGalleries().then(setGalleries);
  }, []);
  return (
    <section className="container-page py-6 md:py-8">
      <header className="mb-8 max-w-2xl border-b border-border pb-5">
        <p className="eyebrow">Wall Galleries</p>
        <h1 className="mt-1 font-display text-2xl text-text md:text-3xl">Curated arrangements.</h1>
        <p className="mt-2 text-sm text-text-muted">Browse the lookbooks, or shop the bundle.</p>
      </header>
      <div className="grid gap-10 md:grid-cols-2 md:gap-12">
        {galleries
          ? galleries.map((g) => <GalleryCard key={g.slug} gallery={g} />)
          : Array.from({ length: 2 }).map((_, i) => <GalleryCardSkeleton key={i} />)}
      </div>
    </section>
  );
}
