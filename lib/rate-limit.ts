import { headers } from "next/headers";

type RateLimitConfig = {
  windowMs: number;
  max: number;
  message: string;
};

const hits = new Map<string, { count: number; resetAt: number }>();

export async function rateLimit(
  action: string,
  config: RateLimitConfig,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const h = await headers();
  const ip = h.get("x-forwarded-for") ?? h.get("x-real-ip") ?? "unknown";
  const key = `${action}:${ip}`;
  const now = Date.now();

  const entry = hits.get(key);
  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + config.windowMs });
    return { ok: true };
  }

  entry.count++;
  if (entry.count > config.max) {
    return { ok: false, error: config.message };
  }

  return { ok: true };
}

/** ล้าง entries หมดอายุ — เรียกสม่ำเสมอกัน leak */
export function cleanupRateLimit() {
  const now = Date.now();
  for (const [key, entry] of hits) {
    if (now > entry.resetAt) hits.delete(key);
  }
}

// auto-cleanup ทุก 5 นาที (ไม่มี side effect ใน serverless cold start)
// ponytail: ใช้ `setInterval` ไม่มีใน Edge runtime — ถ้าต้อง deploy Edge ให้ลบ block นี้
if (typeof setInterval !== "undefined") {
  setInterval(cleanupRateLimit, 300_000);
  // ให้ process exit ตามธรรมชาติ — ไม่ต้อง unref
}
