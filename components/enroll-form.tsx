"use client";

import { useState, useTransition } from "react";
import { enroll } from "@/actions/enrollments";
import { formatDateTime } from "@/lib/format";

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
  type: "scheduled" | "open";
  sessions: SessionOption[];
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleEnroll() {
    setError(null);
    startTransition(async () => {
      const res = await enroll(courseId, type === "scheduled" ? selected : null);
      // ถ้าสำเร็จ action จะ redirect เอง — ที่นี่จะได้ผลเฉพาะกรณี error
      if (res && !res.ok) setError(res.error);
    });
  }

  const noBookableSession =
    type === "scheduled" &&
    sessions.filter((s) => s.isOpen && s.seatsLeft > 0).length === 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      {type === "scheduled" && (
        <>
          <h3 className="mb-3 font-semibold text-slate-900">เลือกรอบเรียน</h3>
          {sessions.length === 0 ? (
            <p className="text-sm text-slate-500">ยังไม่มีรอบเรียนเปิดรับสมัคร</p>
          ) : (
            <div className="space-y-2">
              {sessions.map((s) => {
                const full = s.seatsLeft <= 0 || !s.isOpen;
                return (
                  <label
                    key={s.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${
                      full
                        ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-60"
                        : selected === s.id
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="session"
                      value={s.id}
                      disabled={full}
                      checked={selected === s.id}
                      onChange={() => setSelected(s.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">
                        {formatDateTime(s.startAt)}
                      </div>
                      {s.location && (
                        <div className="text-sm text-slate-500">{s.location}</div>
                      )}
                      <div className="mt-1 text-sm">
                        {full ? (
                          <span className="font-medium text-red-600">รอบนี้เต็มแล้ว</span>
                        ) : (
                          <span className="text-emerald-600">
                            เหลือ {s.seatsLeft} ที่นั่ง
                          </span>
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
        <p className="mb-3 text-sm text-slate-600">
          คอร์สนี้เรียนได้ทันที สมัครแล้วเริ่มเรียนได้เลยหลังยืนยันการชำระเงิน
        </p>
      )}

      {error && (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <button
        onClick={handleEnroll}
        disabled={
          pending ||
          noBookableSession ||
          (type === "scheduled" && !selected)
        }
        className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {pending ? "กำลังดำเนินการ..." : noBookableSession ? "เต็มทุกรอบแล้ว" : "สมัครเรียน"}
      </button>
    </div>
  );
}
