import Stripe from "stripe";
import { getServerEnv } from "./env";

let cached: Stripe | null = null;

export function stripe(): Stripe {
  if (cached) return cached;
  cached = new Stripe(getServerEnv().STRIPE_SECRET_KEY, {
    apiVersion: "2025-02-24.acacia",
    typescript: true,
  });
  return cached;
}

export function verifyWebhook(rawBody: string, signature: string): Stripe.Event {
  return stripe().webhooks.constructEvent(rawBody, signature, getServerEnv().STRIPE_WEBHOOK_SECRET);
}
