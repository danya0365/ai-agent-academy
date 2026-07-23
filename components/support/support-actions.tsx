"use client";

import { useState, useSyncExternalStore } from "react";
import { Heart, Copy, Check } from "lucide-react";
import { useSupportStore } from "@/lib/support-store";

/** true เฉพาะฝั่ง client หลัง hydration — กัน hydration mismatch โดยไม่ setState ใน effect */
const emptySubscribe = () => () => {};
function useHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

/**
 * ปุ่ม "ให้กำลังใจ dev" — ไม่ล็อกเนื้อหา เป็นแค่ interaction อบอุ่น
 * เก็บสถานะไว้ใน localStorage (Zustand persist) เพื่อจำว่าเคยกดแล้ว
 */
export function EncourageButton() {
  const encouraged = useSupportStore((s) => s.encouraged);
  const count = useSupportStore((s) => s.encourageCount);
  const encourage = useSupportStore((s) => s.encourage);

  // กัน hydration mismatch: อ่านค่า persist หลัง hydration เท่านั้น
  const mounted = useHydrated();
  const isEncouraged = mounted && encouraged;

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={encourage}
        className={`btn ${isEncouraged ? "btn-secondary" : "btn-accent"}`}
        aria-pressed={isEncouraged}
      >
        <Heart
          className={`size-4 ${isEncouraged ? "fill-current" : ""}`}
          aria-hidden
        />
        {isEncouraged ? "ให้กำลังใจแล้ว" : "ให้กำลังใจ dev"}
        {mounted && count > 0 && (
          <span className="badge bg-card text-foreground">{count}</span>
        )}
      </button>
      {isEncouraged && (
        <p className="text-sm text-muted">
          ขอบคุณจากใจจริง ๆ ครับ 🙏 กำลังใจของคุณมีความหมายกับครอบครัวผมมาก
        </p>
      )}
    </div>
  );
}

/** ปุ่มคัดลอกข้อความ (เช่น เบอร์พร้อมเพย์) */
export function CopyButton({
  value,
  label,
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // เบราว์เซอร์บางตัว/บริบทที่ไม่ปลอดภัยคัดลอกไม่ได้ — เงียบไว้
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1 text-sm font-bold text-brand-700 transition hover:text-brand-500"
      aria-label={`คัดลอก${label ? " " + label : ""}`}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "คัดลอกแล้ว" : label ?? "คัดลอก"}
    </button>
  );
}
