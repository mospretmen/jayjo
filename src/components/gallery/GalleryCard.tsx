import { Link } from "react-router-dom";
import type { Gallery } from "@/catalog/types";
import { ImageWithBlur } from "@/components/product/ImageWithBlur";
import { HoverLift } from "@/components/motion/HoverLift";

export function GalleryCard({ gallery }: { gallery: Gallery }) {
  return (
    <HoverLift className="group">
      <Link to={`/galleries/${gallery.slug}`} className="block">
        <ImageWithBlur src={gallery.heroImage.src} alt={gallery.heroImage.alt} aspect={gallery.heroImage.aspect} />
        <div className="mt-4 space-y-1">
          <p className="eyebrow">Wall Gallery</p>
          <h3 className="font-display text-2xl text-text transition group-hover:text-accent">
            {gallery.title}
          </h3>
          <p className="text-text-muted">{gallery.description}</p>
        </div>
      </Link>
    </HoverLift>
  );
}
