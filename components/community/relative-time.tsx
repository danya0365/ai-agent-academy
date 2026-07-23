"use client";

import { useSyncExternalStore } from "react";
import { formatRelativeThai } from "@/lib/community";
import { formatDateTime } from "@/lib/format";

/**
 * นาฬิกากลาง (module-level) — interval เดียวใช้ร่วมทุก timestamp
 * ใช้ useSyncExternalStore เพื่อเลี่ยง setState-in-effect และ hydration-safe
 * (server snapshot = 0 → ทุกอันเรนเดอร์ "เมื่อสักครู่" ตอน SSR, client แก้เป็นเวลาจริง)
 */
let now = typeof window === "undefined" ? 0 : Date.now();
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  if (!timer) {
    timer = setInterval(() => {
      now = Date.now();
      listeners.forEach((l) => l());
    }, 60_000);
  }
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

export function RelativeTime({ ms }: { ms: number }) {
  const clientNow = useSyncExternalStore(
    subscribe,
    () => now,
    () => 0,
  );

  return (
    <time
      dateTime={new Date(ms).toISOString()}
      title={formatDateTime(ms)}
      suppressHydrationWarning
      className="text-xs text-muted"
    >
      {formatRelativeThai(ms, clientNow)}
    </time>
  );
}
