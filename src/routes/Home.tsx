import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Artwork, Gallery } from "@/catalog/types";
import { getCatalog } from "@/catalog";
import { EyebrowHeading } from "@/components/ui/EyebrowHeading";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { ArtworkGrid } from "@/components/product/ArtworkGrid";
import { GalleryCard } from "@/components/gallery/GalleryCard";
import { GalleryCardSkeleton } from "@/components/gallery/GalleryCardSkeleton";
import { ImageWithBlur } from "@/components/product/ImageWithBlur";
import { Reveal } from "@/components/motion/Reveal";

export default function Home() {
  const navigate = useNavigate();
  const [art, setArt] = useState<Artwork[] | null>(null);
  const [galleries, setGalleries] = useState<Gallery[] | null>(null);
  useEffect(() => {
    const c = getCatalog();
    c.listArtworks().then((a) => setArt(a.slice(0, 6)));
    c.listGalleries().then((g) => setGalleries(g.slice(0, 2)));
  }, []);

  const hero = art?.[0];

  return (
    <>
      <Section className="pt-8 md:pt-12">
        <div className="grid items-center gap-10 md:grid-cols-[1fr_1.2fr] md:gap-16">
          <Reveal>
            <EyebrowHeading
              eyebrow="Studio JayJo"
              title="Quiet paintings, made to be lived with."
              description="Originals on linen and small-edition prints on cotton rag — composed in warm pigments and slow, restrained palettes."
              level={1}
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={() => navigate("/shop")}>Shop the studio</Button>
              <Button variant="ghost" onClick={() => navigate("/galleries")}>
                Wall Galleries
              </Button>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            {hero ? (
              <Link to={`/shop/${hero.slug}`} className="block">
                <ImageWithBlur
                  src={hero.images[0].src}
                  alt={hero.images[0].alt}
                  aspect={hero.images[0].aspect}
                  priority
                  className="rounded-lg"
                />
                <div className="mt-3 flex items-baseline justify-between">
                  <p className="eyebrow">{hero.kind === "original" ? "Featured original" : "Featured print"}</p>
                  <p className="font-display text-base text-text">{hero.title}</p>
                </div>
              </Link>
            ) : (
              <div className="aspect-[3/4] rounded-lg bg-burnt/15" />
            )}
          </Reveal>
        </div>
      </Section>

      <Section>
        <EyebrowHeading eyebrow="Shop By" title="Find something quiet for your wall." />
        <div className="mt-10">
          <ArtworkGrid artworks={art ?? []} loading={art === null} />
        </div>
        <div className="mt-10 flex justify-center">
          <Button variant="ghost" onClick={() => navigate("/shop")}>
            See everything
          </Button>
        </div>
      </Section>

      <Section>
        <EyebrowHeading eyebrow="Wall Galleries" title="Shop the arrangements." />
        <div className="mt-10 grid gap-10 md:grid-cols-2">
          {galleries
            ? galleries.map((g) => <GalleryCard key={g.slug} gallery={g} />)
            : Array.from({ length: 2 }).map((_, i) => <GalleryCardSkeleton key={i} />)}
        </div>
      </Section>

      <section className="mt-16 bg-fig text-bg md:mt-20">
        <div className="container-page grid gap-8 py-16 md:grid-cols-[2fr_1fr] md:items-center md:py-20">
          <Reveal>
            <p className="eyebrow text-bg/70">Work with Studio JayJo</p>
            <h2 className="mt-3 font-display text-3xl md:text-5xl">
              Collaborations with collectors, designers, and hospitality clients.
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <Link
              to="/work-with-us"
              className="inline-flex h-12 items-center justify-center rounded-md bg-accent px-8 text-base font-medium text-bg shadow-[var(--shadow-card)] transition hover:bg-burnt hover:shadow-[var(--shadow-card-hover)] md:w-full"
            >
              Tell us about your project
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
