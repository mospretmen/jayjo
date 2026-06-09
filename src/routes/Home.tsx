import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Artwork, Gallery } from "@/catalog/types";
import { getCatalog } from "@/catalog";
import { Button } from "@/components/ui/Button";
import { ArtworkCard } from "@/components/product/ArtworkCard";
import { ArtworkCardSkeleton } from "@/components/product/ArtworkCardSkeleton";
import { GalleryCard } from "@/components/gallery/GalleryCard";
import { GalleryCardSkeleton } from "@/components/gallery/GalleryCardSkeleton";
import { Reveal } from "@/components/motion/Reveal";

const SHOP_BY = [
  { label: "All works", href: "/shop" },
  { label: "Originals", href: "/shop?kind=original" },
  { label: "Prints", href: "/shop?kind=print" },
  { label: "Wall Galleries", href: "/galleries" },
];

export default function Home() {
  const navigate = useNavigate();
  const [art, setArt] = useState<Artwork[] | null>(null);
  const [galleries, setGalleries] = useState<Gallery[] | null>(null);

  useEffect(() => {
    const c = getCatalog();
    c.listArtworks().then((a) => setArt(a.slice(0, 6)));
    c.listGalleries().then((g) => setGalleries(g.slice(0, 2)));
  }, []);

  return (
    <>
      {/* HERO — full-bleed editorial; pulled up under the transparent sticky header */}
      <section className="relative -mt-16 h-[100svh] min-h-[640px] w-full overflow-hidden">
        <img
          src="/hero/hero-gallery-wall.jpg"
          alt="A curated gallery wall in a warm, sunlit interior"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Soft warm overlay for legibility */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-text/70 via-text/30 to-transparent"
        />
        <div className="absolute inset-0 flex flex-col justify-between px-6 pt-24 pb-10 sm:px-10 sm:pt-28 sm:pb-14 lg:px-16 lg:pt-32 lg:pb-20">
          <Reveal>
            <div className="max-w-2xl text-bg">
              <p className="eyebrow text-bg/80">New collection</p>
              <h1 className="mt-3 font-display text-4xl leading-[1.05] sm:text-5xl lg:text-7xl">
                Art, designed for warm, lived-in rooms.
              </h1>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="max-w-xl space-y-6 text-bg">
              <p className="max-w-prose text-base text-bg/90 sm:text-lg">
                Originals on linen, prints on cotton rag, and curated Wall Galleries — composed in
                quiet earth tones and assembled with intention.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => navigate("/shop")}>Shop the studio</Button>
                <Link
                  to="/galleries"
                  className="inline-flex h-11 items-center justify-center rounded-md border border-bg/40 px-6 text-sm font-medium text-bg outline-none transition hover:bg-bg/10 focus-visible:ring-2 focus-visible:ring-bg focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                >
                  Wall Galleries
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SHOP BY pill row — single row, scrolls horizontally on mobile if needed */}
      <section className="border-b border-border bg-bg-elevated">
        <div
          className="flex items-center gap-3 overflow-x-auto py-5 sm:flex-wrap sm:overflow-visible sm:py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{
            paddingLeft: "max(1.5rem, calc((100vw - 80rem) / 2 + 1.5rem))",
            paddingRight: "max(1.5rem, calc((100vw - 80rem) / 2 + 1.5rem))",
          }}
        >
          <p className="eyebrow mr-1 shrink-0">Shop by</p>
          {SHOP_BY.map((s) => (
            <Link
              key={s.href}
              to={s.href}
              className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full border border-border bg-bg px-4 py-2 text-sm text-text outline-none transition hover:bg-accent hover:text-bg focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              {s.label}
            </Link>
          ))}
        </div>
      </section>

      {/* LATEST WORKS — smooth horizontal scroll */}
      <section className="py-14 md:py-20">
        <div className="container-page">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-xl">
                <p className="eyebrow">New from the studio</p>
                <h2 className="mt-3 font-display text-3xl text-text md:text-4xl">
                  Latest works.
                </h2>
              </div>
              <Link to="/shop" className="text-sm text-text underline-offset-4 hover:underline">
                See everything →
              </Link>
            </div>
          </Reveal>
        </div>

        <div className="mt-10">
          <div
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-6 [scrollbar-color:rgb(var(--color-text-rgb)/0.2)_transparent] [scrollbar-width:thin] sm:gap-8"
            style={{
              paddingLeft: "max(1.5rem, calc((100vw - 80rem) / 2 + 1.5rem))",
              paddingRight: "max(1.5rem, calc((100vw - 80rem) / 2 + 1.5rem))",
            }}
          >
            {art
              ? art.map((a, i) => (
                  <div
                    key={a.slug}
                    className="w-[72%] shrink-0 snap-start sm:w-[44%] md:w-[34%] lg:w-[26%] xl:w-[22%]"
                  >
                    <ArtworkCard artwork={a} priority={i < 2} />
                  </div>
                ))
              : Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="w-[72%] shrink-0 sm:w-[44%] md:w-[34%] lg:w-[26%] xl:w-[22%]">
                    <ArtworkCardSkeleton />
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* EDITORIAL SPREAD — full-bleed image + side caption */}
      <section className="relative">
        <div className="grid items-stretch md:grid-cols-[1.4fr_1fr]">
          <div className="relative aspect-[3/2] md:aspect-auto">
            <img
              src="/hero/featured-arrangement.jpg"
              alt="An oversized botanical painting flanked by a fiddle-leaf fig and a brass floor lamp"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center bg-bg-elevated px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
            <Reveal>
              <p className="eyebrow">In the studio</p>
              <h2 className="mt-3 font-display text-3xl text-text md:text-4xl">
                Built to anchor a room.
              </h2>
              <p className="mt-5 max-w-prose text-text-muted">
                Every Wall Gallery is composed in the studio — proportions, palette, and pace
                chosen together. We hang them on the wall, photograph them in daylight, and only
                then list them for sale.
              </p>
              <div className="mt-8">
                <Button variant="ghost" onClick={() => navigate("/galleries")}>
                  Browse the arrangements
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* WALL GALLERIES */}
      <section className="container-page py-16 md:py-24">
        <Reveal>
          <p className="eyebrow">Wall Galleries</p>
          <h2 className="mt-3 font-display text-3xl text-text md:text-4xl">
            Shop the arrangements.
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-12">
          {galleries
            ? galleries.map((g) => <GalleryCard key={g.slug} gallery={g} />)
            : Array.from({ length: 2 }).map((_, i) => <GalleryCardSkeleton key={i} />)}
        </div>
      </section>

      {/* WORK WITH STUDIO JAYJO — terracotta CTA */}
      <section className="bg-fig text-bg">
        <div className="container-page grid items-center gap-8 py-14 md:grid-cols-[2fr_1fr] md:py-20">
          <Reveal>
            <p className="eyebrow text-bg/70">Work with Studio JayJo</p>
            <h2 className="mt-3 font-display text-3xl md:text-5xl">
              Collaborations with collectors, designers, and hospitality clients.
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <Link
              to="/work-with-us"
              className="inline-flex h-12 items-center justify-center rounded-md bg-accent px-8 text-base font-medium text-bg shadow-[var(--shadow-card)] outline-none transition hover:bg-burnt hover:shadow-[var(--shadow-card-hover)] focus-visible:ring-2 focus-visible:ring-bg focus-visible:ring-offset-2 focus-visible:ring-offset-fig md:w-full"
            >
              Tell us about your project
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
