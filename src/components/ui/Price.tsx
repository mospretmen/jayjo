import { formatPrice, formatPriceRange } from "@/lib/currency";
import { cn } from "@/lib/cn";

interface PriceProps {
  cents: number | number[];
  currency?: string;
  className?: string;
}

export function Price({ cents, currency = "USD", className }: PriceProps) {
  const text = Array.isArray(cents) ? formatPriceRange(cents, currency) : formatPrice(cents, currency);
  return <span className={cn("font-sans tabular-nums text-text", className)}>{text}</span>;
}
