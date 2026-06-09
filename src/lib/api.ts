import { env } from "@/lib/env";

export interface ApiError {
  code: string;
  message: string;
  requestId?: string;
}

export class FetchError extends Error {
  constructor(public status: number, public apiError: ApiError) {
    super(apiError.message);
  }
}

async function call<TBody, TResponse>(
  method: "GET" | "POST",
  path: string,
  body?: TBody,
): Promise<TResponse> {
  const baseUrl = env.APP_URL.replace(/\/$/, "");
  const url = path.startsWith("http") ? path : `${baseUrl}${path}`;
  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let payload: { error?: ApiError } = {};
    try {
      payload = await res.json();
    } catch {
      // ignore
    }
    throw new FetchError(res.status, payload.error ?? { code: "network_error", message: res.statusText });
  }
  return (await res.json()) as TResponse;
}

export const api = {
  post<TBody, TResponse>(path: string, body: TBody): Promise<TResponse> {
    return call<TBody, TResponse>("POST", path, body);
  },
  get<TResponse>(path: string): Promise<TResponse> {
    return call<undefined, TResponse>("GET", path);
  },
};
