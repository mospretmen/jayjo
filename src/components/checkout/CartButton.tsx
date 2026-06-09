import { ShoppingBag } from "lucide-react";
import { useCart } from "@/store/cart";
import { cn } from "@/lib/cn";

interface CartButtonProps {
  onClick: () => void;
  transparent?: boolean;
}

export function CartButton({ onClick, transparent = false }: CartButtonProps) {
  const count = useCart((s) => s.itemCount());
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Cart${count ? ` (${count})` : ""}`}
      className={cn(
        "relative inline-flex h-10 w-10 items-center justify-center rounded-full outline-none transition focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
        transparent
          ? "text-bg/85 hover:bg-bg/15 hover:text-bg focus-visible:ring-offset-transparent"
          : "text-text-muted hover:bg-bg-elevated hover:text-text focus-visible:ring-offset-bg",
      )}
    >
      <ShoppingBag size={18} />
      {count > 0 && (
        <span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs text-bg"
        >
          {count}
        </span>
      )}
    </button>
  );
}
