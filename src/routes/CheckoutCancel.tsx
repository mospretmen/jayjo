import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

export default function CheckoutCancel() {
  const navigate = useNavigate();
  useEffect(() => {
    toast.message("Checkout cancelled. Your cart is still here.");
  }, []);
  return (
    <Section className="text-center">
      <p className="eyebrow">Cancelled</p>
      <h1 className="mt-3 font-display text-4xl text-text md:text-5xl">No charge made.</h1>
      <p className="mt-6 text-text-muted">Take your time. Your cart is saved.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Button onClick={() => navigate("/cart")}>Back to cart</Button>
        <Button variant="ghost" onClick={() => navigate("/shop")}>Keep browsing</Button>
      </div>
    </Section>
  );
}
