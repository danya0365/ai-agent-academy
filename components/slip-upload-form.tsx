"use client";

import { useState, useRef, useTransition } from "react";
import imageCompression from "browser-image-compression";
import { Upload } from "lucide-react";
import { uploadSlip } from "@/actions/enrollments";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function SlipUploadForm({ enrollmentId }: { enrollmentId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [sizeInfo, setSizeInfo] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [ready, setReady] = useState(false);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<File | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const original = e.target.files?.[0];
    if (!original) {
      fileRef.current = null;
      setReady(false);
      setFileName(null);
      setSizeInfo(null);
      return;
    }
    setFileName(original.name);
    setReady(false);
    setCompressing(true);
    try {
      const compressed = await imageCompression(original, {
        maxWidthOrHeight: 1600,
        maxSizeMB: 0.6,
        initialQuality: 0.8,
        useWebWorker: true,
        fileType: "image/jpeg",
      });
      fileRef.current = new File([compressed], "slip.jpg", { type: "image/jpeg" });
      setSizeInfo(`${formatSize(original.size)} → ${formatSize(fileRef.current.size)}`);
    } catch {
      fileRef.current = original;
      setSizeInfo(formatSize(original.size));
    } finally {
      setReady(true);
      setCompressing(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const file = fileRef.current;
    if (!file) {
      setError("กรุณาแนบรูปสลิป");
      return;
    }
    const formData = new FormData();
    formData.append("slip", file);
    startTransition(async () => {
      const res = await uploadSlip(enrollmentId, formData);
      if (res && !res.ok) setError(res.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted-surface px-4 py-6 text-center transition hover:bg-card">
        <Upload className="size-6 text-brand-700" />
        <span className="text-sm font-bold text-foreground">แนบรูปสลิปการโอนเงิน</span>
        <span className="text-xs text-muted">รองรับ JPG, PNG, WEBP</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {fileName && (
        <p className="text-xs text-muted">
          {fileName}
          {compressing && " · กำลังย่อรูป..."}
          {sizeInfo && !compressing && ` · ${sizeInfo}`}
        </p>
      )}

      {error && (
        <p className="rounded-xl border-2 border-border bg-error-surface px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || compressing || !ready}
        className="btn btn-primary w-full"
      >
        {pending ? "กำลังอัปโหลด..." : compressing ? "กำลังย่อรูป..." : "ส่งสลิป"}
      </button>
    </form>
  );
}
