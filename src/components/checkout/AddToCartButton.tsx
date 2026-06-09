import { useState } from "react";
import type { Artwork, ArtworkVariant } from "@/catalog/types";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/store/cart";
import { VariantPicker } from "@/components/product/VariantPicker";
import { toast } from "sonner";

export function AddToCartButton({ artwork }: { artwork: Artwork }) {
  const [variant, setVariant] = useState<ArtworkVariant>(() => artwork.variants[0]);
  const add = useCart((s) => s.add);
  const isSoldOut = variant.stock !== undefined && variant.stock <= 0;
  return (
    <div className="space-y-4">
      <VariantPicker artwork={artwork} onChange={setVariant} />
      <Button
        size="lg"
        disabled={isSoldOut}
        onClick={() => {
          add({ kind: "artwork", slug: artwork.slug, variantId: variant.id });
          toast.success(`Added "${artwork.title}${variant.label ? ` — ${variant.label}` : ""}" to cart.`);
        }}
      >
        {isSoldOut ? "Sold" : "Add to cart"}
      </Button>
    </div>
  );
}
