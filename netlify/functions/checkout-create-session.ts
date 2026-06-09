import type { Context } from "@netlify/functions";
import { randomBytes } from "node:crypto";
import { stripe } from "./_lib/stripe";
import { db } from "./_lib/db";
import { getServerEnv } from "./_lib/env";
import { parseJson } from "./_lib/validate";
import { CreateCheckoutRequestSchema } from "../../src/shared/schemas";
import { resolveCartLines, PricingError } from "./_lib/pricing";
import { AppError, errorResponse, jsonResponse } from "./_lib/errors";
import { log, newRequestId } from "./_lib/log";
import { staticAdapter } from "../../src/catalog/adapters/static";

export default async (req: Request, _ctx: Context): Promise<Response> => {
  const requestId = newRequestId();
  try {
    if (req.method !== "POST") throw new AppError("method_not_allowed", 405, "POST only");

    const env = getServerEnv();
    const body = await parseJson(req, CreateCheckoutRequestSchema);

    const artworks = await staticAdapter.listArtworks();
    const galleries = await staticAdapter.listGalleries();

    let resolved;
    try {
      resolved = resolveCartLines(body.items, { artworks, galleries });
    } catch (e) {
      if (e instanceof PricingError) {
        throw new AppError(e.code, 400, e.message);
      }
      throw e;
    }

    // Determine shipping group: if ANY line is an oversized original, use the heavier rate.
    const needsOversized = resolved.lines.some((l) => {
      if (l.kind !== "artwork") return false;
      const a = artworks.find((x) => x.slug === l.slug);
      return a?.shippingGroup === "original-oversized";
    });

    const guestToken = randomBytes(24).toString("base64url");

    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: resolved.lines.map((l) => ({
        price: l.stripePriceId,
        quantity: l.quantity,
      })),
      automatic_tax: { enabled: true },
      shipping_address_collection: {
        allowed_countries: [
          "US","CA","GB","IE","FR","DE","ES","IT","NL","BE","SE","DK","NO","FI","CH","AT","PT","AU","NZ","JP","SG","HK",
        ],
      },
      shipping_options: needsOversized
        ? [
            {
              shipping_rate_data: {
                type: "fixed_amount",
                fixed_amount: { amount: 7500, currency: "usd" },
                display_name: "White-glove (originals)",
                delivery_estimate: {
                  minimum: { unit: "business_day", value: 5 },
                  maximum: { unit: "business_day", value: 14 },
                },
              },
            },
          ]
        : [
            {
              shipping_rate_data: {
                type: "fixed_amount",
                fixed_amount: { amount: 1500, currency: "usd" },
                display_name: "Standard (prints)",
                delivery_estimate: {
                  minimum: { unit: "business_day", value: 3 },
                  maximum: { unit: "business_day", value: 7 },
                },
              },
            },
          ],
      success_url: `${env.APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.APP_URL}/checkout/cancel`,
      metadata: {
        guest_token: guestToken,
        cart_hash: resolved.lines.map((l) => `${l.slug}:${l.variantId ?? ""}:${l.quantity}`).join(","),
      },
    });

    // Persist a pending order row so webhook can find it; the webhook upgrades status to 'paid'.
    await db()(
      `INSERT INTO orders (stripe_session_id, email, status, subtotal_cents, total_cents, currency, guest_token)
       VALUES ($1, $2, 'pending', $3, $3, 'usd', $4)
       ON CONFLICT (stripe_session_id) DO NOTHING`,
      [session.id, "pending@studiojayjo.com", resolved.subtotalCents, guestToken],
    );

    log("info", "Checkout session created", {
      requestId,
      sessionId: session.id,
      lineCount: resolved.lines.length,
      subtotalCents: resolved.subtotalCents,
    });

    return jsonResponse({ url: session.url });
  } catch (e) {
    return errorResponse(e, requestId);
  }
};

export const config = { path: "/api/checkout-create-session" };
