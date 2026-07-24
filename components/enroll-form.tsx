"use client";

import { useState, useTransition } from "react";
import { enroll } from "@/actions/enrollments";

export function EnrollForm({ courseId }: { courseId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleEnroll() {
    setError(null);
    startTransition(async () => {
      const res = await enroll(courseId);
      if (res && !res.ok) setError(res.error);
    });
  }

  return (
    <div className="card p-5">
      <p className="mb-3 text-sm text-muted">
        คอร์สนี้เรียนได้ทันที สมัครแล้วเริ่มเรียนได้เลยหลังยืนยันการชำระเงิน
      </p>

      {error && (
        <p className="mt-3 rounded-xl border-2 border-border bg-error-surface px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}

      <button
        onClick={handleEnroll}
        disabled={pending}
        className="btn btn-primary mt-4 w-full"
      >
        {pending ? "กำลังดำเนินการ..." : "สมัครเรียน"}
      </button>
    </div>
  );
}
