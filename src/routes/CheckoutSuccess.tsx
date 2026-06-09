import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { useOrderPolling } from "@/hooks/useOrderPolling";
import { useCart } from "@/store/cart";
import { Skeleton } from "@/components/ui/Skeleton";
import { Price } from "@/components/ui/Price";

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const polling = useOrderPolling(sessionId);
  const clearCart = useCart((s) => s.clear);
  const navigate = useNavigate();

  useEffect(() => {
    if (polling.status === "found") clearCart();
  }, [polling.status, clearCart]);

  return (
    <Section className="text-center">
      <p className="eyebrow">Thank you</p>
      <h1 className="mt-3 font-display text-4xl text-text md:text-5xl">Your order is confirmed.</h1>

      <div className="mx-auto mt-12 max-w-md">
        {polling.status === "polling" && (
          <div className="space-y-3">
            <Skeleton className="mx-auto h-6 w-3/4" delayMs={0} />
            <Skeleton className="mx-auto h-4 w-1/2" delayMs={0} />
            <p className="text-sm text-text-muted">Saving your order…</p>
          </div>
        )}
        {polling.status === "found" && polling.order && (
          <div className="space-y-3">
            <p className="text-text-muted">Order ID</p>
            <p className="font-mono text-sm text-text">{polling.order.id}</p>
            <p className="text-text-muted">Total</p>
            <Price cents={polling.order.totalCents} currency={polling.order.currency.toUpperCase()} className="font-display text-2xl" />
            <p className="mt-6 text-text-muted">
              We emailed you a receipt with a tracking link.
            </p>
          </div>
        )}
        {polling.status === "timeout" && (
          <p className="text-text-muted">
            Your order is being processed. Check your inbox for the receipt.
          </p>
        )}
        {polling.status === "error" && (
          <p className="text-fig">{polling.error ?? "Couldn't load order."}</p>
        )}
      </div>

      <div className="mt-12 flex flex-col items-center gap-3">
        <Button onClick={() => navigate("/shop")}>Keep shopping</Button>
        <Link to="/" className="text-sm text-text-muted underline">Back to the studio</Link>
      </div>
    </Section>
  );
}
