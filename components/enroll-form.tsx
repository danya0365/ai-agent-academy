"use client";

import { useState, useTransition } from "react";
import { enroll } from "@/actions/enrollments";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { CourseType } from "@/db/schema";

type SessionOption = {
  id: string;
  startAt: Date | number;
  endAt: Date | number;
  location: string | null;
  isOpen: boolean;
  capacity: number;
  seatsLeft: number;
};

export function EnrollForm({
  courseId,
  type,
  sessions,
}: {
  courseId: string;
  type: CourseType;
  sessions: SessionOption[];
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleEnroll() {
    setError(null);
    startTransition(async () => {
      const res = await enroll(courseId, type === "scheduled" ? selected : null);
      if (res && !res.ok) setError(res.error);
    });
  }

  const noBookableSession =
    type === "scheduled" &&
    sessions.filter((s) => s.isOpen && s.seatsLeft > 0).length === 0;

  return (
    <div className="card p-5">
      {type === "scheduled" && (
        <>
          <h3 className="mb-3 font-extrabold text-foreground">เลือกรอบเรียน</h3>
          {sessions.length === 0 ? (
            <p className="text-sm text-muted">ยังไม่มีรอบเรียนเปิดรับสมัคร</p>
          ) : (
            <div className="space-y-2">
              {sessions.map((s) => {
                const full = s.seatsLeft <= 0 || !s.isOpen;
                return (
                  <label
                    key={s.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3 transition",
                      full
                        ? "cursor-not-allowed border-border bg-muted-surface opacity-60"
                        : selected === s.id
                          ? "border-brand-500 bg-brand-50"
                          : "border-border hover:bg-muted-surface",
                    )}
                  >
                    <input
                      type="radio"
                      name="session"
                      value={s.id}
                      disabled={full}
                      checked={selected === s.id}
                      onChange={() => setSelected(s.id)}
                      className="mt-1 accent-brand-500"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-foreground">{formatDateTime(s.startAt)}</div>
                      {s.location && <div className="text-sm text-muted">{s.location}</div>}
                      <div className="mt-1 text-sm font-medium">
                        {full ? (
                          <span className="text-error">รอบนี้เต็มแล้ว</span>
                        ) : (
                          <span className="text-success">เหลือ {s.seatsLeft} ที่นั่ง</span>
                        )}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </>
      )}

      {type === "open" && (
        <p className="mb-3 text-sm text-muted">
          คอร์สนี้เรียนได้ทันที สมัครแล้วเริ่มเรียนได้เลยหลังยืนยันการชำระเงิน
        </p>
      )}

      {error && (
        <p className="mt-3 rounded-xl border-2 border-border bg-error-surface px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}

      <button
        onClick={handleEnroll}
        disabled={pending || noBookableSession || (type === "scheduled" && !selected)}
        className="btn btn-primary mt-4 w-full"
      >
        {pending ? "กำลังดำเนินการ..." : noBookableSession ? "เต็มทุกรอบแล้ว" : "สมัครเรียน"}
      </button>
    </div>
  );
}
