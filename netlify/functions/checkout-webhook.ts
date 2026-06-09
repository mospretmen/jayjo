import type { Context } from "@netlify/functions";
import type Stripe from "stripe";
import { verifyWebhook, stripe } from "./_lib/stripe";
import { db } from "./_lib/db";
import { sendOrderReceipt } from "./_lib/resend";
import { AppError, errorResponse, jsonResponse } from "./_lib/errors";
import { log, newRequestId } from "./_lib/log";
import { filesAdapter } from "../../src/catalog/adapters/files";

export default async (req: Request, _ctx: Context): Promise<Response> => {
  const requestId = newRequestId();
  try {
    if (req.method !== "POST") throw new AppError("method_not_allowed", 405, "POST only");

    const signature = req.headers.get("stripe-signature");
    if (!signature) throw new AppError("missing_signature", 400, "Stripe signature header missing");

    const rawBody = await req.text();
    let event: Stripe.Event;
    try {
      event = verifyWebhook(rawBody, signature);
    } catch (e) {
      log("warn", "Webhook signature verification failed", { requestId, error: String(e) });
      throw new AppError("invalid_signature", 400, "Invalid webhook signature");
    }

    log("info", "Webhook received", { requestId, type: event.type, id: event.id });

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleSessionCompleted(session, requestId);
    } else if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      await handleRefund(charge, requestId);
    } else {
      log("info", "Ignored event type", { requestId, type: event.type });
    }

    return jsonResponse({ received: true });
  } catch (e) {
    return errorResponse(e, requestId);
  }
};

async function handleSessionCompleted(session: Stripe.Checkout.Session, requestId: string) {
  // Expand line items to get pricing details for persistence
  const expanded = await stripe().checkout.sessions.retrieve(session.id, {
    expand: ["line_items", "line_items.data.price"],
  });
  const lineItems = expanded.line_items?.data ?? [];

  const email = session.customer_details?.email ?? "unknown@studiojayjo.com";
  const guestToken = session.metadata?.guest_token ?? null;
  const subtotal = session.amount_subtotal ?? 0;
  const shipping = session.shipping_cost?.amount_subtotal ?? 0;
  const tax = session.total_details?.amount_tax ?? 0;
  const total = session.amount_total ?? subtotal + shipping + tax;
  const currency = session.currency ?? "usd";
  const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;
  const shippingAddress = session.shipping_details?.address ?? null;

  await db()(
    `UPDATE orders SET
       email = $2,
       stripe_payment_id = $3,
       status = 'paid',
       subtotal_cents = $4,
       shipping_cents = $5,
       tax_cents = $6,
       total_cents = $7,
       currency = $8,
       shipping_address = $9
     WHERE stripe_session_id = $1`,
    [session.id, email, paymentIntentId, subtotal, shipping, tax, total, currency, shippingAddress ? JSON.stringify(shippingAddress) : null],
  );

  // Resolve catalog metadata for items (to record slugs + variant labels + image URLs)
  const artworks = await filesAdapter.listArtworks();
  const galleries = await filesAdapter.listGalleries();

  const orderRows = (await db()(`SELECT id FROM orders WHERE stripe_session_id = $1`, [session.id])) as { id: string }[];
  const orderId = orderRows[0]?.id;
  if (!orderId) {
    log("error", "Order missing after session.completed", { requestId, sessionId: session.id });
    throw new AppError("order_missing", 500, "Order row not found after webhook");
  }

  // Idempotency: delete any pre-existing items for this order before inserting.
  await db()(`DELETE FROM order_items WHERE order_id = $1`, [orderId]);

  const receiptItems: Array<{ title: string; variantLabel?: string; quantity: number; unitPriceCents: number }> = [];

  for (const li of lineItems) {
    const meta = (li.price?.metadata ?? {}) as Record<string, string>;
    const variantId = meta.variantId; // format: "<slug>:<variantId>"
    const galleryBundleSlug = meta.galleryBundleSlug;
    let title = li.description ?? "Item";
    let slug = "";
    let variantInternalId: string | null = null;
    let variantLabel: string | undefined;
    let imageUrl: string | null = null;

    if (variantId) {
      const [aSlug, vId] = variantId.split(":");
      slug = aSlug;
      variantInternalId = vId;
      const artwork = artworks.find((a) => a.slug === aSlug);
      if (artwork) {
        title = artwork.title;
        variantLabel = artwork.variants.find((v) => v.id === vId)?.label;
        imageUrl = artwork.images[0]?.src ?? null;
      }
    } else if (galleryBundleSlug) {
      slug = galleryBundleSlug;
      const gallery = galleries.find((g) => g.slug === galleryBundleSlug);
      if (gallery) {
        title = `${gallery.title} (Gallery)`;
        imageUrl = gallery.heroImage.src;
      }
    }

    const qty = li.quantity ?? 1;
    const unit = li.price?.unit_amount ?? 0;

    await db()(
      `INSERT INTO order_items (order_id, artwork_slug, variant_id, title, variant_label, unit_price_cents, quantity, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [orderId, slug || "unknown", variantInternalId, title, variantLabel ?? null, unit, qty, imageUrl],
    );

    receiptItems.push({ title, variantLabel, quantity: qty, unitPriceCents: unit });

    // Decrement inventory for originals
    if (variantId && slug) {
      const artwork = artworks.find((a) => a.slug === slug);
      if (artwork?.kind === "original") {
        await db()(
          `INSERT INTO inventory (artwork_slug, variant_id, stock) VALUES ($1, $2, 0)
           ON CONFLICT (artwork_slug, variant_id) DO UPDATE SET stock = GREATEST(inventory.stock - 1, 0), updated_at = NOW()`,
          [slug, variantInternalId ?? ""],
        );
      }
    }
  }

  try {
    await sendOrderReceipt({
      to: email,
      orderId,
      guestToken,
      totalCents: total,
      currency,
      items: receiptItems,
    });
  } catch (e) {
    log("warn", "Receipt email failed (order still persisted)", { requestId, orderId, error: String(e) });
  }

  log("info", "Order persisted", { requestId, orderId, sessionId: session.id, totalCents: total });
}

async function handleRefund(charge: Stripe.Charge, requestId: string) {
  const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
  if (!paymentIntentId) return;
  await db()(
    `UPDATE orders SET status = 'refunded' WHERE stripe_payment_id = $1`,
    [paymentIntentId],
  );
  log("info", "Order refunded", { requestId, paymentIntentId });
}

// Stripe webhooks need RAW body — disable Netlify's JSON parsing
export const config = {
  path: "/api/checkout-webhook",
};
