"use client";

import { useState, useTransition } from "react";
import { approveEnrollment, rejectEnrollment } from "@/actions/admin";

export function EnrollmentReview({
  enrollmentId,
  status,
}: {
  enrollmentId: string;
  status: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();

  function doApprove() {
    setError(null);
    startTransition(async () => {
      const res = await approveEnrollment(enrollmentId);
      if (!res.ok) setError(res.error);
    });
  }

  function doReject() {
    setError(null);
    startTransition(async () => {
      const res = await rejectEnrollment(enrollmentId, reason);
      if (!res.ok) setError(res.error);
      else setRejecting(false);
    });
  }

  // ปุ่มจะแสดงเมื่อยังตรวจสอบได้
  const canReview = status === "slip_uploaded" || status === "pending_payment";
  if (!canReview) return null;

  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      {error && (
        <p className="mb-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {!rejecting ? (
        <div className="flex gap-2">
          {status === "slip_uploaded" && (
            <button
              onClick={doApprove}
              disabled={pending}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:bg-slate-300"
            >
              {pending ? "กำลังบันทึก..." : "อนุมัติ"}
            </button>
          )}
          <button
            onClick={() => setRejecting(true)}
            disabled={pending}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            ปฏิเสธ
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="เหตุผลที่ปฏิเสธ (จะแสดงให้ลูกค้าเห็น)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="input"
          />
          <div className="flex gap-2">
            <button
              onClick={doReject}
              disabled={pending}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:bg-slate-300"
            >
              {pending ? "กำลังบันทึก..." : "ยืนยันการปฏิเสธ"}
            </button>
            <button
              onClick={() => setRejecting(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
