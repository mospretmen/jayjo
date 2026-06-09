import { useEffect, useState } from "react";
import { useCart } from "@/store/cart";
import { getCatalog } from "@/catalog";
import { Price } from "@/components/ui/Price";

export function CartSummary() {
  const items = useCart((s) => s.items);
  const [subtotalCents, setSubtotalCents] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const catalog = getCatalog();
      let total = 0;
      for (const line of items) {
        if (line.kind === "artwork") {
          const a = await catalog.getArtwork(line.slug);
          const v = a?.variants.find((x) => x.id === line.variantId);
          if (v) total += v.priceCents * line.quantity;
        } else {
          const g = await catalog.getGallery(line.slug);
          if (g?.bundle) total += g.bundle.bundlePriceCents * line.quantity;
        }
      }
      if (!cancelled) setSubtotalCents(total);
    })();
    return () => {
      cancelled = true;
    };
  }, [items]);

  return (
    <div className="space-y-2 border-t border-border pt-4">
      <div className="flex items-center justify-between text-sm text-text-muted">
        <span>Subtotal</span>
        {subtotalCents !== null ? <Price cents={subtotalCents} /> : <span>—</span>}
      </div>
      <p className="text-xs text-text-muted">Shipping and taxes calculated at checkout.</p>
    </div>
  );
}
