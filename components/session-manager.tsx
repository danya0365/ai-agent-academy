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
        <p className="rounded-xl border-2 border-border bg-error-surface px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}

      {/* รายการรอบเรียน */}
      <div className="space-y-3">
        {sessions.length === 0 ? (
          <p className="card-flat p-6 text-center text-muted">ยังไม่มีรอบเรียน</p>
        ) : (
          sessions.map((s) =>
            editing === s.id ? (
              <form
                key={s.id}
                action={(fd) => handleUpdate(s.id, fd)}
                className="card space-y-3 border-brand-500 p-4"
              >
                <SessionFields s={s} />
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    name="isOpen"
                    defaultChecked={s.isOpen}
                    className="size-4 accent-brand-500"
                  />
                  เปิดรับสมัคร
                </label>
                <div className="flex gap-2">
                  <button type="submit" disabled={pending} className="btn btn-primary text-sm">
                    บันทึก
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="btn btn-secondary text-sm"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            ) : (
              <div
                key={s.id}
                className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-bold text-foreground">{formatDateTime(s.startAt)}</p>
                  <p className="text-sm text-muted">
                    {s.location || "ไม่ระบุสถานที่"} · ที่นั่ง {s.reserved}/{s.capacity}
                    {!s.isOpen && " · ปิดรับสมัคร"}
                  </p>
                </div>
                <div className="flex gap-2 text-sm">
                  <button onClick={() => setEditing(s.id)} className="btn btn-secondary text-sm">
                    แก้ไข
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    disabled={pending}
                    className="btn btn-secondary text-sm text-error"
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
      <form action={handleCreate} className="card space-y-3 p-4">
        <h3 className="font-extrabold text-foreground">เพิ่มรอบเรียนใหม่</h3>
        <SessionFields />
        <button type="submit" disabled={pending} className="btn btn-primary text-sm">
          {pending ? "กำลังบันทึก..." : "เพิ่มรอบเรียน"}
        </button>
      </form>
    </div>
  );
}

function SessionFields({ s }: { s?: SessionRow }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Label text="เริ่ม">
        <input type="datetime-local" name="startAt" required defaultValue={s?.startAtLocal} className="input" />
      </Label>
      <Label text="สิ้นสุด">
        <input type="datetime-local" name="endAt" required defaultValue={s?.endAtLocal} className="input" />
      </Label>
      <Label text="จำนวนที่นั่ง">
        <input type="number" name="capacity" min={1} required defaultValue={s?.capacity ?? 20} className="input" />
      </Label>
      <Label text="สถานที่">
        <input
          type="text"
          name="location"
          placeholder="เช่น ออนไลน์ผ่าน Zoom"
          defaultValue={s?.location ?? ""}
          className="input"
        />
      </Label>
    </div>
  );
}

function Label({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-foreground">{text}</span>
      {children}
    </label>
  );
}
