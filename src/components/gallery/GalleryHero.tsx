import type { Gallery } from "@/catalog/types";
import { ImageWithBlur } from "@/components/product/ImageWithBlur";
import { Parallax } from "@/components/motion/Parallax";
import { EyebrowHeading } from "@/components/ui/EyebrowHeading";

export function GalleryHero({ gallery }: { gallery: Gallery }) {
  return (
    <section className="container-page py-12">
      <Parallax intensity="subtle">
        <ImageWithBlur
          src={gallery.heroImage.src}
          alt={gallery.heroImage.alt}
          aspect={gallery.heroImage.aspect}
          priority
          className="rounded-lg"
        />
      </Parallax>
      <div className="mt-10 max-w-prose">
        <EyebrowHeading eyebrow="Wall Gallery" title={gallery.title} description={gallery.description} level={1} />
      </div>
    </section>
  );
}
