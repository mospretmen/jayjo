import { Skeleton } from "@/components/ui/Skeleton";

export function ArtworkCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[4/5] w-full" delayMs={0} />
      <Skeleton className="h-5 w-2/3" delayMs={0} />
      <Skeleton className="h-4 w-1/3" delayMs={0} />
    </div>
  );
}
