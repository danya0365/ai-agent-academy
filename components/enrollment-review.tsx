"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
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

  const canReview = status === "slip_uploaded" || status === "pending_payment";
  if (!canReview) return null;

  return (
    <div className="mt-3 border-t-2 border-border pt-3">
      {error && (
        <p className="mb-2 rounded-xl border-2 border-border bg-error-surface px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}

      {!rejecting ? (
        <div className="flex flex-wrap gap-2">
          {status === "slip_uploaded" && (
            <button
              onClick={doApprove}
              disabled={pending}
              className="btn bg-success text-on-brand text-sm"
            >
              <Check className="size-4" />
              {pending ? "กำลังบันทึก..." : "อนุมัติ"}
            </button>
          )}
          <button
            onClick={() => setRejecting(true)}
            disabled={pending}
            className="btn btn-secondary text-sm text-error"
          >
            <X className="size-4" /> ปฏิเสธ
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
          <div className="flex flex-wrap gap-2">
            <button
              onClick={doReject}
              disabled={pending}
              className="btn bg-error text-on-brand text-sm"
            >
              {pending ? "กำลังบันทึก..." : "ยืนยันการปฏิเสธ"}
            </button>
            <button
              onClick={() => setRejecting(false)}
              className="btn btn-secondary text-sm"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
