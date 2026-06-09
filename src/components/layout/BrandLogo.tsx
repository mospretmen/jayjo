import { cn } from "@/lib/cn";

interface BrandLogoProps {
  variant?: "icon" | "icon-text";
  className?: string;
  /** Tailwind size class, e.g. h-8 w-8 */
  sizeClass?: string;
}

/**
 * Studio JayJo brandmark. Defaults to the icon-only square logo at h-9 w-9.
 * Use `variant="icon-text"` for sites/contexts where the brand needs to read
 * even at small sizes (the logo art already includes "JAYJO STUDIO").
 */
export function BrandLogo({ variant = "icon", className, sizeClass = "h-9 w-9" }: BrandLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <img
        src="/android-chrome-512x512.png"
        alt=""
        aria-hidden
        className={cn("block shrink-0 rounded-sm object-contain", sizeClass)}
        loading="eager"
        decoding="sync"
      />
      {variant === "icon-text" && (
        <span className="font-display text-xl tracking-tight">Studio JayJo</span>
      )}
      <span className="sr-only">Studio JayJo</span>
    </span>
  );
}
