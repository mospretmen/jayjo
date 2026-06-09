import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { getCatalog } from "@/catalog";
import { type CartLine as TLine, useCart } from "@/store/cart";
import { Price } from "@/components/ui/Price";
import { ImageWithBlur } from "@/components/product/ImageWithBlur";

interface Resolved {
  title: string;
  variantLabel?: string;
  unitPriceCents: number;
  imageUrl: string;
  href: string;
}

async function resolveLine(line: TLine): Promise<Resolved | null> {
  const catalog = getCatalog();
  if (line.kind === "artwork") {
    const a = await catalog.getArtwork(line.slug);
    if (!a) return null;
    const v = a.variants.find((x) => x.id === line.variantId);
    if (!v) return null;
    return {
      title: a.title,
      variantLabel: v.label,
      unitPriceCents: v.priceCents,
      imageUrl: a.images[0].src,
      href: `/shop/${a.slug}`,
    };
  }
  const g = await catalog.getGallery(line.slug);
  if (!g?.bundle) return null;
  return {
    title: `${g.title} (Gallery)`,
    unitPriceCents: g.bundle.bundlePriceCents,
    imageUrl: g.heroImage.src,
    href: `/galleries/${g.slug}`,
  };
}

export function CartLine({ line }: { line: TLine }) {
  const [resolved, setResolved] = useState<Resolved | null>(null);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);

  useEffect(() => {
    resolveLine(line).then(setResolved);
  }, [line]);

  if (!resolved) {
    return <div className="h-24 animate-pulse rounded-md bg-bg-elevated" />;
  }

  const key = { kind: line.kind, slug: line.slug, variantId: line.variantId };

  return (
    <div className="flex gap-4 py-4">
      <Link to={resolved.href} className="block w-20 shrink-0">
        <ImageWithBlur src={resolved.imageUrl} alt={resolved.title} aspect={3 / 4} />
      </Link>
      <div className="flex-1 space-y-1">
        <Link to={resolved.href} className="font-display text-base text-text hover:text-accent">
          {resolved.title}
        </Link>
        {resolved.variantLabel && (
          <p className="text-xs text-text-muted">{resolved.variantLabel}</p>
        )}
        <Price cents={resolved.unitPriceCents} className="text-sm text-text-muted" />
        <div className="mt-2 flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-text-muted">
            Qty
            <input
              type="number"
              min={1}
              max={99}
              value={line.quantity}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (!Number.isNaN(n)) setQuantity(key, n);
              }}
              className="h-8 w-14 rounded-md border border-border bg-bg-elevated px-2 text-sm text-text"
            />
          </label>
          <button
            type="button"
            onClick={() => remove(key)}
            aria-label={`Remove ${resolved.title}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:text-fig"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
