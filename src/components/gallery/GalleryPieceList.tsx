import { useEffect, useState } from "react";
import type { Artwork, Gallery } from "@/catalog/types";
import { getCatalog } from "@/catalog";
import { ArtworkGrid } from "@/components/product/ArtworkGrid";

export function GalleryPieceList({ gallery }: { gallery: Gallery }) {
  const [pieces, setPieces] = useState<Artwork[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const catalog = getCatalog();
      const all = await Promise.all(gallery.artworkSlugs.map((s) => catalog.getArtwork(s)));
      if (cancelled) return;
      setPieces(all.filter((a): a is Artwork => !!a));
    })();
    return () => {
      cancelled = true;
    };
  }, [gallery.artworkSlugs]);

  return <ArtworkGrid artworks={pieces ?? []} loading={pieces === null} />;
}
