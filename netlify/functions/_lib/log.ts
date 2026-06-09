const SECRET_PATTERNS = [
  /sk_(live|test)_[A-Za-z0-9]{20,}/g,
  /whsec_[A-Za-z0-9]{20,}/g,
  /re_[A-Za-z0-9_]{20,}/g,
  /xai-[A-Za-z0-9]{20,}/g,
  /ghp_[A-Za-z0-9]{20,}/g,
  /npg_[A-Za-z0-9]{8,}/g,
  /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, // JWT
];

function redact(value: unknown): unknown {
  if (typeof value === "string") {
    let out = value;
    for (const p of SECRET_PATTERNS) out = out.replace(p, "[REDACTED]");
    return out;
  }
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object") {
    const o: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) o[k] = redact(v);
    return o;
  }
  return value;
}

export function log(level: "info" | "warn" | "error", msg: string, ctx: Record<string, unknown> = {}) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    msg,
    ...(redact(ctx) as Record<string, unknown>),
  };
  const sink = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
  sink(JSON.stringify(entry));
}

export function newRequestId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
