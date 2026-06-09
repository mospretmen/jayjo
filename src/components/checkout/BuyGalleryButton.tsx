import type { Gallery } from "@/catalog/types";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/store/cart";
import { toast } from "sonner";

export function BuyGalleryButton({ gallery }: { gallery: Gallery }) {
  const add = useCart((s) => s.add);
  if (!gallery.bundle) return null;
  return (
    <Button
      onClick={() => {
        add({ kind: "gallery", slug: gallery.slug });
        toast.success(`Added "${gallery.title}" gallery to cart.`);
      }}
    >
      Buy the whole gallery
    </Button>
  );
}
