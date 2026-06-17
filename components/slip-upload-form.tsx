"use client";

import { useState, useRef, useTransition } from "react";
import imageCompression from "browser-image-compression";
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
  // ไฟล์ที่ย่อแล้ว พร้อมส่ง
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
      // ย่อรูปบน client เพื่อประหยัดเน็ตผู้ใช้ — แต่คงคุณภาพพอให้ QR บนสลิปอ่านออก
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
      // ย่อไม่สำเร็จ — ใช้ไฟล์เดิม
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
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">
          แนบรูปสลิปการโอนเงิน (JPG, PNG, WEBP)
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
        />
      </label>
      {fileName && (
        <p className="text-xs text-slate-500">
          {fileName}
          {compressing && " · กำลังย่อรูป..."}
          {sizeInfo && !compressing && ` · ${sizeInfo}`}
        </p>
      )}

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={pending || compressing || !ready}
        className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-700 disabled:bg-slate-300"
      >
        {pending ? "กำลังอัปโหลด..." : compressing ? "กำลังย่อรูป..." : "ส่งสลิป"}
      </button>
    </form>
  );
}
