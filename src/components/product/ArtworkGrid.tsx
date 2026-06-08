import type { Artwork } from "@/catalog/types";
import type { ReactNode } from "react";
import { ArtworkCard } from "./ArtworkCard";
import { ArtworkCardSkeleton } from "./ArtworkCardSkeleton";
import { RevealStagger } from "@/components/motion/RevealStagger";

export function ArtworkGrid({
  artworks,
  loading,
  emptyState,
}: {
  artworks: Artwork[];
  loading?: boolean;
  emptyState?: ReactNode;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ArtworkCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  if (artworks.length === 0) {
    return (
      <div className="rounded-md border border-border bg-bg-elevated p-10 text-center text-text-muted">
        {emptyState ?? "Nothing matches these filters."}
      </div>
    );
  }
  return (
    <RevealStagger
      staggerMs={80}
      className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
    >
      {artworks.map((a, i) => (
        <ArtworkCard key={a.slug} artwork={a} priority={i < 3} />
      ))}
    </RevealStagger>
  );
}
