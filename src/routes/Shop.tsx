import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import type { Artwork, ArtworkFilter } from "@/catalog/types";
import { getCatalog } from "@/catalog";
import { ArtworkFilters } from "@/components/product/ArtworkFilters";
import { ArtworkGrid } from "@/components/product/ArtworkGrid";

function activeFilterCount(f: ArtworkFilter): number {
  return (
    (f.kind ? 1 : 0) +
    (f.colorTags?.length ?? 0) +
    (f.sizeTags?.length ?? 0) +
    (f.query ? 1 : 0)
  );
}

export default function Shop() {
  const [params] = useSearchParams();
  const initialKind = params.get("kind") as Artwork["kind"] | null;
  const [filter, setFilter] = useState<ArtworkFilter>({ kind: initialKind ?? undefined });
  const [results, setResults] = useState<Artwork[] | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setResults(null);
    getCatalog()
      .listArtworks(filter)
      .then(setResults);
  }, [filter]);

  const activeCount = activeFilterCount(filter);

  return (
    <section className="container-page py-6 md:py-8">
      <header className="mb-6 flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-4">
        <div>
          <p className="eyebrow">Shop</p>
          <h1 className="mt-1 font-display text-2xl text-text md:text-3xl">The full studio.</h1>
        </div>
        <p className="text-sm text-text-muted">
          {results === null ? "Loading…" : `${results.length} ${results.length === 1 ? "work" : "works"}`}
        </p>
      </header>

      {/* Mobile filter trigger — collapses the sidebar at < lg */}
      <div className="mb-5 flex items-center justify-between gap-3 lg:hidden">
        <Dialog.Root open={filtersOpen} onOpenChange={setFiltersOpen}>
          <Dialog.Trigger asChild>
            <button
              type="button"
              className="inline-flex h-11 items-center gap-2 rounded-md border border-border bg-bg-elevated px-4 text-sm text-text outline-none transition hover:bg-bg focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              <SlidersHorizontal size={16} />
              Filter
              {activeCount > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs text-bg">
                  {activeCount}
                </span>
              )}
            </button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-text/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
            <Dialog.Content
              className="fixed inset-y-0 left-0 z-50 flex h-full w-full max-w-xs flex-col border-r border-border bg-bg/95 shadow-[var(--shadow-card-hover)] backdrop-blur-lg data-[state=open]:animate-in data-[state=open]:slide-in-from-left"
              aria-describedby={undefined}
            >
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <Dialog.Title className="font-display text-xl text-text">Filter</Dialog.Title>
                <Dialog.Close
                  aria-label="Close filters"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-text-muted outline-none transition hover:bg-bg-elevated hover:text-text focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <X size={18} />
                </Dialog.Close>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-6">
                <ArtworkFilters value={filter} onChange={setFilter} />
              </div>
              <div className="border-t border-border bg-bg-elevated px-5 py-3">
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="inline-flex h-11 w-full items-center justify-center rounded-md bg-accent px-6 text-sm font-medium text-bg outline-none transition hover:bg-burnt focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                >
                  Show {results?.length ?? 0} works
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      <div className="grid gap-8 lg:grid-cols-[15rem_1fr] lg:gap-12">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <ArtworkFilters value={filter} onChange={setFilter} />
        </aside>
        <ArtworkGrid artworks={results ?? []} loading={results === null} />
      </div>
    </section>
  );
}
