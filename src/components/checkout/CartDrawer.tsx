import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useCart } from "@/store/cart";
import { CartLine } from "./CartLine";
import { CartSummary } from "./CartSummary";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { api, FetchError } from "@/lib/api";
import { toast } from "sonner";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const items = useCart((s) => s.items);
  const [submitting, setSubmitting] = useState(false);

  async function startCheckout() {
    if (items.length === 0) return;
    setSubmitting(true);
    try {
      const { url } = await api.post<{ items: typeof items }, { url: string }>(
        "/api/checkout-create-session",
        {
          items: items.map((i) => ({
            kind: i.kind,
            slug: i.slug,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        },
      );
      window.location.href = url;
    } catch (e) {
      const msg = e instanceof FetchError ? e.apiError.message : "Checkout couldn't start. Try again.";
      toast.error(msg);
      setSubmitting(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-text/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content
          className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-bg shadow-[var(--shadow-card-hover)] data-[state=open]:animate-in data-[state=open]:slide-in-from-right"
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <Dialog.Title className="font-display text-xl text-text">Your cart</Dialog.Title>
            <Dialog.Close
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-text-muted hover:bg-bg-elevated hover:text-text"
              aria-label="Close cart"
            >
              <X size={18} />
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-2">
            {items.length === 0 ? (
              <div className="py-12 text-center text-text-muted">
                Your cart is empty.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {items.map((line, i) => (
                  <CartLine key={`${line.kind}:${line.slug}:${line.variantId ?? ""}:${i}`} line={line} />
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-border bg-bg-elevated px-6 py-4 space-y-4">
              <CartSummary />
              <Button onClick={startCheckout} disabled={submitting} fullWidth size="lg">
                {submitting ? "Redirecting…" : "Checkout"}
              </Button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
