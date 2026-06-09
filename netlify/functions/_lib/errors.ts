import { log } from "./log";

export class AppError extends Error {
  constructor(
    public code: string,
    public httpStatus: number,
    message: string,
    public context: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

export function errorResponse(err: unknown, requestId: string) {
  if (err instanceof AppError) {
    log("warn", err.message, { code: err.code, requestId, ...err.context });
    return jsonResponse({ error: { code: err.code, message: err.message, requestId } }, err.httpStatus);
  }
  log("error", "Unhandled error", { requestId, error: String(err), stack: (err as Error)?.stack });
  return jsonResponse(
    { error: { code: "internal_error", message: "Something went wrong.", requestId } },
    500,
  );
}
