import { useState } from "react";
import { cn } from "@/lib/cn";

interface ImageWithBlurProps {
  src: string;
  alt: string;
  aspect?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
}

export function ImageWithBlur({
  src,
  alt,
  aspect = 4 / 5,
  priority = false,
  className,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
}: ImageWithBlurProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={cn("relative overflow-hidden bg-bg-elevated", className)} style={{ aspectRatio: aspect }}>
      <img
        src={src}
        alt={alt}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        {...{ fetchpriority: priority ? "high" : "auto" }}
        onLoad={() => setLoaded(true)}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}
