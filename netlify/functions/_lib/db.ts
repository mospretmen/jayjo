import { neon } from "@neondatabase/serverless";
import { getServerEnv } from "./env";

let cached: ReturnType<typeof neon> | null = null;

export function db() {
  if (cached) return cached;
  cached = neon(getServerEnv().DATABASE_URL);
  return cached;
}
