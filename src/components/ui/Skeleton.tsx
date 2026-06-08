import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export function Skeleton({
  className,
  delayMs = 200,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { delayMs?: number }) {
  const [show, setShow] = useState(delayMs === 0);
  useEffect(() => {
    if (delayMs === 0) return;
    const t = setTimeout(() => setShow(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);
  if (!show) return null;
  return (
    <div
      aria-hidden
      className={cn(
        "relative overflow-hidden rounded-md bg-bg-elevated shimmer",
        className,
      )}
      {...props}
    />
  );
}
