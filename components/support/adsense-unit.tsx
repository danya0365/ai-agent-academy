"use client";

import { useEffect } from "react";
import Script from "next/script";

// อ่าน env ตอน build (NEXT_PUBLIC_* ถูก inline ให้ฝั่ง client)
const CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
const SLOT_ID = process.env.NEXT_PUBLIC_ADSENSE_SLOT_TIPS;

type AdsWindow = Window & { adsbygoogle?: unknown[] };

/**
 * ช่องโฆษณา Google AdSense (แบบแสดงผล ไม่บังคับกด)
 * - ถ้ายังไม่ตั้ง client/slot id → แสดง placeholder แทน ไม่ให้หน้าพัง
 * - โหลดสคริปต์ด้วย next/script (strategy afterInteractive)
 *
 * ⚠️ AdSense policy: ห้ามชวน/บังคับให้กด — ปล่อยให้เป็นการแสดงผลตามธรรมชาติเท่านั้น
 */
export function AdsenseUnit() {
  useEffect(() => {
    if (!CLIENT_ID || !SLOT_ID) return;
    try {
      const w = window as AdsWindow;
      w.adsbygoogle = w.adsbygoogle || [];
      w.adsbygoogle.push({});
    } catch {
      // เงียบไว้ถ้า push ไม่สำเร็จ (เช่น ad blocker)
    }
  }, []);

  // ยังไม่มีบัญชี/สลอต → placeholder ให้ merge ได้ก่อน ค่อยใส่ id ทีหลัง
  if (!CLIENT_ID || !SLOT_ID) {
    return (
      <div className="card-flat flex min-h-24 items-center justify-center bg-muted-surface p-5 text-center text-sm text-muted">
        พื้นที่โฆษณา
        <span className="sr-only"> (ยังไม่ได้ตั้งค่า AdSense)</span>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-1 text-xs text-muted">โฆษณา</p>
      <Script
        id="adsbygoogle-init"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT_ID}`}
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={CLIENT_ID}
        data-ad-slot={SLOT_ID}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
