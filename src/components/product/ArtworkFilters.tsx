import type { ArtworkFilter } from "@/catalog/types";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";

interface FiltersProps {
  value: ArtworkFilter;
  onChange: (next: ArtworkFilter) => void;
}

const COLORS = [
  { id: "deep-fig", label: "Deep Fig" },
  { id: "olive-moss", label: "Olive Moss" },
  { id: "cognac", label: "Cognac" },
  { id: "warm-greige", label: "Warm Greige" },
  { id: "soft-parchment", label: "Soft Parchment" },
];
const SIZES = [
  { id: "small", label: "Small" },
  { id: "medium", label: "Medium" },
  { id: "large", label: "Large" },
];

export function ArtworkFilters({ value, onChange }: FiltersProps) {
  const toggle = (key: "colorTags" | "sizeTags", id: string) => {
    const list = value[key] ?? [];
    onChange({
      ...value,
      [key]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id],
    });
  };
  return (
    <aside className="space-y-8">
      <Input
        label="Search"
        placeholder="Search by title"
        value={value.query ?? ""}
        onChange={(e) => onChange({ ...value, query: e.target.value })}
      />
      <div>
        <p className="eyebrow mb-3">Kind</p>
        <div className="space-y-2">
          {(["original", "print"] as const).map((k) => (
            <Checkbox
              key={k}
              label={k === "original" ? "Originals" : "Prints"}
              checked={value.kind === k}
              onChange={(e) => onChange({ ...value, kind: e.target.checked ? k : undefined })}
            />
          ))}
        </div>
      </div>
      <div>
        <p className="eyebrow mb-3">Color</p>
        <div className="space-y-2">
          {COLORS.map((c) => (
            <Checkbox
              key={c.id}
              label={c.label}
              checked={value.colorTags?.includes(c.id) ?? false}
              onChange={() => toggle("colorTags", c.id)}
            />
          ))}
        </div>
      </div>
      <div>
        <p className="eyebrow mb-3">Size</p>
        <div className="space-y-2">
          {SIZES.map((s) => (
            <Checkbox
              key={s.id}
              label={s.label}
              checked={value.sizeTags?.includes(s.id) ?? false}
              onChange={() => toggle("sizeTags", s.id)}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}
