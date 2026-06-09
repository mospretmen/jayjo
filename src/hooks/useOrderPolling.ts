import { useEffect, useState } from "react";
import { api, FetchError } from "@/lib/api";

interface OrderPolling {
  status: "polling" | "found" | "timeout" | "error";
  order: { id: string; totalCents: number; currency: string } | null;
  error?: string;
}

const SCHEDULE_MS = [500, 1000, 2000, 3000, 5000];

export function useOrderPolling(sessionId: string | null): OrderPolling {
  const [state, setState] = useState<OrderPolling>({ status: "polling", order: null });

  useEffect(() => {
    if (!sessionId) {
      setState({ status: "error", order: null, error: "Missing session id" });
      return;
    }
    let cancelled = false;
    let attempt = 0;
    const tick = async () => {
      if (cancelled) return;
      try {
        const res = await api.get<{ order: OrderPolling["order"] }>(
          `/api/orders-get?session_id=${encodeURIComponent(sessionId)}`,
        );
        if (res.order) {
          setState({ status: "found", order: res.order });
          return;
        }
      } catch (e) {
        // 404 = not found yet; other errors logged but we keep polling
        if (e instanceof FetchError && e.status !== 404) {
          setState({ status: "error", order: null, error: e.apiError.message });
          return;
        }
      }
      if (attempt >= SCHEDULE_MS.length) {
        setState({ status: "timeout", order: null });
        return;
      }
      setTimeout(tick, SCHEDULE_MS[attempt++]);
    };
    tick();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return state;
}
