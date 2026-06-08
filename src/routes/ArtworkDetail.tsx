import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Artwork } from "@/catalog/types";
import { getCatalog } from "@/catalog";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { VariantPicker } from "@/components/product/VariantPicker";
import { ImageWithBlur } from "@/components/product/ImageWithBlur";
import { Heart } from "lucide-react";
import { useFavorites } from "@/store/favorites";
import { Reveal } from "@/components/motion/Reveal";

export default function ArtworkDetail() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const [artwork, setArtwork] = useState<Artwork | null | undefined>(undefined);
  const isFav = useFavorites((s) => s.slugs.includes(slug));
  const toggle = useFavorites((s) => s.toggle);

  useEffect(() => {
    setArtwork(undefined);
    getCatalog()
      .getArtwork(slug)
      .then((a) => setArtwork(a));
  }, [slug]);

  if (artwork === undefined) {
    return (
      <Section>
        <div className="grid gap-12 md:grid-cols-2">
          <Skeleton className="aspect-[4/5] w-full" delayMs={0} />
          <div className="space-y-4">
            <Skeleton className="h-10 w-2/3" delayMs={0} />
            <Skeleton className="h-5 w-1/3" delayMs={0} />
            <Skeleton className="h-32 w-full" delayMs={0} />
          </div>
        </div>
      </Section>
    );
  }

  if (artwork === null) {
    return (
      <Section>
        <h1 className="font-display text-3xl">We couldn&apos;t find that piece.</h1>
        <p className="mt-2 text-text-muted">It may have been moved or sold.</p>
        <Button className="mt-6" onClick={() => navigate("/shop")}>
          Back to shop
        </Button>
      </Section>
    );
  }

  const main = artwork.images[0];

  return (
    <Section>
      <div className="grid gap-12 md:grid-cols-2">
        <Reveal>
          <ImageWithBlur
            src={main.src}
            alt={main.alt}
            aspect={main.aspect}
            priority
            className="rounded-lg"
          />
          {artwork.images.slice(1).length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {artwork.images.slice(1).map((img, i) => (
                <ImageWithBlur
                  key={i}
                  src={img.src}
                  alt={img.alt}
                  aspect={img.aspect}
                  className="rounded"
                />
              ))}
            </div>
          )}
        </Reveal>
        <Reveal delay={0.1}>
          <p className="eyebrow">{artwork.kind === "original" ? "Original" : "Print"}</p>
          <h1 className="mt-2 font-display text-4xl text-text md:text-5xl">{artwork.title}</h1>
          <p className="mt-2 text-text-muted">{artwork.medium}</p>
          <div className="mt-8 max-w-prose space-y-4 text-text">
            <p>{artwork.description}</p>
            {artwork.story && <p className="text-text-muted">{artwork.story}</p>}
          </div>
          <div className="mt-10 space-y-4">
            <VariantPicker artwork={artwork} />
            <div className="flex gap-3">
              <Button size="lg">Add to cart</Button>
              <button
                type="button"
                onClick={() => toggle(artwork.slug)}
                aria-pressed={isFav}
                aria-label={isFav ? "Remove from favorites" : "Favorite this piece"}
                className="inline-flex h-12 w-12 items-center justify-center rounded-md border border-border text-text-muted transition hover:text-text"
              >
                <Heart size={18} className={isFav ? "fill-fig text-fig" : ""} />
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
