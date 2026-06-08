import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import type { Artwork } from "@/catalog/types";
import { ImageWithBlur } from "@/components/product/ImageWithBlur";
import { Price } from "@/components/ui/Price";
import { HoverLift } from "@/components/motion/HoverLift";
import { useFavorites } from "@/store/favorites";
import { cn } from "@/lib/cn";

export function ArtworkCard({ artwork, priority = false }: { artwork: Artwork; priority?: boolean }) {
  const isFav = useFavorites((s) => s.slugs.includes(artwork.slug));
  const toggle = useFavorites((s) => s.toggle);
  const main = artwork.images[0];
  const prices = artwork.variants.map((v) => v.priceCents);
  return (
    <HoverLift className="group">
      <article className="relative">
        <Link to={`/shop/${artwork.slug}`} className="block">
          <ImageWithBlur src={main.src} alt={main.alt} aspect={main.aspect} priority={priority} />
        </Link>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggle(artwork.slug);
          }}
          aria-label={isFav ? `Remove ${artwork.title} from favorites` : `Favorite ${artwork.title}`}
          aria-pressed={isFav}
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-bg/80 backdrop-blur transition hover:bg-bg"
        >
          <Heart
            size={16}
            className={cn("transition", isFav ? "fill-fig text-fig" : "text-text-muted")}
          />
        </button>
        <div className="mt-3 space-y-1">
          <Link to={`/shop/${artwork.slug}`}>
            <h3 className="font-display text-lg text-text transition group-hover:text-accent">
              {artwork.title}
            </h3>
          </Link>
          <Price cents={prices} className="text-sm text-text-muted" />
        </div>
      </article>
    </HoverLift>
  );
}
