import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Artwork } from "@/catalog/types";
import { getCatalog } from "@/catalog";
import { Section } from "@/components/ui/Section";
import { EyebrowHeading } from "@/components/ui/EyebrowHeading";
import { ArtworkGrid } from "@/components/product/ArtworkGrid";
import { useFavorites } from "@/store/favorites";

export default function Favorites() {
  const slugs = useFavorites((s) => s.slugs);
  const [items, setItems] = useState<Artwork[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const c = getCatalog();
      const list = await Promise.all(slugs.map((s) => c.getArtwork(s)));
      if (!cancelled) setItems(list.filter((a): a is Artwork => !!a));
    })();
    return () => {
      cancelled = true;
    };
  }, [slugs]);
  return (
    <Section>
      <EyebrowHeading
        eyebrow="Favorites"
        title="Your saved pieces."
        description="Saved locally on this device. Sign in (coming soon) to sync across devices."
      />
      <div className="mt-12">
        {slugs.length === 0 ? (
          <div className="rounded-md border border-border bg-bg-elevated p-10 text-center text-text-muted">
            You haven&apos;t saved anything yet.{" "}
            <Link
              to="/shop"
              className="ml-2 inline-flex h-11 items-center justify-center rounded-md bg-accent px-6 text-sm font-medium text-bg shadow-[var(--shadow-card)] transition hover:bg-burnt hover:shadow-[var(--shadow-card-hover)]"
            >
              Browse the studio
            </Link>
          </div>
        ) : (
          <ArtworkGrid artworks={items ?? []} loading={items === null} />
        )}
      </div>
    </Section>
  );
}
