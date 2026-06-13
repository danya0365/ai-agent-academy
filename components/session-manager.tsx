"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSession, updateSession, deleteSession } from "@/actions/admin";
import { formatDateTime } from "@/lib/format";

export type SessionRow = {
  id: string;
  startAtLocal: string; // "YYYY-MM-DDTHH:mm" สำหรับ input datetime-local
  endAtLocal: string;
  startAt: number;
  capacity: number;
  location: string | null;
  isOpen: boolean;
  reserved: number;
};

export function SessionManager({
  courseId,
  sessions,
}: {
  courseId: string;
  sessions: SessionRow[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function refresh() {
    router.refresh();
  }

  function handleCreate(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await createSession(courseId, formData);
      if (!res.ok) setError(res.error);
      else refresh();
    });
  }

  function handleUpdate(sessionId: string, formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await updateSession(sessionId, formData);
      if (!res.ok) setError(res.error);
      else {
        setEditing(null);
        refresh();
      }
    });
  }

  function handleDelete(sessionId: string) {
    setError(null);
    startTransition(async () => {
      const res = await deleteSession(sessionId);
      if (!res.ok) setError(res.error);
      else refresh();
    });
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {/* รายการรอบเรียน */}
      <div className="space-y-3">
        {sessions.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-500">
            ยังไม่มีรอบเรียน
          </p>
        ) : (
          sessions.map((s) =>
            editing === s.id ? (
              <form
                key={s.id}
                action={(fd) => handleUpdate(s.id, fd)}
                className="space-y-3 rounded-xl border border-indigo-200 bg-white p-4"
              >
                <SessionFields s={s} />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="isOpen"
                    defaultChecked={s.isOpen}
                    className="h-4 w-4"
                  />
                  เปิดรับสมัคร
                </label>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={pending}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    บันทึก
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            ) : (
              <div
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4"
              >
                <div>
                  <p className="font-medium text-slate-900">{formatDateTime(s.startAt)}</p>
                  <p className="text-sm text-slate-500">
                    {s.location || "ไม่ระบุสถานที่"} · ที่นั่ง {s.reserved}/{s.capacity}
                    {!s.isOpen && " · ปิดรับสมัคร"}
                  </p>
                </div>
                <div className="flex gap-2 text-sm">
                  <button
                    onClick={() => setEditing(s.id)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
                  >
                    แก้ไข
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    disabled={pending}
                    className="rounded-lg border border-red-300 px-3 py-1.5 font-medium text-red-700 hover:bg-red-50"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            ),
          )
        )}
      </div>

      {/* เพิ่มรอบใหม่ */}
      <form
        action={handleCreate}
        className="space-y-3 rounded-xl border border-slate-200 bg-white p-4"
      >
        <h3 className="font-semibold text-slate-900">เพิ่มรอบเรียนใหม่</h3>
        <SessionFields />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-slate-300"
        >
          {pending ? "กำลังบันทึก..." : "เพิ่มรอบเรียน"}
        </button>
      </form>
    </div>
  );
}

function SessionFields({ s }: { s?: SessionRow }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">เริ่ม</span>
        <input
          type="datetime-local"
          name="startAt"
          required
          defaultValue={s?.startAtLocal}
          className="input"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">สิ้นสุด</span>
        <input
          type="datetime-local"
          name="endAt"
          required
          defaultValue={s?.endAtLocal}
          className="input"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">จำนวนที่นั่ง</span>
        <input
          type="number"
          name="capacity"
          min={1}
          required
          defaultValue={s?.capacity ?? 20}
          className="input"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">สถานที่</span>
        <input
          type="text"
          name="location"
          placeholder="เช่น ออนไลน์ผ่าน Zoom"
          defaultValue={s?.location ?? ""}
          className="input"
        />
      </label>
    </div>
  );
}
