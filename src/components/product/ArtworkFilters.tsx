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
  const activeCount =
    (value.kind ? 1 : 0) +
    (value.colorTags?.length ?? 0) +
    (value.sizeTags?.length ?? 0) +
    (value.query ? 1 : 0);

  return (
    <aside className="space-y-7">
      <div className="flex items-center justify-between">
        <p className="font-display text-xl text-text">Filter</p>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => onChange({})}
            className="text-xs text-text-muted underline-offset-4 hover:text-text hover:underline"
          >
            Clear ({activeCount})
          </button>
        )}
      </div>

      <Input
        label="Search"
        placeholder="Search by title"
        value={value.query ?? ""}
        onChange={(e) => onChange({ ...value, query: e.target.value })}
      />

      <FilterGroup title="Kind">
        {(["original", "print"] as const).map((k) => (
          <Checkbox
            key={k}
            label={k === "original" ? "Originals" : "Prints"}
            checked={value.kind === k}
            onChange={(e) => onChange({ ...value, kind: e.target.checked ? k : undefined })}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Color">
        {COLORS.map((c) => (
          <Checkbox
            key={c.id}
            label={c.label}
            checked={value.colorTags?.includes(c.id) ?? false}
            onChange={() => toggle("colorTags", c.id)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Size">
        {SIZES.map((s) => (
          <Checkbox
            key={s.id}
            label={s.label}
            checked={value.sizeTags?.includes(s.id) ?? false}
            onChange={() => toggle("sizeTags", s.id)}
          />
        ))}
      </FilterGroup>
    </aside>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-border pt-5">
      <legend className="eyebrow mb-3 block">{title}</legend>
      <div className="flex flex-col gap-1">{children}</div>
    </fieldset>
  );
}
