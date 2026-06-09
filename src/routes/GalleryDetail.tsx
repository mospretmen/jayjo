import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { Gallery } from "@/catalog/types";
import { getCatalog } from "@/catalog";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { GalleryHero } from "@/components/gallery/GalleryHero";
import { GalleryPieceList } from "@/components/gallery/GalleryPieceList";
import { Price } from "@/components/ui/Price";
import { PageSkeleton } from "@/components/layout/PageSkeleton";

export default function GalleryDetail() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const [gallery, setGallery] = useState<Gallery | null | undefined>(undefined);

  useEffect(() => {
    setGallery(undefined);
    getCatalog().getGallery(slug).then(setGallery);
  }, [slug]);

  if (gallery === undefined) return <PageSkeleton />;
  if (gallery === null) {
    return (
      <Section>
        <h1 className="font-display text-3xl">Gallery not found.</h1>
        <Button className="mt-6" onClick={() => navigate("/galleries")}>
          All galleries
        </Button>
      </Section>
    );
  }

  return (
    <>
      <GalleryHero gallery={gallery} />
      <Section as="section">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <p className="eyebrow">Pieces in this gallery</p>
          {gallery.bundle && (
            <div className="flex items-center gap-4">
              <Price cents={gallery.bundle.bundlePriceCents} className="font-display text-2xl" />
              <Button disabled aria-disabled title="Bundle checkout launches with Plan 2">
                Buy the whole gallery
              </Button>
            </div>
          )}
        </div>
        <GalleryPieceList gallery={gallery} />
      </Section>
      <section className="bg-bg-elevated">
        <div className="container-page grid items-center gap-6 py-16 md:grid-cols-[2fr_1fr]">
          <div>
            <p className="eyebrow">Want something custom?</p>
            <h2 className="mt-3 font-display text-3xl">
              Let&apos;s curate a Wall Gallery for your space.
            </h2>
          </div>
          <Link
            to="/work-with-us"
            className="inline-flex h-12 items-center justify-center rounded-md bg-accent px-8 text-base font-medium text-bg shadow-[var(--shadow-card)] transition hover:bg-burnt hover:shadow-[var(--shadow-card-hover)]"
          >
            Start a project
          </Link>
        </div>
      </section>
    </>
  );
}
