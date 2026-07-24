"use client";

import { useEffect, useState } from "react";
import { ExternalLink, X } from "lucide-react";
import { isInAppBrowser, detectedAppName } from "@/lib/detect-in-app-browser";

export function InAppBanner() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isInAppBrowser()) setShow(true);
  }, []);

  if (!show || dismissed) return null;

  const app = detectedAppName();
  const msg = app
    ? `คุณกำลังใช้งานผ่าน ${app} — กรุณาเปิดด้วย Safari / Chrome / browser ภายนอกเพื่อประสบการณ์ที่ดีที่สุด`
    : "กรุณาเปิดด้วย Safari / Chrome / browser ภายนอกเพื่อประสบการณ์ที่ดีที่สุด";

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between gap-3 bg-warning-surface px-4 py-2 text-sm font-bold text-warning shadow-md">
      <span className="flex items-center gap-2">
        <ExternalLink className="size-4 shrink-0" />
        {msg}
      </span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded-full p-1 transition hover:bg-warning/80"
        aria-label="ปิด"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
