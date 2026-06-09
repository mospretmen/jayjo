import { z } from "zod";
import { AppError } from "./errors";

export async function parseJson<T>(req: Request, schema: z.ZodType<T>): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new AppError("invalid_json", 400, "Request body must be JSON.");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new AppError("validation_failed", 400, "Invalid request body.", {
      issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
  }
  return parsed.data;
}
