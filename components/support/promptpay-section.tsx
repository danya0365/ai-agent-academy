"use client";

import { useState, useCallback } from "react";
import {
  Heart,
  Download,
  Copy,
  Check,
  X,
  Pencil,
} from "lucide-react";
import { getPromptPayQR } from "@/actions/promptpay";

interface Props {
  initialQR: string | null;
  promptPayId: string;
}

const PRESETS = [50, 100, 200, 500, 1000];

export function PromptPaySection({ initialQR, promptPayId }: Props) {
  const [mode, setMode] = useState<"open" | number>("open");
  const [customText, setCustomText] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [qr, setQr] = useState<string | null>(initialQR);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const generateQR = useCallback(async (amt?: number) => {
    setLoading(true);
    try {
      const dataUrl = await getPromptPayQR(amt);
      if (dataUrl) setQr(dataUrl);
    } catch {
      // silently fail — QR generation is non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  const selectPreset = (val: number) => {
    setMode(val);
    setShowCustomInput(false);
    setCustomText("");
    generateQR(val);
  };

  const goOpen = () => {
    setMode("open");
    setShowCustomInput(false);
    setCustomText("");
    generateQR();
  };

  const submitCustom = () => {
    const val = parseInt(customText, 10);
    if (isNaN(val) || val < 1) return;
    setMode(val);
    setShowCustomInput(false);
    generateQR(val);
  };

  const downloadQR = async () => {
    if (!qr) return;
    setDownloading(true);
    try {
      const link = document.createElement("a");
      link.href = qr;
      link.download = `promptpay${typeof mode === "number" ? `-${mode}` : ""}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setDownloading(false);
    }
  };

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(promptPayId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard not available
    }
  };

  const isSelectedPreset = (val: number) => mode === val && !showCustomInput;
  const showAmountTag = mode !== "open";

  return (
    <div className="card-flat flex flex-col items-center p-5">
      <p className="mb-3 text-sm font-bold text-foreground">
        โอนให้กำลังใจผ่านพร้อมเพย์
      </p>

      {/* ── Preset + custom buttons ── */}
      <div className="flex flex-wrap justify-center gap-1.5 mb-3">
        {PRESETS.map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => selectPreset(val)}
            className={`btn btn-sm ${
              isSelectedPreset(val) ? "btn-accent" : "btn-secondary"
            }`}
          >
            {val.toLocaleString()}
          </button>
        ))}

        {!showCustomInput && (
          <button
            type="button"
            onClick={() => {
              setShowCustomInput(true);
              setMode("open");
            }}
            className="btn btn-sm btn-secondary"
          >
            อื่นๆ
          </button>
        )}

        {showAmountTag && (
          <button
            type="button"
            onClick={goOpen}
            className="btn btn-sm btn-ghost text-muted"
            title="กลับเป็น QR แบบเปิด (ไม่ระบุยอด)"
          >
            <X className="size-3" />
          </button>
        )}
      </div>

      {/* ── Custom input ── */}
      {showCustomInput && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitCustom();
          }}
          className="mb-3 flex w-full max-w-56 items-center gap-2"
        >
          <input
            type="number"
            min={1}
            inputMode="numeric"
            placeholder="กรอกจำนวนบาท"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            className="input flex-1 text-center"
            autoFocus
          />
          <button type="submit" className="btn btn-accent btn-sm">
            ยืนยัน
          </button>
        </form>
      )}

      {/* ── Amount tag ── */}
      {showAmountTag && (
        <p className="mb-2 text-xs font-bold text-brand-500">
          จำนวน {mode.toLocaleString()} บาท
        </p>
      )}

      {/* ── QR ── */}
      {loading ? (
        <div className="flex h-40 w-40 items-center justify-center rounded-xl border-2 border-border">
          <span className="text-xs text-muted">กำลังสร้าง QR...</span>
        </div>
      ) : qr ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qr}
            alt="PromptPay QR"
            className="w-40 rounded-xl border-2 border-border"
          />
        </div>
      ) : null}

      {/* ── Download ── */}
      {qr && (
        <button
          type="button"
          onClick={downloadQR}
          disabled={downloading}
          className="btn btn-sm btn-secondary mt-2 gap-1.5"
        >
          <Download className="size-3.5" />
          {downloading ? "กำลังดาวน์โหลด..." : "ดาวน์โหลด QR"}
        </button>
      )}

      {/* ── Copy PromptPay ID ── */}
      <div className="mt-2 flex items-center gap-2">
        <span className="font-mono text-sm text-foreground">
          {promptPayId}
        </span>
        <button
          type="button"
          onClick={copyId}
          className="inline-flex items-center gap-1 text-sm font-bold text-brand-700 transition hover:text-brand-500"
          aria-label="คัดลอกเบอร์พร้อมเพย์"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "คัดลอกแล้ว" : "คัดลอกเบอร์"}
        </button>
      </div>
    </div>
  );
}
