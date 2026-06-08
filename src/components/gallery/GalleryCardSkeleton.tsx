import { Skeleton } from "@/components/ui/Skeleton";

export function GalleryCardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="aspect-[3/2] w-full" delayMs={0} />
      <Skeleton className="h-4 w-24" delayMs={0} />
      <Skeleton className="h-7 w-2/3" delayMs={0} />
      <Skeleton className="h-4 w-full" delayMs={0} />
    </div>
  );
}
