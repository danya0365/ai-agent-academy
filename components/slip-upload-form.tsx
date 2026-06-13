"use client";

import { useState, useTransition } from "react";
import { uploadSlip } from "@/actions/enrollments";

export function SlipUploadForm({ enrollmentId }: { enrollmentId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await uploadSlip(enrollmentId, formData);
      if (res && !res.ok) setError(res.error);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">
          แนบรูปสลิปการโอนเงิน (JPG, PNG, WEBP — ไม่เกิน 5MB)
        </span>
        <input
          type="file"
          name="slip"
          accept="image/jpeg,image/png,image/webp"
          required
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
        />
      </label>
      {fileName && <p className="text-xs text-slate-500">เลือกไฟล์: {fileName}</p>}

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-700 disabled:bg-slate-300"
      >
        {pending ? "กำลังอัปโหลด..." : "ส่งสลิป"}
      </button>
    </form>
  );
}
