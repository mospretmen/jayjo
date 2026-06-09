import { Skeleton } from "@/components/ui/Skeleton";

export function PageSkeleton() {
  return (
    <div className="container-page py-16 md:py-24">
      <Skeleton className="mb-4 h-8 w-40" />
      <Skeleton className="mb-10 h-12 w-2/3" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4] w-full" />
        ))}
      </div>
    </div>
  );
}
