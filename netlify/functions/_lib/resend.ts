import { Resend } from "resend";
import { getServerEnv } from "./env";
import { log } from "./log";

let cached: Resend | null = null;

function client(): Resend {
  if (cached) return cached;
  cached = new Resend(getServerEnv().RESEND_API_KEY);
  return cached;
}

interface OrderReceiptInput {
  to: string;
  orderId: string;
  guestToken: string | null;
  totalCents: number;
  currency: string;
  items: Array<{ title: string; variantLabel?: string; quantity: number; unitPriceCents: number }>;
}

function formatCents(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export async function sendOrderReceipt(input: OrderReceiptInput): Promise<void> {
  const env = getServerEnv();
  const trackUrl = input.guestToken
    ? `${env.APP_URL}/account/orders/${input.orderId}?token=${input.guestToken}`
    : `${env.APP_URL}/account/orders/${input.orderId}`;

  const itemsHtml = input.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0;">${i.title}${i.variantLabel ? ` — ${i.variantLabel}` : ""} × ${i.quantity}</td><td style="padding:6px 0;text-align:right;">${formatCents(i.unitPriceCents * i.quantity, input.currency)}</td></tr>`,
    )
    .join("");

  const html = `
<!doctype html>
<html><body style="font-family: Georgia, serif; background:#F2EBDC; color:#2E1F12; padding:32px;">
  <div style="max-width:560px; margin:0 auto; background:#E8E2D3; padding:32px; border-radius:8px;">
    <p style="font-size:12px; letter-spacing:0.18em; text-transform:uppercase; color:#756751;">Studio JayJo</p>
    <h1 style="font-size:28px; margin:8px 0 24px;">Thank you for your order</h1>
    <p>We've received your order. We'll email you again when it ships.</p>
    <table style="width:100%; margin-top:24px; border-top:1px solid #A89A86; border-bottom:1px solid #A89A86; padding:12px 0;">${itemsHtml}</table>
    <p style="font-size:18px; text-align:right; margin:16px 0;"><strong>Total: ${formatCents(input.totalCents, input.currency)}</strong></p>
    <p style="margin-top:24px;"><a href="${trackUrl}" style="color:#A6541F;">Track your order</a></p>
    <p style="margin-top:32px; font-size:12px; color:#756751;">Studio JayJo · hello@studiojayjo.com</p>
  </div>
</body></html>`;

  const result = await client().emails.send({
    from: "Studio JayJo <hello@studiojayjo.com>",
    to: input.to,
    subject: `Your Studio JayJo order — ${input.orderId.slice(0, 8)}`,
    html,
  });

  log("info", "Receipt email sent", { id: result.data?.id, recipient: input.to, template: "order_receipt" });
}
