import { Link } from "react-router-dom";
import { useCart } from "@/store/cart";
import { Section } from "@/components/ui/Section";
import { EyebrowHeading } from "@/components/ui/EyebrowHeading";
import { Button } from "@/components/ui/Button";
import { CartLine } from "@/components/checkout/CartLine";
import { CartSummary } from "@/components/checkout/CartSummary";
import { api, FetchError } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";

export default function Cart() {
  const items = useCart((s) => s.items);
  const [submitting, setSubmitting] = useState(false);

  async function startCheckout() {
    if (items.length === 0) return;
    setSubmitting(true);
    try {
      const { url } = await api.post<{ items: typeof items }, { url: string }>(
        "/api/checkout-create-session",
        { items: items.map((i) => ({ kind: i.kind, slug: i.slug, variantId: i.variantId, quantity: i.quantity })) },
      );
      window.location.href = url;
    } catch (e) {
      const msg = e instanceof FetchError ? e.apiError.message : "Checkout couldn't start. Try again.";
      toast.error(msg);
      setSubmitting(false);
    }
  }

  return (
    <Section>
      <EyebrowHeading eyebrow="Your cart" title="Review your selection" />
      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_360px]">
        <div className="divide-y divide-border">
          {items.length === 0 ? (
            <div className="py-12 text-center text-text-muted">
              Your cart is empty.{" "}
              <Link to="/shop" className="underline">
                Browse the studio
              </Link>
              .
            </div>
          ) : (
            items.map((line, i) => (
              <CartLine key={`${line.kind}:${line.slug}:${line.variantId ?? ""}:${i}`} line={line} />
            ))
          )}
        </div>
        {items.length > 0 && (
          <aside className="h-fit rounded-md bg-bg-elevated p-6 space-y-4">
            <CartSummary />
            <Button onClick={startCheckout} disabled={submitting} fullWidth size="lg">
              {submitting ? "Redirecting…" : "Checkout"}
            </Button>
          </aside>
        )}
      </div>
    </Section>
  );
}
