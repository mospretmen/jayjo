import { z } from "zod";

const ServerEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  STRIPE_SECRET_KEY: z.string().min(10).startsWith("sk_"),
  STRIPE_WEBHOOK_SECRET: z.string().min(10).startsWith("whsec_"),
  RESEND_API_KEY: z.string().min(10).startsWith("re_"),
  JWT_SECRET: z.string().min(32),
  APP_URL: z.string().url(),
  NOTIFY_EMAIL: z.string().email(),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;

let cached: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = ServerEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Missing or invalid server env vars: ${missing}`);
  }
  cached = parsed.data;
  return cached;
}
