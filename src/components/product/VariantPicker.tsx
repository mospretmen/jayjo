import { useState } from "react";
import type { Artwork, ArtworkVariant } from "@/catalog/types";
import { Select } from "@/components/ui/Select";
import { Price } from "@/components/ui/Price";

interface VariantPickerProps {
  artwork: Artwork;
  onChange?: (variant: ArtworkVariant) => void;
}

export function VariantPicker({ artwork, onChange }: VariantPickerProps) {
  const [selected, setSelected] = useState(artwork.variants[0]);
  const isOriginal = artwork.variants.length === 1 && artwork.kind === "original";
  return (
    <div className="space-y-3">
      {!isOriginal ? (
        <Select
          label="Size"
          value={selected.id}
          onChange={(e) => {
            const v = artwork.variants.find((v) => v.id === e.target.value);
            if (v) {
              setSelected(v);
              onChange?.(v);
            }
          }}
        >
          {artwork.variants.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label}
            </option>
          ))}
        </Select>
      ) : (
        <p className="text-sm text-text-muted">{selected.label}</p>
      )}
      <Price cents={selected.priceCents} className="font-display text-2xl" />
      {selected.stock !== undefined && selected.stock <= 0 && (
        <p className="text-sm text-fig">Sold</p>
      )}
    </div>
  );
}
